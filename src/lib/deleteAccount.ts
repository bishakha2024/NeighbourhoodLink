import { collection, deleteDoc, doc, getDocs, query, where, writeBatch, type DocumentReference } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from './firebase';

export async function deleteAccountData(password: string) {
  const user = auth?.currentUser;
  if (!user?.email || !db) throw new Error('Please sign in to delete your account.');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  const refs = new Map<string, DocumentReference>();
  const find = async (name: string, field: string, value: string) => {
    const snapshot = await getDocs(query(collection(db!, name), where(field, '==', value)));
    snapshot.docs.forEach(item => refs.set(item.ref.path, item.ref));
    return snapshot.docs;
  };
  // Discover all dependent data before making any destructive changes.
  const listings = await find('Listings', 'userId', user.uid);
  const posts = await find('Community Posts', 'userId', user.uid);
  for (const name of ['Services', 'Listing Likes', 'Listing Comments', 'Post Likes', 'Post Comments', 'Reports']) await find(name, 'userId', user.uid);
  for (const field of ['senderId', 'receiverId']) await find('Messages', field, user.uid);
  for (const field of ['reviewerId', 'reviewedUserId']) await find('Reviews', field, user.uid);
  for (const listing of listings) for (const name of ['Listing Likes', 'Listing Comments']) await find(name, 'listingId', listing.id);
  for (const post of posts) for (const name of ['Post Likes', 'Post Comments']) await find(name, 'postId', post.id);
  const devices = await getDocs(collection(db, 'Users', user.uid, 'Devices'));
  devices.docs.forEach(item => refs.set(item.ref.path, item.ref));
  // Remove reactions before their parent documents, so ownership rules can resolve parents.
  const ordered = [...refs.values()].sort((a, b) => Number(['Listings', 'Community Posts'].includes(a.parent.id)) - Number(['Listings', 'Community Posts'].includes(b.parent.id)));
  try {
    for (let offset = 0; offset < ordered.length; offset += 10) {
      const batch = writeBatch(db);
      ordered.slice(offset, offset + 10).forEach(ref => batch.delete(ref));
      await batch.commit();
    }
    await deleteDoc(doc(db, 'Users', user.uid));
    await deleteUser(user);
  } catch {
    throw new Error('Account deletion could not finish. Some data may already be removed. Please stay signed in and retry deletion.');
  }
}
