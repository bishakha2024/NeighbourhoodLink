import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../src/components/AppHeader';
import { Chip } from '../src/components/Chip';
import { Screen } from '../src/components/Screen';
import { useData } from '../src/context/DataContext';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

export default function ReportProblem() {
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const { addReport } = useData();
  const { demoMode } = useAuth();
  const [reason, setReason] = useState('Other');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await addReport(reason, details, listingId);
      Alert.alert('Report saved', demoMode ? 'Your report is saved on this device. Demo reports are not sent to a moderation team.' : 'Your report has been submitted.');
      router.back();
    } catch (error: any) { Alert.alert('Could not submit report', error.message); }
    finally { setSaving(false); }
  };
  return <Screen><AppHeader title={listingId ? 'Report listing' : 'Report a problem'} back />
    <Text style={styles.label}>Reason</Text>
    <View style={styles.chips}>{['Scam', 'Inappropriate content', 'Safety concern', 'App issue', 'Other'].map((value) => <Chip key={value} label={value} selected={reason === value} onPress={() => setReason(value)} />)}</View>
    <Text style={styles.label}>What happened?</Text>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Report details" value={details} onChangeText={setDetails} multiline placeholder="Provide details to help us understand the problem." style={styles.input} />
    <Pressable disabled={saving || !details.trim()} onPress={submit} style={[styles.button, !details.trim() && { opacity: 0.5 }]}><Text style={styles.buttonText}>{saving ? 'Submitting…' : 'Submit report'}</Text></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({ label: { color: colors.ink, fontWeight: '800' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, input: { minHeight: 160, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, color: colors.ink, textAlignVertical: 'top' }, button: { padding: 15, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' }, buttonText: { color: colors.white, fontWeight: '800' } });
