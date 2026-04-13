import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherDashboard'>;

export function TeacherDashboard({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          <View style={styles.heroCard}>
            <Text style={{ color: '#bbf7d0', fontSize: fontSize.sm, fontWeight: '700' }}>TEACHER CONSOLE</Text>
            <Text style={{ color: '#ffffff', fontSize: fontSize['2xl'], fontWeight: '800', marginTop: spacing.xs }}>
              Build smarter classrooms
            </Text>
            <Text style={{ color: '#dcfce7', fontSize: fontSize.sm, marginTop: spacing.sm }}>
              Create assessments, review requests, and monitor class performance.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Focus</Text>
              <Text style={styles.statValue}>Class Quality</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Workflow</Text>
              <Text style={styles.statValue}>Review Daily</Text>
            </View>
          </View>

          <Text style={{ marginTop: spacing.xl, marginBottom: spacing.md, fontSize: fontSize.lg, fontWeight: '700', color: '#0f172a' }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.md }}>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('CreateQuiz')}>
              <Text style={styles.actionEmoji}>🧠</Text>
              <Text style={styles.actionTitle}>Create Quiz</Text>
              <Text style={styles.actionSub}>Publish a new test for class 8, 9, or 10.</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('ManageStudents')}>
              <Text style={styles.actionEmoji}>👥</Text>
              <Text style={styles.actionTitle}>Manage Students</Text>
              <Text style={styles.actionSub}>Approve requests and edit student details.</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.actionCard, { marginTop: spacing.md }]} onPress={() => navigation.navigate('ClassAnalytics')}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionTitle}>Class Analytics</Text>
            <Text style={styles.actionSub}>Track pass rates, averages and subject trends.</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingVertical: 32,
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radii.lg,
    padding: 18,
    ...shadows.card,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    ...shadows.soft,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
