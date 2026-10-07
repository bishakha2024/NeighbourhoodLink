import { useFocusEffect } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { useAuth } from '../src/context/AuthContext';
import { useData } from '../src/context/DataContext';
import { colors } from '../src/theme/colors';

export default function Messages() {
  const { listingId, sellerId, sellerName, serviceId } = useLocalSearchParams<{ listingId?: string; sellerId?: string; sellerName?: string; serviceId?: string }>();
  const { user } = useAuth(); const { messages, addMessage, markConversationRead } = useData(); const [text, setText] = useState(''); const [sending, setSending] = useState(false);
  const target = sellerId;
  const chat = useMemo(() => messages.filter((m) => ((m.senderId === user?.id && m.receiverId === target) || (m.senderId === target && m.receiverId === user?.id))).sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [messages, target, user?.id, listingId, serviceId]);
  useFocusEffect(useCallback(() => { markConversationRead(target ?? ''); }, [target, messages]));
  const send = async () => {
    if (!text.trim() || sending || !target) return;
    setSending(true);
    try {
      await addMessage({ id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`, senderId: user?.id ?? '', receiverId: target, receiverName: sellerName ?? 'Neighbour', senderName: user?.fullName ?? 'Neighbour', text: text.trim(), timestamp: new Date().toISOString(), ...(listingId ? { listingId } : {}), ...(serviceId ? { serviceId } : {}) });
      setText('');
    } catch (error: any) { Alert.alert('Could not send message', error.message ?? 'Please try again.'); }
    finally { setSending(false); }
  };
  if (!target || target === user?.id) return <Screen><AppHeader title="Messages" back /><Text>Choose another neighbour to start a conversation.</Text><Pressable onPress={() => router.replace('/(tabs)/messages')}><Text style={{ color: colors.primary }}>Open conversations</Text></Pressable></Screen>;
  return <Screen><AppHeader title="Conversation" back /><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/neighbour/[id]', params: { id: target, name: sellerName ?? 'Neighbour' } })}><Text style={{ color: colors.primary, fontWeight: '900', fontSize: 22 }}>{sellerName ?? 'Neighbour'} →</Text><Text>View profile and listings</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/reviews', params: { userId: target, userName: sellerName ?? 'Neighbour' } })}><Text style={{ color: colors.primary, fontWeight: '800' }}>Reviews & ratings</Text></Pressable>{chat.length ? chat.map((m) => <View key={m.id} style={[styles.bubble, m.senderId === user?.id ? styles.mine : styles.theirs]}><Text style={[styles.bubbleText, m.senderId === user?.id && { color: colors.white }]}>{m.text}</Text></View>) : <View style={styles.empty}><Text style={styles.emptyEmoji}>💬</Text><Text style={styles.emptyTitle}>Start the conversation</Text><Text style={styles.emptyBody}>Ask about pickup, availability, condition, or borrowing details.</Text></View>}<View style={styles.composer}><TextInput inputAccessoryViewID="screen-keyboard-toolbar" editable={!sending} value={text} onChangeText={setText} placeholder="Write a message…" style={styles.input} multiline /><Pressable disabled={sending || !text.trim()} onPress={send} style={styles.send}><Text style={styles.sendText}>{sending ? 'Sending…' : 'Send'}</Text></Pressable></View></Screen>;
}
const styles = StyleSheet.create({ bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16, marginBottom: 8 }, mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 5 }, theirs: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 5 }, bubbleText: { color: colors.ink, lineHeight: 19 }, empty: { alignItems: 'center', padding: 45, gap: 8 }, emptyEmoji: { fontSize: 40 }, emptyTitle: { fontSize: 18, fontWeight: '900', color: colors.ink }, emptyBody: { textAlign: 'center', color: colors.muted, lineHeight: 19 }, composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: colors.background, paddingTop: 8 }, input: { flex: 1, minHeight: 48, maxHeight: 100, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11, color: colors.ink }, send: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 13 }, sendText: { color: colors.white, fontWeight: '900' } });
