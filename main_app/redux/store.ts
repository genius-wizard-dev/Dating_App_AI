import { configureStore } from '@reduxjs/toolkit';
import { authSlice, feedSlice, friendSlice, interactionsSlice, messageSlice, userSlice } from './slices';

const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    friend: friendSlice,
    feed: feedSlice,
    message: messageSlice,
    interactions: interactionsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
