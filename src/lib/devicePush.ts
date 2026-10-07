import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFirebaseConfigured, isPushEnabled } from './firebase';
import { savePushToken } from './firebaseData';
import { registerPush } from './push';

export async function setDevicePush(userId: string, enabled: boolean) {
  if (!isFirebaseConfigured && enabled) throw new Error('Device delivery requires a configured Firebase project. In-app notifications work in demo mode.');
  if (enabled && !isPushEnabled) throw new Error('Device notifications are unavailable for now. In-app notifications are active.');
  const key = `nl_push_token_${userId}`;
  if (enabled) {
    const token = await registerPush();
    await savePushToken(userId, token, true);
    await AsyncStorage.setItem(key, token);
  } else {
    const token = await AsyncStorage.getItem(key);
    if (token) await savePushToken(userId, token, false);
  }
}

