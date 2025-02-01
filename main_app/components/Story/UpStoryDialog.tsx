import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Button, Input, Sheet, Stack, Text, YStack } from 'tamagui';
import Alert from '~/components/Alert';
import { RootState } from '~/redux/store';
import { pickImage, uploadImage } from '~/utils/imageUtils';
import { supabase } from '~/utils/supabase';

interface UpStoryDialogProps {
  onClose: () => void;
}

const FOLDER_PATH = 'feeds';

export default function UpStoryDialog({ onClose }: UpStoryDialogProps) {
  const { profile } = useSelector((state: RootState) => state.user);
  const [imageData, setImageData] = useState<ImageUpload | null>(null);
  const [status, setStatus] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () =>
      setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    setBtnDisable(!imageData || !status);
  }, [imageData, status]);

  const handleImagePick = async () => {
    const result = await pickImage([2, 3], 'story');
    if (result) setImageData(result);
  };

  const showUploadResult = (success: boolean, message: string) => {
    setAlertTitle(success ? 'Thành công' : 'Thất bại');
    setAlertMessage(message);
    setIsSuccess(success);
    setShowAlert(true);
  };

  const handleUploadStory = async () => {
    if (!imageData || !profile?.id) return;

    try {
      const uploadResult = await uploadImage(imageData, profile.id, FOLDER_PATH);
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Lỗi khi tải ảnh lên');
      }

      const { error: feedError } = await supabase.from('feeds').insert([
        {
          user_id: profile.id,
          status,
          image: uploadResult.url,
        },
      ]);

      if (feedError) throw feedError;

      showUploadResult(true, 'Story đã được đăng thành công!');
    } catch (error) {
      console.error('Upload story failed:', error);
      showUploadResult(false, 'Có lỗi xảy ra khi đăng story. Vui lòng thử lại!');
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <>
      <Sheet
        ref={sheetRef}
        modal
        open={true}
        onOpenChange={onClose}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100000}
        animationConfig={{
          type: 'spring',
          damping: 35,
          mass: 1.5,
          stiffness: 200,
        }}>
        <Sheet.Overlay />
        <Sheet.Frame
          padding="$4"
          justifyContent="space-between"
          backgroundColor="white"
          borderTopLeftRadius={30}
          borderTopRightRadius={30}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={keyboardHeight + 95}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack space="$4">
                <TouchableOpacity onPress={handleImagePick}>
                  {imageData ? (
                    <Image
                      source={{ uri: imageData.uri }}
                      style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 15 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <YStack
                      width="100%"
                      aspectRatio={2 / 3}
                      backgroundColor="#FFF0F3"
                      borderRadius={15}
                      justifyContent="center"
                      alignItems="center">
                      <Ionicons name="camera-outline" size={40} color="#E94057" />
                      <Text fontSize="$3" color="#E94057" marginTop="$2">
                        Chọn ảnh
                      </Text>
                    </YStack>
                  )}
                </TouchableOpacity>

                <Stack
                  borderColor={'#E94057'}
                  borderWidth={1}
                  borderRadius={15}
                  height={60}
                  justifyContent="center"
                  alignItems="center">
                  <Input
                    placeholder="Nhập status"
                    value={status}
                    onChangeText={setStatus}
                    width={'100%'}
                    color={'#E94057'}
                    placeholderTextColor={'#E94057'}
                    backgroundColor={'$transparent'}
                    borderWidth={0}
                  />
                </Stack>

                <Button
                  backgroundColor={btnDisable ? 'gray' : '#E94057'}
                  borderRadius={15}
                  icon={<Ionicons name="cloud-upload-outline" size={20} color="white" />}
                  onPress={handleUploadStory}
                  disabled={btnDisable}
                  height={60}>
                  <Text color="white" fontSize="$5" fontWeight="bold">
                    Đăng story
                  </Text>
                </Button>
              </YStack>
            </ScrollView>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
      <Alert
        isOpen={showAlert}
        onClose={handleAlertClose}
        onAccept={handleAlertClose}
        title={alertTitle}
        message={alertMessage}
        cancelText="Đóng"
        acceptText="OK"
      />
    </>
  );
}
