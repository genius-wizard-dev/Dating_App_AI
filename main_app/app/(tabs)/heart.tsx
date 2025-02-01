import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, Stack, Text, XStack, YStack } from 'tamagui';
import { InteractionType } from '~/redux/slices/interactions';
import { RootState } from '~/redux/store';
import { getUserInteractions, insertInteraction } from '~/redux/thunks/interactions';

const Heart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { userInteractions, loading } = useSelector((state: RootState) => state.interactions);
  const { feeds } = useSelector((state: RootState) => state.feed);
  const [activeTab, setActiveTab] = useState<InteractionType>(InteractionType.LOVE);

  const fetchUserInteractions = useCallback(() => {
    if (user?.id) {
      dispatch(getUserInteractions(user.id) as any);
    }
  }, [user?.id, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInteractions();
    }, [fetchUserInteractions])
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserInteractions(user.id) as any);
    }
  }, [user?.id]);

  const getFeedData = (storyId: number) => {
    return feeds.find((feed) => feed.id === storyId);
  };

  const handleInteraction = async (
    storyId: number,
    targetUserId: string,
    type: InteractionType
  ) => {
    if (!user?.id) return;

    try {
      await dispatch(
        insertInteraction({
          userId: user.id,
          storyId,
          targetUserId,
          preferenceType: type,
        }) as any
      );

      fetchUserInteractions();
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
  };

  const filteredInteractions = (type: InteractionType) => {
    return userInteractions.filter((interaction) => interaction.preference_type === type);
  };

  const handleLove = (storyId: number, targetUserId: string) => {
    handleInteraction(storyId, targetUserId, InteractionType.LOVE);
  };

  const handleInterest = (storyId: number, targetUserId: string) => {
    handleInteraction(storyId, targetUserId, InteractionType.INTEREST);
  };

  const handleDislike = (storyId: number, targetUserId: string) => {
    handleInteraction(storyId, targetUserId, InteractionType.DISLIKE);
  };

  const renderInteractionButtons = (feed: any) => {
    if (activeTab === InteractionType.DISLIKE) {
      return (
        <XStack justifyContent="space-between" width="100%">
          <TouchableOpacity onPress={() => handleLove(feed.id, feed.user_id)}>
            <Stack backgroundColor="rgba(255, 255, 255, 0.8)" borderRadius={30} padding={12}>
              <Ionicons name="heart" size={24} color="#E94057" />
            </Stack>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleInterest(feed.id, feed.user_id)}>
            <Stack backgroundColor="rgba(255, 255, 255, 0.8)" borderRadius={30} padding={12}>
              <Ionicons name="star" size={24} color="#8A2BE2" />
            </Stack>
          </TouchableOpacity>
        </XStack>
      );
    }

    return (
      <XStack justifyContent="space-between" width="100%">
        <TouchableOpacity
          onPress={() =>
            activeTab === InteractionType.LOVE
              ? handleInterest(feed.id, feed.user_id)
              : handleLove(feed.id, feed.user_id)
          }>
          <Stack backgroundColor="rgba(255, 255, 255, 0.8)" borderRadius={30} padding={12}>
            <Ionicons
              name={activeTab === InteractionType.LOVE ? 'star' : 'heart'}
              size={24}
              color={activeTab === InteractionType.LOVE ? '#8A2BE2' : '#E94057'}
            />
          </Stack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDislike(feed.id, feed.user_id)}>
          <Stack backgroundColor="rgba(255, 255, 255, 0.8)" borderRadius={30} padding={12}>
            <Ionicons name="close" size={24} color="#FF6B6B" />
          </Stack>
        </TouchableOpacity>
      </XStack>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="#E94057" />
        </Stack>
      );
    }

    const currentInteractions = filteredInteractions(activeTab);

    if (currentInteractions.length === 0) {
      return (
        <Stack flex={1} alignItems="center" justifyContent="center" paddingTop={32}>
          <Text color="#666666">Không có tương tác nào</Text>
        </Stack>
      );
    }

    return (
      <YStack padding={16} gap={16}>
        {currentInteractions.map((interaction, index) => {
          if (index % 2 !== 0) return null;
          const feed1 = getFeedData(interaction.story_id);
          const feed2 = currentInteractions[index + 1]
            ? getFeedData(currentInteractions[index + 1].story_id)
            : null;
          if (!feed1) return null;

          return (
            <XStack key={interaction.id} height={300} gap={16}>
              <Stack flex={1} borderRadius={16} overflow="hidden">
                <Image source={{ uri: feed1.image }} style={{ width: '100%', height: '100%' }} />
                <XStack position="absolute" bottom={16} left={16} right={16}>
                  {renderInteractionButtons(feed1)}
                </XStack>
              </Stack>
              {feed2 && (
                <Stack flex={1} borderRadius={16} overflow="hidden">
                  <Image source={{ uri: feed2.image }} style={{ width: '100%', height: '100%' }} />
                  <XStack position="absolute" bottom={16} left={16} right={16}>
                    {renderInteractionButtons(feed2)}
                  </XStack>
                </Stack>
              )}
            </XStack>
          );
        })}
      </YStack>
    );
  };

  const TabButton = ({
    type,
    icon,
    label,
  }: {
    type: InteractionType;
    icon: string;
    label: string;
  }) => (
    <TouchableOpacity onPress={() => setActiveTab(type)} style={{ flex: 1 }}>
      <Stack
        backgroundColor={activeTab === type ? '#E94057' : 'transparent'}
        borderRadius={30}
        padding={12}
        alignItems="center"
        margin={4}>
        <XStack gap={8} alignItems="center" justifyContent="center">
          <Ionicons name={icon as any} size={20} color={activeTab === type ? 'white' : '#666666'} />
          <Text
            color={activeTab === type ? 'white' : '#666666'}
            fontWeight={activeTab === type ? '600' : '400'}>
            {label}
          </Text>
        </XStack>
      </Stack>
    </TouchableOpacity>
  );

  return (
    <Stack flex={1} backgroundColor="#F3F3F3" marginTop={50}>
      <YStack paddingHorizontal={16}>
        <Text fontSize={30} fontWeight="bold" color="#1A1A1A">
          Tương tác
        </Text>
      </YStack>

      <Stack paddingTop={16} paddingHorizontal={16}>
        <XStack backgroundColor="white" borderRadius={30} padding={4}>
          <TabButton type={InteractionType.LOVE} icon="heart" label="Yêu thích" />
          <TabButton type={InteractionType.INTEREST} icon="star" label="Quan tâm" />
          <TabButton type={InteractionType.DISLIKE} icon="close-circle" label="Bỏ qua" />
        </XStack>
      </Stack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
        }}>
        <Stack flex={1} paddingTop={16}>
          {renderContent()}
        </Stack>
      </ScrollView>
    </Stack>
  );
};

export default Heart;
