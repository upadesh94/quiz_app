import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, shadows } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherDashboard'>;

export function TeacherDashboard({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.page, { backgroundColor: isDark ? '#160629' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: '#bbf7d0', fontSize: fontSize.sm, fontWeight: '700' }}>TEACHER CONSOLE</Text>
            <Text style={{ color: '#ffffff', fontSize: fontSize['2xl'], fontWeight: '800', marginTop: spacing.xs }}>
              Build smarter classrooms
            </Text>
            <Text style={{ color: '#dcfce7', fontSize: fontSize.sm, marginTop: spacing.sm }}>
              Create assessments, review requests, and monitor class performance.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : colors.border }]}>
              <Text style={[styles.statLabel, isDark && { color: '#a78bfa' }]}>Focus</Text>
              <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>Class Quality</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : colors.border }]}>
              <Text style={[styles.statLabel, isDark && { color: '#a78bfa' }]}>Workflow</Text>
              <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>Review Daily</Text>
            </View>
          </View>

          <Text style={{ marginTop: spacing.xl, marginBottom: spacing.md, fontSize: fontSize.lg, fontWeight: '700', color: isDark ? '#FFFFFF' : '#0f172a' }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.md }}>
            <Pressable style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : colors.border }]} onPress={() => navigation.navigate('CreateQuiz')}>
              <Text style={styles.actionEmoji}>🧠</Text>
              <Text style={[styles.actionTitle, isDark && { color: '#FFFFFF' }]}>Create Quiz</Text>
              <Text style={[styles.actionSub, isDark && { color: '#cbd5e1' }]}>Publish a new test for class 8, 9, or 10.</Text>
            </Pressable>
            <Pressable style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : colors.border }]} onPress={() => navigation.navigate('ManageStudents')}>
              <Text style={styles.actionEmoji}>👥</Text>
              <Text style={[styles.actionTitle, isDark && { color: '#FFFFFF' }]}>Manage Students</Text>
              <Text style={[styles.actionSub, isDark && { color: '#cbd5e1' }]}>Approve requests and edit student details.</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.actionCard, { marginTop: spacing.md, backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : colors.border }]} onPress={() => navigation.navigate('ClassAnalytics')}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={[styles.actionTitle, isDark && { color: '#FFFFFF' }]}>Class Analytics</Text>
            <Text style={[styles.actionSub, isDark && { color: '#cbd5e1' }]}>Track pass rates, averages and subject trends.</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingVertical: 32,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: 18,
    ...shadows.card,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    ...shadows.soft,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 16,
    ...shadows.card,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionSub: {
    fontSize: 13,
    lineHeight: 18,
  },
});
