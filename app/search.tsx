import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { ListingCard } from '../src/components/ListingCard';
import { Chip } from '../src/components/Chip';
import { useData } from '../src/context/DataContext';
import { colors } from '../src/theme/colors';

export default function Search() {
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { listings } = useData(); const [query, setQuery] = useState(''); const [category, setCategory] = useState(initialCategory ?? 'All'); const [localOnly, setLocalOnly] = useState(true);
  const categories = ['All', 'Home', 'Tools', 'Kids', 'Outdoor', 'Sports', 'Other'];
  const filtered = useMemo(() => listings.filter((item) => (!query || `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())) && (category === 'All' || item.category === category) && (!localOnly || item.status === 'active')), [listings, query, category, localOnly]);
  return <Screen><AppHeader title="Search & filters" back /><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={query} onChangeText={setQuery} placeholder="What are you looking for?" style={styles.input} /><Text style={styles.label}>Category</Text><View style={styles.chips}>{categories.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</View><Text style={styles.label}>Location</Text><Pressable onPress={() => setLocalOnly(!localOnly)} style={styles.location}><Text style={styles.checkbox}>{localOnly ? '✓' : ''}</Text><View style={{ flex: 1 }}><Text style={styles.locationTitle}>Only show active listings</Text><Text style={styles.locationMeta}>Hide reserved and unavailable items</Text></View></Pressable><Text style={styles.count}>{filtered.length} matching result{filtered.length === 1 ? '' : 's'}</Text>{filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}<Pressable onPress={() => router.back()} style={styles.button}><Text style={styles.buttonText}>Apply filters</Text></Pressable></Screen>;
}
const styles = StyleSheet.create({ input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 }, label: { fontSize: 12, fontWeight: '900', color: colors.ink, marginTop: 2 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, location: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 14, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, checkbox: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.primarySoft, color: colors.primaryDark, textAlign: 'center', lineHeight: 24, fontWeight: '900' }, locationTitle: { color: colors.ink, fontWeight: '800' }, locationMeta: { color: colors.muted, fontSize: 11, marginTop: 2 }, count: { color: colors.muted, fontSize: 12, fontWeight: '800' }, button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 13, alignItems: 'center' }, buttonText: { color: colors.white, fontWeight: '900' } });
