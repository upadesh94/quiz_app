import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';

export type LoadingStateProps = {
  message?: string;
  type?: 'spinner' | 'fullscreen' | 'skeleton';
  count?: number;
  style?: ViewStyle;
};

export function LoadingState({
  message = 'Loading...',
  type = 'spinner',
  count = 3,
  style,
}: LoadingStateProps) {
  const { colors, isDark } = useAppTheme();
  const { fontSize, spacing } = useResponsive();

  if (type === 'fullscreen') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary, fontSize: fontSize.base, marginTop: spacing.md }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  if (type === 'skeleton') {
    return (
      <View style={[styles.skeletonContainer, style]}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.skeletonCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: radii.md,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View style={[styles.skeletonLine, { width: '40%', height: 16, backgroundColor: isDark ? '#334155' : '#CBD5E1', marginBottom: 12 }]} />
            <View style={[styles.skeletonLine, { width: '85%', height: 12, backgroundColor: isDark ? '#334155' : '#CBD5E1', marginBottom: 8 }]} />
            <View style={[styles.skeletonLine, { width: '60%', height: 12, backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.inlineSpinner, { padding: spacing.lg }, style]}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  inlineSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  message: {
    fontWeight: '500',
    textAlign: 'center',
  },
  skeletonContainer: {
    width: '100%',
  },
  skeletonCard: {
    width: '100%',
  },
  skeletonLine: {
    borderRadius: 4,
  },
});
