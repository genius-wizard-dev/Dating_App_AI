import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog, Image, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';
import { Camera } from '~/assets/icons';
import InputField from '~/components/InputField';
import { RootState } from '~/redux/store';
import { getProfile } from '~/redux/thunks/user';
import { ProfileData } from '~/types';
import { pickImage, updateProfile, uploadImage } from '~/utils/imageUtils';

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

const Security = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const goBack = params.goBack as Href<string>;
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state: RootState) => state.user);

  const [profileData, setProfileData] = useState<ProfileData | null>(profile);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile?.hobbies || []);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [alert, setAlert] = useState({ isOpen: false, message: '' });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleHobbiesSelect = useCallback(
    (hobby: string) => {
      setSelectedHobbies((prev) =>
        prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
      );
      setProfileData((prev: any) => {
        if (!prev) return null;
        const updatedHobbies = selectedHobbies.includes(hobby)
          ? selectedHobbies.filter((h) => h !== hobby)
          : [...selectedHobbies, hobby];
        return { ...prev, hobbies: updatedHobbies };
      });
    },
    [selectedHobbies]
  );

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) {
      setImage(result.uri);
    }
  };

  const getImageSource = () => {
    if (image) return { uri: image };
    if (profile?.avatar) return { uri: profile.avatar };
    return require('~/assets/avatar.jpg');
  };

  const handleImageUpload = async (imageUri: string, userId: string) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          const imageUpload = {
            base64: base64Data,
            uri: imageUri,
            mimeType: 'image/jpeg',
            fileName: `avatar_${Date.now()}.jpg`,
          };

          const uploadResult = await uploadImage(imageUpload, userId, 'avatars', profile?.avatar);
          resolve(uploadResult);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image',
      };
    }
  };

  const handleSave = async () => {
    if (!profileData?.id) {
      setAlert({
        isOpen: true,
        message: 'Cannot update: Missing profile information.',
      });
      return;
    }

    try {
      setIsLoading(true);
      let updatedProfile = { ...profileData };

      if (image && image !== profile?.avatar) {
        const imageUploadResult = await handleImageUpload(image, profileData.id);
        if (imageUploadResult.success && imageUploadResult.url) {
          updatedProfile.avatar = imageUploadResult.url;
        }
      }

      const result = await updateProfile(updatedProfile);
      if (result.success) {
        await dispatch(getProfile(user as User) as any);
        router.replace(goBack);
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="#E94057" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#FFFFFF" paddingTop={56} paddingHorizontal={20}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <XStack
          paddingHorizontal={20}
          justifyContent="space-between"
          alignItems="center"
          marginBottom={20}>
          <Button
            pressStyle={{ backgroundColor: 'white', borderColor: '#E8E6EA' }}
            marginRight={'auto'}
            borderWidth={1.5}
            bg={'white'}
            borderColor={'#E8E6EA'}
            width={62}
            height={62}
            borderRadius={15}
            justifyContent="center"
            alignItems="center"
            onPress={() => router.replace(goBack)}>
            <Ionicons name="chevron-back" size={24} color="#E94057" />
          </Button>
          <Text fontSize={34} fontWeight="bold" color="#1A1A1A">
            Chỉnh sửa
          </Text>
        </XStack>
        <YStack
          paddingHorizontal={20}
          space={24}
          paddingBottom={30}
          justifyContent="center"
          alignItems="center">
          <XStack justifyContent="center" alignItems="center" width={120} marginBottom={20}>
            <Image
              source={getImageSource()}
              style={{ width: 120, height: 120, borderRadius: 25 }}
            />
            <Pressable
              style={{
                backgroundColor: '#E94057',
                width: 45,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1000,
                borderWidth: 2,
                borderColor: 'white',
                position: 'absolute',
                right: -15,
                bottom: -15,
              }}
              onPress={handlePickImage}>
              <Camera />
            </Pressable>
          </XStack>
          <InputField
            id="username"
            label="Username"
            value={profileData?.username || ''}
            onChange={(text) => handleInputChange('username', text)}
          />
          <InputField
            id="full_name"
            label="Họ và tên"
            value={profileData?.full_name || ''}
            onChange={(text) => handleInputChange('full_name', text)}
          />
          <InputField
            id="birthday"
            label="Ngày sinh"
            value={profileData?.birthday || ''}
            onChange={(value: string) => handleInputChange('birthday', value)}
            type="date"
          />
          <InputField
            id="email"
            label="Email"
            value={profileData?.email || ''}
            onChange={(text) => handleInputChange('email', text)}
          />

          <InputField
            id="bio"
            label="Giới thiệu bản thân"
            value={profileData?.bio || ''}
            onChange={(text) => handleInputChange('bio', text)}
          />
          <InputField
            id="location"
            label="Vị trí"
            value={profileData?.location || ''}
            onChange={(text) => handleInputChange('location', text)}
          />
          <Dialog>
            <Dialog.Trigger asChild>
              <Button
                backgroundColor="white"
                paddingHorizontal={16}
                borderWidth={1.5}
                borderColor="#E94067"
                height={60}
                borderRadius={15}
                paddingVertical={8}
                width={'100%'}
                pressStyle={{ backgroundColor: 'white', scale: 0.95, borderColor: '#E94057' }}>
                <Text fontSize={14} color="#E94057" fontWeight={'bold'}>
                  Tùy chỉnh sở thích
                </Text>
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                key="overlay"
                animation="quick"
                opacity={0.5}
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
              <Dialog.Content
                bordered
                elevate
                key="content"
                animation={[
                  'quick',
                  {
                    opacity: {
                      overshootClamping: true,
                    },
                  },
                ]}
                enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                x={0}
                scale={1}
                opacity={1}
                y={0}
                backgroundColor="#FFFFFF"
                padding={20}
                width="90%"
                maxWidth={400}>
                <YStack space>
                  <Dialog.Title fontSize={20} fontWeight="bold" marginBottom={15} color="black">
                    Chọn sở thích
                  </Dialog.Title>
                  <ScrollView maxHeight={400}>
                    <XStack flexWrap="wrap" justifyContent="flex-start" gap={10}>
                      {hobbies.map((hobby) => (
                        <Button
                          key={hobby}
                          onPress={() => handleHobbiesSelect(hobby)}
                          backgroundColor={selectedHobbies.includes(hobby) ? '#FF6B8A' : '#FFF0F3'}
                          paddingHorizontal={16}
                          paddingVertical={10}
                          borderRadius={20}
                          pressStyle={{ backgroundColor: '#FF6B8A', borderWidth: 0 }}>
                          <Text
                            fontSize={16}
                            color={selectedHobbies.includes(hobby) ? 'white' : '#FF4D67'}>
                            {hobby}
                          </Text>
                        </Button>
                      ))}
                    </XStack>
                  </ScrollView>
                  <Dialog.Close asChild>
                    <Button
                      backgroundColor="#FF4D67"
                      paddingHorizontal={16}
                      height={50}
                      borderRadius={25}
                      marginTop={20}>
                      <Text color="white" fontWeight="600" fontSize={18}>
                        Đóng
                      </Text>
                    </Button>
                  </Dialog.Close>
                </YStack>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
          <Button
            onPress={handleSave}
            backgroundColor="#E94057"
            color="white"
            fontSize={16}
            fontWeight="bold"
            width={'100%'}
            borderWidth={0}
            height={60}
            borderRadius={15}
            marginTop={20}
            pressStyle={{ scale: 0.95, backgroundColor: '#E94057' }}>
            Lưu thay đổi
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default Security;
