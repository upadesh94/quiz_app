import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle, Pressable, Text } from 'react-native';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';

export type CustomCardProps = PropsWithChildren & {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  onPress?: () => void;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
};

export function CustomCard({
  children,
  variant = 'default',
  onPress,
  style,
  title,
  subtitle,
  headerRight,
  footer,
}: CustomCardProps) {
  const { colors, isDark } = useAppTheme();
  const { spacing, fontSize } = useResponsive();

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.none,
        };
      case 'glass':
      case 'elevated':
        return {
          backgroundColor: isDark ? colors.surface : colors.card,
          borderWidth: 1,
          borderColor: isDark ? colors.border : colors.border,
          ...shadows.soft,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.card,
        };
    }
  };

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.card,
        getCardStyle(),
        {
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {(title || subtitle || headerRight) && (
        <View style={[styles.header, { marginBottom: children ? spacing.sm : 0 }]}>
          <View style={styles.titleContainer}>
            {title && (
              <Text
                style={[
                  styles.title,
                  { color: colors.textPrimary, fontSize: fontSize.lg },
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}

      {children}

      {footer && (
        <View style={[styles.footer, { borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
          {footer}
        </View>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '400',
  },
  footer: {
    borderTopWidth: 1,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
});
