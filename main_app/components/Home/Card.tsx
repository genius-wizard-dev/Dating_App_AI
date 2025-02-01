import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Image, Stack, Text } from 'tamagui';

interface CardProps {
  imgUrl: string;
  location: string;
  name: string;
  age: number;
  desc: string;
  swipeDirection: 'left' | 'right' | null;
  swipeMagnitude?: number;
}

export const Card: React.FC<CardProps> = ({
  imgUrl,
  location,
  name,
  age,
  desc,
  swipeDirection,
  swipeMagnitude = 0,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  return (
    <Stack
      width="95%"
      height="78%"
      borderRadius={24}
      overflow="hidden"
      position="relative"
      alignSelf="center"
      marginTop={10}>
      {isImageLoading && (
        <Stack
          width="100%"
          height="100%"
          position="absolute"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$gray5">
          <ActivityIndicator size="large" color="#E94057" />
        </Stack>
      )}

      {imageError ? (
        <Stack
          width="100%"
          height="100%"
          position="absolute"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$gray5">
          <Ionicons name="image-outline" size={60} color="#999" />
          <Text color="#999" marginTop={10}>
            Không thể tải ảnh
          </Text>
        </Stack>
      ) : (
        <Image
          source={{ uri: imgUrl }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            opacity: swipeMagnitude > 0 ? 0.8 : 1,
          }}
          onLoadStart={() => setIsImageLoading(true)}
          onLoadEnd={() => setIsImageLoading(false)}
          onError={() => {
            setImageError(true);
            setIsImageLoading(false);
          }}
        />
      )}

      {location && (
        <Stack
          position="absolute"
          top={15}
          right={15}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          borderRadius={15}
          padding={8}
          flexDirection="row"
          alignItems="center">
          <Ionicons name="location-outline" size={16} color="white" />
          <Text color="white" fontSize={14} marginLeft={4}>
            {location}
          </Text>
        </Stack>
      )}
      {Math.abs(swipeMagnitude) > 0 && swipeDirection && (
        <Stack
          position="absolute"
          width="100%"
          height="100%"
          backgroundColor={
            swipeDirection === 'left' ? 'rgba(255, 87, 34, 0.3)' : 'rgba(156, 39, 176, 0.3)'
          }
          zIndex={1}
          alignItems="center"
          justifyContent="center">
          <Stack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor="white"
            alignItems="center"
            justifyContent="center">
            <Ionicons
              name={swipeDirection === 'left' ? 'close' : 'star'}
              size={60}
              color={swipeDirection === 'left' ? '#FF5722' : '#9C27B0'}
            />
          </Stack>
        </Stack>
      )}

      {swipeDirection == null ? (
        <Stack
          position="absolute"
          bottom={0}
          justifyContent="center"
          width="100%"
          padding={20}
          height={110}
          backgroundColor="#000"
          opacity={0.75}>
          <Stack zIndex={1} marginLeft={20}>
            <Text color="white" fontSize={24} fontWeight="700">
              {name}, {age}
            </Text>
            <Text color="white" fontSize={14} marginTop={4}>
              {desc}
            </Text>
          </Stack>
        </Stack>
      ) : (
        <></>
      )}
    </Stack>
  );
};
