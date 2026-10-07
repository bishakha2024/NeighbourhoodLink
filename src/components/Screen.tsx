import React from 'react';
import { InputAccessoryView, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function Screen({ children, scroll = true, contentStyle }: { children: React.ReactNode; scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  return <SafeAreaView edges={['top']} style={styles.safe}>
    {scroll ? <ScrollView
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >{children}</ScrollView> : <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.content, contentStyle]} onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}>{children}</View>
    </KeyboardAvoidingView>}
    {Platform.OS === 'ios' && <InputAccessoryView nativeID="screen-keyboard-toolbar">
      <View style={styles.toolbar}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss keyboard" onPress={Keyboard.dismiss} hitSlop={10}><Text style={styles.done}>Done</Text></Pressable></View>
    </InputAccessoryView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  toolbar: { backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.line, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  done: { color: colors.primary, fontWeight: '800', fontSize: 16 },
});
