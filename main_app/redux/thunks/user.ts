import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';

export const getUserInfo = createAsyncThunk('user/getUserInfo', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const getProfile = createAsyncThunk('user/getProfile', async (user: User, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

