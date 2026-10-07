import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { useData } from '../../src/context/DataContext';
import { colors, shadow } from '../../src/theme/colors';

export default function ServiceDetails() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>(); const { services, loading } = useData(); const service = services.find((s) => s.id === id);
  if (loading) return <Screen><AppHeader title="Service" back /><Text>Loading…</Text></Screen>;
  if (!service) return <Screen><AppHeader title="Service" back /><Text>Service not found.</Text></Screen>;
  const contact = () => router.push({ pathname: '/chat', params: { sellerId: service.userId, sellerName: service.providerName, serviceId: service.id } });
  return <Screen><AppHeader title="Service details" back /><View style={styles.hero}><Text style={styles.icon}>✦</Text><Text style={styles.title}>{service.serviceName}</Text><Text style={styles.provider}>{service.providerName} • {service.rating > 0 ? `⭐ ${service.rating.toFixed(1)}` : 'New provider'}</Text></View><View style={styles.card}><Text style={styles.section}>About this service</Text><Text style={styles.body}>{service.description}</Text><Text style={styles.section}>Availability</Text><Text style={styles.value}>{service.availability}</Text><Text style={styles.section}>Area</Text><Text style={styles.value}>{service.location}</Text><Text style={styles.section}>Rate</Text><Text style={styles.value}>${service.price} per session</Text></View>{service.userId === user?.id && <Pressable onPress={() => router.push({ pathname: '/services/manage/[id]', params: { id: service.id } })} style={styles.button}><Text style={styles.buttonText}>Manage service</Text></Pressable>}{service.userId !== user?.id && <Pressable onPress={contact} style={styles.button}><Text style={styles.buttonText}>Contact provider</Text></Pressable>}<Pressable onPress={() => router.push({ pathname: '/reviews', params: { userId: service.userId, userName: service.providerName } })}><Text style={styles.secondary}>Reviews & ratings</Text></Pressable></Screen>;
}
const styles = StyleSheet.create({ hero: { backgroundColor: colors.primary, borderRadius: 22, padding: 24, gap: 7, ...shadow }, icon: { fontSize: 28, color: colors.white }, title: { color: colors.white, fontSize: 28, fontWeight: '900' }, provider: { color: '#E8F4EC', fontWeight: '800' }, card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 17, gap: 8 }, section: { color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 4 }, body: { color: colors.ink, lineHeight: 20 }, value: { color: colors.ink, fontWeight: '800' }, button: { backgroundColor: colors.primary, alignItems: 'center', paddingVertical: 15, borderRadius: 14 }, buttonText: { color: colors.white, fontWeight: '900' }, secondary: { color: colors.primary, textAlign: 'center', fontWeight: '900', paddingVertical: 4 } });
