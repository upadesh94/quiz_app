import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';
import { CustomButton } from './CustomButton';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
};

export function ErrorState({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while loading data. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  style,
}: ErrorStateProps) {
  const { colors } = useAppTheme();
  const { fontSize, spacing } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.errorBg,
          borderColor: colors.error,
          borderRadius: radii.md,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.errorBadge, { backgroundColor: colors.error }]}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={[styles.title, { color: colors.errorText, fontSize: fontSize.base }]}>
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.message,
          { color: colors.errorText, fontSize: fontSize.sm, marginTop: spacing.xs },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <View style={[styles.retryWrapper, { marginTop: spacing.md }]}>
          <CustomButton
            title={retryLabel}
            onPress={onRetry}
            variant="danger"
            size="sm"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    width: '100%',
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  errorIconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontWeight: '700',
  },
  message: {
    fontWeight: '400',
    lineHeight: 20,
  },
  retryWrapper: {
    alignSelf: 'flex-start',
  },
});
