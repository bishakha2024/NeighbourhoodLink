import React, { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, Text, TextInput } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';
export default function DeleteAccount() {
  const { deleteAccount, demoMode } = useAuth();
  const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const confirm = () => Alert.alert('Permanently delete account?', 'Your profile, listings, services, posts, conversations, reactions, reviews, and reports will be deleted. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete account', style: 'destructive', onPress: async () => {
    if (busy) return; setBusy(true);
    try { await deleteAccount(password); router.replace('/(auth)/login'); }
    catch (error: any) { Alert.alert('Could not delete account', error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' ? 'Your password is incorrect.' : error.message || 'Please try again.'); }
    finally { setBusy(false); }
  } }]);
  return <Screen><AppHeader title="Delete account" back /><Text>Deleting your account permanently removes your account and associated app data. After deletion, you can register again with the same email.</Text><Text>Uploaded photo files remain in Cloudinary’s media library. Contact the app owner to have those files removed.</Text>{!demoMode && <><Text>Confirm your current password</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Current password" secureTextEntry autoCapitalize="none" editable={!busy} value={password} onChangeText={setPassword} style={{ padding: 14, backgroundColor: colors.card, borderRadius: 14 }} /></>}<Pressable accessibilityRole="button" disabled={busy || (!demoMode && !password)} onPress={confirm} style={{ backgroundColor: colors.danger, padding: 15, borderRadius: 14, opacity: busy ? 0.5 : 1 }}><Text style={{ color: colors.white, fontWeight: '900' }}>{busy ? 'Deleting…' : 'Permanently delete account'}</Text></Pressable></Screen>;
}
