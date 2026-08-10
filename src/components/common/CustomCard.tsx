import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme, radii, shadows } from '../../utils/theme';

type Props = PropsWithChildren & {
  variant?: 'default' | 'glass';
};

export function CustomCard({ children, variant = 'default' }: Props) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        variant === 'glass' || (variant === 'default' && isDark) ? styles.glassCard : styles.card,
        variant === 'default' && !isDark && { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...shadows.card,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
