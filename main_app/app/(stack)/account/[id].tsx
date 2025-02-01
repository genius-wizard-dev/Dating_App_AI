import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Button, H3, Stack, Text, XStack, YStack } from 'tamagui';
import Alert from '~/components/Alert';
import ImageViewer from '~/components/ImageViewer';
import { supabase } from '~/utils/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Account = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const goBack = params.goBack as Href<string>;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userFeeds, setUserFeeds] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onAccept: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onAccept: () => {},
  });
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [profileResponse, feedsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('feeds').select('*').eq('user_id', id),
      ]);
      setProfile(profileResponse.data);
      setUserFeeds(feedsResponse.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadImage = useCallback(async (imageUrl: string) => {
    try {
      const { uri } = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + 'image.jpg'
      );
      await MediaLibrary.saveToLibraryAsync(uri);
      setAlertConfig({
        isOpen: true,
        title: 'Thành công',
        message: 'Đã lưu ảnh vào thư viện',
        onAccept: () => setAlertConfig((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      setAlertConfig({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải ảnh. Vui lòng thử lại sau.',
        onAccept: () => setAlertConfig((prev) => ({ ...prev, isOpen: false })),
      });
    }
  }, []);

  const renderHobbies = useCallback(() => {
    if (!profile?.hobbies || profile.hobbies.length === 0) {
      return (
        <Text fontSize={16} color="#666666">
          Chưa cập nhật sở thích
        </Text>
      );
    }
    return (
      <XStack flexWrap="wrap" gap={8}>
        {profile.hobbies.map((hobby: string, index: number) => (
          <Stack
            key={index}
            backgroundColor="#FFE8EC"
            paddingHorizontal={16}
            paddingVertical={8}
            borderRadius={100}>
            <Text fontSize={14} color="#E94057">
              {hobby}
            </Text>
          </Stack>
        ))}
      </XStack>
    );
  }, [profile?.hobbies]);

  const renderFeeds = useCallback(() => {
    if (loadingFeeds) return <ActivityIndicator size="small" color="#E94057" />;
    if (userFeeds.length === 0) {
      return (
        <Stack padding={20} alignItems="center">
          <Text color="#666666">Chưa có bài đăng nào</Text>
        </Stack>
      );
    }
    return (
      <>
        <XStack flexWrap="wrap" gap={2}>
          {userFeeds.map((feed) => (
            <Stack key={feed.id}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedImage(feed.image)}
                style={{
                  width: (SCREEN_WIDTH - 0) / 2.5,
                  height: (SCREEN_WIDTH - 0) / 2.5,
                  backgroundColor: '#f0f0f0',
                }}>
                <Image
                  source={{ uri: feed.image }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Button
                size="$2"
                icon={<Ionicons name="download-outline" size={22} color="#fff" />}
                onPress={() => handleDownloadImage(feed.image)}
                position="absolute"
                bottom={5}
                right={5}
                width={40}
                height={40}
                padding={0}
                justifyContent="center"
                alignItems="center"
                backgroundColor="rgba(0,0,0,0.5)"
                borderRadius={100}
                pressStyle={{ opacity: 0.8 }}
              />
            </Stack>
          ))}
        </XStack>
        {selectedImage && (
          <ImageViewer
            visible={true}
            imageUrl={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </>
    );
  }, [loadingFeeds, userFeeds, handleDownloadImage, selectedImage]);

  if (loading) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#E94057" />
      </Stack>
    );
  }

  if (!profile) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center" backgroundColor="#FFFFFF">
        <Text color="#666666">Không tìm thấy thông tin người dùng</Text>
      </Stack>
    );
  }
  return (
    <YStack flex={1} backgroundColor="#FFFFFF" paddingTop={56}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <XStack
          paddingHorizontal={20}
          justifyContent="space-between"
          alignItems="center"
          marginBottom={20}>
          <Button
            pressStyle={{ scale: 0.98, backgroundColor: 'white', borderColor: '#E94067' }}
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
            Hồ sơ
          </Text>
        </XStack>
        <YStack paddingHorizontal={20} space={24} paddingBottom={30}>
          <YStack paddingHorizontal={20} space={20}>
            <Stack alignItems="center">
              <Stack
                width={120}
                height={120}
                borderRadius={60}
                overflow="hidden"
                borderWidth={3}
                borderColor="#E94057"
                marginBottom={15}>
                <Image
                  source={{ uri: profile?.avatar || 'https://i.pravatar.cc/300' }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </Stack>
              <Text
                fontSize={24}
                fontWeight="600"
                color="#1A1A1A"
                flex={1}
                justifyContent="center"
                alignItems="center">
                {profile?.full_name}{' '}
                <Text fontWeight="normal" color="#666666" fontSize={18}>
                  ({profile?.username})
                </Text>
              </Text>
              <Text fontSize={16} color="#666666" marginTop={4}>
                {profile?.age} tuổi
              </Text>
            </Stack>
            <YStack backgroundColor="#F8F8F8" padding={20} borderRadius={15} space={12}>
              <XStack space={12} alignItems="center">
                <Ionicons name="location-outline" size={24} color="#E94057" />
                <Text fontSize={16} color="#666666">
                  {profile?.location || 'Chưa cập nhật'}
                </Text>
              </XStack>
              <XStack space={12} alignItems="center">
                <Ionicons name="calendar-outline" size={24} color="#E94057" />
                <Text fontSize={16} color="#666666">
                  {profile?.birthday
                    ? new Date(profile.birthday).toLocaleDateString()
                    : 'Chưa cập nhật'}
                </Text>
              </XStack>
              <XStack space={12} alignItems="center">
                <Ionicons name="mail-outline" size={24} color="#E94057" />
                <Text fontSize={16} color="#666666">
                  {profile?.email || 'Chưa cập nhật'}
                </Text>
              </XStack>
            </YStack>
            <YStack space={12}>
              <H3 fontSize={18} fontWeight="600" color="#1A1A1A">
                Sở thích
              </H3>
              {renderHobbies()}
            </YStack>
            <YStack space={12}>
              <H3 fontSize={18} fontWeight="600" color="#1A1A1A">
                Giới thiệu
              </H3>
              <Text fontSize={16} color="#666666" lineHeight={24}>
                {profile?.bio || 'Chưa có thông tin giới thiệu'}
              </Text>
            </YStack>
            <YStack space={12}>
              <XStack justifyContent="space-between" alignItems="center">
                <H3 fontSize={18} fontWeight="600" color="#1A1A1A">
                  Bài đăng
                </H3>
                <Text fontSize={14} color="#666666">
                  {userFeeds.length} bài đăng
                </Text>
              </XStack>
              {renderFeeds()}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
      <Alert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onAccept={alertConfig.onAccept}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        acceptText="OK"
      />
    </YStack>
  );
};

export default Account;
