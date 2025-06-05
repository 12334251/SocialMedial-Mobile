// features/friends/friendRequestsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FriendRequest {
  _id: string;
  friendRequestSenderId: string;
  friendRequestReceiverId: string;
  friendRequestSenderDetails: Record<string, any>;
  friendRequestReceiverDetails: Record<string, any>;
  isFriend: "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface AcceptedFriendRequestsState {
  accepted: FriendRequest[];
  acceptedIndex: Record<string, number>;
}

const initialState: AcceptedFriendRequestsState = {
  accepted: [],
  acceptedIndex: {},
};

const acceptedFriendRequestsSlice = createSlice({
  name: "acceptedFriendRequests",
  initialState,
  reducers: {
    // 1) Replace the entire pending-list (e.g. on initial load):
    setAcceptedRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.accepted = action.payload;
      state.acceptedIndex = {};
      action.payload.forEach((req, idx) => {
        state.acceptedIndex[req._id] = idx;
      });
    },

    // 2) Add a new pending request (unshift to front):
    addAcceptedRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.accepted.unshift(action.payload);
      // rebuild index
      state.acceptedIndex = {};
      state.accepted.forEach((req, idx) => {
        state.acceptedIndex[req._id] = idx;
      });
    },

    // 3) Update an existing pending-request in place:
    updateAcceptedRequest: (
      state,
      action: PayloadAction<{
        requestId: string;
        changes: Partial<FriendRequest>;
      }>
    ) => {
      const { requestId, changes } = action.payload;
      const idx = state.acceptedIndex[requestId];
      if (idx !== undefined) {
        state.accepted[idx] = { ...state.accepted[idx], ...changes };
      }
    },

    // 4) Remove a pending request (e.g. once accepted/declined):
    removeAcceptedRequest: (
      state,
      action: PayloadAction<{ requestId: string }>
    ) => {
      const idx = state.acceptedIndex[action.payload.requestId];
      if (idx !== undefined) {
        state.accepted.splice(idx, 1);
        // rebuild index
        state.acceptedIndex = {};
        state.accepted.forEach((req, i) => {
          state.acceptedIndex[req._id] = i;
        });
      }
    },
  },
});

export const {
  setAcceptedRequests,
  addAcceptedRequest,
  updateAcceptedRequest,
  removeAcceptedRequest,
} = acceptedFriendRequestsSlice.actions;

export default acceptedFriendRequestsSlice.reducer;
