import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { AppUser } from '../types';

// Both registration and the auth listener can run after account creation.
// A transaction makes profile initialization safe whichever finishes first.
export async function ensureUserProfile(user: AppUser, registration = false): Promise<AppUser> {
  if (!db) return user;
  const profileRef = doc(db, 'Users', user.id);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(profileRef);
    if (!snapshot.exists()) {
      transaction.set(profileRef, { userId: user.id, ...user, createdAt: new Date().toISOString() });
      return user;
    }
    const saved = snapshot.data();
    if (registration && saved.fullName !== user.fullName) transaction.update(profileRef, { fullName: user.fullName });
    return { ...user, profileImage: saved.profileImage ?? user.profileImage, fullName: registration ? user.fullName : saved.fullName ?? user.fullName, location: saved.location ?? user.location, verificationStatus: saved.verificationStatus ?? user.verificationStatus, rating: saved.rating ?? user.rating };
  });
}
