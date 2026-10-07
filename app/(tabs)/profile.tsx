import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { useData } from '../../src/context/DataContext';
import { useAuth } from '../../src/context/AuthContext';
import { colors, shadow } from '../../src/theme/colors';

const Row = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => <Pressable onPress={onPress} style={styles.row}><Text style={styles.icon}>{icon}</Text><Text style={styles.rowLabel}>{label}</Text><Text style={styles.chevron}>›</Text></Pressable>;

export default function Profile() {
  const { user, logout, demoMode } = useAuth();

  const { listings, reviews } = useData();
  const received = reviews.filter((review) => review.reviewedUserId === user?.id);
  const average = received.length ? (received.reduce((sum, review) => sum + review.rating, 0) / received.length).toFixed(1) : '—';
  const listingCount = listings.filter((listing) => listing.userId === user?.id).length;
  const handleSignOut = async () => {
    try { await logout(); router.replace('/(auth)/login'); }
    catch (error: any) { Alert.alert('Could not sign out', error.message); }
  };

  return <Screen><AppHeader title="Profile" /><View style={styles.profileCard}><View style={styles.avatar}>{user?.profileImage ? <Image source={{ uri: user.profileImage }} style={{ width: 56, height: 56, borderRadius: 28 }} /> : <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? 'N'}</Text>}</View><View style={{ flex: 1, gap: 3 }}><Text style={styles.name}>{user?.fullName ?? 'Neighbour'}</Text><Text style={styles.email}>{user?.email}</Text><Text style={styles.location}>📍 {user?.location}</Text></View></View><View style={styles.stats}><View><Text style={styles.statNumber}>{average}</Text><Text style={styles.statLabel}>Rating</Text></View><View><Text style={styles.statNumber}>{listingCount}</Text><Text style={styles.statLabel}>Listings</Text></View><View><Text style={styles.statNumber}>{received.length}</Text><Text style={styles.statLabel}>Reviews</Text></View></View><View style={styles.menu}><Row icon="✎" label="Edit profile" onPress={() => router.push('/edit-profile')} /><Row icon="✚" label="Create listing" onPress={() => router.push('/create-listing')} /><Row icon="★" label="Reviews & ratings" onPress={() => router.push('/reviews')} /><Row icon="♧" label="Notifications" onPress={() => router.push('/notifications')} /><Row icon="⚙" label="Settings" onPress={() => router.push('/settings')} /></View><Pressable onPress={handleSignOut} style={styles.logout}><Text style={styles.logoutText}>Sign out</Text></Pressable></Screen>;
}
const styles = StyleSheet.create({ profileCard: { backgroundColor: colors.card, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow }, avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.white, fontSize: 24, fontWeight: '900' }, name: { fontSize: 18, fontWeight: '900', color: colors.ink }, email: { color: colors.muted, fontSize: 12 }, location: { color: colors.muted, fontSize: 12 }, verify: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 }, verifyText: { color: colors.primaryDark, fontWeight: '900', fontSize: 11 }, stats: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 18, flexDirection: 'row', justifyContent: 'space-around' }, statNumber: { fontSize: 22, fontWeight: '900', color: colors.ink, textAlign: 'center' }, statLabel: { color: colors.muted, fontSize: 11, textAlign: 'center' }, menu: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 }, icon: { width: 25, textAlign: 'center', color: colors.primary, fontSize: 18 }, rowLabel: { flex: 1, color: colors.ink, fontWeight: '800' }, chevron: { color: colors.muted, fontSize: 22 }, logout: { padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#FDEEEE' }, logoutText: { color: colors.danger, fontWeight: '900' }, demo: { textAlign: 'center', color: colors.muted, fontSize: 11 } });
