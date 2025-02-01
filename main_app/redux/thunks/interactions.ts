import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '~/utils/supabase';
import { InteractionType } from '../slices/interactions';

interface InteractionParams {
  userId: string;
  storyId: number;
  targetUserId: string;
  preferenceType: InteractionType;
}

export const insertInteraction = createAsyncThunk(
  'interactions/insert',
  async ({ userId, storyId, targetUserId, preferenceType }: InteractionParams) => {
    const { data, error } = await supabase.rpc('insert_interaction', {
      _user_id: userId,
      _story_id: storyId,
      _target_user_id: targetUserId,
      _preference_type: preferenceType,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);

export const getUserInteractions = createAsyncThunk(
  'interactions/getUserInteractions',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);
