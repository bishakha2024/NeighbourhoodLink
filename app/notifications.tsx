import { notificationRoute } from '../src/lib/notificationRoute';
import { router } from 'expo-router';
import { Notification } from '../src/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { useData } from '../src/context/DataContext';
import { colors } from '../src/theme/colors';

export default function Notifications() { const { notifications, markNotificationRead } = useData();
  const open = (notification: Notification) => {
    markNotificationRead(notification.id);
    router.push(notificationRoute(notification.target));
  };
  return <Screen><AppHeader title="Notifications" back />{!notifications.length && <Text style={styles.body}>No notifications yet.</Text>}{notifications.map((n) => <Pressable accessibilityRole="button" onPress={() => open(n)} key={n.id} style={[styles.card, !n.read && styles.unread]}><View style={styles.dot}><Text>•</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={styles.title}>{n.title}</Text><Text style={styles.body}>{n.body}</Text><Text style={styles.date}>{new Date(n.createdAt).toLocaleDateString()}</Text></View></Pressable>)}</Screen>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12 }, unread: { borderColor: '#B8D8C3', backgroundColor: '#F7FBF8' }, dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.ink, fontWeight: '900' }, body: { color: colors.muted, lineHeight: 18 }, date: { color: colors.muted, fontSize: 10 } });
