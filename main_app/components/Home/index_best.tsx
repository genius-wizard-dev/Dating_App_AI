import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, PanResponder } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Stack, Text, YStack } from 'tamagui';
import { resetIndex, setIsInitialized, setNextIndex } from '~/redux/slices/feeds';
import { InteractionType } from '~/redux/slices/interactions';
import { RootState } from '~/redux/store';
import { getFeeds } from '~/redux/thunks/feeds';
import { insertInteraction } from '~/redux/thunks/interactions';
import { ActionButtons } from './ActionButtons';
import { Card } from './Card';
import Filter from './Filters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Paralax: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    interestedIn: 'Both',
    location: 'Chicago, USA',
    distance: 50,
    ageRange: [18, 35],
  });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeMagnitude, setSwipeMagnitude] = useState(0);
  const {
    profileData,
    feeds: cards,
    currentIndex,
    isInitialized,
  } = useSelector((state: RootState) => state.feed);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        setIsLoading(true);
        console.log('Loading feeds...');
        await dispatch(getFeeds() as any);
        console.log('Feeds loaded successfully');
      } catch (error) {
        console.error('Error loading feeds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    console.log('useEffect check:', { isInitialized, cardsLength: cards.length });
    if (!isInitialized || cards.length === 0) {
      loadFeeds();
      dispatch(setIsInitialized(true));
    }
  }, [isInitialized]);

  const isDataReady = !isLoading && cards.length > 0 && currentIndex < cards.length;
  console.log('Data readiness check:', {
    isLoading,
    cardsLength: cards.length,
    currentIndex,
    isDataReady,
  });

  const handleCardInteraction = (cardData: any, direction: number) => {
    if (!user?.id || !cardData) {
      console.warn('Missing required data:', {
        hasUserId: !!user?.id,
        hasCardData: !!cardData,
      });
      return;
    }

    if (direction > 0) {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: cardData.id,
          targetUserId: cardData.user_id,
          preferenceType: InteractionType.INTEREST,
        }) as any
      );
    } else {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: cardData.id,
          targetUserId: cardData.user_id,
          preferenceType: InteractionType.DISLIKE,
        }) as any
      );
    }

    dispatch(setNextIndex());
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!user?.id || !cards[currentIndex]) return;

    dispatch(
      insertInteraction({
        userId: user.id,
        storyId: cards[currentIndex].id,
        targetUserId: cards[currentIndex].user_id,
        preferenceType: direction === 'right' ? InteractionType.INTEREST : InteractionType.DISLIKE,
      }) as any
    );
    dispatch(setNextIndex());
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > SCREEN_WIDTH * 0.4) {
        const direction = gesture.dx > 0 ? 'right' : 'left';
        Animated.timing(position, {
          toValue: {
            x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
            y: gesture.dy,
          },
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleSwipe(direction);
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const renderCard = (item: any, index: number) => {
    if (index < currentIndex) return null;

    const isFirstCard = index === currentIndex;
    const profile = profileData[item.user_id] || {};
    const { age, full_name } = profile;

    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    const animatedCardStyle = {
      transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
      zIndex: cards.length - index,
    };

    return (
      <Animated.View
        key={item.id}
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH - 20,
            height: SCREEN_HEIGHT * 0.7,
            top: 10,
          },
          isFirstCard ? animatedCardStyle : { zIndex: cards.length - index },
        ]}
        {...(isFirstCard ? panResponder.panHandlers : {})}>
        <Card
          imgUrl={item.image}
          name={full_name}
          age={age}
          desc={item.status}
          swipeDirection={swipeDirection}
          swipeMagnitude={swipeMagnitude}
        />
      </Animated.View>
    );
  };

  const renderCards = useCallback(() => {
    if (isLoading) {
      return (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#E94057" />
          <Text marginTop={10} color="$gray10">
            Đang tải dữ liệu...
          </Text>
        </Stack>
      );
    }

    if (!isLoading && (currentIndex >= cards.length || cards.length === 0)) {
      return (
        <Stack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <Ionicons name="reload-circle-outline" size={48} color="#E94057" />
          <Text marginTop={10} color="$gray10" textAlign="center">
            Không còn hồ sơ nào để hiển thị
          </Text>
          <Button
            backgroundColor="#E94057"
            color="white"
            onPress={handleResetCards}
            disabled={isResetting}
            pressStyle={{ opacity: 0.8 }}
            paddingHorizontal={24}
            paddingVertical={10}
            borderRadius={100}>
            {isResetting ? (
              <Stack flexDirection="row" alignItems="center" gap={8}>
                <ActivityIndicator color="white" size="small" />
                <Text color="white">Đang tải...</Text>
              </Stack>
            ) : (
              <Text color="white">Tải thêm hồ sơ</Text>
            )}
          </Button>
        </Stack>
      );
    }

    return cards
      .map((item, index) => {
        if (index < currentIndex) return null;
        return renderCard(item, index);
      })
      .reverse();
  }, [cards, currentIndex, isLoading, renderCard, isResetting]);

  const handleResetCards = async () => {
    try {
      setIsResetting(true);
      dispatch(resetIndex());
      position.setValue({ x: 0, y: 0 });
      dispatch(getFeeds() as any);
    } catch (error) {
      console.error('Error resetting cards:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const animateCard = (direction: 'left' | 'right', onComplete: () => void) => {
    Animated.timing(position, {
      toValue: {
        x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0,
      },
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleDislike = () => {
    if (isResetting || currentIndex >= cards.length) return;
    if (!user?.id || !cards[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('left', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: cards[currentIndex].id,
          targetUserId: cards[currentIndex].user_id,
          preferenceType: InteractionType.DISLIKE,
        }) as any
      );
      dispatch(setNextIndex());
    });
  };

  const handleInterest = () => {
    if (isResetting || currentIndex >= cards.length) return;
    if (!user?.id || !cards[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('right', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: cards[currentIndex].id,
          targetUserId: cards[currentIndex].user_id,
          preferenceType: InteractionType.INTEREST,
        }) as any
      );
      dispatch(setNextIndex());
    });
  };

  const handleLove = () => {
    if (isResetting || currentIndex >= cards.length) return;
    if (!user?.id || !cards[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('right', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: cards[currentIndex].id,
          targetUserId: cards[currentIndex].user_id,
          preferenceType: InteractionType.LOVE,
        }) as any
      );

      if (cards[currentIndex].user_id === user?.id) {
        router.push({
          pathname: '/account/[id]',
          params: {
            id: cards[currentIndex].user_id,
            goBack: '/home',
          },
        });
      } else {
        router.push({
          pathname: '/profile/[id]',
          params: {
            id: cards[currentIndex].user_id,
            goBack: '/home',
          },
        });
      }
    });
  };

  return (
    <Stack flex={1}>
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={16}
        width="100%"
        zIndex={0}>
        <YStack justifyContent="space-between" alignItems="flex-start" marginBottom={16}>
          <Text fontSize={30} fontWeight="bold" color="#1A1A1A">
            Khám phá
          </Text>
          <Stack
            backgroundColor="#FFE8EC"
            paddingHorizontal={15}
            paddingVertical={8}
            borderRadius={12}
            marginTop={8}>
            <Text fontSize={14} color="#E94057" fontWeight="600">
              {filters.location}
            </Text>
          </Stack>
        </YStack>

        <Button
          unstyled
          backgroundColor={showFilter ? '#E94057' : 'white'}
          width={60}
          height={60}
          borderRadius={16}
          borderWidth={1.5}
          borderColor={showFilter ? '#E94057' : '#F3F3F3'}
          justifyContent="center"
          alignItems="center"
          pressStyle={{
            backgroundColor: '#FAFAFA',
            scale: 0.97,
          }}
          onPress={() => setShowFilter(true)}>
          <Ionicons name="options-outline" size={24} color={showFilter ? 'white' : '#E94057'} />
        </Button>
      </Stack>

      <Stack flex={1} position="relative" alignItems="center" justifyContent="center" gap={20}>
        {renderCards()}
        {!isLoading && currentIndex < cards.length && cards.length > 0 && (
          <ActionButtons
            onDislike={handleDislike}
            onSuperLike={handleInterest}
            onHeartPress={() => {
              handleLove();
            }}
          />
        )}
      </Stack>

      <Filter
        feeds={cards}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filters={filters}
        setFilters={setFilters}
      />
    </Stack>
  );
};

export default Paralax;
