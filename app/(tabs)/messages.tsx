import { NeighbourAvatar } from '../../src/components/NeighbourAvatar';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { useData } from '../../src/context/DataContext';
import { colors, shadow } from '../../src/theme/colors';

export default function MessageList() {
  const { user } = useAuth();
  const { messages, readIds } = useData();

  const conversations = useMemo(() => {
    const grouped = new Map<string, { userId: string; name: string; listingId?: string; serviceId?: string; text: string; timestamp: string }>();
    messages.forEach((message) => {
      if (message.senderId !== user?.id && message.receiverId !== user?.id) return;
      const otherId = message.senderId === user?.id ? message.receiverId : message.senderId;
      if (otherId === user?.id) return;
      const existing = grouped.get(otherId);
      if (!existing || new Date(message.timestamp) > new Date(existing.timestamp)) {
        grouped.set(otherId, {
          userId: otherId,
          name: message.senderId === user?.id ? message.receiverName ?? messages.find((item) => item.senderId === otherId)?.senderName ?? 'Neighbour' : message.senderName,
          listingId: message.listingId, serviceId: message.serviceId,
          text: message.text,
          timestamp: message.timestamp,
        });
      }
    });
    return Array.from(grouped.values()).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [messages, user?.id]);

  return (
    <Screen>
      <AppHeader title="Messages" />
      {conversations.map((conversation) => (
        <Pressable
          key={conversation.userId}
          onPress={() => router.push({ pathname: '/chat', params: { sellerId: conversation.userId, sellerName: conversation.name, ...(conversation.listingId ? { listingId: conversation.listingId } : {}), ...(conversation.serviceId ? { serviceId: conversation.serviceId } : {}) } })}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
        >
          <NeighbourAvatar userId={conversation.userId} name={conversation.name} />
          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={[styles.name, { fontWeight: messages.some(item => item.senderId === conversation.userId && item.receiverId === user?.id && !readIds.includes(`message-${item.id}`)) ? '900' : '400' }]} numberOfLines={1}>{conversation.name}</Text>
              {messages.filter(item => item.senderId === conversation.userId && item.receiverId === user?.id && !readIds.includes(`message-${item.id}`)).length > 0 && <Text style={{ color: colors.primary, fontWeight: '900' }}>{messages.filter(item => item.senderId === conversation.userId && item.receiverId === user?.id && !readIds.includes(`message-${item.id}`)).length} new</Text>}<Text style={styles.time}>{formatTime(conversation.timestamp)}</Text>
            </View>
            <Text style={[styles.preview, { fontWeight: messages.some(item => item.senderId === conversation.userId && item.receiverId === user?.id && !readIds.includes(`message-${item.id}`)) ? '800' : '400' }]} numberOfLines={2}>{conversation.text}</Text>
            {conversation.listingId ? <Text style={styles.context}></Text> : null}
          </View>
        </Pressable>
      ))}
      {!conversations.length && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyBody}>Message a neighbour from a marketplace listing, service, or community post.</Text>
        </View>
      )}
    </Screen>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, ...shadow },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: colors.primaryDark },
  body: { flex: 1, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '900', color: colors.ink },
  time: { fontSize: 11, color: colors.muted },
  preview: { color: colors.muted, lineHeight: 19 },
  context: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', padding: 45, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 19, fontWeight: '900', color: colors.ink },
  emptyBody: { textAlign: 'center', color: colors.muted, lineHeight: 19 },
});
