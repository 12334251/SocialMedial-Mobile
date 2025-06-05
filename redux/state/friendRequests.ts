// features/friends/friendRequestsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FriendRequest {
  _id: string;
  friendRequestSenderId: string;
  friendRequestReceiverId: string;
  friendRequestSenderDetails: Record<string, any>;
  friendRequestReceiverDetails: Record<string, any>;
  isFriend: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestsState {
  pending: FriendRequest[];
  pendingIndex: Record<string, number>;
}

const initialState: FriendRequestsState = {
  pending: [],
  pendingIndex: {},
};

const friendRequestsSlice = createSlice({
  name: "friendRequests",
  initialState,
  reducers: {
    // 1) Replace the entire pending-list (e.g. on initial load):
    setPendingRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.pending = action.payload;
      state.pendingIndex = {};
      action.payload.forEach((req, idx) => {
        state.pendingIndex[req._id] = idx;
      });
    },

    // 2) Add a new pending request (unshift to front):
    addPendingRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.pending.unshift(action.payload);
      // rebuild index
      state.pendingIndex = {};
      state.pending.forEach((req, idx) => {
        state.pendingIndex[req._id] = idx;
      });
    },

    // 3) Update an existing pending-request in place:
    updatePendingRequest: (
      state,
      action: PayloadAction<{
        requestId: string;
        changes: Partial<FriendRequest>;
      }>
    ) => {
      const { requestId, changes } = action.payload;
      const idx = state.pendingIndex[requestId];
      if (idx !== undefined) {
        state.pending[idx] = { ...state.pending[idx], ...changes };
      }
    },

    // 4) Remove a pending request (e.g. once accepted/declined):
    removePendingRequest: (
      state,
      action: PayloadAction<{ requestId: string }>
    ) => {
      const idx = state.pendingIndex[action.payload.requestId];
      if (idx !== undefined) {
        state.pending.splice(idx, 1);
        // rebuild index
        state.pendingIndex = {};
        state.pending.forEach((req, i) => {
          state.pendingIndex[req._id] = i;
        });
      }
    },
  },
});

export const {
  setPendingRequests,
  addPendingRequest,
  updatePendingRequest,
  removePendingRequest,
} = friendRequestsSlice.actions;

export default friendRequestsSlice.reducer;
