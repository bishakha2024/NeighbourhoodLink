import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function ForgotPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword, demoMode } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try { await resetPassword(email); setSent(true); }
    catch (error: any) { Alert.alert('Could not reset password', error.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <Screen><AppHeader title="Reset password" back />
    <Text>Enter the email address you used to create your account.</Text>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Password reset email" value={email} onChangeText={value => { setEmail(value); setSent(false); }} editable={!busy} placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" style={{ padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.card }} />
    {sent && <Text accessibilityRole="alert">If an account exists for this email, you’ll receive a password reset link. Check your inbox and spam folder, then return here to sign in.</Text>}
    {demoMode && <Text>Password reset requires a connected Firebase account and is unavailable in demo mode.</Text>}
    <Pressable accessibilityRole="button" disabled={busy || demoMode || sent} onPress={submit} style={{ padding: 15, borderRadius: 14, alignItems: 'center', backgroundColor: colors.primary, opacity: busy || demoMode || sent ? 0.5 : 1 }}><Text style={{ color: colors.white, fontWeight: '800' }}>{busy ? 'Sending…' : sent ? 'Reset email requested' : 'Send reset link'}</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')}><Text style={{ color: colors.primary }}>Back to sign in</Text></Pressable>
  </Screen>;
}
