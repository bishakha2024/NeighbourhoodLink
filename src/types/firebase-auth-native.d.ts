import 'firebase/auth';
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

// Firebase 12 exports this at runtime for React Native, but its shared
// public declaration omits the native-only export.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
