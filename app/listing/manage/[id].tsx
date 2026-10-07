import { ListingPhotos, uploadListingPhotos, type ListingPhoto } from '../../../src/components/ListingPhotos';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../../../src/components/AppHeader';
import { Chip } from '../../../src/components/Chip';
import { Screen } from '../../../src/components/Screen';
import { useAuth } from '../../../src/context/AuthContext';
import { useData } from '../../../src/context/DataContext';
import { Listing } from '../../../src/types';
import { colors } from '../../../src/theme/colors';

export default function ManageListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listings, loading } = useData();
  const { user } = useAuth();
  const listing = listings.find((item) => item.id === id);
  if (loading) return <Screen><AppHeader title="Manage listing" back /><Text>Loading…</Text></Screen>;
  if (!listing) return <Screen><AppHeader title="Manage listing" back /><Text>Listing not found.</Text></Screen>;
  if (listing.userId !== user?.id) return <Screen><AppHeader title="Manage listing" back /><Text>Only the owner can manage this listing.</Text></Screen>;
  return <ListingEditor key={listing.id} listing={listing} />;
}

function ListingEditor({ listing }: { listing: Listing }) {
  const { updateListing, deleteListing } = useData();
  const [photos, setPhotos] = useState<ListingPhoto[]>(listing.images.map(uri => ({ uri })));
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(String(listing.price));
  const [category, setCategory] = useState(listing.category);
  const [location, setLocation] = useState(listing.location);
  const [status, setStatus] = useState(listing.status);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving) return;
    if (!title.trim() || !description.trim() || !location.trim()) return Alert.alert('Add more details', 'Title, description, and location are required.');
    if (listing.type === 'sale' && (!Number.isFinite(Number(price)) || Number(price) < 0)) return Alert.alert('Invalid price', 'Enter a valid, non-negative amount.');
    setSaving(true);
    try {
      const images = await uploadListingPhotos(photos, listing.userId);
      setPhotos(images.map(uri => ({ uri })));
      await updateListing({ ...listing, images, title: title.trim(), description: description.trim(), location: location.trim(), category, status, price: listing.type === 'sale' ? Number(price) : 0 });
      router.replace({ pathname: '/listing/[id]', params: { id: listing.id } });
    } catch (error: any) {
      Alert.alert('Could not save listing', error.message ?? 'Please try again.');
    } finally { setSaving(false); }
  };
  const remove = () => Alert.alert('Delete listing?', 'This permanently removes your listing from the marketplace.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      if (saving) return;
      setSaving(true);
      try { await deleteListing(listing.id); router.replace('/(tabs)/marketplace'); }
      catch (error: any) { Alert.alert('Could not delete listing', error.message || 'Please try again.'); }
      finally { setSaving(false); }
    } },
  ]);
  return <Screen>
    <AppHeader title="Manage listing" back />
    <ListingPhotos photos={photos} onChange={setPhotos} disabled={saving} />
    <Text style={styles.label}>Title</Text>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Listing title" value={title} onChangeText={setTitle} style={styles.input} />
    <Text style={styles.label}>Description</Text>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Listing description" value={description} onChangeText={setDescription} multiline style={[styles.input, styles.description]} />
    <Text style={styles.label}>Category</Text>
    <View style={styles.chips}>{['Home', 'Tools', 'Kids', 'Outdoor', 'Sports', 'Other'].map((value) => <Chip key={value} label={value} selected={category === value} onPress={() => setCategory(value)} />)}</View>
    <Text style={styles.label}>Location</Text>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Listing location" value={location} onChangeText={setLocation} style={styles.input} />
    {listing.type === 'sale' && <><Text style={styles.label}>Price</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Listing price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} /></>}
    <Text style={styles.label}>Status</Text>
    <View style={styles.chips}>
      <Chip label="Active" selected={status === 'active'} onPress={() => setStatus('active')} />
      <Chip label="Reserved" selected={status === 'reserved'} onPress={() => setStatus('reserved')} />
      <Chip label={listing.type === 'sale' ? 'Sold' : 'Unavailable'} selected={status === 'sold'} onPress={() => setStatus('sold')} />
    </View>
    <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={[styles.button, saving && { opacity: 0.5 }]}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save changes'}</Text></Pressable>
    <Pressable accessibilityRole="button" disabled={saving} onPress={remove} style={{ padding: 15, alignItems: 'center' }}><Text style={{ color: colors.danger, fontWeight: '900' }}>Delete listing</Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.ink },
  description: { minHeight: 120, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '900' },
});
