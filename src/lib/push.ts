// Web has no native push module. Expo resolves push.native.ts on Android/iOS.
export async function registerPush(): Promise<string> {
  throw new Error('Device push notifications are available in the Android and iOS development builds.');
}
export function listenToPush(_open: (data: Record<string, unknown>) => void) { return () => {}; }
