import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, ScrollView, Sheet, Stack, Text, XStack, YStack } from 'tamagui';
import { selectMessagesByPartner } from '~/redux/selectors/message';
import { RootState } from '~/redux/store';
import { markMessagesAsRead, sendMessage } from '~/redux/thunks/message';

interface ChatDialogProps {
  partnerId: string;
  onClose: () => void;
}

export default function ChatDialog({ partnerId, onClose }: ChatDialogProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  const messages = useSelector((state: RootState) => selectMessagesByPartner(state, partnerId));
  const partner = useSelector((state: RootState) =>
    state.friend.friendInfo?.find((f) => f.id === partnerId)
  );

  useEffect(() => {
    if (profile?.id && partnerId) {
      dispatch(
        markMessagesAsRead({
          senderId: partnerId,
          receiverId: profile.id,
        }) as any
      );
    }
  }, [profile?.id, partnerId, messages.length]);

  const handleSend = () => {
    if (!message.trim() || !profile?.id) return;

    dispatch(
      sendMessage({
        sender_id: profile.id,
        receiver_id: partnerId,
        message: message.trim(),
      }) as any
    );
    setMessage('');
  };

  const groupedMessages = messages.reduce(
    (groups, msg) => {
      const date = new Date(msg.send_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
      return groups;
    },
    {} as Record<string, typeof messages>
  );

  return (
    <Sheet
      modal
      open={true}
      onOpenChange={onClose}
      snapPoints={[85]}
      dismissOnSnapToBottom
      animationConfig={{
        type: 'spring',
        damping: 35,
        mass: 1.2,
        stiffness: 200,
      }}>
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame
        backgroundColor="white"
        borderTopLeftRadius={50}
        borderTopRightRadius={50}
        enterStyle={{ opacity: 0, scale: 0.95, y: 20 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: 20 }}
        animation="quick">
        <XStack
          paddingHorizontal={25}
          paddingTop={25}
          paddingBottom={20}
          borderBottomWidth={1}
          borderBottomColor="#F0F0F0"
          alignItems="center"
          space={10}>
          <XStack flex={1} alignItems="center" space={10}>
            <Stack width={50} height={50} borderRadius={25} overflow="hidden">
              <Image
                source={{ uri: partner?.avatar }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </Stack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color="#1A1A1A">
                {partner?.full_name || 'Loading...'}
              </Text>
              <Text fontSize={12} color="#00BA88">
                Online
              </Text>
            </YStack>
          </XStack>
          <Button unstyled onPress={onClose} pressStyle={{ opacity: 0.7 }}>
            <Stack>
              <Ionicons name="close" size={30} color="#000" />
            </Stack>
          </Button>
        </XStack>

        <ScrollView
          flex={1}
          padding={15}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}>
          <YStack space={20}>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <YStack key={date} space={10}>
                <Text
                  textAlign="center"
                  fontSize={12}
                  color="#999"
                  backgroundColor="#F8F8F8"
                  paddingVertical={5}
                  paddingHorizontal={10}
                  borderRadius={10}
                  alignSelf="center">
                  {date}
                </Text>

                {dateMessages.map((msg, index) => {
                  const isLastMessage = index === dateMessages.length - 1;
                  const isSender = msg.sender_id === profile?.id;

                  return (
                    <XStack
                      key={msg.id}
                      justifyContent={isSender ? 'flex-end' : 'flex-start'}
                      width="100%"
                      paddingHorizontal={5}
                    >
                      <Stack
                        backgroundColor={isSender ? '#E94057' : '#F3F3F3'}
                        padding={12}
                        borderRadius={20}
                        maxWidth="85%"
                        minWidth={100}
                        borderTopLeftRadius={isSender ? 20 : 5}
                        borderTopRightRadius={isSender ? 5 : 20}>
                        <Text
                          color={isSender ? 'white' : '#1A1A1A'}
                          fontSize={16}
                          lineHeight={22}
                        >
                          {msg.message}
                        </Text>
                        <XStack
                          space={4}
                          alignItems="center"
                          justifyContent="flex-end"
                          marginTop={6}
                        >
                          <Text
                            fontSize={12}
                            color={isSender ? '#FFD7DE' : '#999'}
                          >
                            {new Date(msg.send_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          {isSender && isLastMessage && (
                            <Ionicons
                              name={msg.is_read ? 'checkmark-done' : 'checkmark'}
                              size={16}
                              color={msg.is_read ? '#00BA88' : '#FFD7DE'}
                            />
                          )}
                        </XStack>
                      </Stack>
                    </XStack>
                  );
                })}
              </YStack>
            ))}

            {isTyping && (
              <XStack justifyContent="flex-start">
                <Stack
                  backgroundColor="#F3F3F3"
                  padding={12}
                  borderRadius={20}
                  maxWidth="80%"
                  borderTopLeftRadius={5}>
                  <Text color="#1A1A1A" fontSize={14}>
                    Đang nhập...
                  </Text>
                </Stack>
              </XStack>
            )}
          </YStack>
        </ScrollView>

        <XStack
          padding={15}
          space={10}
          borderTopWidth={1}
          borderTopColor="#F0F0F0"
          backgroundColor="white">
          <Input
            flex={1}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
            backgroundColor="white"
            borderWidth={1}
            color="#000"
            borderColor="#E8E8E8"
            height={45}
            paddingHorizontal={15}
            fontSize={14}
            pressStyle={{ borderColor: '#E94057' }}
          />
          <Button
            backgroundColor="white"
            width={45}
            height={45}
            padding={0}
            borderWidth={1}
            borderColor="#E8E8E8"
            alignItems="center"
            justifyContent="center"
            onPress={handleSend}
            disabled={!message.trim()}
            pressStyle={{
              backgroundColor: 'white',
              borderColor: '#E94057',
              scale: 0.98,
            }}>
            <Stack>
              <Ionicons name="send" size={25} color="#E94057" />
            </Stack>
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
}
