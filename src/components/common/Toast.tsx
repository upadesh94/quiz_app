import React from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastProps = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  style?: ViewStyle;
};

export function Toast({
  message,
  title,
  variant = 'info',
  onDismiss,
  style,
}: ToastProps) {
  const { colors, isDark } = useAppTheme();
  const { fontSize, spacing } = useResponsive();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.successBg,
          text: colors.successText,
          border: colors.success,
          badge: '✓',
        };
      case 'error':
        return {
          bg: colors.errorBg,
          text: colors.errorText,
          border: colors.error,
          badge: '✕',
        };
      case 'warning':
        return {
          bg: colors.warningBg,
          text: colors.warningText,
          border: colors.warning,
          badge: '⚠',
        };
      case 'info':
      default:
        return {
          bg: colors.infoBg,
          text: colors.infoText,
          border: colors.info,
          badge: 'ℹ',
        };
    }
  };

  const toastStyle = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.bg,
          borderColor: toastStyle.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
        shadows.soft,
        style,
      ]}
    >
      <View style={[styles.badgeContainer, { backgroundColor: toastStyle.border }]}>
        <Text style={styles.badgeText}>{toastStyle.badge}</Text>
      </View>

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: toastStyle.text, fontSize: fontSize.base }]}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: toastStyle.text, fontSize: fontSize.sm }]}>
          {message}
        </Text>
      </View>

      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissButton}>
          <Text style={[styles.dismissText, { color: toastStyle.text }]}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  badgeContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontWeight: '500',
  },
  dismissButton: {
    paddingLeft: 12,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
