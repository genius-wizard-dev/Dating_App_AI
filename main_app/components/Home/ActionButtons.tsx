import { FontAwesome, Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import { Button, Stack } from 'tamagui';

import { useState } from 'react';

interface ActionButtonsProps {
  onDislike: () => void;

  onSuperLike: () => void;

  onHeartPress: () => void;
}

export const ActionButtons = ({ onDislike, onSuperLike, onHeartPress }: ActionButtonsProps) => {
  const router = useRouter();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleButtonPress = (action: () => void) => {
    if (isButtonDisabled) return;

    setIsButtonDisabled(true);

    action();

    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 500);
  };

  return (
    <Stack
      position="absolute"
      bottom={5}
      flexDirection="row"
      gap={20}
      justifyContent="center"
      alignItems="center"
      width="100%"
      marginHorizontal="auto"
      zIndex={100}>
      <Button
        backgroundColor="white"
        width={80}
        height={80}
        borderRadius={30}
        justifyContent="center"
        alignItems="center"
        disabled={isButtonDisabled}
        pressStyle={{
          scale: 0.95,
          borderColor: '#FF6B6B',
          backgroundColor: '#FFE5E5',
        }}
        onPress={() => handleButtonPress(onDislike)}>
        <Ionicons name="close" size={35} color="#FF6B6B" />
      </Button>

      <Button
        backgroundColor="#E94057"
        width={90}
        height={90}
        borderRadius={100}
        justifyContent="center"
        alignItems="center"
        pressStyle={{
          scale: 0.95,
          backgroundColor: '#E94057',
          borderColor: '#E94057',
        }}
        onPress={onHeartPress}>
        <FontAwesome name="heart" size={45} color="white" />
      </Button>

      <Button
        backgroundColor="white"
        width={80}
        height={80}
        borderRadius={30}
        justifyContent="center"
        alignItems="center"
        disabled={isButtonDisabled}
        pressStyle={{
          scale: 0.95,
          borderColor: '#8A2BE2',
          backgroundColor: '#F0E5FF',
        }}
        onPress={() => handleButtonPress(onSuperLike)}>
        <Ionicons name="star" size={35} color="#8A2BE2" />
      </Button>
    </Stack>
  );
};
