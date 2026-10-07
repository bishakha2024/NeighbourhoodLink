import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function Chip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}><Text style={[styles.text, selected && styles.selectedText]}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ chip: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card }, selected: { backgroundColor: colors.primary, borderColor: colors.primary }, text: { color: colors.ink, fontSize: 12, fontWeight: '700' }, selectedText: { color: colors.white } });
