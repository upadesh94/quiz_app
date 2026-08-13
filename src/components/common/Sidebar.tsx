import React from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

export type SidebarNavItem = {
  key: string;
  label: string;
  icon?: string;
  onPress: () => void;
  isActive?: boolean;
};

export type SidebarProps = {
  items: SidebarNavItem[];
  userRole?: string;
  userName?: string;
  style?: ViewStyle;
};

export function Sidebar({ items, userRole, userName, style }: SidebarProps) {
  const { colors, isDark } = useAppTheme();
  const { fontSize, spacing, isDesktop, isTablet } = useResponsive();

  if (!isDesktop && !isTablet) {
    return null;
  }

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.card,
          borderRightColor: colors.border,
          padding: spacing.md,
          width: isDesktop ? 240 : 80,
        },
        style,
      ]}
    >
      {/* Top Brand Logo */}
      <View style={[styles.brandContainer, { marginBottom: spacing.lg }]}>
        <BrandLogo />
      </View>

      {/* Nav Items */}
      <View style={styles.navList}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.navItem,
              {
                borderRadius: radii.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: isDesktop ? spacing.md : spacing.xs,
                backgroundColor: item.isActive
                  ? colors.primaryLight
                  : pressed
                  ? (isDark ? '#334155' : '#F1F5F9')
                  : 'transparent',
                marginBottom: spacing.xs,
                justifyContent: isDesktop ? 'flex-start' : 'center',
              },
            ]}
          >
            {item.icon && (
              <Text
                style={[
                  styles.navIcon,
                  { color: item.isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {item.icon}
              </Text>
            )}
            {isDesktop && (
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: item.isActive ? colors.primary : colors.textPrimary,
                    fontSize: fontSize.base,
                    fontWeight: item.isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Footer Profile & Theme Toggle */}
      <View style={[styles.footer, { borderTopColor: colors.border, paddingTop: spacing.md }]}>
        {isDesktop && (userName || userRole) && (
          <View style={styles.userInfo}>
            {userName && (
              <Text style={[styles.userName, { color: colors.textPrimary, fontSize: fontSize.sm }]}>
                {userName}
              </Text>
            )}
            {userRole && (
              <Text style={[styles.userRole, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {userRole.toUpperCase()}
              </Text>
            )}
          </View>
        )}
        <View style={styles.themeWrapper}>
          <ThemeToggle />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandContainer: {
    alignItems: 'center',
  },
  navList: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  navIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  navLabel: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    alignItems: 'center',
  },
  userInfo: {
    marginBottom: 8,
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
  },
  userRole: {
    fontWeight: '400',
  },
  themeWrapper: {
    alignItems: 'center',
  },
});
