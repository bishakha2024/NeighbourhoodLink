import { ProfilePhoto } from '../../src/components/ProfilePhoto';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { useData } from '../../src/context/DataContext';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { ListingCard } from '../../src/components/ListingCard';
import type { AppUser } from '../../src/types';

export default function NeighbourProfile() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { listings, services, reviews } = useData();
  const [profile, setProfile] = useState<Partial<AppUser> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setProfile(null); setError('');
    if (db) getDoc(doc(db, 'Users', id)).then(snapshot => { if (!cancelled && snapshot.exists()) setProfile(snapshot.data()); }).catch(() => { if (!cancelled) setError('Profile details could not be loaded.'); });
    return () => { cancelled = true; };
  }, [id]);
  const owned = listings.filter(item => item.userId === id);
  const ratings = reviews.filter(item => item.reviewedUserId === id);
  const displayName = profile?.fullName || name || owned[0]?.sellerName || 'Neighbour';
  return <Screen><AppHeader title="Neighbour profile" back />{profile?.profileImage && <ProfilePhoto uri={profile.profileImage} />}<Text style={{ fontSize: 24, fontWeight: '900' }}>{displayName}</Text>{profile?.location && <Text>{profile.location}</Text>}{error && <Text>{error}</Text>}<Pressable onPress={() => router.push({ pathname: '/reviews', params: { userId: id, userName: displayName } })}><Text>{ratings.length ? `${(ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1)} ★` : 'No ratings yet'} · View reviews</Text></Pressable><Text style={{ fontSize: 20, fontWeight: '800' }}>Listings ({owned.length})</Text>{owned.map(listing => <ListingCard key={listing.id} listing={listing} />)}<Text style={{ fontSize: 20, fontWeight: '800' }}>Services</Text>{services.filter(item => item.userId === id).map(item => <Pressable key={item.id} onPress={() => router.push({ pathname: '/services/[id]', params: { id: item.id } })}><Text>{item.serviceName} →</Text></Pressable>)}</Screen>;
}
