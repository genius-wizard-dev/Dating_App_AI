import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSelector } from 'react-redux';
import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import { RootState } from '~/redux/store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  responseTime?: number;
}

interface ChatbotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageContent = ({ content, role }: { content: string; role: 'user' | 'assistant' }) => {
  const markdownStyles: any = {
    body: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontSize: 15,
      lineHeight: 22,
      marginVertical: 8,
    },
    heading1: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontSize: 24,
      fontWeight: '700',
      marginVertical: 8,
    },
    heading2: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontSize: 22,
      fontWeight: '700',
      marginVertical: 8,
    },
    heading3: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontSize: 20,
      fontWeight: '700',
      marginVertical: 8,
    },
    bullet_list: {
      marginTop: 8,
    },
    bullet_list_item: {
      marginBottom: 4,
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
    },
    bullet_list_icon: {
      marginRight: 4,
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginVertical: 8,
    },
    link: {
      color: role === 'user' ? '#FFFFFF' : '#E94057',
      textDecorationLine: 'none',
    },
    code_inline: {
      backgroundColor: role === 'user' ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
    },
    strong: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontWeight: '700',
    },
    em: {
      color: role === 'user' ? '#FFFFFF' : '#1A1A1A',
      fontStyle: 'italic',
    },
  };

  return (
    <YStack
      backgroundColor={role === 'user' ? '#10A37F' : '#F3F4F6'}
      paddingHorizontal={15}
      paddingVertical={5}
      borderRadius={20}
      maxWidth={350}
      width={role === 'user' ? 'auto' : '80%'}
      minWidth={100}
      alignSelf={role === 'user' ? 'flex-end' : 'flex-start'}
      marginHorizontal={16}
      marginTop={4}
      marginBottom={4}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowRadius={8}
      elevation={2}>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </YStack>
  );
};

export function ChatbotPopup({ isOpen, onClose }: ChatbotPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const { profile } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd();
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const body = JSON.stringify({
        question: userMessage,
        chat_id: profile?.id || crypto.randomUUID(),
        profile_id: profile?.id,
      });

      const loadingMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', isTyping: true, responseTime: loadingMessageId },
      ]);

      const response = await fetch('https://climbing-pegasus-meet.ngrok-free.app/mobile/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from server');
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.responseTime === loadingMessageId
            ? {
                role: 'assistant',
                content: data.result || 'Xin lỗi, đã xảy ra lỗi.',
                isTyping: false,
                responseTime: loadingMessageId,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra khi kết nối với máy chủ.',
          isTyping: false,
          responseTime: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <YStack
      position="absolute"
      bottom={150}
      right={20}
      width={350}
      height={520}
      backgroundColor="white"
      borderRadius={20}
      shadowColor="#000000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.15}
      elevation={8}>
      <XStack
        backgroundColor="#10A37F"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        padding={16}
        alignItems="center"
        justifyContent="space-between">
        <XStack alignItems="center" space={8}>
          <YStack backgroundColor="white" padding={8} borderRadius={12}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#10A37F" />
          </YStack>
          <Text color="white" fontSize={16} fontWeight="600">
            Trợ Lý AI
          </Text>
        </XStack>
        <Button
          backgroundColor="transparent"
          onPress={onClose}
          pressStyle={{
            scale: 0.95,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 0,
          }}>
          <Ionicons name="close" size={24} color="white" />
        </Button>
      </XStack>

      <YStack flex={1} backgroundColor="#F9FAFB">
        <ScrollView
          ref={scrollViewRef}
          // padding={16}
          paddingBottom={40}
          bounces={false}
          showsVerticalScrollIndicator={false}>
          {messages.map((item, index) => (
            <XStack
              key={index}
              marginVertical={6}
              justifyContent={item.role === 'user' ? 'flex-end' : 'flex-start'}>
              {item.isTyping ? (
                <LoadingSpinner />
              ) : (
                <MessageContent content={item.content} role={item.role} />
              )}
            </XStack>
          ))}
        </ScrollView>
      </YStack>

      <XStack
        padding={16}
        space={8}
        borderBottomLeftRadius={20}
        borderBottomRightRadius={20}
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="#E5E7EB">
        <Input
          flex={1}
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn của bạn..."
          placeholderTextColor="#9CA3AF"
          fontSize={15}
          lineHeight={22}
          borderWidth={1}
          borderColor="#E5E7EB"
          borderRadius={24}
          paddingHorizontal={16}
          paddingVertical={10}
          backgroundColor="white"
          color="#1A1A1A"
          editable={!isLoading}
        />
        <Button
          circular
          width={40}
          height={40}
          backgroundColor={isLoading || !input.trim() ? '#E5E7EB' : '#10A37F'}
          disabled={isLoading || !input.trim()}
          onPress={handleSubmit}
          animation="quick"
          pressStyle={{
            scale: 0.95,
            opacity: 0.9,
            borderWidth: 0,
            backgroundColor:
              isLoading || !input.trim() ? 'rgba(229, 231, 235, 0.8)' : 'rgba(16, 163, 127, 0.8)',
          }}>
          {isLoading ? (
            <ActivityIndicator
              color={isLoading || !input.trim() ? '#9CA3AF' : 'white'}
              size="small"
            />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={isLoading || !input.trim() ? '#9CA3AF' : 'white'}
            />
          )}
        </Button>
      </XStack>
    </YStack>
  );
}

const LoadingSpinner = () => (
  <XStack padding={4} alignItems="center" space={8}>
    <ActivityIndicator size="small" color="#10A37F" />
    <Text color="#6B7280" fontSize={15} lineHeight={22}>
      Đang xử lý...
    </Text>
  </XStack>
);
