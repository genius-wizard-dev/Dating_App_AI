import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { BaseState } from '~/types/state';
import { getSession, performOAuth, signIn, signInWithGoogle, signOut, signUp } from '../thunks/auth';
interface AuthState extends BaseState {
  session: any | null;
  isLogin: boolean;
}

const initialState: AuthState = {
  session: null,
  isLogin: false,
  status: 'idle',
  error: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    clearSession: (state) => {
      state.session = null;
      state.isLogin = false;
      AsyncStorage.removeItem('session');
    },
    getSessionFromStorage: (state) => {
      AsyncStorage.getItem('session').then(session => {
        if (session) {
          state.session = JSON.parse(session);
          state.isLogin = true;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(performOAuth.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(performOAuth.fulfilled, (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.status = 'succeeded';
      if (action.payload.session) {
        state.session = action.payload.session;
        AsyncStorage.setItem('session', JSON.stringify(action.payload.session));
        state.isLogin = true;
      }
    });
    builder.addCase(performOAuth.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
      state.isLogin = false;
    });

    builder.addCase(signInWithGoogle.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(signInWithGoogle.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload.session) {
        state.session = action.payload.session;
        AsyncStorage.setItem('session', JSON.stringify(action.payload.session));
        state.isLogin = true;
      }
    });
    builder.addCase(signInWithGoogle.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
      state.isLogin = false;
    });

    builder.addCase(signIn.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload.session) {
        state.session = action.payload.session;
        state.isLogin = true;
        AsyncStorage.setItem('session', JSON.stringify(action.payload.session));
      }
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
      state.isLogin = false;
    });
    builder.addCase(signUp.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload.session) {
        state.session = action.payload.session;
        state.isLogin = true;
        AsyncStorage.setItem('session', JSON.stringify(action.payload.session));
      }
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
      state.isLogin = false;
    });
    builder.addCase(getSession.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getSession.fulfilled, (state, action) => {
      state.status = 'succeeded';
      if (action.payload.session) {
        state.session = action.payload.session;
        state.isLogin = true;
        AsyncStorage.setItem('session', JSON.stringify(action.payload.session));
      }
    });
    builder.addCase(getSession.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
      state.isLogin = false;
    });
    builder.addCase(signOut.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(signOut.fulfilled, (state) => {
      state.status = 'succeeded';
      state.session = null;
      state.isLogin = false;
      AsyncStorage.removeItem('session');
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Có lỗi xảy ra';
    });
  },
});

export const { clearSession, getSessionFromStorage } = authSlice.actions;
export default authSlice.reducer;
