import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, Provider, Session, User } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { SessionRespone } from '~/types/auth';
import { supabase } from '~/utils/supabase';
WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri();
export const performOAuth = createAsyncThunk('auth/performOAuth', async (provider: Provider, { rejectWithValue }) => {
  try {
    const createSessionFromUrl = async (url: string) => {
      const { params, errorCode } = QueryParams.getQueryParams(url);

      if (errorCode) throw new Error(errorCode);
      const { access_token, refresh_token } = params;

      if (!access_token) return;

      const { data, error }: AuthResponse = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;
      return data;
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return rejectWithValue(error.message);
    }

    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);

    if (res.type === 'success') {
      const { url } = res;
      const data = (await createSessionFromUrl(url)) as { user: User | null; session: Session | null };
      return data;
    }

    return rejectWithValue('Đăng nhập không thành công');
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async (token: string, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: token,
    })
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({email, password});
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const signUp = createAsyncThunk('auth/signUp', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {

    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const getSession = createAsyncThunk('auth/getSession', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.getSession() as SessionRespone;
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});
export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});
