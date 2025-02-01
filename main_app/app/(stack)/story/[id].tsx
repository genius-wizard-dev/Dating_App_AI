import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Avatar, Button, Card, Input, Text, XStack, YStack, styled } from 'tamagui';
import { RootState } from '~/redux/store';
import { pickImage } from '~/utils/imageUtils';

const StyledCard = styled(Card, {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
});

const StyledButton = styled(Button, {
  backgroundColor: '#E94057',
  borderRadius: 30,
  paddingVertical: 12,
});

const UploadStory = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleImagePick = async () => {
    const result = await pickImage();
    if (result) setImage(result.uri);
  };

  const handleUpload = async () => {
    console.log('Uploading story:', { image, status });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <StyledCard elevate size="$4">
        <YStack space="$4" padding="$4">
          <XStack space="$3" alignItems="center">
            <Avatar circular size="$7">
              <Avatar.Image source={{ uri: profile?.avatar }} />
            </Avatar>
            <Text fontSize="$6" fontWeight="bold" color="#333">
              {profile?.full_name}
            </Text>
          </XStack>
          <TouchableOpacity onPress={handleImagePick}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 350, borderRadius: 15 }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                height={350}
                backgroundColor="#F5F5F5"
                borderRadius={15}
                justifyContent="center"
                alignItems="center">
                <Ionicons name="camera-outline" size={64} color="#999" />
                <Text fontSize="$4" color="#999" marginTop="$2">
                  Chọn ảnh
                </Text>
              </YStack>
            )}
          </TouchableOpacity>
          <Input
            placeholder="Nhập trạng thái..."
            value={status}
            onChangeText={setStatus}
            backgroundColor="#F5F5F5"
            borderRadius={15}
            height={50}
            paddingHorizontal={15}
          />
          <StyledButton
            icon={<Ionicons name="cloud-upload-outline" size={24} color="#FFF" />}
            onPress={handleUpload}>
            <Text color="#FFF" fontSize="$4" fontWeight="bold">
              Đăng story
            </Text>
          </StyledButton>
        </YStack>
      </StyledCard>
    </ScrollView>
  );
};

export default UploadStory;
