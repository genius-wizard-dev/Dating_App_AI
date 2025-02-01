import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "~/utils/supabase";

export const getMessages = createAsyncThunk(
  "message/getMessages",
  async (profile_id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          message,
          send_at,
          sender_id,
          receiver_id,
          is_read,
          sender:profiles!sender_id (
            id,
            full_name,
            avatar
          ),
          receiver:profiles!receiver_id (
            id,
            full_name,
            avatar
          )
        `)
        .or(`sender_id.eq.${profile_id},receiver_id.eq.${profile_id}`)
        .order('send_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi tải tin nhắn");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async ({
    sender_id,
    receiver_id,
    message,
  }: {
    sender_id: string;
    receiver_id: string;
    message: string;
  }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id,
          receiver_id,
          message,
        })
        .select(`
          id,
          message,
          send_at,
          sender_id,
          receiver_id,
          is_read,
          sender:profiles!sender_id (
            id,
            full_name,
            avatar
          ),
          receiver:profiles!receiver_id (
            id,
            full_name,
            avatar
          )
        `)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi gửi tin nhắn");
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'message/markAsRead',
  async ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .match({ sender_id: senderId, receiver_id: receiverId, is_read: false });

    if (error) throw error;
    return { senderId, receiverId };
  }
);
