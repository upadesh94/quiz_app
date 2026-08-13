import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, Modal, Pressable, ScrollView } from 'react-native';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';
import { CustomButton } from './CustomButton';

export type CustomModalProps = PropsWithChildren & {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionLoading?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export function CustomModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  secondaryActionLabel,
  onSecondaryAction,
}: CustomModalProps) {
  const { colors, isDark } = useAppTheme();
  const { spacing, fontSize, isMobile, screenWidth } = useResponsive();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              width: isMobile ? screenWidth - 32 : Math.min(540, screenWidth - 64),
            },
            shadows.soft,
          ]}
        >
          {/* Header */}
          {(title || subtitle) && (
            <View style={[styles.header, { marginBottom: spacing.md }]}>
              <View style={styles.titleContainer}>
                {title && (
                  <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.xl }]}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4 }]}>
                    {subtitle}
                  </Text>
                )}
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={[styles.closeButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {/* Actions */}
          {(primaryActionLabel || secondaryActionLabel) && (
            <View style={[styles.actionRow, { marginTop: spacing.lg, gap: spacing.sm }]}>
              {secondaryActionLabel && (
                <View style={styles.actionButton}>
                  <CustomButton
                    title={secondaryActionLabel}
                    onPress={onSecondaryAction || onClose}
                    variant="outline"
                    fullWidth
                  />
                </View>
              )}

              {primaryActionLabel && onPrimaryAction && (
                <View style={styles.actionButton}>
                  <CustomButton
                    title={primaryActionLabel}
                    onPress={onPrimaryAction}
                    loading={primaryActionLoading}
                    variant="primary"
                    fullWidth
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    borderWidth: 1,
    maxHeight: '85%',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '400',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    flexGrow: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
  },
});
