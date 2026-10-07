import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ProfilePhoto({ uri, size = 90, listing = false }: { uri: string; size?: number; listing?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={listing ? "Expand listing photo" : "Expand profile photo"} onPress={() => setExpanded(true)}><Image source={{ uri }} style={{ width: size, height: listing ? 250 : size, borderRadius: listing ? 20 : size / 2 }} /></Pressable>
    <Modal visible={expanded} transparent={false} animationType="fade" onRequestClose={() => setExpanded(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
        <Image accessibilityLabel={listing ? "Expanded listing photo" : "Expanded profile photo"} source={{ uri }} resizeMode="contain" style={{ flex: 1, width: '100%' }} />
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}><Pressable accessibilityRole="button" accessibilityLabel="Close photo" onPress={() => setExpanded(false)} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', borderRadius: 14 }}><Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Close ✕</Text></Pressable></View>
      </SafeAreaView>
    </Modal>
  </>;
}
