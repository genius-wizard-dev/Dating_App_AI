import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "~/types/state";
import { getMessages, sendMessage } from "../thunks/message";

interface Message {
  id: string;
  message: string;
  send_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  sender: {
    id: string;
    full_name: string;
    avatar: string;
  };
  receiver: {
    id: string;
    full_name: string;
    avatar: string;
  };
}

interface MessageState extends BaseState {
  messages: Message[];
}

const initialState: MessageState = {
  messages: [],
  status: 'idle',
  error: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload.map((message: any) => ({
          ...message,
          sender: message.sender[0],
          receiver: message.receiver[0]
        }));
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.unshift({
          ...action.payload,
          sender: action.payload.sender[0],
          receiver: action.payload.receiver[0]
        });
      });
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
