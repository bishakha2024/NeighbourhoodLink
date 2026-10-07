import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { setDevicePush } from '../src/lib/devicePush';
import { useAuth } from '../src/context/AuthContext';
import { useData } from '../src/context/DataContext';
import type { Preferences } from '../src/types';
import { isPushEnabled } from '../src/lib/firebase';
import { colors } from '../src/theme/colors';

export default function Settings() {
  const { user, updateLocation } = useAuth();
  const { preferences, updatePreferences, loading } = useData();
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState(user?.location ?? '');
  const change = async (key: keyof Preferences, value: boolean) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      if (key === 'pushEnabled') await setDevicePush(user.id, value);
      await updatePreferences({ ...preferences, [key]: value });
    } catch (error: any) {
      if (key === 'pushEnabled') await setDevicePush(user.id, preferences.pushEnabled).catch(() => {});
      Alert.alert('Could not update preference', error.message);
    } finally { setSaving(false); }
  };
  const saveLocation = async () => {
    setSaving(true);
    try { await updateLocation(location); Alert.alert('Saved', 'Your neighbourhood has been updated.'); }
    catch (error: any) { Alert.alert('Could not save location', error.message); }
    finally { setSaving(false); }
  };
  return <Screen><AppHeader title="Settings" back />
    <View style={styles.section}><Text style={styles.sectionTitle}>Preferences</Text>
      <SettingRow title="Device push notifications" text={isPushEnabled ? "Alerts for new messages, reviews, and community activity" : "Unavailable for now. Notifications inside the app remain active."} value={preferences.pushEnabled && isPushEnabled} disabled={saving || loading || !isPushEnabled} onValueChange={(value) => change('pushEnabled', value)} />
      <SettingRow title="Community updates" text="Include new community posts in your notifications" value={preferences.communityUpdates} disabled={saving || loading} onValueChange={(value) => change('communityUpdates', value)} />
      <SettingRow title="Use my neighbourhood" text="Use your saved neighbourhood when publishing posts and listings" value={preferences.useLocation} disabled={saving || loading} onValueChange={(value) => change('useLocation', value)} />
    </View>
    <View style={[styles.section, { padding: 15, gap: 12 }]}><Text style={styles.rowTitle}>Your neighbourhood</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Your neighbourhood" value={location} onChangeText={setLocation} style={styles.input} placeholder="Neighbourhood or city" /><Pressable disabled={saving || !location.trim()} onPress={saveLocation}><Text style={styles.link}>Save neighbourhood</Text></Pressable></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Safety & account</Text>
      <Pressable onPress={() => router.push('/report')} style={styles.row}><Text style={styles.rowTitle}>Report a problem</Text><Text style={styles.arrow}>›</Text></Pressable>
      <Pressable onPress={() => router.push({ pathname: '/information', params: { page: 'privacy' } })} style={styles.row}><Text style={styles.rowTitle}>Privacy information</Text><Text style={styles.arrow}>›</Text></Pressable>
      <Pressable onPress={() => router.push({ pathname: '/information', params: { page: 'about' } })} style={styles.row}><Text style={styles.rowTitle}>About NeighbourhoodLink</Text><Text style={styles.arrow}>›</Text></Pressable>
    </View><Pressable onPress={() => router.push('/delete-account')} style={styles.row}><Text style={{ color: colors.danger, fontWeight: '800' }}>Delete account</Text></Pressable><Text style={styles.version}>NeighbourhoodLink v1.0.0</Text>
  </Screen>;
}
function SettingRow({ title, text, value, onValueChange, disabled }: { title: string; text: string; value: boolean; disabled: boolean; onValueChange: (v: boolean) => void }) { return <View style={styles.row}><View style={{ flex: 1, gap: 3 }}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowText}>{text}</Text></View><Switch disabled={disabled} value={value} onValueChange={onValueChange} trackColor={{ false: '#D7DDD8', true: '#A8CFB5' }} thumbColor={value ? colors.primary : '#FFFFFF'} /></View>; }
const styles = StyleSheet.create({ section: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, sectionTitle: { paddingHorizontal: 15, paddingTop: 15, color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 }, row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, gap: 12, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 12 }, rowTitle: { color: colors.ink, fontWeight: '800' }, rowText: { color: colors.muted, fontSize: 11, lineHeight: 16 }, arrow: { color: colors.muted, fontSize: 22 }, version: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 8 }, input: { padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, color: colors.ink }, link: { color: colors.primary, fontWeight: '800' } });
