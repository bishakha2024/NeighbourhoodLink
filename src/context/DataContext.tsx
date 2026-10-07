import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CommunityPost, Listing, ListingLike, ListingComment, Message, PostComment, PostLike, Preferences, Report, Review, Service } from '../types';
import * as mock from '../lib/mockData';
import { db, isFirebaseConfigured } from '../lib/firebase';
import * as remote from '../lib/firebaseData';
import { buildNotifications } from '../lib/notifications';
import { useAuth } from './AuthContext';

const defaults: Preferences = { pushEnabled: false, communityUpdates: true, useLocation: true };
const upsert = <T extends { id: string }>(items: T[], item: T) => [item, ...items.filter((current) => current.id !== item.id)];
const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const initial = () => ({
  listings: isFirebaseConfigured ? [] as Listing[] : mock.listings,
  posts: isFirebaseConfigured ? [] as CommunityPost[] : mock.posts,
  services: isFirebaseConfigured ? [] as Service[] : mock.services,
  messages: isFirebaseConfigured ? [] as Message[] : mock.messages,
  reviews: isFirebaseConfigured ? [] as Review[] : mock.reviews,
  postLikes: [] as PostLike[], postComments: [] as PostComment[], reports: [] as Report[],
  listingLikes: [] as ListingLike[], listingComments: [] as ListingComment[], seenListingIds: [] as string[],
  readIds: [] as string[], preferences: defaults,
});

function useAppData() {
  const { user } = useAuth();
  const [data, setData] = useState(initial);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const [dataError, setDataError] = useState('');
  const [retry, setRetry] = useState(0);
  const activeUser = useRef(user?.id);
  activeUser.current = user?.id;
  const storageKey = `nl_app_data_v2_${isFirebaseConfigured ? 'firebase' : 'demo'}_${user?.id ?? 'guest'}`;
  const persistence = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    setHydratedFor(null);
    setSyncedFor(null);
    setData(initial());
    setDataError('');
    const load = async () => {
      let raw = await AsyncStorage.getItem(storageKey);
      // Import existing demo content without mixing authenticated Firebase accounts.
      if (!raw && !isFirebaseConfigured && user?.id === 'demo-user') raw = await AsyncStorage.getItem('nl_app_data_v1');
      if (cancelled) return;
      if (raw) {
        const saved = JSON.parse(raw);
        const base = initial();
        setData({ ...base, ...(!isFirebaseConfigured ? saved : {}), preferences: { ...defaults, ...saved.preferences }, seenListingIds: saved.seenListingIds ?? [], readIds: saved.readIds ?? (saved.notifications ?? []).filter((item: { read: boolean }) => item.read).map((item: { id: string }) => item.id) });
      }
      if (isFirebaseConfigured && user && db) {
        const profile = await getDoc(doc(db, 'Users', user.id));
        if (cancelled) return;
        if (profile.exists() && profile.data().preferences) setData((current) => ({ ...current, preferences: { ...defaults, ...profile.data().preferences } }));
      }
      setHydratedFor(storageKey);
    };
    load().catch((error) => { if (!cancelled) { setDataError(`Could not load saved data: ${error.message}`); setHydratedFor(storageKey); } });
    return () => { cancelled = true; };
  }, [storageKey, user?.id, retry]);

  useEffect(() => {
    if (hydratedFor !== storageKey) return;
    const saved = isFirebaseConfigured ? { preferences: data.preferences, readIds: data.readIds, seenListingIds: data.seenListingIds } : data;
    persistence.current = persistence.current.catch(() => {}).then(() => AsyncStorage.setItem(storageKey, JSON.stringify(saved))).catch((error) => setDataError(`Could not save data: ${error.message}`));
  }, [data, hydratedFor, storageKey]);

  useEffect(() => {
    if (!isFirebaseConfigured || !user || hydratedFor !== storageKey) return;
    setDataError('');
    let cancelled = false;
    const received = new Set<string>();
    const finish = (name: string) => {
      if (cancelled) return;
      received.add(name);
      if (received.size === 9) setSyncedFor(storageKey);
    };
    const failure = (name: string, error: Error) => {
      if (cancelled) return;
      setDataError(`Could not sync data: ${error.message}`);
      finish(name);
    };
    const subscribe = <T,>(name: string, key: keyof typeof data) => remote.subscribeCollection<T>(name, (items) => {
      if (cancelled) return;
      setData((current) => ({ ...current, [key]: items }));
      finish(name);
    }, (error) => failure(name, error));
    const unsubscribe = [
      subscribe<Listing>('Listings', 'listings'), subscribe<ListingLike>('Listing Likes', 'listingLikes'), subscribe<ListingComment>('Listing Comments', 'listingComments'), subscribe<CommunityPost>('Community Posts', 'posts'),
      subscribe<Service>('Services', 'services'), subscribe<Review>('Reviews', 'reviews'),
      subscribe<PostLike>('Post Likes', 'postLikes'), subscribe<PostComment>('Post Comments', 'postComments'),
      remote.subscribeMessages(user.id, (messages) => {
        if (cancelled) return;
        setData((current) => ({ ...current, messages }));
        finish('Messages');
      }, (error) => failure('Messages', error)),
    ];
    return () => { cancelled = true; unsubscribe.forEach((stop) => stop()); };
  }, [user?.id, hydratedFor, storageKey, retry]);

  const requireUser = () => {
    if (!user) throw new Error('Please sign in first.');
    if (hydratedFor !== storageKey) throw new Error('Your data is still loading. Please try again.');
    return user;
  };
  const commit = async (operation: () => Promise<void>, change: (current: typeof data) => typeof data) => {
    const owner = requireUser().id;
    await operation();
    if (activeUser.current === owner) setData(change);
  };
  const addListing = async (listing: Listing) => {
    if (listing.userId !== requireUser().id) throw new Error('Invalid listing owner.');
    await commit(() => remote.saveListing(listing), (current) => ({ ...current, listings: upsert(current.listings, listing) }));
  };
  const updateListing = async (listing: Listing) => {
    if (listing.userId !== requireUser().id || !data.listings.some((item) => item.id === listing.id && item.userId === user?.id)) throw new Error('Only the owner can manage this listing.');
    await commit(() => remote.saveListing(listing), (current) => ({ ...current, listings: upsert(current.listings, listing) }));
  };
  const deleteListing = async (id: string) => {
    if (!data.listings.some(item => item.id === id && item.userId === requireUser().id)) throw new Error('Only the owner can delete this listing.');
    await commit(() => remote.deleteListing(id), current => ({ ...current, listings: current.listings.filter(item => item.id !== id) }));
  };
  const addService = async (service: Service) => {
    if (service.userId !== requireUser().id) throw new Error('Invalid service owner.');
    await commit(() => remote.saveService(service), (current) => ({ ...current, services: upsert(current.services, service) }));
  };
  const updateService = async (service: Service) => {
    if (service.userId !== requireUser().id || !data.services.some(item => item.id === service.id && item.userId === user?.id)) throw new Error('Only the provider can manage this service.');
    await commit(() => remote.saveService(service), current => ({ ...current, services: upsert(current.services, service) }));
  };
  const deleteService = async (id: string) => {
    const owner = requireUser().id;
    if (!data.services.some(item => item.id === id && item.userId === owner)) throw new Error('Only the provider can delete this service.');
    await commit(() => remote.deleteService(id), current => ({ ...current, services: current.services.filter(item => item.id !== id) }));
  };
  const addPost = async (post: CommunityPost) => {
    if (post.userId !== requireUser().id) throw new Error('Invalid post owner.');
    await commit(() => remote.savePost(post), (current) => ({ ...current, posts: upsert(current.posts, post) }));
  };
  const addMessage = async (message: Message) => {
    const sender = requireUser();
    if (message.senderId !== sender.id || !message.receiverId || message.receiverId === sender.id || !message.text.trim()) throw new Error('Choose another neighbour and enter a message.');
    await commit(() => remote.saveMessage(message), (current) => ({ ...current, messages: upsert(current.messages, message) }));
  };
  const togglePostLike = async (postId: string) => {
    const author = requireUser();
    if (!data.posts.some((post) => post.id === postId)) throw new Error('Post not found.');
    const like: PostLike = { id: `${postId}_${author.id}`, postId, userId: author.id, createdAt: new Date().toISOString() };
    const liked = !data.postLikes.some((item) => item.id === like.id);
    await commit(() => remote.savePostLike(like, liked), (current) => ({ ...current, postLikes: liked ? upsert(current.postLikes, like) : current.postLikes.filter((item) => item.id !== like.id) }));
  };
  const addPostComment = async (postId: string, content: string) => {
    const author = requireUser();
    if (!content.trim()) return;
    if (!data.posts.some((post) => post.id === postId)) throw new Error('Post not found.');
    const comment: PostComment = { id: newId('comment'), postId, userId: author.id, userName: author.fullName, content: content.trim(), createdAt: new Date().toISOString() };
    await commit(() => remote.savePostComment(comment), (current) => ({ ...current, postComments: upsert(current.postComments, comment) }));
  };
  const toggleListingLike = async (listingId: string) => {
    const author = requireUser();
    if (!data.listings.some(item => item.id === listingId)) throw new Error('Listing not found.');
    const like: ListingLike = { id: `${listingId}_${author.id}`, listingId, userId: author.id, createdAt: new Date().toISOString() };
    const liked = !data.listingLikes.some(item => item.id === like.id);
    await commit(() => remote.saveListingLike(like, liked), current => ({ ...current, listingLikes: liked ? upsert(current.listingLikes, like) : current.listingLikes.filter(item => item.id !== like.id) }));
  };
  const addListingComment = async (listingId: string, content: string) => {
    const author = requireUser();
    if (!content.trim()) return;
    if (!data.listings.some(item => item.id === listingId)) throw new Error('Listing not found.');
    const comment: ListingComment = { id: newId('listing-comment'), listingId, userId: author.id, userName: author.fullName, content: content.trim(), createdAt: new Date().toISOString() };
    await commit(() => remote.saveListingComment(comment), current => ({ ...current, listingComments: upsert(current.listingComments, comment) }));
  };
  const markMarketplaceSeen = () => setData(current => ({ ...current, seenListingIds: [...new Set([...current.seenListingIds, ...current.listings.map(item => item.id)])] }));
  const markConversationRead = (otherId: string) => setData(current => ({ ...current, readIds: [...new Set([...current.readIds, ...current.messages.filter(item => item.senderId === otherId && item.receiverId === user?.id).map(item => `message-${item.id}`)])] }));
  const addReview = async (reviewedUserId: string, rating: number, comment: string) => {
    const author = requireUser();
    if (!reviewedUserId || reviewedUserId === author.id) throw new Error('Choose another neighbour to review.');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment.trim()) throw new Error('Choose 1–5 stars and write a review.');
    const review: Review = { id: `${author.id}_${reviewedUserId}`, reviewerId: author.id, reviewerName: author.fullName, reviewedUserId, rating, comment: comment.trim(), createdAt: new Date().toISOString() };
    await commit(() => remote.saveReview(review), (current) => ({ ...current, reviews: upsert(current.reviews, review) }));
  };
  const addReport = async (reason: string, details: string, listingId?: string) => {
    const author = requireUser();
    if (!reason || !details.trim()) throw new Error('Choose a reason and describe the problem.');
    const report: Report = { id: newId('report'), userId: author.id, reason, details: details.trim(), ...(listingId ? { listingId } : {}), createdAt: new Date().toISOString(), status: 'pending' };
    await commit(() => remote.saveReport(report), (current) => ({ ...current, reports: upsert(current.reports, report) }));
  };
  const updatePreferences = async (preferences: Preferences) => {
    const owner = requireUser().id;
    await commit(() => remote.savePreferences(owner, preferences), (current) => ({ ...current, preferences }));
  };
  const markNotificationRead = (id: string) => setData((current) => ({ ...current, readIds: [...new Set([...current.readIds, id])] }));
  const notifications = useMemo(() => user ? buildNotifications(user.id, data, data.readIds, data.preferences) : [], [data, user?.id]);
  return { ...data, notifications, loading: hydratedFor !== storageKey || (isFirebaseConfigured && !!user && syncedFor !== storageKey), dataError, retrySync: () => setRetry((current) => current + 1), markMarketplaceSeen, markConversationRead, toggleListingLike, addListingComment, addListing, updateListing, deleteListing, addService, updateService, deleteService, addPost, addMessage, togglePostLike, addPostComment, addReview, addReport, updatePreferences, markNotificationRead };
}

const DataContext = createContext<ReturnType<typeof useAppData> | undefined>(undefined);
export function DataProvider({ children }: { children: React.ReactNode }) {
  const data = useAppData();
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
