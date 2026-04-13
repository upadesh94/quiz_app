import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { StudentPerformanceAnalytics } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentDashboard'>;

export function StudentDashboard({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<StudentPerformanceAnalytics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStudentStats = async () => {
      if (!user?.id) {
        setAnalytics(null);
        setIsLoadingStats(false);
        return;
      }

      try {
        const response = await PerformanceService.getStudentPerformance(user.id);
        setAnalytics(response);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStudentStats();
  }, [user?.id]);

  const improvement = analytics?.improvementDelta ?? 0;
  const improvementLabel = improvement >= 0 ? `+${improvement}%` : `${improvement}%`;

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          <View style={styles.heroCard}>
            <Text style={{ color: '#dbeafe', fontSize: fontSize.sm, fontWeight: '700' }}>STUDENT HUB</Text>
            <Text style={{ color: '#ffffff', fontSize: fontSize['2xl'], fontWeight: '800', marginTop: spacing.xs }}>
              Hi {user?.fullName?.split(' ')[0] || 'Student'}
            </Text>
            <Text style={{ color: '#bfdbfe', fontSize: fontSize.sm, marginTop: spacing.sm }}>
              Your learning summary is updated automatically after each quiz.
            </Text>
          </View>

          <Text style={{ marginTop: spacing.xl, marginBottom: spacing.sm, fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary }}>
            Your Stats
          </Text>

          {isLoadingStats ? (
            <View style={[styles.statCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginLeft: spacing.sm, color: colors.textSecondary }}>Loading your stats...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={[styles.statCardWide, { width: isTablet ? '48%' : '100%' }]}>
                <Text style={styles.statLabel}>Overall Score</Text>
                <Text style={styles.statValue}>{analytics?.averageScore ?? 0}%</Text>
                <Text style={styles.statSubtext}>Average across all your attempts</Text>
              </View>

              <View style={[styles.statCardWide, { width: isTablet ? '48%' : '100%' }]}>
                <Text style={styles.statLabel}>Quiz Attempts</Text>
                <Text style={styles.statValue}>{analytics?.attemptsCount ?? 0}</Text>
                <Text style={styles.statSubtext}>Total quizzes you have submitted</Text>
              </View>

              <View style={[styles.statCardWide, { width: isTablet ? '48%' : '100%' }]}>
                <Text style={styles.statLabel}>Best Subject</Text>
                <Text style={styles.statValueSmall}>{analytics?.strongestSubject ?? 'Not enough data'}</Text>
                <Text style={styles.statSubtext}>Your highest scoring subject so far</Text>
              </View>

              <View style={[styles.statCardWide, { width: isTablet ? '48%' : '100%' }]}>
                <Text style={styles.statLabel}>Needs Practice</Text>
                <Text style={styles.statValueSmall}>{analytics?.weakestSubject ?? 'Not enough data'}</Text>
                <Text
                  style={[
                    styles.statSubtext,
                    { color: improvement >= 0 ? colors.success : colors.error, fontWeight: '700' },
                  ]}
                >
                  Progress trend: {improvementLabel}
                </Text>
              </View>
            </View>
          )}

          <Text style={{ marginTop: spacing.xl, marginBottom: spacing.md, fontSize: fontSize.lg, fontWeight: '700', color: '#0f172a' }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.md }}>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('AvailableQuizzes')}>
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionTitle}>Start Quiz</Text>
              <Text style={styles.actionSub}>Open available quizzes and begin attempt.</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('PerformanceAnalytics')}>
              <Text style={styles.actionEmoji}>📈</Text>
              <Text style={styles.actionTitle}>View Analytics</Text>
              <Text style={styles.actionSub}>Check your trend, pass rate and subject scores.</Text>
            </Pressable>
          </View>
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
    backgroundColor: colors.primary,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCardWide: {
    width: '48%',
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
  statValueSmall: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  statSubtext: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
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
