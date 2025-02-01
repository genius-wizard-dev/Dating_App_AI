import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'tamagui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Stack flex={1} backgroundColor="rgba(0,0,0,0.9)" justifyContent="center" alignItems="center">
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});

export default ImageViewer;
