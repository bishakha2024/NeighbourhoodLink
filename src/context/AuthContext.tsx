import { deleteAccountData } from '../lib/deleteAccount';
import { ensureUserProfile } from '../lib/userProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDevicePush } from '../lib/devicePush';
import { sendPasswordResetEmail, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AppUser } from '../types';
import { demoUser } from '../lib/mockData';

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  demoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  editProfile: (fullName: string, location: string, profileImage: string) => Promise<void>;
  updateLocation: (location: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    const hydrateDemoUser = async () => {
      const stored = await AsyncStorage.getItem('nl_demo_user');
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    };

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        let nextUser: AppUser = {
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName ?? 'Neighbour',
          email: firebaseUser.email ?? '',
          location: 'Your Neighbourhood',
          verificationStatus: 'pending',
          rating: 0,
        };
        if (db) {
          try {
            nextUser = await ensureUserProfile(nextUser);
          } catch (error) { console.warn('Could not load profile.', error); }
        }
        if (auth?.currentUser?.uid !== firebaseUser.uid) return;
        setUser(nextUser);
        setLoading(false);
      });
    } else {
      hydrateDemoUser();
    }
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return;
    }
    const next = { ...demoUser, email: email.trim() || demoUser.email };
    await AsyncStorage.setItem('nl_demo_user', JSON.stringify(next));
    setUser(next);
  };

  const resetPassword = async (email: string) => {
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Enter a valid email address.');
    if (!isFirebaseConfigured || !auth) throw new Error('Password reset is unavailable in demo mode.');
    try { await sendPasswordResetEmail(auth, address); }
    catch (error: any) {
      if (error.code === 'auth/user-not-found') return;
      if (error.code === 'auth/too-many-requests') throw new Error('Too many requests. Please wait a few minutes and try again.');
      if (error.code === 'auth/network-request-failed') throw new Error('Check your internet connection and try again.');
      throw new Error('Could not send the reset email. Please try again.');
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: fullName.trim() });
      const nextUser: AppUser = { id: credential.user.uid, fullName: fullName.trim(), email: email.trim(), location: 'Your Neighbourhood', verificationStatus: 'pending', rating: 0 };
      try { setUser(await ensureUserProfile(nextUser, true)); }
      catch { throw new Error('Your account was created, but its profile could not be saved. Please sign in with your email and password to retry.'); }
      return;
    }
    const next: AppUser = { ...demoUser, id: 'demo-user-new', fullName: fullName.trim(), email: email.trim() };
    await AsyncStorage.setItem('nl_demo_user', JSON.stringify(next));
    setUser(next);
  };

  const editProfile = async (fullName: string, location: string, profileImage: string) => {
    if (!user) throw new Error('Please sign in first.');
    if (!fullName.trim() || !location.trim()) throw new Error('Enter your name and neighbourhood.');
    const next = { ...user, fullName: fullName.trim(), location: location.trim(), profileImage };
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'Users', user.id), { fullName: next.fullName, location: next.location, profileImage }, { merge: true });
    } else await AsyncStorage.setItem('nl_demo_user', JSON.stringify(next));
    setUser(next);
  };
  const updateLocation = async (location: string) => {
    if (!user || !location.trim()) throw new Error('Enter your neighbourhood or city.');
    const next = { ...user, location: location.trim() };
    if (isFirebaseConfigured && db) await setDoc(doc(db, 'Users', user.id), { userId: user.id, location: next.location }, { merge: true });
    else await AsyncStorage.setItem('nl_demo_user', JSON.stringify(next));
    setUser(next);
  };
  const deleteAccount = async (password: string) => {
    if (!user) throw new Error('Please sign in first.');
    const owner = user.id;
    if (isFirebaseConfigured) await deleteAccountData(password);
    await AsyncStorage.multiRemove(['nl_demo_user', `nl_app_data_v2_${isFirebaseConfigured ? 'firebase' : 'demo'}_${owner}`, `nl_push_token_${owner}`]);
    setUser(null);
  };
  const logout = async () => {
    if (user && isFirebaseConfigured) await setDevicePush(user.id, false);
    if (isFirebaseConfigured && auth) await signOut(auth);
    await AsyncStorage.removeItem('nl_demo_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, demoMode: !isFirebaseConfigured, deleteAccount, resetPassword, login, register, logout, updateLocation, editProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
