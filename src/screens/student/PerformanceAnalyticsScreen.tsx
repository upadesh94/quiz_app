import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PerformanceLineChart } from '../../components/charts/PerformanceLineChart';
import { SubjectBarChart } from '../../components/charts/SubjectBarChart';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { StudentPerformanceAnalytics } from '../../types/models';
import { colors, radii, shadows } from '../../utils/theme';

export function PerformanceAnalyticsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<StudentPerformanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        setAnalytics(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await PerformanceService.getStudentPerformance(user.id);
        setAnalytics(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.id]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Performance Analytics</Text>

      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loaderText}>Loading analytics...</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Average</Text>
              <Text style={styles.summaryValue}>{analytics?.averageScore ?? 0}%</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Attempts</Text>
              <Text style={styles.summaryValue}>{analytics?.attemptsCount ?? 0}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Pass Rate</Text>
              <Text style={styles.summaryValue}>{analytics?.passRate ?? 0}%</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Best Subject</Text>
              <Text style={styles.summaryValueSmall}>{analytics?.strongestSubject ?? '-'}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Weak Subject</Text>
              <Text style={styles.summaryValueSmall}>{analytics?.weakestSubject ?? '-'}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Improvement</Text>
              <Text
                style={[
                  styles.summaryValueSmall,
                  { color: (analytics?.improvementDelta ?? 0) >= 0 ? colors.success : colors.error },
                ]}
              >
                {(analytics?.improvementDelta ?? 0) >= 0 ? '+' : ''}
                {analytics?.improvementDelta ?? 0}%
              </Text>
            </View>
          </View>

          <PerformanceLineChart data={analytics?.trend ?? []} />
          <SubjectBarChart data={analytics?.subjectAnalytics ?? []} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 14,
    backgroundColor: colors.background,
  },
  contentContainer: {
    gap: 14,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loaderBox: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  loaderText: {
    color: '#334155',
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    padding: 12,
    ...shadows.soft,
  },
  summaryTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
