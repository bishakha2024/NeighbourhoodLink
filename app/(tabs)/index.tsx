import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { SectionTitle } from '../../src/components/SectionTitle';
import { ListingCard } from '../../src/components/ListingCard';
import { useData } from '../../src/context/DataContext';
import { useAuth } from '../../src/context/AuthContext';
import { colors, shadow } from '../../src/theme/colors';

const categories = [
  ['🛠️', 'Tools'], ['🏠', 'Home'], ['🚲', 'Sports'], ['🧸', 'Kids'], ['🌱', 'Garden'], ['📦', 'Other']
];

export default function Home() {
  const { user } = useAuth();
  const { notifications, listings, posts } = useData();
  return <Screen>
    <AppHeader title={`Hi, ${user?.fullName?.split(' ')[0] ?? 'Neighbour'}`} right={<Pressable onPress={() => router.push('/notifications')}><Text style={styles.bell}>◔</Text>{notifications.filter(item => !item.read).length > 0 && <Text accessibilityLabel="Unread notifications" style={{ color: colors.white, backgroundColor: colors.danger, borderRadius: 10, paddingHorizontal: 5, position: 'absolute', right: -8, top: -5 }}>{notifications.filter(item => !item.read).length}</Text>}</Pressable>} />
    <View style={styles.hero}><Text style={styles.heroKicker}>LOCAL • TRUSTED • PRACTICAL</Text><Text style={styles.heroTitle}>What can we share today?</Text><Text style={styles.heroBody}>Find useful items, lend a hand, or see what your neighbours are talking about.</Text><View style={styles.heroButtons}><Pressable onPress={() => router.push('/(tabs)/marketplace')} style={styles.primary}><Text style={styles.primaryText}>Explore marketplace</Text></Pressable><Pressable onPress={() => router.push('/create-listing')} style={styles.secondary}><Text style={styles.secondaryText}>Post an item</Text></Pressable></View></View>
    <SectionTitle title="Browse by category" action="See all" onPress={() => router.push('/(tabs)/marketplace')} />
    <View style={styles.categoryGrid}>{categories.map(([emoji, label]) => <Pressable key={label} onPress={() => router.push({ pathname: '/search', params: { category: label } })} style={styles.category}><Text style={styles.emoji}>{emoji}</Text><Text style={styles.categoryText}>{label}</Text></Pressable>)}</View>
    <SectionTitle title="Nearby listings" action="View all" onPress={() => router.push('/(tabs)/marketplace')} />
    {listings.slice(0, 2).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
    <SectionTitle title="Community pulse" action="Open feed" onPress={() => router.push('/(tabs)/community')} />
    {posts[0] && <Pressable accessibilityRole="button" accessibilityLabel={`Open community post: ${posts[0].title}`} onPress={() => router.push({ pathname: '/community/[id]', params: { id: posts[0].id } })} style={styles.postCard}><Text style={styles.postTitle}>{posts[0]?.title}</Text><Text style={styles.postBody} numberOfLines={2}>{posts[0]?.content}</Text><Text style={styles.postMeta}>{posts[0]?.location} • {posts[0]?.userName}</Text></Pressable>}
  </Screen>;
}
const styles = StyleSheet.create({ bell: { fontSize: 25, color: colors.ink }, hero: { padding: 22, borderRadius: 22, backgroundColor: colors.primary, gap: 10, ...shadow }, heroKicker: { color: '#D5EBDD', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, heroTitle: { color: colors.white, fontSize: 28, fontWeight: '900', lineHeight: 33 }, heroBody: { color: '#EAF5ED', lineHeight: 20 }, heroButtons: { flexDirection: 'row', gap: 10, marginTop: 8 }, primary: { backgroundColor: colors.white, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12 }, primaryText: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 }, secondary: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }, secondaryText: { color: colors.white, fontWeight: '900', fontSize: 12 }, categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, category: { width: '31.5%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 6 }, emoji: { fontSize: 22 }, categoryText: { color: colors.ink, fontWeight: '800', fontSize: 12 }, postCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 15, gap: 6 }, postTitle: { fontSize: 15, fontWeight: '900', color: colors.ink }, postBody: { color: colors.muted, lineHeight: 19 }, postMeta: { fontSize: 12, color: colors.primary, fontWeight: '700' } });
