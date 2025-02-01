import type { User } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ScrollView, Spinner, Text, View, YStack } from 'tamagui';
import Alert from '~/components/Alert';
import { RootState } from '~/redux/store';
import { getProfile } from '~/redux/thunks/user';
import { updateProfile } from '~/utils/imageUtils';
const hobbies = [
  'Photography',
  'Shopping',
  'Karaoke',
  'Yoga',
  'Cooking',
  'Tennis',
  'Run',
  'Swimming',
  'Art',
  'Traveling',
  'Extreme',
  'Music',
  'Drink',
  'Video games',
];
const Interests: React.FC = () => {
  const router = useRouter();
  const { profile, user } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile?.hobbies || []);
  const [alert, setAlert] = useState({ isOpen: false, message: '' });
  const dispatch = useDispatch();
  const showNotification = async (title: string, message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,

          body: message,

          data: { url: '/(tabs)/home' },
        },

        trigger: null,
      });
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
    }
  };
  const handleHobbiesSelect = useCallback((hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  }, []);

  const handleContinue = useCallback(async () => {
    try {
      setLoading(true);
      const updatedProfile = {
        ...profile,
        hobbies: selectedHobbies,
        first_setup: true,
      };
      const result = await updateProfile(updatedProfile);
      if (result.success) {
        await dispatch(getProfile(user as User) as any);
        router.replace('/(tabs)/home');
        await showNotification('Update', 'Cập nhật thông tin thành công');
      } else {
        setAlert({
          isOpen: true,
          message: 'Failed to update profile. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [selectedHobbies, profile, router]);

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack
        width="100%"
        paddingHorizontal={30}
        paddingVertical={40}
        flex={1}
        bg="white"
        justifyContent="space-between"
        alignItems="center">
        <YStack justifyContent="center" alignItems="center" width="100%" space={20}>
          <Button
            pressStyle={{ backgroundColor: 'white', borderColor: '#E8E6EA' }}
            marginRight={'auto'}
            marginTop={55}
            borderWidth={1.5}
            bg={'white'}
            borderColor={'#E8E6EA'}
            width={62}
            height={62}
            borderRadius={15}
            justifyContent="center"
            alignItems="center"
            onPress={() => router.back()}>
            <Image
              source={require('../../assets/icons/back.svg')}
              style={{ width: 14, height: 20 }}
            />
          </Button>

          <View marginTop={20} marginBottom={10} width={'100%'} space={10}>
            <Text fontSize={35} fontWeight="bold" width="100%" textAlign="left">
              Your Interests
            </Text>
            <Text fontSize={16} color="#808080" width="100%" textAlign="left">
              Select a few of your interests and let everyone know what you’re passionate about.
            </Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
            }}
            width="100%">
            {hobbies.map((hobby) => (
              <Button
                key={hobby}
                onPress={() => handleHobbiesSelect(hobby)}
                backgroundColor={selectedHobbies.includes(hobby) ? '#E94057' : 'white'}
                borderColor={selectedHobbies.includes(hobby) ? '#E94057' : '#E8E6EA'}
                borderWidth={1.5}
                borderRadius={15}
                paddingHorizontal={20}
                justifyContent="center"
                alignItems="center"
                height={50}
                width="45%"
                pressStyle={{ backgroundColor: 'white', borderColor: '#E8E6EA' }}
                marginBottom={15}>
                <Text
                  fontSize={16}
                  fontWeight="bold"
                  color={selectedHobbies.includes(hobby) ? 'white' : 'black'}
                  textAlign="center">
                  {hobby}
                </Text>
              </Button>
            ))}
          </ScrollView>
        </YStack>
        <Button
          width="100%"
          height={60}
          borderRadius={15}
          backgroundColor="#E94057"
          borderWidth={2}
          borderColor="#E94057"
          color="white"
          fontWeight="bold"
          fontSize={16}
          onPress={handleContinue}
          disabled={selectedHobbies.length === 0}>
          Continue
        </Button>
      </YStack>
      <Alert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ isOpen: false, message: '' })}
        onAccept={() => setAlert({ isOpen: false, message: '' })}
        message={alert.message}
      />
    </>
  );
};

export default Interests;
