import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spinner, Stack, Text, XStack, YStack } from 'tamagui';
import Alert from '~/components/Alert';
import { RootState } from '~/redux/store';
import {
  acceptFriend,
  getFriendRequests,
  getFriends,
  rejectFriend,
  removeFriend,
} from '~/redux/thunks/friend';

const ITEMS_PER_PAGE = 5;

const BUTTON_STYLES = {
  height: 45,
  borderRadius: 10,
  pressStyle: { scale: 0.98 },
};

interface Friend {
  id: string;
  full_name: string;
  avatar: string;
}

const FriendItem = ({
  friend,
  onRemove,
  loading,
}: {
  friend: Friend;
  onRemove: (id: string) => void;
  loading: boolean;
}) => (
  <XStack space={12} backgroundColor="#F8F8F8" padding={15} borderRadius={15}>
    <Button
      width={60}
      height={60}
      padding={0}
      borderWidth={0}
      borderRadius={30}
      overflow="hidden"
      onPress={() => {
        router.push({
          pathname: '/profile/[id]',
          params: {
            id: friend.id,
            goBack: '/friend',
          },
        });
      }}>
      <Image
        source={{ uri: friend.avatar }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Button>
    <YStack flex={1} justifyContent="center">
      <Text fontSize={16} fontWeight="600" color="#1A1A1A">
        {friend.full_name}
      </Text>
    </YStack>
    <Button
      backgroundColor="#E94057"
      paddingHorizontal={16}
      height={36}
      borderRadius={18}
      onPress={() => onRemove(friend.id)}
      disabled={loading}>
      <Text color="white" fontWeight="600" fontSize={13}>
        Hủy kết bạn
      </Text>
    </Button>
  </XStack>
);

const FriendRequest = ({
  request,
  onAccept,
  onReject,
  loading,
}: {
  request: Friend;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}) => (
  <XStack space={12} backgroundColor="#F8F8F8" padding={15} borderRadius={15}>
    <Stack width={60} height={60} borderRadius={30} overflow="hidden">
      <Image
        source={{ uri: request.avatar }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Stack>
    <YStack flex={1} justifyContent="center">
      <Text fontSize={16} fontWeight="600" color="#1A1A1A">
        {request.full_name}
      </Text>
    </YStack>
    <XStack space={8} alignItems="center">
      <Button
        backgroundColor="#E94057"
        paddingHorizontal={16}
        height={36}
        borderRadius={18}
        onPress={() => onAccept(request.id)}
        disabled={loading}>
        <Text color="white" fontWeight="600" fontSize={13}>
          Đồng ý
        </Text>
      </Button>
      <Button
        backgroundColor="#F0F0F0"
        paddingHorizontal={16}
        height={36}
        borderRadius={18}
        onPress={() => onReject(request.id)}
        disabled={loading}>
        <Text color="#666666" fontWeight="600" fontSize={13}>
          Từ chối
        </Text>
      </Button>
    </XStack>
  </XStack>
);

const Friend = () => {
  const [displayState, setDisplayState] = useState({
    showAllRequests: false,
    showAllFriends: false,
    requestsDisplayCount: ITEMS_PER_PAGE,
    friendsDisplayCount: ITEMS_PER_PAGE,
    activeTab: 'requests' as 'requests' | 'friends',
  });
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '',
    selectedFriendId: null as string | null,
    selectedRequestId: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const friendsRequestInfo =
    useSelector((state: RootState) => state.friend.friendsRequestInfo) || [];
  const friendInfo = useSelector((state: RootState) => state.friend.friendInfo) || [];
  const { user } = useSelector((state: RootState) => state.user);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.id) {
        await Promise.all([
          dispatch(getFriends(user.id) as any),
          dispatch(getFriendRequests(user.id) as any),
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleShowMore = (type: 'requests' | 'friends') => {
    setDisplayState((prev) => ({
      ...prev,
      [type === 'requests' ? 'requestsDisplayCount' : 'friendsDisplayCount']:
        prev[type === 'requests' ? 'requestsDisplayCount' : 'friendsDisplayCount'] + ITEMS_PER_PAGE,
      [type === 'requests' ? 'showAllRequests' : 'showAllFriends']: true,
    }));
  };

  const handleCollapse = (type: 'requests' | 'friends') => {
    setDisplayState((prev) => ({
      ...prev,
      [type === 'requests' ? 'requestsDisplayCount' : 'friendsDisplayCount']: ITEMS_PER_PAGE,
      [type === 'requests' ? 'showAllRequests' : 'showAllFriends']: false,
    }));
  };

  const renderLoadingSpinner = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" marginBottom={80}>
      <Spinner size="large" color="#E94057" />
      <Text color="#666666" marginTop={10}>
        Đang tải dữ liệu
      </Text>
    </YStack>
  );

  const handleRemoveFriend = useCallback((id: string) => {
    setAlertState((prev) => ({
      ...prev,
      selectedFriendId: id,
      title: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn hủy kết bạn?',
      isOpen: true,
    }));
  }, []);

  const renderFriendRequests = () => (
    <YStack paddingHorizontal={20} space={15} marginBottom={80}>
      {friendsRequestInfo.slice(0, displayState.requestsDisplayCount).map((request) => (
        <FriendRequest
          key={request.id}
          request={request}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          loading={loading}
        />
      ))}
      {!displayState.showAllRequests &&
        friendsRequestInfo.length > displayState.requestsDisplayCount && (
          <Button
            backgroundColor="#F8F8F8"
            height={50}
            borderRadius={15}
            onPress={() => handleShowMore('requests')}
            pressStyle={{
              scale: 0.98,
              backgroundColor: '#F0F0F0',
              borderColor: '#F0F0F0',
            }}>
            <Text color="#666666">
              Xem thêm {friendsRequestInfo.length - displayState.requestsDisplayCount} lời mời
            </Text>
          </Button>
        )}
      {displayState.showAllRequests && displayState.requestsDisplayCount > ITEMS_PER_PAGE && (
        <Button
          backgroundColor="#F8F8F8"
          height={50}
          borderRadius={15}
          onPress={() => handleCollapse('requests')}
          pressStyle={{
            scale: 0.98,
            backgroundColor: '#F0F0F0',
            borderColor: '#F0F0F0',
          }}>
          <Text color="#666666">Thu gọn</Text>
        </Button>
      )}
    </YStack>
  );

  const renderFriendsList = useMemo(
    () => (
      <YStack paddingHorizontal={20} space={15} marginBottom={80}>
        {friendInfo.slice(0, displayState.friendsDisplayCount).map((friend) => (
          <FriendItem
            key={friend.id}
            friend={friend}
            onRemove={handleRemoveFriend}
            loading={loading}
          />
        ))}
        {!displayState.showAllFriends && friendInfo.length > displayState.friendsDisplayCount && (
          <Button
            backgroundColor="#F8F8F8"
            height={50}
            borderRadius={15}
            onPress={() => handleShowMore('friends')}
            pressStyle={{
              scale: 0.98,
              backgroundColor: '#F0F0F0',
              borderColor: '#F0F0F0',
            }}>
            <Text color="#666666">
              Xem thêm {friendInfo.length - displayState.friendsDisplayCount} bạn bè
            </Text>
          </Button>
        )}
        {displayState.showAllFriends && displayState.friendsDisplayCount > ITEMS_PER_PAGE && (
          <Button
            backgroundColor="#F8F8F8"
            height={50}
            borderRadius={15}
            onPress={() => handleCollapse('friends')}
            pressStyle={{
              scale: 0.98,
              backgroundColor: '#F0F0F0',
              borderColor: '#F0F0F0',
            }}>
            <Text color="#666666">Thu gọn</Text>
          </Button>
        )}
      </YStack>
    ),
    [friendInfo, loading, displayState.friendsDisplayCount, handleRemoveFriend]
  );

  const handleCloseAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false, selectedFriendId: null }));
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      if (alertState.selectedFriendId && user?.id) {
        await dispatch(
          removeFriend({
            profile_id: user.id,
            selectedFriendId: alertState.selectedFriendId,
          }) as any
        );
      }
      setAlertState((prev) => ({ ...prev, title: 'Thành công', message: 'Thao tác thành công' }));
      loadData();
    } catch (error) {
      setAlertState((prev) => ({
        ...prev,
        title: 'Thất bại',
        message: 'Có lỗi xảy ra khi thực hiện thao tác',
      }));
    } finally {
      setLoading(false);
      setAlertState((prev) => ({ ...prev, isOpen: false, selectedFriendId: null }));
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      if (user?.id) {
        await dispatch(
          acceptFriend({
            profile_id: user.id,
            friend_id: requestId,
          }) as any
        );
        await loadData();
      }
      setAlertState((prev) => ({
        ...prev,
        title: 'Thành công',
        message: 'Đã chấp nhận lời mời kết bạn',
        isOpen: true,
      }));
    } catch (error) {
      setAlertState((prev) => ({
        ...prev,
        title: 'Thất bại',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi chấp nhận lời mời',
        isOpen: true,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoading(true);
      if (user?.id) {
        await dispatch(
          rejectFriend({
            profile_id: user.id,
            friend_id: requestId,
          }) as any
        );
        await dispatch(getFriendRequests(user.id) as any);
      }
      setAlertState((prev) => ({
        ...prev,
        title: 'Thành công',
        message: 'Đã từ chối lời mời kết bạn',
      }));
    } catch (error) {
      console.error('Error rejecting friend:', error);
      setAlertState((prev) => ({
        ...prev,
        title: 'Thất bại',
        message: 'Có lỗi xảy ra khi từ chối lời mời',
      }));
    } finally {
      setLoading(false);
      setAlertState((prev) => ({ ...prev, isOpen: true }));
    }
  };

  return (
    <YStack flex={1} backgroundColor="#FFFFFF" paddingTop={56}>
      <XStack
        paddingHorizontal={20}
        justifyContent="space-between"
        alignItems="center"
        marginBottom={20}>
        <Text fontSize={34} fontWeight="bold" color="#1A1A1A">
          Bạn bè
        </Text>

        <Stack>
          <Ionicons name="search" size={24} color="#666666" />
        </Stack>
      </XStack>

      <XStack paddingHorizontal={20} marginBottom={20}>
        <Button
          flex={1}
          backgroundColor={displayState.activeTab === 'requests' ? '#E94057' : '#F8F8F8'}
          {...BUTTON_STYLES}
          pressStyle={{
            ...BUTTON_STYLES.pressStyle,

            backgroundColor: displayState.activeTab === 'requests' ? '#E94057' : '#F0F0F0',

            borderColor: displayState.activeTab === 'requests' ? '#E94057' : '#F0F0F0',
          }}
          onPress={() => setDisplayState((prev) => ({ ...prev, activeTab: 'requests' }))}>
          <Text
            color={displayState.activeTab === 'requests' ? 'white' : '#666666'}
            fontFamily="$body">
            Lời mời ({friendsRequestInfo.length})
          </Text>
        </Button>

        <Button
          flex={1}
          backgroundColor={displayState.activeTab === 'friends' ? '#E94057' : '#F8F8F8'}
          {...BUTTON_STYLES}
          marginLeft={10}
          pressStyle={{
            ...BUTTON_STYLES.pressStyle,

            backgroundColor: displayState.activeTab === 'friends' ? '#E94057' : '#F0F0F0',

            borderColor: displayState.activeTab === 'friends' ? '#E94057' : '#F0F0F0',
          }}
          onPress={() => setDisplayState((prev) => ({ ...prev, activeTab: 'friends' }))}>
          <Text
            color={displayState.activeTab === 'friends' ? 'white' : '#666666'}
            fontFamily="$body">
            Bạn bè ({friendInfo.length})
          </Text>
        </Button>
      </XStack>

      {loading ? (
        renderLoadingSpinner()
      ) : (
        <ScrollView>
          {displayState.activeTab === 'requests' ? renderFriendRequests() : renderFriendsList}
        </ScrollView>
      )}

      <Alert
        isOpen={alertState.isOpen}
        onClose={handleCloseAlert}
        onAccept={alertState.selectedFriendId ? handleConfirmAction : handleCloseAlert}
        message={alertState.message}
        title={alertState.title}
        cancelText={alertState.selectedFriendId ? 'Hủy' : 'Đóng'}
        acceptText={alertState.selectedFriendId ? 'Xác nhận' : 'OK'}
      />
    </YStack>
  );
};

export default Friend;
