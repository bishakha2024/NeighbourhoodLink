import { useData } from '../../src/context/DataContext';
import { useAuth } from '../../src/context/AuthContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { TabIcon } from '../../src/components/TabIcon';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  const { notifications, listings, seenListingIds } = useData();
  const { user } = useAuth();
  const newMessages = notifications.some(item => !item.read && item.target?.page === 'message');
  const newListings = listings.some(item => item.userId !== user?.id && !seenListingIds.includes(item.id));
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 68, paddingBottom: 8, paddingTop: 8, borderTopColor: colors.line, backgroundColor: colors.white }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon glyph="⌂" focused={focused} /> }} />
    <Tabs.Screen name="marketplace" options={{ title: 'Market', tabBarIcon: ({ focused }) => <TabIcon glyph="◫" focused={focused} dot={newListings} /> }} />
    <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ focused }) => <TabIcon glyph="◉" focused={focused} /> }} />
    <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ focused }) => <TabIcon glyph="✉" focused={focused} dot={newMessages} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon glyph="●" focused={focused} /> }} />
  </Tabs>;
}
