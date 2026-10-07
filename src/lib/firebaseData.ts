import { isCloudinaryConfigured, uploadCloudinaryImage, type ImageUploadMetadata } from './cloudinary';
import { collection, deleteDoc, doc, getDocs, onSnapshot, or, query, setDoc, where, type QueryConstraint } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from './firebase';
import type { CommunityPost, Listing, Message, PostComment, PostLike, Preferences, Report, Review, Service } from '../types';

export function subscribeCollection<T>(name: string, receive: (items: T[]) => void, onError: (error: Error) => void, ...constraints: QueryConstraint[]) {
  if (!db || !isFirebaseConfigured) return () => {};
  return onSnapshot(query(collection(db, name), ...constraints), (snapshot) => receive(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as T)).sort((a, b) => ((b as { createdAt?: string }).createdAt ?? '').localeCompare((a as { createdAt?: string }).createdAt ?? ''))), onError);
}

export function subscribeMessages(userId: string, receive: (items: Message[]) => void, onError: (error: Error) => void) {
  if (!db || !isFirebaseConfigured) return () => {};
  return onSnapshot(query(collection(db, 'Messages'), or(where('senderId', '==', userId), where('receiverId', '==', userId))), (snapshot) => receive(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Message))), onError);
}

async function save(name: string, value: { id: string }) {
  if (!db || !isFirebaseConfigured) return;
  // Optional message context must be omitted rather than stored as undefined.
  const clean = Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
  await setDoc(doc(db, name, value.id), clean);
}
export const saveListing = (listing: Listing) => save('Listings', listing);
export const saveService = (service: Service) => save('Services', service);
export const savePost = (post: CommunityPost) => save('Community Posts', post);
export const saveMessage = (message: Message) => save('Messages', message);
export const saveReview = (review: Review) => save('Reviews', review);
export const saveReport = (report: Report) => save('Reports', report);
export const savePostComment = (comment: PostComment) => save('Post Comments', comment);

export async function savePostLike(like: PostLike, liked: boolean) {
  if (!db || !isFirebaseConfigured) return;
  if (liked) await save('Post Likes', like);
  else await deleteDoc(doc(db, 'Post Likes', like.id));
}

export async function savePreferences(userId: string, preferences: Preferences) {
  if (!db || !isFirebaseConfigured) return;
  await setDoc(doc(db, 'Users', userId), { preferences }, { merge: true });
}

export async function savePushToken(userId: string, token: string, enabled: boolean) {
  if (!db || !isFirebaseConfigured) return;
  await setDoc(doc(db, 'Users', userId, 'Devices', token), { token, enabled, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function uploadImage(uri: string, folder: string, filename: string, metadata: ImageUploadMetadata = {}) {
  if (uri.startsWith('http')) return uri;
  if (isCloudinaryConfigured) return uploadCloudinaryImage(uri, metadata);
  if (!isFirebaseConfigured) return uri;
  if (!storage) throw new Error('Photo uploads are unavailable. Please use the default listing image.');
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function seedDemoIfEmpty() {
  if (!db || !isFirebaseConfigured) return false;
  return (await getDocs(collection(db, 'Listings'))).empty;
}

export async function deleteListing(id: string) {
  if (!db || !isFirebaseConfigured) return;
  await deleteDoc(doc(db, 'Listings', id));
}

export const saveListingComment = (comment: import('../types').ListingComment) => save('Listing Comments', comment);
export async function saveListingLike(like: import('../types').ListingLike, liked: boolean) {
  if (!db || !isFirebaseConfigured) return;
  if (liked) await save('Listing Likes', like);
  else await deleteDoc(doc(db, 'Listing Likes', like.id));
}

export async function deleteService(id: string) {
  if (!db || !isFirebaseConfigured) return;
  await deleteDoc(doc(db, 'Services', id));
}
