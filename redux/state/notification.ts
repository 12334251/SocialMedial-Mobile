import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Notification type
interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  icon: string;
  singleUnread: boolean;
  unread: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  notificationCount: number;
}

// Define the initial state
const initialState: NotificationState = {
  notifications: [],
  notificationCount: 0,
};

// Create the slice for notifications
export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Add, update, or remove notification based on action type
    setNotification: (
      state,
      action: PayloadAction<{ notifications: Notification[] }>
    ) => {
      // Merge the current notifications with the new ones
      const mergedNotifications = [
        ...state.notifications,
        ...action.payload.notifications,
      ];

      // Create a Map to automatically remove duplicates (the later occurrence will overwrite the earlier one)
      const uniqueNotificationsMap = new Map<string, Notification>();
      mergedNotifications.forEach((notif) => {
        uniqueNotificationsMap.set(notif._id, notif);
      });

      // Convert the Map values back to an array.
      state.notifications = Array.from(uniqueNotificationsMap.values());
    },

    setNotificationCount: (
      state,
      action: PayloadAction<{ notificationCount: number }>
    ) => {
      state.notificationCount = action.payload.notificationCount;
    },

    // ➤ New: Increment-by-one
    incrementNotificationCount: (state) => {
      state.notificationCount += 1;
    },

    // ➤ New: Reset / clear
    clearNotificationCount: (state) => {
      state.notificationCount = 0;
    },

    // Replace or append a whole page of notifications (e.g. from pagination)
    appendNotifications: (
      state,
      action: PayloadAction<{ notifications: Notification[] }>
    ) => {
      const incoming = action.payload.notifications;

      // Merge existing + incoming, using a Map to keep last (newest) version on dup‐id
      const map = new Map<string, Notification>(
        state.notifications.map((n) => [n._id, n])
      );
      incoming.forEach((n) => map.set(n._id, n));

      // Turn back into array, sorted descending by createdAt (newest first)
      state.notifications = Array.from(map.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    },

    // Prepend a single new notification (e.g. from WebSocket)
    prependNotification: (state, action: PayloadAction<Notification>) => {
      const newNotif = action.payload;

      // if it's already in the list, remove the old one
      state.notifications = state.notifications.filter(
        (n) => n._id !== newNotif._id
      );

      // mark as unread
      newNotif.unread = true;

      // put at the front
      state.notifications.unshift(newNotif);

      // bump up the badge counter
      state.notificationCount += 1;
    },

    removeLastNotification: (state) => {
      // Remove the last notification from the array if it exists.
      if (state.notifications.length > 0) {
        state.notifications.pop();
      }
    },

    // Mark a specific notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notif) => notif._id === action.payload
      );
      if (notification) {
        notification.unread = false;
      }
    },

    // Mark a specific notification as unread
    markAsUnread: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notif) => notif._id === action.payload
      );
      if (notification) {
        notification.unread = true;
      }
    },
  },
});

// Export the actions
export const {
  setNotification,
  setNotificationCount,
  incrementNotificationCount,
  clearNotificationCount,
  appendNotifications,
  prependNotification,
  removeLastNotification,
  markAsRead,
  markAsUnread,
} = notificationSlice.actions;

// Export the reducer
export default notificationSlice.reducer;
