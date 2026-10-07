import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { SyncStatus } from '../src/components/SyncStatus';
import { PushNotifications } from '../src/components/PushNotifications';
import { DataProvider } from '../src/context/DataContext';

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><DataProvider><PushNotifications /><SyncStatus /><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} /></DataProvider></AuthProvider></SafeAreaProvider>;
}
