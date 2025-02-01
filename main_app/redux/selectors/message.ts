import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectMessagesByPartner = createSelector(
  [(state: RootState) => state.message.messages,
   (state: RootState) => state.user.profile,
   (_, partnerId: string) => partnerId],
  (messages, profile, partnerId) =>
    messages.filter(msg =>
      (msg.sender_id === profile?.id && msg.receiver_id === partnerId) ||
      (msg.sender_id === partnerId && msg.receiver_id === profile?.id)
    ).sort((a, b) => new Date(a.send_at).getTime() - new Date(b.send_at).getTime())
);

export const selectLastMessagesWithPartners = createSelector(
  [(state: RootState) => state.message.messages,
   (state: RootState) => state.user.profile,
   (state: RootState) => state.friend.friendInfo],
  (messages, profile, friendInfo) => {
    const lastMessages = new Map();

    messages.forEach(msg => {
      const isReceiver = msg.receiver_id === profile?.id;
      const partnerId = isReceiver ? msg.sender_id : msg.receiver_id;
      const partner = friendInfo?.find(f => f.id === partnerId);

      if (!partner) return;

      const existingMsg = lastMessages.get(partnerId);
      if (!existingMsg || new Date(msg.send_at) > new Date(existingMsg.send_at)) {
        lastMessages.set(partnerId, {
          id: partnerId,
          name: partner.full_name,
          avatar: partner.avatar,
          lastMessage: msg.sender_id === profile?.id ? `You: ${msg.message}` : msg.message,
          time: new Date(msg.send_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          unread: !msg.is_read && msg.sender_id !== profile?.id ? 1 : 0,
          typing: false,
        });
      }
    });

    return Array.from(lastMessages.values());
  }
);
