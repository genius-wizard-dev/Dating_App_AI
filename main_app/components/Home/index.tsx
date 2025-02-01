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
import { Feed, FeedInfoUser } from '~/types/feed';
import { Filter } from '~/types/filter';
import { ActionButtons } from './ActionButtons';
import { Card } from './Card';
import Filters from './Filters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Paralax: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const position = useRef(new Animated.ValueXY()).current;
  const [showFilter, setShowFilter] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeMagnitude, setSwipeMagnitude] = useState(0);
  const { info, feeds, currentIndex, isInitialized } = useSelector(
    (state: RootState) => state.feed
  );
  const ages = info.map((profile) => profile.age);
  const minAge = ages.length > 0 ? Math.min(...ages) : 18;
  const maxAge = ages.length > 0 ? Math.max(...ages) : 35;
  const ageRange = [minAge, maxAge];
  const allLocations = 'Tất cả';
  const locations = [
    'Tất cả',
    ...new Set(info.map((profile) => profile.location).filter(Boolean)),
  ] as string[];
  const initialFilter: Filter = {
    gender: 'Both',
    location: allLocations,
    ageRange: ageRange,
  };

  const [filters, setFilters] = useState<Filter>(initialFilter);
  const [filteredFeeds, setFilteredFeeds] = useState<Feed[]>(feeds);
  useEffect(() => {
    const loadFeeds = async () => {
      try {
        setIsLoading(true);
        await dispatch(getFeeds() as any);
      } catch (error) {
        console.error('Error loading feeds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized || feeds.length === 0) {
      loadFeeds();
      dispatch(setIsInitialized(true));
    }
  }, [isInitialized]);
  useEffect(() => {
    const filterProfiles = (p: FeedInfoUser) => {
      const ageInRange = p.age >= filters.ageRange[0] && p.age <= filters.ageRange[1];
      const genderMatch = filters.gender === 'Both' || p.gender === filters.gender;
      const locationMatch = filters.location === 'Tất cả' || p.location === filters.location;
      return ageInRange && genderMatch && locationMatch;
    };
    const filteredIds = info.filter(filterProfiles).map((p) => p.id);
    const filtered = feeds.filter((f) => filteredIds.includes(f.user_id));

    if (feeds.length > 0) {
      setFilteredFeeds(filtered);
    }
  }, [filters, feeds, info]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!user?.id || !filteredFeeds[currentIndex]) return;

    dispatch(
      insertInteraction({
        userId: user.id,
        storyId: filteredFeeds[currentIndex].id,
        targetUserId: filteredFeeds[currentIndex].user_id,
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

  const renderCard = (feed: Feed, index: number) => {
    if (index < currentIndex) return null;
    const isFirstCard = index === currentIndex;
    const profile = info.find((item) => item.id === feed.user_id) as FeedInfoUser;
    const { age, full_name, location } = profile;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    const animatedCardStyle = {
      transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
      zIndex: filteredFeeds.length - index,
    };

    return (
      <Animated.View
        key={feed.id}
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH - 20,
            height: SCREEN_HEIGHT * 0.7,
            top: 10,
          },
          isFirstCard ? animatedCardStyle : { zIndex: filteredFeeds.length - index },
        ]}
        {...(isFirstCard ? panResponder.panHandlers : {})}>
        <Card
          imgUrl={feed.image}
          name={full_name}
          age={age}
          desc={feed.status}
          location={location ?? ''}
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

    if (!isLoading && (currentIndex >= filteredFeeds.length || filteredFeeds.length === 0)) {
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

    return filteredFeeds
      .map((feed: Feed, index) => {
        if (index < currentIndex) return null;
        return renderCard(feed, index);
      })
      .reverse();
  }, [filteredFeeds, currentIndex, isLoading, renderCard, isResetting]);

  const handleResetCards = async () => {
    try {
      setIsResetting(true);
      dispatch(resetIndex());
      position.setValue({ x: 0, y: 0 });
      dispatch(getFeeds() as any);
    } catch (error) {
      console.error('Error resetting feeds:', error);
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
    if (isResetting || currentIndex >= filteredFeeds.length) return;
    if (!user?.id || !filteredFeeds[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('left', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: filteredFeeds[currentIndex].id,
          targetUserId: filteredFeeds[currentIndex].user_id,
          preferenceType: InteractionType.DISLIKE,
        }) as any
      );
      dispatch(setNextIndex());
    });
  };

  const handleInterest = () => {
    if (isResetting || currentIndex >= filteredFeeds.length) return;
    if (!user?.id || !filteredFeeds[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('right', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: filteredFeeds[currentIndex].id,
          targetUserId: filteredFeeds[currentIndex].user_id,
          preferenceType: InteractionType.INTEREST,
        }) as any
      );
      dispatch(setNextIndex());
    });
  };

  const handleLove = () => {
    if (isResetting || currentIndex >= filteredFeeds.length) return;
    if (!user?.id || !filteredFeeds[currentIndex]) {
      console.warn('Missing user ID or card data');
      return;
    }

    animateCard('right', () => {
      dispatch(
        insertInteraction({
          userId: user.id,
          storyId: filteredFeeds[currentIndex].id,
          targetUserId: filteredFeeds[currentIndex].user_id,
          preferenceType: InteractionType.LOVE,
        }) as any
      );

      if (filteredFeeds[currentIndex].user_id === user?.id) {
        router.push({
          pathname: '/account/[id]',
          params: {
            id: filteredFeeds[currentIndex].user_id,
            goBack: '/home',
          },
        });
      } else {
        router.push({
          pathname: '/profile/[id]',
          params: {
            id: filteredFeeds[currentIndex].user_id,
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
        {!isLoading && currentIndex < filteredFeeds.length && filteredFeeds.length > 0 && (
          <ActionButtons
            onDislike={handleDislike}
            onSuperLike={handleInterest}
            onHeartPress={() => {
              handleLove();
            }}
          />
        )}
      </Stack>

      <Filters
        initialFilters={initialFilter}
        feeds={feeds}
        locations={locations}
        ageRange={ageRange}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filters={filters}
        setFilters={setFilters}
      />
    </Stack>
  );
};

export default Paralax;
