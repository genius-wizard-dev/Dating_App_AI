import { Redirect, Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, YStack } from 'tamagui';
import { RootState } from '~/redux/store';
import { getSession } from '~/redux/thunks/auth';
import { getFeeds } from '~/redux/thunks/feeds';
import { getFriends } from '~/redux/thunks/friend';
import { getMessages } from '~/redux/thunks/message';
import { getProfile, getUserInfo } from '~/redux/thunks/user';

export default function AppLayout() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const result = await dispatch(getSession() as any);
        if (result.payload?.session !== null) {
          const userResult = await dispatch(getUserInfo() as any);
          if (userResult.payload?.user) {
            await dispatch(getProfile(userResult.payload.user) as any);
            await dispatch(getFriends(userResult.payload.user.id) as any);
            await dispatch(getMessages(userResult.payload.user.id) as any);
            await dispatch(getFeeds() as any);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy session:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [dispatch]);
  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
        <Spinner size="large" color="#E94057" />
      </YStack>
    );
  }

  if (!isLogin) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profile?.first_setup) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Slot />;
}
