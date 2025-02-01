import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "~/types/state";
import { acceptFriend, getFriendRequests, getFriends, rejectFriend, removeFriend } from "../thunks/friend";

interface FriendState extends BaseState {
  friends: string[];
  friends_request: any[];
  friendsRequestInfo: Array<{
    id: string;
    full_name: string;
    avatar: string;
  }> | null;
  friendInfo: Array<{
    id: string;
    full_name: string;
    avatar: string;
  }> | null;
}

const initialState: FriendState = {
  friends: [],
  friends_request: [],
  friendInfo: null,
  friendsRequestInfo: null,
  status: 'idle',
  error: null,
};

const handlePending = (state: FriendState) => {
  state.status = "loading";
  state.error = null;
};

const handleRejected = (state: FriendState, action: PayloadAction<unknown>) => {
  state.status = "failed";
  state.error = action.payload as string;
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    clearFriends: (state) => {
      state.friends = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriends.pending, handlePending)
      .addCase(getFriends.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends = action.payload.friends;
        state.friendInfo = action.payload.friendInfo;
      })
      .addCase(getFriends.rejected, handleRejected)

    builder
      .addCase(removeFriend.pending, handlePending)
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends = action.payload.friends;
        state.friendInfo = state.friendInfo?.filter(
          friend => action.payload.friends?.includes(friend.id)
        ) || null;
      })
      .addCase(removeFriend.rejected, handleRejected)

    builder
      .addCase(getFriendRequests.pending, handlePending)
      .addCase(getFriendRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends_request = action.payload.requests;
        state.friendsRequestInfo = action.payload.requestInfo;
      })
      .addCase(getFriendRequests.rejected, handleRejected)

    builder
      .addCase(acceptFriend.pending, handlePending)
      .addCase(acceptFriend.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends = action.payload.friends;
      })
      .addCase(acceptFriend.rejected, handleRejected)

    builder
      .addCase(rejectFriend.pending, handlePending)
      .addCase(rejectFriend.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.friends_request = action.payload?.map(request => request.sender_id) || [];
      })
      .addCase(rejectFriend.rejected, handleRejected)
  },
});

export const { clearFriends } = friendSlice.actions;
export default friendSlice.reducer;
