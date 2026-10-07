import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action && <Pressable onPress={onPress}><Text style={styles.action}>{action}</Text></Pressable>}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }, title: { fontSize: 18, fontWeight: '800', color: colors.ink }, action: { color: colors.primary, fontWeight: '800', fontSize: 13 } });
