import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./state/index";
import notificationReducer from "./state/notification";
import registrationReducer from "./state/registration";
import friendRequestsReducer from "./state/friendRequests";
import acceptedFriendRequestsReducer from "./state/acceptedRequest";

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
  registration: registrationReducer,
  friendRequests: friendRequestsReducer,
  acceptedRequest: acceptedFriendRequestsReducer,
});

// Explicitly declare RootState type
export type RootState = ReturnType<typeof store.getState>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Keep this for clean setup
    }),
});
