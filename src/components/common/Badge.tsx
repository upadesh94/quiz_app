import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  pill = true,
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const { colors, isDark } = useAppTheme();
  const { fontSize } = useResponsive();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.successBg,
          text: colors.successText,
          border: isDark ? 'transparent' : colors.successBg,
        };
      case 'warning':
        return {
          bg: colors.warningBg,
          text: colors.warningText,
          border: isDark ? 'transparent' : colors.warningBg,
        };
      case 'error':
        return {
          bg: colors.errorBg,
          text: colors.errorText,
          border: isDark ? 'transparent' : colors.errorBg,
        };
      case 'info':
        return {
          bg: colors.infoBg,
          text: colors.infoText,
          border: isDark ? 'transparent' : colors.infoBg,
        };
      case 'primary':
        return {
          bg: colors.primaryLight,
          text: colors.primary,
          border: isDark ? 'transparent' : colors.primaryLight,
        };
      case 'neutral':
      default:
        return {
          bg: isDark ? '#334155' : '#E2E8F0',
          text: colors.textSecondary,
          border: 'transparent',
        };
    }
  };

  const badgeColors = getVariantStyles();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          borderRadius: pill ? radii.pill : radii.xs,
          paddingHorizontal: isSm ? 8 : 10,
          paddingVertical: isSm ? 2 : 4,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: badgeColors.text,
            fontSize: isSm ? fontSize.xs : fontSize.sm,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
