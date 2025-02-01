import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Image, Spinner, Text, XStack, YStack } from 'tamagui';
import { Camera } from '~/assets/icons';
import Alert from '~/components/Alert';
import InputField from '~/components/InputField';
import { RootState } from '~/redux/store';
import { getProfile } from '~/redux/thunks/user';
import { ProfileData } from '~/types';
import { pickImage, updateProfile, uploadImage } from '~/utils/imageUtils';

export default function Setup() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { profile, user } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [alert, setAlert] = useState({ isOpen: false, message: '' });
  const [profileData, setProfileData] = useState<ProfileData | null>(profile);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const isBtnDisabled = !profileData?.full_name || !profileData?.username || !profileData?.birthday;

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result) {
      setImage(result.uri);
    }
  };

  const getImageSource = () => {
    if (image) return { uri: image };
    if (profile?.avatar) return { uri: profile.avatar };
    return require('../../assets/avatar.jpg');
  };

  const handleContinue = async () => {
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
        router.push('/(setup)/iam');
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

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="#E94057" />
      </YStack>
    );
  }
  return (
    <>
      <YStack
        width="100%"
        paddingHorizontal={30}
        paddingVertical={40}
        flex={1}
        bg="white"
        justifyContent="space-between"
        alignItems="center">
        <Text
          fontSize={35}
          fontWeight="bold"
          marginBottom={20}
          width="100%"
          textAlign="left"
          marginTop={55}>
          Profile Details
        </Text>

        <YStack justifyContent="space-between" alignItems="center">
          <XStack>
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
                right: -10,
                bottom: -15,
              }}
              onPress={handlePickImage}>
              <Camera />
            </Pressable>
          </XStack>

          <YStack marginVertical={50} space={20}>
            <InputField
              id="full_name"
              label="Full Name"
              value={profileData?.full_name || ''}
              onChange={(value: string) => handleInputChange('full_name', value)}
            />
            <InputField
              id="username"
              label="Username"
              value={profileData?.username || ''}
              onChange={(value: string) => handleInputChange('username', value)}
            />
            <InputField
              id="birthday"
              label="Birthday"
              value={profileData?.birthday || ''}
              onChange={(value: string) => handleInputChange('birthday', value)}
              type="date"
            />
          </YStack>
        </YStack>

        <Button
          width="100%"
          height={60}
          borderRadius={15}
          backgroundColor={isBtnDisabled ? 'grey' : '#E94057'}
          borderColor={isBtnDisabled ? 'grey' : '#E94057'}
          color="white"
          fontWeight="bold"
          fontSize={16}
          onPress={handleContinue}
          disabled={isBtnDisabled}>
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
}
