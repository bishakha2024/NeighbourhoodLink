import React, { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Image, Pressable, Text, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { useAuth } from '../src/context/AuthContext';
import { uploadImage } from '../src/lib/firebaseData';
import { isFirebaseConfigured, isStorageEnabled } from '../src/lib/firebase';
import { isCloudinaryConfigured, type ImageUploadMetadata } from '../src/lib/cloudinary';
import { colors } from '../src/theme/colors';
export default function EditProfile() {
  const { user, editProfile } = useAuth();
  const [name, setName] = useState(user?.fullName ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [photo, setPhoto] = useState(user?.profileImage ?? '');
  const [metadata, setMetadata] = useState<ImageUploadMetadata>({});
  const [busy, setBusy] = useState(false);
  const canUpload = !isFirebaseConfigured || isStorageEnabled || isCloudinaryConfigured;
  const pick = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Photo access required', 'Allow photo access to change your profile picture.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) { const asset = result.assets[0]; setPhoto(asset.uri); setMetadata({ fileName: asset.fileName, mimeType: asset.mimeType }); }
    } catch (error: any) { Alert.alert('Could not select photo', error.message); }
  };
  const save = async () => {
    if (busy || !user) return;
    if (!name.trim() || !location.trim()) return Alert.alert('Missing details', 'Enter your name and neighbourhood.');
    setBusy(true);
    try {
      const url = photo ? await uploadImage(photo, `profiles/${user.id}`, `${Date.now()}.jpg`, metadata) : '';
      setPhoto(url);
      await editProfile(name, location, url);
      router.back();
    } catch (error: any) { Alert.alert('Could not save profile', error.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <Screen><AppHeader title="Edit profile" back />{photo ? <Image source={{ uri: photo }} style={{ width: 120, height: 120, borderRadius: 60, alignSelf: 'center' }} /> : <Text style={{ fontSize: 45, textAlign: 'center' }}>{name.charAt(0).toUpperCase() || 'N'}</Text>}<Pressable disabled={busy || !canUpload} onPress={pick}><Text style={{ color: colors.primary, textAlign: 'center' }}>Change photo</Text></Pressable>{!!photo && <Pressable disabled={busy} onPress={() => setPhoto('')}><Text style={{ color: colors.danger, textAlign: 'center' }}>Remove photo</Text></Pressable>}<Text>Full name</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Full name" editable={!busy} value={name} onChangeText={setName} style={{ padding: 14, backgroundColor: colors.card, borderRadius: 14 }} /><Text>Neighbourhood or city</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Neighbourhood or city" editable={!busy} value={location} onChangeText={setLocation} style={{ padding: 14, backgroundColor: colors.card, borderRadius: 14 }} /><Text>Email: {user?.email}</Text><Pressable accessibilityRole="button" disabled={busy} onPress={save} style={{ padding: 15, backgroundColor: colors.primary, borderRadius: 14, opacity: busy ? 0.5 : 1 }}><Text style={{ color: colors.white, textAlign: 'center', fontWeight: '800' }}>{busy ? 'Saving…' : 'Save profile'}</Text></Pressable></Screen>;
}
