import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <View style={styles.splash}><View style={styles.logo}><Text style={styles.logoText}>N</Text></View><Text style={styles.name}>NeighbourhoodLink</Text><Text style={styles.tagline}>Your neighbourhood, connected.</Text>{loading && <ActivityIndicator color={colors.primary} style={styles.spinner} />}</View>;
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  logoText: { color: colors.white, fontSize: 32, fontWeight: '900' },
  name: { fontSize: 26, fontWeight: '900', color: colors.ink },
  tagline: { color: colors.muted },
  spinner: { marginTop: 18 },
});
