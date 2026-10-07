import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { useAuth } from '../../src/context/AuthContext';
import { useData } from '../../src/context/DataContext';
import { colors } from '../../src/theme/colors';

export default function CreateCommunityPost() {
  const { user } = useAuth(); const { addPost, preferences } = useData(); const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [publishing, setPublishing] = useState(false);
  const publish = async () => {
    if (publishing) return;
    if (!title.trim() || !content.trim()) return Alert.alert('Add more detail', 'A title and message are required.');
    setPublishing(true);
    try {
      await addPost({ id: `post-${Date.now()}`, userId: user?.id ?? '', userName: user?.fullName ?? 'Neighbour', title: title.trim(), content: content.trim(), images: [], location: preferences.useLocation ? user?.location ?? 'Your Neighbourhood' : 'Location on request', createdAt: new Date().toISOString() });
      router.replace('/(tabs)/community');
    } catch (error: any) { Alert.alert('Could not publish', error.message); }
    finally { setPublishing(false); }
  };
  return <Screen><AppHeader title="Create community post" back /><Text style={styles.helper}>Share an announcement, event, recommendation, or neighbourhood update.</Text><Text style={styles.label}>Title</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={title} onChangeText={setTitle} placeholder="e.g. Weekend clean-up" style={styles.input} /><Text style={styles.label}>Message</Text><TextInput inputAccessoryViewID="screen-keyboard-toolbar" value={content} onChangeText={setContent} placeholder="Write your update…" multiline style={[styles.input, { minHeight: 160, textAlignVertical: 'top' }]} /><Text style={styles.location}>{preferences.useLocation ? `📍 ${user?.location ?? 'Your Neighbourhood'}` : 'Location on request'}</Text><Pressable disabled={publishing} onPress={publish} style={styles.button}><Text style={styles.buttonText}>{publishing ? 'Publishing…' : 'Publish post'}</Text></Pressable></Screen>;
}
const styles = StyleSheet.create({ helper: { color: colors.muted, lineHeight: 19 }, label: { fontSize: 12, fontWeight: '900', color: colors.ink, marginTop: 4 }, input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink }, location: { backgroundColor: colors.primarySoft, padding: 12, borderRadius: 13, color: colors.primaryDark, fontWeight: '800' }, button: { backgroundColor: colors.primary, alignItems: 'center', paddingVertical: 15, borderRadius: 14 }, buttonText: { color: colors.white, fontWeight: '900' } });
