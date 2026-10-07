import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { useAuth } from '../src/context/AuthContext';
import { useData } from '../src/context/DataContext';
import { colors } from '../src/theme/colors';

export default function Reviews() {
  const { userId, userName } = useLocalSearchParams<{ userId?: string; userName?: string }>();
  const { user } = useAuth();
  const { reviews, addReview } = useData();
  const target = userId ?? user?.id;
  const received = reviews.filter((review) => review.reviewedUserId === target);
  const existing = received.find((review) => review.reviewerId === user?.id);
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const average = received.length ? (received.reduce((sum, review) => sum + review.rating, 0) / received.length).toFixed(1) : '—';
  const submit = async () => {
    if (saving || !target) return;
    setSaving(true);
    try { await addReview(target, rating, comment); setComment(''); Alert.alert('Review saved', 'Thank you for sharing your experience.'); }
    catch (error: any) { Alert.alert('Could not save review', error.message); }
    finally { setSaving(false); }
  };
  return <Screen>
    <AppHeader title="Reviews & ratings" back />
    <View style={styles.summary}><Text style={styles.score}>{average}</Text><Text style={styles.sub}>{userName ?? 'Your profile'} · {received.length} review{received.length === 1 ? '' : 's'}</Text></View>
    {target && target !== user?.id && <View style={styles.card}>
      <Text style={styles.name}>{existing ? 'Update your review' : 'Share your experience'}</Text>
      <View style={styles.row}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} stars`} accessibilityState={{ selected: rating === value }} onPress={() => setRating(value)}><Text style={[styles.star, { color: value <= rating ? '#D79E2E' : colors.muted }]}>★</Text></Pressable>)}</View>
      <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Review" value={comment} editable={!saving} onChangeText={setComment} placeholder="Describe your experience with this neighbour…" multiline style={styles.input} />
      <Pressable onPress={submit} disabled={saving || !comment.trim()} style={[styles.button, !comment.trim() && { opacity: 0.5 }]}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save review'}</Text></Pressable>
    </View>}
    {!received.length && <Text style={styles.comment}>No reviews yet.</Text>}
    {received.map((review) => <View key={review.id} style={styles.card}><View style={styles.row}><Text style={styles.name}>{review.reviewerName}</Text><Text style={styles.rating}>{'★'.repeat(review.rating)}</Text></View><Text style={styles.comment}>{review.comment}</Text><Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text></View>)}
  </Screen>;
}
const styles = StyleSheet.create({ summary: { backgroundColor: colors.primary, borderRadius: 20, padding: 25, alignItems: 'center', gap: 5 }, score: { color: colors.white, fontSize: 38, fontWeight: '900' }, sub: { color: '#EAF5ED', textAlign: 'center' }, card: { backgroundColor: colors.card, borderRadius: 17, borderWidth: 1, borderColor: colors.line, padding: 15, gap: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, name: { color: colors.ink, fontWeight: '900' }, rating: { color: '#D79E2E' }, star: { fontSize: 32 }, comment: { color: colors.ink, lineHeight: 19 }, date: { color: colors.muted, fontSize: 11 }, input: { minHeight: 100, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, color: colors.ink, textAlignVertical: 'top' }, button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' }, buttonText: { color: colors.white, fontWeight: '800' } });
