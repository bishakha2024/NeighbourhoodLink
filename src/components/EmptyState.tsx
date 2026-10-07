import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function EmptyState({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return <View style={styles.wrap}><Text style={styles.emoji}>{emoji}</Text><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', padding: 36, gap: 8 }, emoji: { fontSize: 42 }, title: { fontSize: 18, fontWeight: '800', color: colors.ink }, body: { textAlign: 'center', color: colors.muted, lineHeight: 20, maxWidth: 300 } });
