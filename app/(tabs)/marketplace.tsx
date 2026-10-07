import { useFocusEffect } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { ListingCard } from '../../src/components/ListingCard';
import { Service } from '../../src/types';
import { Chip } from '../../src/components/Chip';
import { useData } from '../../src/context/DataContext';
import { colors } from '../../src/theme/colors';

export default function Marketplace() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { listings, services, markMarketplaceSeen } = useData();
  useFocusEffect(useCallback(() => { markMarketplaceSeen(); }, [listings]));
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'sale' | 'borrow' | 'giveaway' | 'services'>(params.type === 'services' ? 'services' : 'all');
  useEffect(() => {
    if (params.type === 'services') setType('services');
  }, [params.type]);
  const filtered = useMemo(() => listings.filter((item) => {
    const matchQuery = !query || `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    const matchType = type === 'all' || item.type === type;
    return matchQuery && matchType;
  }), [listings, query, type]);

  const filteredServices = useMemo(() => services.filter((service) => !query || `${service.serviceName} ${service.category} ${service.description}`.toLowerCase().includes(query.toLowerCase())), [services, query]);

  return <Screen><AppHeader title="Marketplace" right={<Pressable onPress={() => router.push('/create-listing')} style={styles.add}><Text style={styles.addText}>＋ Post</Text></Pressable>} />
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={query} onChangeText={setQuery} placeholder="Search items, categories, services…" style={styles.search} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}><Chip label="All" selected={type === 'all'} onPress={() => setType('all')} /><Chip label="For sale" selected={type === 'sale'} onPress={() => setType('sale')} /><Chip label="Borrow" selected={type === 'borrow'} onPress={() => setType('borrow')} /><Chip label="Giveaway" selected={type === 'giveaway'} onPress={() => setType('giveaway')} /><Chip label="Services" selected={type === 'services'} onPress={() => setType('services')} /><Chip label="Advanced filters" onPress={() => router.push('/search')} /></ScrollView>
    <Text style={styles.result}>{filtered.length + ((type === 'all' || type === 'services') ? filteredServices.length : 0)} result(s)</Text>
    {filtered.map(listing => <ListingCard key={listing.id} listing={listing} />)}
    {(type === 'all' || type === 'services') && filteredServices.map(service => <ServiceCard key={service.id} service={service} />)}
    {!filtered.length && !((type === 'all' || type === 'services') && filteredServices.length) && <View style={styles.empty}><Text style={styles.emptyEmoji}>🔎</Text><Text style={styles.emptyTitle}>No matches found</Text><Text style={styles.emptyBody}>Try a different keyword or remove one of the filters.</Text></View>}

  </Screen>;
}
function ServiceCard({ service }: { service: Service }) {
  return <Pressable onPress={() => router.push({ pathname: '/services/[id]', params: { id: service.id } })} style={styles.serviceCard}>
    <View style={styles.serviceIcon}><Text style={styles.serviceIconText}>{service.category === 'Pets' ? '🐾' : service.category === 'Education' ? '📚' : '🌿'}</Text></View>
    <View style={{ flex: 1, gap: 4 }}><Text style={styles.serviceTitle}>{service.serviceName}</Text><Text style={styles.serviceProvider}>{service.providerName} • {service.rating > 0 ? `⭐ ${service.rating.toFixed(1)}` : 'New provider'}</Text><Text style={styles.serviceBody}>{service.description}</Text><Text style={styles.serviceMeta}>{service.availability} • ${service.price}/session</Text></View>
  </Pressable>;
}

const styles = StyleSheet.create({ add: { backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 }, serviceCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 15, flexDirection: 'row', gap: 13 }, serviceIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, serviceIconText: { fontSize: 22 }, serviceTitle: { fontSize: 16, fontWeight: '900', color: colors.ink }, serviceProvider: { color: colors.primary, fontWeight: '800', fontSize: 12 }, serviceBody: { color: colors.muted, lineHeight: 18 }, serviceMeta: { color: colors.ink, fontSize: 12, fontWeight: '700' }, addText: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 }, search: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink }, chips: { gap: 8, paddingRight: 10 }, result: { fontSize: 12, color: colors.muted, fontWeight: '700' }, empty: { alignItems: 'center', padding: 45, gap: 8 }, emptyEmoji: { fontSize: 40 }, emptyTitle: { fontSize: 19, fontWeight: '900', color: colors.ink }, emptyBody: { textAlign: 'center', color: colors.muted } });
