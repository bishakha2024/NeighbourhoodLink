import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

const app = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

let auth: Auth | null = null;
if (app) {
  try {
    auth =
      Platform.OS === 'web'
        ? getAuth(app)
        : initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
  } catch {
    auth = getAuth(app);
  }
}

export { auth };
export const db = app ? getFirestore(app) : null;
// Enable these after provisioning Storage and deploying the push handlers.
export const isStorageEnabled = isFirebaseConfigured && process.env.EXPO_PUBLIC_ENABLE_STORAGE === 'true';
export const isPushEnabled = isFirebaseConfigured && process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true';
export const storage = app && isStorageEnabled ? getStorage(app) : null;
