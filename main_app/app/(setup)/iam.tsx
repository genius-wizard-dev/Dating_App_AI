import type { User } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Text, View, YStack } from 'tamagui';
import { RootState } from '~/redux/store';
import { getProfile } from '~/redux/thunks/user';
import { Gender, GenderType } from '~/types';
import { updateProfile } from '~/utils/imageUtils';

const Iam = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state: RootState) => state.user);
  const [selectedGender, setSelectedGender] = useState<GenderType>(profile?.gender || Gender.Male);

  const handleGenderSelect = async (gender: GenderType) => {
    setSelectedGender(gender);
    const updatedProfile = {
      ...profile,
      gender: gender,
    };

    const result = await updateProfile(updatedProfile);
    if (result.success) {
      await dispatch(getProfile(user as User) as any);
      router.push('/(setup)/interests');
    }
  };

  const GenderButton: React.FC<{
    gender: GenderType;
    selectedGender: GenderType;
    onSelect: (gender: GenderType) => void;
  }> = ({ gender, selectedGender, onSelect }) => (
    <Button
      onPress={() => onSelect(gender)}
      backgroundColor={selectedGender === gender ? '#E94057' : 'white'}
      borderColor={selectedGender === gender ? '#E94057' : '#E8E6EA'}
      borderWidth={1.5}
      borderRadius={15}
      paddingVertical={15}
      paddingHorizontal={20}
      justifyContent="space-between"
      alignItems="center"
      height={65}
      flexDirection="row"
      width="100%"
      pressStyle={{ backgroundColor: 'white', borderColor: '#E8E6EA' }}>
      <Text fontSize={16} fontWeight="bold" color={selectedGender === gender ? 'white' : 'black'}>
        {gender}
      </Text>
      <View>
        {selectedGender === gender && (
          <Image
            source={require('../../assets/icons/check.svg')}
            style={{ width: 25, height: 20 }}
          />
        )}
      </View>
    </Button>
  );

  return (
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

        <Text fontSize={35} marginVertical={50} fontWeight="bold" width="100%" textAlign="left">
          I am a
        </Text>
        <YStack space={20} mt={15}>
          {Object.values(Gender).map((gender) => (
            <GenderButton
              key={gender}
              gender={gender}
              selectedGender={selectedGender}
              onSelect={handleGenderSelect}
            />
          ))}
        </YStack>
      </YStack>
      <Button
        width="100%"
        height={60}
        borderRadius={15}
        backgroundColor={selectedGender ? '#E94057' : 'grey'}
        borderWidth={2}
        borderColor="#E94057"
        color="white"
        fontWeight="bold"
        fontSize={16}
        onPress={() => router.push('/(setup)/interests')}>
        Continue
      </Button>
    </YStack>
  );
};

export default Iam;
