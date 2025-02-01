// Code by Thuận Nguyễn
import React, { memo } from 'react';
import { AlertDialog, Button, XStack, YStack } from 'tamagui';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  message: string;
  title?: string;
  cancelText?: string;
  acceptText?: string;
}

const Alert = memo(
  ({
    isOpen,
    onClose,
    onAccept,
    message,
    title = 'Alert',
    cancelText = 'Cancel',
    acceptText = 'Accept',
  }: AlertProps) => (
    <AlertDialog open={isOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
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
          padding={20}
          minWidth={350}
          backgroundColor="white"
          borderRadius={15}>
          <YStack space>
            <AlertDialog.Title color="#1A1A1A" fontSize={18} fontWeight="600">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description color="#666666" fontSize={14}>
              {message}
            </AlertDialog.Description>
            <XStack gap="$3" justifyContent="flex-end">
              <AlertDialog.Cancel asChild>
                <Button
                  backgroundColor="#F8F8F8"
                  color="#666666"
                  borderRadius={15}
                  pressStyle={{
                    backgroundColor: '#F0F0F0',
                  }}
                  onPress={onClose}>
                  {cancelText}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  backgroundColor="#E94057"
                  color="white"
                  borderRadius={15}
                  pressStyle={{
                    backgroundColor: '#FFE8EC',
                  }}
                  onPress={onAccept}>
                  {acceptText}
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
);

Alert.displayName = 'Alert';

export default Alert;
