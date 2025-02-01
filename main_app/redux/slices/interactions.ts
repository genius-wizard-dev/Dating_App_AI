import { createSlice } from '@reduxjs/toolkit';
import { insertInteraction, getUserInteractions } from '../thunks/interactions';

export enum InteractionType {
  LOVE = 'Love',
  DISLIKE = 'Dislike',
  INTEREST = 'Interest'
}

interface Interaction {
  id: number;
  user_id: string;
  story_id: number;
  target_user_id: string;
  preference_type: InteractionType;
  created_at: string;
  updated_at: string;
}

interface InteractionState {
  loading: boolean;
  error: string | null;
  userInteractions: Interaction[];
}

const initialState: InteractionState = {
  loading: false,
  error: null,
  userInteractions: [],
};

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Insert interaction cases
      .addCase(insertInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertInteraction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(insertInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      // Get user interactions cases
      .addCase(getUserInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.userInteractions = action.payload;
      })
      .addCase(getUserInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
        state.userInteractions = [];
      });
  },
});

export const { clearError } = interactionsSlice.actions;
export default interactionsSlice.reducer;
