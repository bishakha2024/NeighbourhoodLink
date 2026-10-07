import { File } from 'expo-file-system';
import { Platform } from 'react-native';

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);
export type ImageUploadMetadata = { mimeType?: string | null; fileName?: string | null };

export async function uploadCloudinaryImage(uri: string, metadata: ImageUploadMetadata = {}) {
  if (!isCloudinaryConfigured) throw new Error('Cloudinary photo uploads are not configured.');
  const form = new FormData();
  if (Platform.OS === 'web') {
    const source = await fetch(uri);
    if (!source.ok) throw new Error('Could not read the selected photo.');
    form.append('file', await source.blob(), metadata.fileName || 'photo.jpg');
  } else {
    // Expo's fetch accepts file bytes, rather than React Native URI descriptors.
    form.append('file', new File(uri), metadata.fileName || uri.split('/').pop() || 'photo.jpg');
  }
  form.append('upload_preset', uploadPreset!);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName!)}/image/upload`, {
      method: 'POST', body: form, signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || typeof result.secure_url !== 'string' || !result.secure_url.startsWith('https://')) {
      throw new Error(result.error?.message || 'Photo upload failed. Please try again.');
    }
    return result.secure_url as string;
  } finally {
    clearTimeout(timeout);
  }
}
