

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from "@reduxjs/toolkit";
import { User } from "@supabase/supabase-js";
import { BaseState } from "~/types/state";
import { getProfile, getUserInfo } from "../thunks/user";
interface UserState extends BaseState {
  user: User | null;
  profile: any;
}

const initialState: UserState = {
  user: null,
  profile: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('profile');
    },
    getUserStorage: (state) => {
      AsyncStorage.getItem('user').then(user => {
        if (user) {
          state.user = JSON.parse(user);
        }
      });
      AsyncStorage.getItem('profile').then(profile => {
        if (profile) {
          state.profile = JSON.parse(profile);
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserInfo.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getUserInfo.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload.user) {
        state.user = action.payload.user;
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(getUserInfo.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? null;
    });
    builder.addCase(getProfile.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getProfile.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload) {
        state.profile = action.payload;
        AsyncStorage.setItem('profile', JSON.stringify(action.payload));
      }
    });
    builder.addCase(getProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? null;
    });
  },
});

export const { clearUser, getUserStorage } = userSlice.actions;
export default userSlice.reducer;
