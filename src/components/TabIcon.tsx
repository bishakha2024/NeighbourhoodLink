import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme/colors';
export function TabIcon({ glyph, focused, dot = false }: { glyph: string; focused: boolean; dot?: boolean }) { return <View><Text style={{ fontSize: 18, color: focused ? colors.primary : colors.muted }}>{glyph}</Text>{dot && <View accessibilityLabel="New activity" style={{ position: 'absolute', right: -5, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />}</View>; }
