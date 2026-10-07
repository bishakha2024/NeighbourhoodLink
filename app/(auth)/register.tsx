import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function Register() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!fullName || !email || password.length < 6) return Alert.alert('Check your details', 'Enter your name, email, and a password of at least 6 characters.');
    try { setBusy(true); await register(fullName, email, password); router.replace('/(tabs)'); } catch (e: any) { Alert.alert('Registration failed', e?.message ?? 'Please try again.'); } finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safe}><View style={styles.wrap}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.heading}>Create your account</Text><Text style={styles.sub}>Start connecting with people and resources around you.</Text>
    <View style={styles.card}>
      <Text style={styles.label}>Full name</Text><TextInput value={fullName} onChangeText={setFullName} placeholder="Your name" style={styles.input} />
      <Text style={styles.label}>Email</Text><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <Text style={styles.label}>Password</Text><TextInput value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry style={styles.input} />
      <Pressable onPress={submit} style={styles.button} disabled={busy}><Text style={styles.buttonText}>{busy ? 'Creating…' : 'Create account'}</Text></Pressable>
    </View>
  </View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, wrap: { flex: 1, padding: 22, gap: 14 }, back: { color: colors.primary, fontWeight: '800' }, heading: { fontSize: 28, fontWeight: '900', color: colors.ink, marginTop: 12 }, sub: { color: colors.muted, lineHeight: 19, marginBottom: 8 }, card: { backgroundColor: colors.card, padding: 20, borderRadius: 22, gap: 10, borderWidth: 1, borderColor: colors.line }, label: { fontSize: 12, fontWeight: '800', color: colors.ink, marginTop: 4 }, input: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FBFCFA', color: colors.ink }, button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 13, alignItems: 'center', marginTop: 8 }, buttonText: { color: colors.white, fontWeight: '900' } });
