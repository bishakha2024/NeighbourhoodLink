import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { isCloudinaryConfigured, type ImageUploadMetadata } from '../lib/cloudinary';
import { isFirebaseConfigured, isStorageEnabled } from '../lib/firebase';
import { uploadImage } from '../lib/firebaseData';
import { colors } from '../theme/colors';

export type ListingPhoto = ImageUploadMetadata & { uri: string };
export const defaultListingPhoto = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80';
export async function uploadListingPhotos(photos: ListingPhoto[], owner: string) {
  const urls: string[] = [];
  for (const [index, photo] of photos.entries()) {
    urls.push(await uploadImage(photo.uri, `listings/${owner}`, `${Date.now()}-${index}.jpg`, photo));
  }
  return urls.length ? urls : [defaultListingPhoto];
}
export function ListingPhotos({ photos, onChange, disabled = false }: { photos: ListingPhoto[]; onChange: (photos: ListingPhoto[]) => void; disabled?: boolean }) {
  const enabled = !isFirebaseConfigured || isStorageEnabled || isCloudinaryConfigured;
  const pick = async (replaceIndex?: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission required', 'Please allow photo access to add images.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: replaceIndex === undefined, selectionLimit: replaceIndex === undefined ? 6 - photos.length : 1 });
      if (result.canceled) return;
      const selected = result.assets.map(asset => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType }));
      if (replaceIndex !== undefined) onChange(photos.map((photo, index) => index === replaceIndex ? selected[0] : photo));
      else onChange([...photos, ...selected].slice(0, 6));
    } catch (error: any) { Alert.alert('Could not select photos', error.message || 'Please try again.'); }
  };
  return <View style={{ gap: 10 }}>
    <Text style={{ color: colors.ink, fontWeight: '900' }}>Photos ({photos.length}/6)</Text>
    <Text style={{ color: colors.muted }}>The first photo appears on your listing card.</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{photos.map((photo, index) => <View key={`${index}-${photo.uri}`} style={{ width: '47%', gap: 6 }}>
      <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 140, borderRadius: 14 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable accessibilityLabel={`Replace photo ${index + 1}`} disabled={disabled || !enabled} onPress={() => pick(index)}><Text style={{ color: colors.primary }}>Replace</Text></Pressable>
        <Pressable accessibilityLabel={`Remove photo ${index + 1}`} disabled={disabled} onPress={() => onChange(photos.filter((_, i) => i !== index))}><Text style={{ color: colors.danger }}>Remove</Text></Pressable>
      </View>
    </View>)}</View>
    {photos.length < 6 && <Pressable accessibilityRole="button" disabled={disabled || !enabled} onPress={() => pick()} style={{ padding: 14, borderRadius: 14, backgroundColor: colors.primarySoft, opacity: disabled || !enabled ? 0.5 : 1 }}><Text style={{ color: colors.primary, fontWeight: '800' }}>Add photos</Text></Pressable>}
    {!enabled && <Text>Photo uploads are unavailable.</Text>}
  </View>;
}
