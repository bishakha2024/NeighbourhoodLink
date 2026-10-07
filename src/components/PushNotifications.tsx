import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPushEnabled } from '../lib/firebase';
import { savePushToken } from '../lib/firebaseData';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { notificationRoute } from '../lib/notificationRoute';
import { listenToPush } from '../lib/push';


export function PushNotifications() {
  const { user } = useAuth();
  const { loading, preferences, markNotificationRead } = useData();
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;
    AsyncStorage.getItem(`nl_push_token_${user.id}`).then(async (token) => {
      if (token && !cancelled) await savePushToken(user.id, token, preferences.pushEnabled && isPushEnabled);
    }).catch((error) => console.warn('Could not sync device notification preference.', error));
    return () => { cancelled = true; };
  }, [user?.id, loading, preferences.pushEnabled]);
  useEffect(() => listenToPush(setPending), []);
  useEffect(() => {
    if (!pending || !user || loading) return;
    const intendedUser = pending.userId;
    if (intendedUser === undefined || intendedUser === user.id) {
      if (typeof pending.notificationId === 'string') markNotificationRead(pending.notificationId);
      router.push(notificationRoute(pending.target));
    }
    setPending(null);
  }, [pending, user?.id, loading]);
  return null;
}
