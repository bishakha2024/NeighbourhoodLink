import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function Login() {
  const { login, demoMode } = useAuth();
  const [email, setEmail] = useState(demoMode ? 'sarah@gmail.com' : '');
  const [password, setPassword] = useState(demoMode ? '1234567' : '');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert('Missing information', 'Please enter your email and password.');
    try { setBusy(true); await login(email, password); router.replace('/(tabs)'); } catch (e: any) { Alert.alert('Login failed', e?.message ?? 'Please check your details.'); } finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.safe}><View style={styles.wrap}>
    <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>N</Text></View><Text style={styles.name}>NeighbourhoodLink</Text><Text style={styles.tagline}>Your neighbourhood, connected.</Text></View>
    <View style={styles.card}>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.sub}>Sign in to buy, share, borrow, and connect locally.</Text>
      <Text style={styles.label}>Email</Text><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <Text style={styles.label}>Password</Text><TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry style={styles.input} />
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => router.push({ pathname: '/(auth)/forgot-password', params: { email: email.trim() } })}><Text style={styles.link}>Forgot password?</Text></Pressable>
      <Pressable onPress={submit} style={styles.button} disabled={busy}><Text style={styles.buttonText}>{busy ? 'Signing in…' : 'Sign in'}</Text></Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}><Text style={styles.link}>New here? Create an account</Text></Pressable>
    </View>
  </View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, wrap: { flex: 1, padding: 22, justifyContent: 'center', gap: 24 }, brand: { alignItems: 'center', gap: 6 }, logo: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, logoText: { color: colors.white, fontSize: 30, fontWeight: '900' }, name: { fontSize: 25, fontWeight: '900', color: colors.ink }, tagline: { color: colors.muted }, card: { backgroundColor: colors.card, padding: 20, borderRadius: 22, gap: 10, borderWidth: 1, borderColor: colors.line }, demo: { backgroundColor: colors.primarySoft, padding: 10, borderRadius: 12 }, demoText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' }, heading: { fontSize: 24, fontWeight: '900', color: colors.ink, marginTop: 5 }, sub: { color: colors.muted, lineHeight: 19, marginBottom: 5 }, label: { fontSize: 12, fontWeight: '800', color: colors.ink, marginTop: 5 }, input: { borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFA', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink }, button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 13, alignItems: 'center', marginTop: 8 }, buttonText: { color: colors.white, fontWeight: '900', fontSize: 15 }, link: { color: colors.primary, textAlign: 'center', fontWeight: '800', marginTop: 4 } });
