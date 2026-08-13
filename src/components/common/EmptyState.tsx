import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';
import { CustomButton } from './CustomButton';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function EmptyState({
  title = 'No Items Found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  const { colors, isDark } = useAppTheme();
  const { fontSize, spacing } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
        {icon ? (
          icon
        ) : (
          <Text style={[styles.iconText, { color: colors.textMuted }]}>📋</Text>
        )}
      </View>

      <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.lg }]}>
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
        ]}
      >
        {description}
      </Text>

      {actionLabel && onAction && (
        <View style={[styles.actionWrapper, { marginTop: spacing.lg }]}>
          <CustomButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: '100%',
    marginVertical: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 340,
  },
  actionWrapper: {
    alignItems: 'center',
  },
});

export default EmptyState;
