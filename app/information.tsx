import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppHeader } from '../src/components/AppHeader';
import { Screen } from '../src/components/Screen';
import { colors } from '../src/theme/colors';

export default function Information() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  const privacy = page === 'privacy';
  return <Screen><AppHeader title={privacy ? 'Privacy information' : 'About'} back />
    <Text style={styles.title}>{privacy ? 'Your data in NeighbourhoodLink' : 'NeighbourhoodLink'}</Text>
    {privacy ? <>
      <Text style={styles.body}>In demo mode, account details and app activity are saved on this device. When Firebase is configured, account information, listings, services, community posts, reactions, reviews, reports, and messages are stored in Firebase.</Text>
      <Text style={styles.body}>Signed-in members can see marketplace and community content and reviews. Messages are restricted to their participants. Reports are restricted to the reporter; moderation access must be configured separately.</Text>
      <Text style={styles.body}>Your neighbourhood is entered manually. This app does not track GPS location. If you enable device notifications, a push token is stored for delivering alerts through Expo, Apple, or Google.</Text>
    </> : <Text style={styles.body}>A place to buy, borrow, give away, offer services, and connect with neighbours. Share community updates, message providers, and leave reviews about your experiences.</Text>}
  </Screen>;
}
const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 22, fontWeight: '900' }, body: { color: colors.ink, fontSize: 15, lineHeight: 23 } });
