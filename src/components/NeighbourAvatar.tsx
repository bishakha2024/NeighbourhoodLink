import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { colors } from '../theme/colors';

export function NeighbourAvatar({ userId, name }: { userId: string; name: string }) {
  const [photo, setPhoto] = useState('');
  useEffect(() => {
    setPhoto('');
    if (!db) return;
    return onSnapshot(doc(db, 'Users', userId), snapshot => setPhoto(snapshot.exists() ? snapshot.data().profileImage || '' : ''), () => setPhoto(''));
  }, [userId]);
  return <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {photo ? <Image accessibilityLabel={`${name}'s profile photo`} source={{ uri: photo }} onError={() => setPhoto('')} style={{ width: 48, height: 48 }} /> : <Text style={{ color: colors.primaryDark, fontSize: 18, fontWeight: '900' }}>{name.charAt(0).toUpperCase()}</Text>}
  </View>;
}
