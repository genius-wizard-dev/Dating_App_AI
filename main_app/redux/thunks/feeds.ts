import { createAsyncThunk } from '@reduxjs/toolkit';
import { PostgrestResponse } from '@supabase/supabase-js';
import { Feed, FeedInfoResponse, FeedInfoUser } from '~/types/feed';
import { supabase } from '~/utils/supabase';

export const getFeeds = createAsyncThunk('feeds/getFeeds', async (_, { rejectWithValue }): Promise<FeedInfoResponse | any> => {
  try {
    const { data: feedsData, error: feedsError } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false }) as PostgrestResponse<Feed>;

    if (feedsError) throw feedsError;
    if (!feedsData || feedsData.length === 0) return { feeds: [], info: [] };

    const userIds = feedsData.map(feed => feed.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, age, full_name, gender, location')
      .in('id', userIds) as PostgrestResponse<FeedInfoUser>;

    if (profilesError) throw profilesError;

    return {
      feeds: feedsData,
      info: profilesData,
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra khi lấy dữ liệu feeds');
  }
});

export const filterFeeds = createAsyncThunk('feeds/filteFeeds', async(filter: any, {rejectWithValue}) => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Có lỗi xảy ra khi lọc feed');
  }
})
