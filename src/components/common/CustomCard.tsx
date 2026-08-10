import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows } from '../../utils/theme';

type Props = PropsWithChildren & {
  variant?: 'default' | 'glass';
};

export function CustomCard({ children, variant = 'default' }: Props) {
  return <View style={variant === 'glass' ? styles.glassCard : styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
