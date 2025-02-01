import type { Provider } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';
import { z } from 'zod';
import Alert from '~/components/Alert';
import InputField from '~/components/InputField';
// import { useAppContext } from '~/context/authContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import { performOAuth, signIn, signInWithGoogle } from '~/redux/thunks/auth';
interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const schema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
  });

  GoogleSignin.configure({
    scopes: ['email', 'profile'],
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const handleGoogleSignIn = async () => {
    {
      try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        // console.log(response);
        if (response.data?.idToken) {
          await dispatch(signInWithGoogle(response.data.idToken) as any);
          router.replace('/');
        }
      } catch (error) {
        console.error('Lỗi đăng nhập Google:', error);
        let errorMessage = 'Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.';

        if (error instanceof Error) {
          if (error.message.includes('SIGN_IN_CANCELLED')) {
            errorMessage = 'Bạn đã hủy đăng nhập Google';
          } else if (error.message.includes('IN_PROGRESS')) {
            errorMessage = 'Đang trong quá trình đăng nhập, vui lòng đợi';
          } else if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
            errorMessage = 'Google Play Services không khả dụng trên thiết bị của bạn';
          }
        }

        setAlertMessage(errorMessage);
        setIsAlertOpen(true);
      }
    }
  };

  const validateForm = () => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<FormData> = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0] as keyof FormData] = error.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const { email, password } = formData;

    try {
      await dispatch(signIn({ email, password }) as any);
      router.replace('/');
    } catch (error) {
      showAlert('Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setLoading(false);
  };

  const handleCloseAlert = () => setIsAlertOpen(false);

  const socialButtons = [
    { provider: 'discord', icon: require('../../assets/icons/discord.svg') },

    { provider: 'facebook', icon: require('../../assets/icons/facebook.svg') },
  ];

  const FORM_FIELDS: Array<{
    field: keyof FormData;
    label: string;
  }> = [
    { field: 'email', label: 'Nhập email' },
    { field: 'password', label: 'Nhập mật khẩu' },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack
        width="100%"
        paddingHorizontal={30}
        paddingVertical={40}
        flex={1}
        bg="white"
        justifyContent="center"
        alignItems="center"
        space={20}>
        <Image
          source={require('../../assets/icons/logo.svg')}
          style={{ width: 108.64, height: 100 }}
        />
        <Text fontSize={24} fontWeight="bold" marginVertical={30}>
          Đăng nhập để tiếp tục
        </Text>

        {FORM_FIELDS.map(({ field, label }) => (
          <InputField
            key={field}
            id={`${field}Login_${Math.random().toString(36).substr(2, 9)}`}
            label={label}
            type={field === 'password' ? 'password' : 'text'}
            value={formData[field]}
            onChange={(value) => handleInputChange(field, value)}
            error={formErrors[field]}
          />
        ))}

        <Button
          width="100%"
          height={60}
          backgroundColor="#E94057"
          color="white"
          fontWeight="bold"
          fontSize={16}
          onPress={handleAuth}
          pressStyle={{ backgroundColor: '#E94057', borderWidth: 0, scale: 0.98 }}
          disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <XStack marginVertical={10}>
          <Text>Chưa có tài khoản? </Text>
          <Link href={{ pathname: '/(auth)/register' }}>
            <Text color="#E94057" fontWeight="bold">
              {' '}
              Đăng ký
            </Text>
          </Link>
        </XStack>

        <XStack justifyContent="center" alignItems="center" space={20}>
          <Separator />
          <Text marginBottom={10}>hoặc đăng nhập với</Text>
          <Separator />
        </XStack>

        <XStack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}>
          {socialButtons.map(({ provider, icon }) => (
            <Button
              key={provider}
              width={80}
              height={80}
              borderColor="#999999"
              backgroundColor="white"
              justifyContent="center"
              alignItems="center"
              borderWidth={1}
              borderRadius={15}
              pressStyle={{ scale: 0.98, backgroundColor: 'white', borderColor: '#999999' }}
              onPress={async () => {
                await dispatch(performOAuth(provider as Provider) as any);
                router.replace('/');
              }}>
              <Image
                source={icon}
                style={{
                  width: provider === 'twitter' ? 35 : 40,
                  height: 40,
                }}
              />
            </Button>
          ))}
          <Button
            width={80}
            height={80}
            borderColor="#999999"
            backgroundColor="white"
            justifyContent="center"
            alignItems="center"
            borderWidth={1}
            borderRadius={15}
            pressStyle={{ scale: 0.98, backgroundColor: 'white', borderColor: '#999999' }}
            onPress={handleGoogleSignIn}>
            <Image
              source={require('../../assets/icons/google.svg')}
              style={{
                width: 40,
                height: 40,
              }}
            />
          </Button>
        </XStack>
      </YStack>
      <Alert
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        onAccept={handleCloseAlert}
        message={alertMessage}
        title="Thông báo đăng nhập"
        cancelText="Đóng"
        acceptText="OK"
      />
    </>
  );
};

export default Login;
