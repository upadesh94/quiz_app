import React from 'react';
import { ActivityIndicator, Pressable, Text, TextStyle, ViewStyle, StyleSheet } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, shadows, touchTargets } from '../../utils/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: CustomButtonProps) {
  const { fontSize, spacing, buttonHeight } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: isDark ? colors.surface : colors.primaryLight,
          border: colors.border,
          text: colors.primary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.textPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.textPrimary,
        };
      case 'danger':
        return {
          bg: colors.error,
          border: colors.error,
          text: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: '#FFFFFF',
        };
    }
  };

  const variantColors = getVariantStyles();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: Math.max(36, touchTargets.minHeight - 8),
          paddingHorizontal: spacing.sm,
          textSize: fontSize.sm,
        };
      case 'lg':
        return {
          height: Math.max(52, buttonHeight + 4),
          paddingHorizontal: spacing.lg,
          textSize: fontSize.lg,
        };
      case 'md':
      default:
        return {
          height: Math.max(buttonHeight, touchTargets.minHeight),
          paddingHorizontal: spacing.md,
          textSize: fontSize.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          width: fullWidth ? '100%' : 'auto',
          minHeight: touchTargets.minHeight,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
          borderRadius: radii.md,
          marginBottom: spacing.xs,
        },
        variant === 'primary' ? shadows.soft : shadows.none,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantColors.text} style={{ marginRight: spacing.xs }} />
      ) : icon ? (
        icon
      ) : null}
      <Text
        style={[
          styles.text,
          {
            color: variantColors.text,
            fontSize: sizeStyles.textSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
