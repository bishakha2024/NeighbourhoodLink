import { ListingPhotos, uploadListingPhotos, type ListingPhoto } from '../src/components/ListingPhotos';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppHeader } from '../src/components/AppHeader';
import { Chip } from '../src/components/Chip';
import { useAuth } from '../src/context/AuthContext';
import { useData } from '../src/context/DataContext';
import { ListingType } from '../src/types';
import { colors } from '../src/theme/colors';
import { isFirebaseConfigured } from '../src/lib/firebase';

export default function CreateListing() {
  const { user } = useAuth(); const { addListing, addService, preferences } = useData();
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('Home'); const [type, setType] = useState<ListingType | 'service'>('sale'); const [price, setPrice] = useState(''); const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [availability, setAvailability] = useState('');
  const [publishing, setPublishing] = useState(false);
  const isService = type === 'service';
  const publish = async () => {
    if (publishing) return;
    if (!title.trim() || !description.trim()) return Alert.alert('Add more details', 'A title and description are required.');
    if (isService && !availability.trim()) return Alert.alert('Add availability', 'Let neighbours know when you are available.');
    if ((type === 'sale' || isService) && (!Number.isFinite(Number(price)) || Number(price) < 0)) return Alert.alert('Invalid price', 'Enter a valid, non-negative amount.');
    setPublishing(true);
    try {
      if (isService) {
        await addService({ id: `local-${Date.now()}`, userId: user?.id ?? 'demo-user', providerName: user?.fullName ?? 'Neighbour', serviceName: title.trim(), description: description.trim(), category, price: Number(price) || 0, availability: availability.trim(), location: preferences.useLocation ? user?.location ?? 'Your Neighbourhood' : 'Location on request', rating: 0, createdAt: new Date().toISOString() });
        Alert.alert('Published', 'Your service is now visible in the marketplace.');
        router.replace({ pathname: '/(tabs)/marketplace', params: { type: 'services' } });
        return;
      }
      const imageUrls = await uploadListingPhotos(photos, user?.id ?? 'demo-user');
      const listing = { id: `local-${Date.now()}`, userId: user?.id ?? 'demo-user', sellerName: user?.fullName ?? 'Neighbour', title, description, category, type, price: type === 'sale' ? Number(price) || 0 : 0, images: imageUrls, location: preferences.useLocation ? user?.location ?? 'Your Neighbourhood' : 'Location on request', status: 'active' as const, createdAt: new Date().toISOString() };
      await addListing(listing);
      Alert.alert('Published', isFirebaseConfigured ? 'Your listing has been saved to Firebase.' : 'Your listing is now visible in the demo marketplace.');
      router.replace('/(tabs)/marketplace');
    } catch (error: any) {
      Alert.alert('Could not publish', error?.message ?? 'Please try again.');
    } finally {
      setPublishing(false);
    }
  };
  return <Screen><AppHeader title="Create listing" back /><Text style={styles.helper}>Choose a listing type and add enough detail for a neighbour to understand what you are offering.</Text>{!isService && <ListingPhotos photos={photos} onChange={setPhotos} disabled={publishing} />}<Text style={styles.label}>Listing type</Text><View style={styles.chips}><Chip label="For sale" selected={type === 'sale'} onPress={() => setType('sale')} /><Chip label="Borrow" selected={type === 'borrow'} onPress={() => setType('borrow')} /><Chip label="Give away" selected={type === 'giveaway'} onPress={() => setType('giveaway')} /><Chip label="Service" selected={isService} onPress={() => { setType('service'); setCategory('Home'); }} /></View><Text style={styles.label}>Title</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={title} onChangeText={setTitle} placeholder={isService ? 'e.g. Math tutoring' : 'e.g. Cordless drill'} style={styles.input} /><Text style={styles.label}>Description</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={description} onChangeText={setDescription} placeholder={isService ? 'What you offer, your experience, and what is included…' : 'Condition, pickup details, what is included…'} multiline style={[styles.input, { minHeight: 105, textAlignVertical: 'top' }]} /><Text style={styles.label}>Category</Text><View style={styles.chips}>{(isService ? ['Home', 'Education', 'Pets', 'Outdoor', 'Wellness', 'Other'] : ['Home', 'Tools', 'Kids', 'Outdoor', 'Sports', 'Other']).map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</View>{isService && <><Text style={styles.label}>Availability</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={availability} onChangeText={setAvailability} placeholder="e.g. Weekends or weekday evenings" style={styles.input} /></>}{(type === 'sale' || isService) && <><Text style={styles.label}>{isService ? 'Rate per session' : 'Price'}</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={price} onChangeText={setPrice} placeholder="0" keyboardType="decimal-pad" style={styles.input} /></>}<Pressable disabled={publishing} onPress={publish} style={styles.button}><Text style={styles.buttonText}>{publishing ? 'Publishing…' : isService ? 'Publish service' : 'Publish listing'}</Text></Pressable></Screen>;
}
const styles = StyleSheet.create({ helper: { color: colors.muted, lineHeight: 19 }, photoWrap: { height: 200, borderRadius: 18, overflow: 'hidden' }, photo: { width: '100%', height: '100%' }, photoOverlay: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }, photoText: { color: colors.white, fontWeight: '800', fontSize: 12 }, label: { color: colors.ink, fontSize: 12, fontWeight: '900', marginTop: 2 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink }, button: { backgroundColor: colors.primary, alignItems: 'center', paddingVertical: 15, borderRadius: 14, marginTop: 8 }, buttonText: { color: colors.white, fontWeight: '900' } });
