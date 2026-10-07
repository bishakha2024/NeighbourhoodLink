import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, Text, TextInput } from 'react-native';
import { Screen } from '../../../src/components/Screen';
import { AppHeader } from '../../../src/components/AppHeader';
import { useData } from '../../../src/context/DataContext';
import { useAuth } from '../../../src/context/AuthContext';
import type { Service } from '../../../src/types';
import { colors } from '../../../src/theme/colors';
export default function ManageService() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services, loading } = useData(); const { user } = useAuth();
  const service = services.find(item => item.id === id);
  if (loading) return <Screen><AppHeader title="Manage service" back /><Text>Loading…</Text></Screen>;
  if (!service) return <Screen><AppHeader title="Manage service" back /><Text>Service not found.</Text></Screen>;
  if (service.userId !== user?.id) return <Screen><AppHeader title="Manage service" back /><Text>Only the provider can manage this service.</Text></Screen>;
  return <Editor key={service.id} service={service} />;
}
function Editor({ service }: { service: Service }) {
  const { updateService, deleteService } = useData();
  const [draft, setDraft] = useState(service); const [price, setPrice] = useState(String(service.price)); const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    if (![draft.serviceName, draft.description, draft.category, draft.availability, draft.location].every(value => value.trim())) return Alert.alert('Missing details', 'Complete all service details.');
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return Alert.alert('Invalid rate', 'Enter a non-negative rate.');
    setBusy(true);
    try { await updateService({ ...draft, serviceName: draft.serviceName.trim(), description: draft.description.trim(), category: draft.category.trim(), availability: draft.availability.trim(), location: draft.location.trim(), price: Number(price) }); router.replace({ pathname: '/services/[id]', params: { id: service.id } }); }
    catch (error: any) { Alert.alert('Could not save service', error.message); } finally { setBusy(false); }
  };
  const remove = () => Alert.alert('Delete service?', 'This permanently removes your service from the marketplace.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => {
    if (busy) return; setBusy(true);
    try { await deleteService(service.id); router.replace({ pathname: '/(tabs)/marketplace', params: { type: 'services' } }); } catch (error: any) { Alert.alert('Could not delete service', error.message); } finally { setBusy(false); }
  } }]);
  return <Screen><AppHeader title="Manage service" back />{(['serviceName', 'description', 'category', 'availability', 'location'] as const).map(key => <React.Fragment key={key}><Text style={{ fontWeight: '800' }}>{({ serviceName: 'Service name', description: 'Description', category: 'Category', availability: 'Availability', location: 'Location' })[key]}</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel={key} editable={!busy} value={draft[key]} onChangeText={value => setDraft(current => ({ ...current, [key]: value }))} multiline={key === 'description'} style={{ padding: 14, borderRadius: 14, backgroundColor: colors.card }} /></React.Fragment>)}<Text>Rate per session</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Service rate" editable={!busy} value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={{ padding: 14, backgroundColor: colors.card }} /><Pressable disabled={busy} onPress={save} style={{ padding: 15, backgroundColor: colors.primary, borderRadius: 14 }}><Text style={{ color: colors.white }}>{busy ? 'Saving…' : 'Save changes'}</Text></Pressable><Pressable disabled={busy} onPress={remove}><Text style={{ color: colors.danger }}>Delete service</Text></Pressable></Screen>;
}
