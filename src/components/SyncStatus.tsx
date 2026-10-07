import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useData } from '../context/DataContext';
import { colors } from '../theme/colors';

export function SyncStatus() {
  const { dataError, loading, retrySync } = useData();
  if (!dataError) return null;
  return <View style={styles.wrap}><Text style={styles.text}>{dataError}</Text><Pressable disabled={loading} onPress={retrySync}><Text style={styles.retry}>Retry</Text></Pressable></View>;
}
const styles = StyleSheet.create({ wrap: { backgroundColor: '#FDEEEE', padding: 12, gap: 8 }, text: { color: colors.danger, fontSize: 12 }, retry: { color: colors.danger, fontWeight: '800' } });
