import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function AppHeader({ title, back = false, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  return <View style={styles.row}>
    {back ? <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable> : <View style={styles.brandDot}><Text style={styles.brandMark}>N</Text></View>}
    <Text style={styles.title}>{title}</Text>
    <View style={styles.right}>{right}</View>
  </View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12 }, brandDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, brandMark: { color: colors.white, fontWeight: '800', fontSize: 18 }, back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, backText: { fontSize: 30, lineHeight: 32, color: colors.ink, marginTop: -3 }, title: { fontSize: 22, fontWeight: '800', color: colors.ink, flex: 1 }, right: { alignItems: 'flex-end' } });
