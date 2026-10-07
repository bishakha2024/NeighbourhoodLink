import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Listing } from '../types';
import { colors, shadow } from '../theme/colors';

export function ListingCard({ listing }: { listing: Listing }) {
  const badge = listing.type === 'sale' ? `$${listing.price}` : listing.type === 'borrow' ? 'Borrow' : 'Free';
  return <Pressable onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.93 }]}>
    <Image source={{ uri: listing.images[0] }} style={styles.image} />
    <View style={styles.body}>
      <View style={styles.top}><Text style={styles.title} numberOfLines={1}>{listing.title}</Text><View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View></View>
      <Text style={styles.meta}>{listing.category} • {listing.location}</Text>
      <Text style={styles.seller}>by {listing.sellerName}</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden', ...shadow, marginBottom: 12 }, image: { width: '100%', height: 160 }, body: { padding: 14, gap: 6 }, top: { flexDirection: 'row', alignItems: 'center', gap: 8 }, title: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.ink }, badge: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 }, meta: { color: colors.muted, fontSize: 13 }, seller: { color: colors.ink, fontSize: 13, fontWeight: '600' } });
