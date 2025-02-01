import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Stack, Text, XStack, YStack } from 'tamagui';
import ChatDialog from '~/components/Chat/ChatDialog';
import { ChatbotPopup } from '~/components/ChatbotPopup';
import UpStoryDialog from '~/components/Story/UpStoryDialog';
import { selectLastMessagesWithPartners } from '~/redux/selectors/message';
import { RootState } from '~/redux/store';
import { getFriends } from '~/redux/thunks/friend';
import { getMessages, markMessagesAsRead } from '~/redux/thunks/message';
import { supabase } from '~/utils/supabase';

const Chat = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const { friendInfo } = useSelector((state: RootState) => state.friend);
  const chatList = useSelector(selectLastMessagesWithPartners);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const router = useRouter();
  const showNotification = async (title: string, message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { screen: 'chat' },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      dispatch(getFriends(profile.id) as any);
      dispatch(getMessages(profile.id) as any);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`,
        },
        async (payload) => {
          if (payload.new) {
            const sender = friendInfo?.find((f) => f.id === payload.new.sender_id);

            if (selectedChat === payload.new.sender_id) {
              dispatch(
                markMessagesAsRead({
                  senderId: payload.new.sender_id,
                  receiverId: profile.id,
                }) as any
              );
            } else {
              await showNotification(sender?.full_name || 'Tin nhắn mới', payload.new.message);
            }

            dispatch(getMessages(profile.id) as any);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.new) {
            dispatch(getMessages(profile.id) as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile?.id, selectedChat, friendInfo]);

  // Xử lý khi đóng chat dialog
  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  // Xử lý khi đóng story dialog
  const handleCloseStory = () => {
    setShowStoryDialog(false);
  };

  return (
    <YStack flex={1} backgroundColor="#fff">
      <XStack
        paddingHorizontal={25}
        paddingTop={50}
        paddingBottom={20}
        alignItems="center"
        space={10}>
        <Text flex={1} fontSize={24} fontWeight="600" color="#1A1A1A">
          Tin nhắn
        </Text>
      </XStack>
      <ScrollView style={{ flex: 1 }}>
        {/* Search */}
        <XStack paddingHorizontal={20} marginBottom={25}>
          <XStack
            width="100%"
            backgroundColor="#F8F8F8"
            borderRadius={15}
            height={50}
            alignItems="center"
            paddingHorizontal={15}>
            <Ionicons name="search" size={20} color="#666666" />
            <Input
              flex={1}
              placeholder="Tìm kiếm tin nhắn..."
              placeholderTextColor="#999999"
              backgroundColor="transparent"
              borderWidth={0}
              height={50}
              paddingLeft={10}
              fontSize={15}
            />
          </XStack>
        </XStack>

        {/* Stories */}
        <YStack marginBottom={25}>
          <Text fontSize={16} fontWeight="600" paddingHorizontal={20} marginBottom={15}>
            Hoạt động
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space={20} paddingHorizontal={20}>
              {/* Add Story Button */}
              <YStack alignItems="center">
                <Button
                  width={65}
                  height={65}
                  borderRadius={32.5}
                  backgroundColor="#F8F8F8"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom={8}
                  pressStyle={{
                    scale: 0.98,
                    backgroundColor: '#F8F8F8',
                    borderWidth: 0,
                  }}
                  onPress={() => setShowStoryDialog(true)}>
                  <Ionicons name="add" size={30} color="#E94057" />
                </Button>
                <Text fontSize={13} color="#666666">
                  Thêm
                </Text>
              </YStack>

              {/* Stories */}
              {friendInfo?.map((friend) => (
                <YStack key={friend.id} alignItems="center">
                  <Stack
                    width={65}
                    height={65}
                    borderRadius={32.5}
                    overflow="hidden"
                    borderWidth={2}
                    borderColor="#E94057"
                    marginBottom={8}
                    pressStyle={{
                      scale: 0.98,
                      opacity: 0.8,
                    }}
                    onPress={() => setSelectedChat(friend.id)}>
                    <Image
                      source={{ uri: friend.avatar }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </Stack>
                  <Text fontSize={13} color="#1A1A1A" numberOfLines={1}>
                    {friend.full_name.split(' ').slice(-1)[0]}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </ScrollView>
        </YStack>

        {/* Messages */}
        <YStack paddingHorizontal={20} marginBottom={80}>
          <Text fontSize={16} fontWeight="600" marginBottom={15}>
            Tin nhắn
          </Text>

          <YStack space={5}>
            {chatList.length === 0 ? (
              <Text textAlign="center" color="#666666">
                Bạn chưa có bất kỳ tin nhắn nào
              </Text>
            ) : (
              chatList.map((chat) => {
                const isSelected = selectedChat === chat.id.toString();
                return (
                  <XStack
                    key={chat.id}
                    alignItems="center"
                    space={12}
                    backgroundColor="white"
                    padding={12}
                    borderRadius={12}
                    pressStyle={{
                      backgroundColor: '#F8F8F8',
                      scale: 0.98,
                    }}
                    onPress={() => setSelectedChat(chat.id.toString())}>
                    <Stack width={60} height={60} borderRadius={30} overflow="hidden">
                      <Image
                        source={{ uri: chat.avatar }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </Stack>

                    <YStack flex={1} space={4}>
                      <Text fontSize={16} fontWeight="600" color="#1A1A1A">
                        {chat.name}
                      </Text>
                      <Text
                        fontSize={14}
                        color={chat.typing ? '#E94057' : '#666666'}
                        fontWeight={chat.typing ? '500' : '400'}
                        numberOfLines={1}
                        opacity={0.8}>
                        {chat.typing ? 'Typing...' : chat.lastMessage}
                      </Text>
                    </YStack>

                    <YStack alignItems="flex-end" space={4}>
                      <Text fontSize={12} color="#999999">
                        {chat.time}
                      </Text>
                      {chat.unread > 0 && !isSelected && (
                        <Stack
                          backgroundColor="#E94057"
                          width={20}
                          height={20}
                          borderRadius={10}
                          alignItems="center"
                          justifyContent="center">
                          <Text color="white" fontSize={11} fontWeight="600">
                            {chat.unread}
                          </Text>
                        </Stack>
                      )}
                    </YStack>
                  </XStack>
                );
              })
            )}
          </YStack>
        </YStack>

        {/* Chat Dialog */}
        {selectedChat && <ChatDialog partnerId={selectedChat} onClose={handleCloseChat} />}
        {showStoryDialog && <UpStoryDialog onClose={handleCloseStory} />}
      </ScrollView>

      {/* Chatbot Button */}
      <YStack position="absolute" bottom={80} right={20} zIndex={1000}>
        <Button
          width={60}
          height={60}
          borderRadius={22}
          backgroundColor="#10A37F"
          pressStyle={{
            scale: 0.97,
            opacity: 0.9,
            backgroundColor: '#10A37F',
            borderWidth: 0,
          }}
          onPress={() => setIsChatbotOpen(!isChatbotOpen)}>
          <Feather name="message-circle" size={24} color="white" />
        </Button>
      </YStack>

      {/* Chatbot Popup */}
      <ChatbotPopup isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </YStack>
  );
};

export default Chat;
