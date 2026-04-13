import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows } from '../../utils/theme';

export function CustomCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
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
});
