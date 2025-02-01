import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { ImageUpload, ProfileData } from '~/types';
import { supabase } from './supabase';

const BUCKET_NAME = 'images';
const IMAGE_QUALITY = 0.8;

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split(`${BUCKET_NAME}/`);
    return urlParts.length > 1 ? urlParts[1] : null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
};

const deleteOldFile = async (oldFileUrl: string): Promise<boolean> => {
  try {
    const filePath = extractFilePathFromUrl(oldFileUrl);
    if (!filePath) {
      console.warn('Could not extract file path from URL');
      return false;
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn('Error deleting old file:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOldFile:', error);
    return false;
  }
};

export const uploadImage = async (
  imageUpload: ImageUpload,
  userId: string,
  folderPath: string,
  oldFileUrl?: string
): Promise<UploadResult> => {
  try {
    if (!imageUpload.base64) {
      return { success: false, error: 'No base64 data provided' };
    }

    if (oldFileUrl) {
      await deleteOldFile(oldFileUrl);
    }

    const decodedFile = decode(imageUpload.base64);
    const filePath = `${folderPath}/${userId}_${Date.now()}_${imageUpload.fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, decodedFile, {
        contentType: imageUpload.mimeType || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return urlData?.publicUrl
      ? { success: true, url: urlData.publicUrl }
      : { success: false, error: 'Failed to get public URL' };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const pickImage = async (
  aspect: [number, number] = [1, 1],
  fileNamePrefix = 'image'
): Promise<ImageUpload | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      aspect,
      quality: IMAGE_QUALITY,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        base64: asset.base64 || undefined,
        uri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: `${fileNamePrefix}_${Date.now()}.jpg`,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const updateProfile = async (
  profile: ProfileData
): Promise<{ success: boolean; data?: ProfileData; error?: string }> => {
  try {
    if (!profile.id) {
      return { success: false, error: 'Missing required profile ID' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
