import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { useAppTheme, shadows } from '../../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ThemeToggle() {
  const dispatch = useDispatch();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => dispatch(toggleTheme())}
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : colors.border },
        { top: Math.max(insets.top + 12, 24) }
      ]}
    >
      <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.card,
    zIndex: 9999,
  },
});
