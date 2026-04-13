import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export function CustomButton({ title, onPress, variant = 'primary', disabled = false, loading = false }: CustomButtonProps) {
  const { fontSize, spacing } = useResponsive();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          width: '100%',
          paddingVertical: spacing.md,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
          flexDirection: 'row',
          gap: spacing.sm,
        },
        variant === 'primary'
          ? { backgroundColor: colors.primary, borderWidth: 1, borderColor: '#1D4ED8' }
          : { backgroundColor: colors.card, borderWidth: 1, borderColor: '#BFDBFE' },
        variant === 'primary' ? shadows.soft : null,
        pressed && !isDisabled ? { opacity: 0.92, transform: [{ scale: 0.98 }] } : null,
        isDisabled ? { opacity: 0.6 } : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : null}
      <Text
        style={{
          color: variant === 'primary' ? '#FFFFFF' : '#1E3A8A',
          fontWeight: '700',
          fontSize: fontSize.lg,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
