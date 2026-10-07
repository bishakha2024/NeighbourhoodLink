import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const supported = Constants.executionEnvironment !== 'storeClient';
if (supported) Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });

export async function registerPush() {
  if (!supported) throw new Error('Device notifications require a development build. They are not available in Expo Go.');
  if (!Device.isDevice) throw new Error('Enable device notifications on a physical device.');
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Device notifications need an Expo project ID. Add it to the app configuration first.');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'NeighbourhoodLink', importance: Notifications.AndroidImportance.HIGH });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Notification permission was not granted. You can enable it in device settings.');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export function listenToPush(open: (data: Record<string, unknown>) => void) {
  if (!supported) return () => {};
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => open(response.notification.request.content.data ?? {}));
  const last = Notifications.getLastNotificationResponse();
  if (last) { open(last.notification.request.content.data ?? {}); Notifications.clearLastNotificationResponse(); }
  return () => subscription.remove();
}
