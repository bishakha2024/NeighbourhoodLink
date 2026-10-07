import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TextInput, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useData } from '../../src/context/DataContext';
import { colors, shadow } from '../../src/theme/colors';

export default function CommunityPostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loading, posts, postLikes, postComments, togglePostLike, addPostComment } = useData();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const likes = postLikes.filter((like) => like.postId === id);
  const liked = likes.some((like) => like.userId === user?.id);
  const comments = postComments.filter((item) => item.postId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const like = async () => {
    if (liking) return;
    setLiking(true);
    try { await togglePostLike(id); }
    catch (error: any) { Alert.alert('Could not update like', error.message); }
    finally { setLiking(false); }
  };
  const submitComment = async () => {
    if (commenting || !comment.trim()) return;
    setCommenting(true);
    try { await addPostComment(id, comment); setComment(''); }
    catch (error: any) { Alert.alert('Could not add comment', error.message); }
    finally { setCommenting(false); }
  };
  const post = posts.find((item) => item.id === id);

  if (loading) return <Screen><AppHeader title="Community post" back /><Text style={styles.meta}>Loading post…</Text></Screen>;
  if (!post) {
    return <Screen>
      <AppHeader title="Community post" back />
      <Text style={styles.title}>Post not found</Text>
      <Text style={styles.meta}>This community post is no longer available.</Text>
      <Pressable onPress={() => router.replace('/(tabs)/community')} style={styles.button}>
        <Text style={styles.buttonText}>Open community feed</Text>
      </Pressable>
    </Screen>;
  }

  const postedAt = new Date(post.createdAt);
  const dateLabel = Number.isNaN(postedAt.getTime()) ? 'Recently posted' : postedAt.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return <Screen>
    <AppHeader title="Community post" back />
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{post.userName.charAt(0)}</Text></View>
        <View style={styles.author}>
          <Text style={styles.name}>{post.userName}</Text>
          <Text style={styles.meta}>{post.location}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.content}</Text>
      {post.images.map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.image} resizeMode="contain" accessibilityLabel={`Photo ${index + 1} for ${post.title}`} />)}
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ selected: liked, disabled: liking }} disabled={liking} onPress={like} style={[styles.like, liked && styles.liked]}>
      <Text style={styles.likeText}>{liked ? '♥ Liked' : '♡ Like'} · {likes.length}</Text>
    </Pressable>
    <View style={styles.card}>
      <Text style={styles.name}>Comments ({comments.length})</Text>
      {!comments.length && <Text style={styles.meta}>Be the first to comment.</Text>}
      {comments.map((item) => <View key={item.id} style={styles.comment}>
        <Text style={styles.name}>{item.userName}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.body}>{item.content}</Text>
      </View>)}
      <TextInput inputAccessoryViewID="screen-keyboard-toolbar" accessibilityLabel="Write a comment" value={comment} onChangeText={setComment} editable={!commenting} placeholder="Write a comment…" multiline style={styles.input} />
      <Pressable accessibilityRole="button" disabled={commenting || !comment.trim()} onPress={submitComment} style={[styles.button, (commenting || !comment.trim()) && { opacity: 0.5 }]}>
        <Text style={styles.buttonText}>{commenting ? 'Posting…' : 'Post comment'}</Text>
      </Pressable>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 13, minHeight: 90, color: colors.ink, textAlignVertical: 'top' },
  comment: { gap: 5, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 14 },
  like: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  liked: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  likeText: { color: colors.primaryDark, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 18, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontWeight: '900', fontSize: 18 },
  author: { flex: 1, gap: 3 },
  name: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 13 },
  date: { color: colors.muted, fontSize: 12 },
  title: { color: colors.ink, fontSize: 25, lineHeight: 32, fontWeight: '900' },
  body: { color: colors.ink, fontSize: 16, lineHeight: 25 },
  image: { width: '100%', height: 260, borderRadius: 14, backgroundColor: colors.background },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '900' },
});
