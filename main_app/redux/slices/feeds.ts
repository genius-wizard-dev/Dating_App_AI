import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Feed, FeedInfoResponse, FeedInfoUser } from '~/types/feed';
import { BaseState } from '~/types/state';
import { getFeeds } from '../thunks/feeds';

interface FeedsState extends BaseState {
  info: FeedInfoUser[];
  feeds: Feed[];
  currentIndex: number;
  isInitialized: boolean;
}

const initialState: FeedsState = {
  info: [],
  feeds: [],
  currentIndex: 0,
  isInitialized: false,
  status: 'idle',
  error: '',
};

const feedSlice = createSlice({
  name: 'feeds',
  initialState,
  reducers: {
    setNextIndex: (state) => {
      state.currentIndex += 1;
    },
    setIsInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    resetIndex: (state) => {
      state.currentIndex = 0;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getFeeds.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getFeeds.fulfilled, (state, action: PayloadAction<FeedInfoResponse>) => {
      state.status = 'succeeded';
      state.feeds = action.payload.feeds;
      state.info = action.payload.info;
    });
    builder.addCase(getFeeds.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Something went wrong.';
    });
  },
});

export const { setNextIndex, setIsInitialized, resetIndex } = feedSlice.actions
export default feedSlice.reducer;
