import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppHeader } from '../../src/components/AppHeader';
import { SectionTitle } from '../../src/components/SectionTitle';
import { useData } from '../../src/context/DataContext';
import { colors, shadow } from '../../src/theme/colors';

export default function Community() {
  const { posts, postLikes, postComments } = useData();
  const [query, setQuery] = useState('');
  const filtered = posts.filter((post) => `${post.title} ${post.content} ${post.userName}`.toLowerCase().includes(query.toLowerCase()));
  return <Screen><AppHeader title="Community" right={<Pressable onPress={() => router.push('/community/create')} style={styles.add}><Text style={styles.addText}>＋ Post</Text></Pressable>} />
    <View style={styles.banner}><Text style={styles.bannerTitle}>Neighbourhood feed</Text><Text style={styles.bannerText}>Announcements, local updates, events, lost & found, and helpful conversations.</Text></View>
    <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Search community posts" value={query} onChangeText={setQuery} placeholder="Search community posts…" style={{ padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.card, color: colors.ink }} /><SectionTitle title="Latest posts" />
    {!filtered.length && <Text style={styles.body}>No community posts found.</Text>}{filtered.map((post) => <Pressable key={post.id} accessibilityRole="button" accessibilityLabel={`Open community post: ${post.title}`} onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.id } })} style={styles.card}><View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{post.userName.charAt(0)}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{post.userName}</Text><Text style={styles.meta}>{post.location}</Text></View><Text style={styles.time}>●</Text></View><Text style={styles.title}>{post.title}</Text><Text style={styles.body}>{post.content}</Text><View style={styles.footer}><Text style={styles.footerText}>♥ {postLikes.filter((like) => like.postId === post.id).length} · 💬 {postComments.filter((comment) => comment.postId === post.id).length} · Read post →</Text></View></Pressable>)}
  </Screen>;
}
const styles = StyleSheet.create({ add: { backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 }, addText: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 }, banner: { backgroundColor: '#F1EDE1', padding: 18, borderRadius: 18, gap: 6 }, bannerTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' }, bannerText: { color: colors.muted, lineHeight: 19 }, card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 11, ...shadow }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.primaryDark, fontWeight: '900' }, name: { fontWeight: '900', color: colors.ink }, meta: { color: colors.muted, fontSize: 12 }, time: { color: colors.primary }, title: { fontSize: 17, fontWeight: '900', color: colors.ink }, body: { color: colors.muted, lineHeight: 20 }, footer: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }, footerText: { color: colors.primary, fontSize: 12, fontWeight: '800' } });
