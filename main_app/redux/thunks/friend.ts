import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "~/utils/supabase";

export const getFriends = createAsyncThunk("friend/getFriends", async (profile_id: string, {rejectWithValue}) => {
  try {
    const {data: friendsData, error: friendsError} = await supabase
      .from("friends")
      .select("friends")
      .eq("profile_id", profile_id)
      .single();

    if (friendsError) throw friendsError;
    const friends = friendsData?.friends || [];

    if (friends.length === 0) {
      return {
        friends: [],
        friendInfo: []
      };
    }

    const {data: friendInfo, error: profilesError} = await supabase
      .from("profiles")
      .select("id, full_name, avatar")
      .in("id", friends);

    if (profilesError) throw profilesError;
    return {
      friends,
      friendInfo: friendInfo || []
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Có lỗi xảy ra");
  }
} );



export const removeFriend = createAsyncThunk(
  "friend/removeFriend",
  async (
    { profile_id, selectedFriendId }: { profile_id: string; selectedFriendId: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.rpc('remove_friend', {
        current_user_id: profile_id,
        friend_id: selectedFriendId
      });
      if (error) throw error;

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra");
    }
  }
);


export const getFriendRequests = createAsyncThunk("friend/getFriendRequests", async (profile_id: string, {rejectWithValue}) => {
  try {
    const {data: requestsData, error: requestError} = await supabase
      .from("friend_request")
      .select("sender_id")
      .eq("receiver_id", profile_id);

    if (requestError) throw requestError;
    const requests = requestsData || [];

    if (requests.length === 0) {
      return {
        requests: [],
        requestInfo: []
      };
    }

    const senderIds = requests.map(request => request.sender_id);
    const {data: requestInfo, error: profilesError} = await supabase
      .from("profiles")
      .select("id, full_name, avatar")
      .in("id", senderIds);

    if (profilesError) throw profilesError;
    return {
      requests,
      requestInfo: requestInfo || []
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Có lỗi xảy ra");
  }
});

export const acceptFriend = createAsyncThunk(
  "friend/acceptFriend",
  async (
    { profile_id, friend_id } : {profile_id: string, friend_id: string},
    { rejectWithValue }
  ) => {
    try {

      const { data } = await supabase.rpc('accept_friend_request', {
        current_profile_id: profile_id,
        current_friend_id: friend_id
      });

      return data;
    } catch (error) {
      console.error('Accept friend error:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi chấp nhận lời mời kết bạn");
    }
  }
);


export const rejectFriend = createAsyncThunk(
  "friend/rejectFriend",
  async (
    {
      profile_id,
      friend_id,

    }: {
      profile_id: string;
      friend_id: string;

    },
    { rejectWithValue }
  ) => {
    try {
      const {error } = await supabase
        .from("friend_request")
        .delete()
        .match({
          sender_id: friend_id,
          receiver_id: profile_id
        })
        ;
      if (error) throw error;
      const {data} = await supabase.from("friend_request").select("sender_id").eq("receiver_id", profile_id);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra");
    }
  }
);
