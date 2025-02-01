import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import React, { useState } from 'react';
import { openInbox } from 'react-native-email-link';
import { useDispatch } from 'react-redux';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import { z } from 'zod';
import Alert from '~/components/Alert';
import InputField from '~/components/InputField';
import { signUp } from '~/redux/thunks/auth';
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const FORM_FIELDS = [
  { id: 'email', label: 'Nhập email', type: 'text' },
  { id: 'password', label: 'Nhập mật khẩu', type: 'password' },
  { id: 'confirmPassword', label: 'Nhập xác nhận mật khẩu', type: 'password' },
] as const;

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({}); // Thêm state để lưu trữ lỗi của form

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const schema = z.object({
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
      confirmPassword: z.string().nonempty('Xác nhận mật khẩu không được để trống'),
    });

    const result = schema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<FormData> = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0] as keyof FormData] = error.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({}); // Reset lỗi nếu form hợp lệ
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      showAlert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match');
      return;
    }

    try {
      await dispatch(signUp({ email, password }) as any);
      showAlert('Sign up successful. Please check your email.');
    } catch (error) {
      showAlert('An error occurred. Please try again.');
      console.error(error);``
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setLoading(false);
  };

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    if (alertMessage === 'Sign up successful. Please check your email.') {
      openInbox();
      setFormData({ email: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <ScrollView
      flex={1}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled">
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
          Sign up to continue
        </Text>

        {FORM_FIELDS.map((field) => (
          <InputField
            key={field.id}
            id={`${field.id}_${Math.random().toString(36).substr(2, 9)}`}
            label={field.label}
            type={field.id.toLowerCase().includes('password') ? 'password' : 'text'}
            value={formData[field.id as keyof FormData]}
            onChange={(value) => handleInputChange(field.id as keyof FormData, value)}
            error={formErrors[field.id as keyof FormData]}
          />
        ))}

        <Button
          width="100%"
          height={60}
          backgroundColor="#E94057"
          color="white"
          fontWeight="bold"
          fontSize={16}
          pressStyle={{ backgroundColor: '#E94057' }}
          onPress={handleAuth}
          disabled={loading}>
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>

        <XStack>
          <Text>You have an account? </Text>
          <Link href={{ pathname: '/(auth)/login' }}>
            <Text color="#E94057" fontWeight="bold">
              {' '}
              Sign in
            </Text>
          </Link>
        </XStack>
      </YStack>
      <Alert
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        onAccept={handleCloseAlert}
        message={alertMessage}
      />
    </ScrollView>
  );
};

export default Register;
