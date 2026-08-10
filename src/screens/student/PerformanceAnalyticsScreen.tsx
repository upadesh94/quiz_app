import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PerformanceLineChart } from '../../components/charts/PerformanceLineChart';
import { SubjectBarChart } from '../../components/charts/SubjectBarChart';
import { CustomCard } from '../../components/common/CustomCard';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { StudentPerformanceAnalytics } from '../../types/models';
import { getSubjectsForClass } from '../../services/utils/Constants';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii } from '../../utils/theme';

export function PerformanceAnalyticsScreen() {
  const { fontSize, spacing } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<StudentPerformanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const studentClassLevel = user?.classLevel ?? 8;
  const subjectOptions = useMemo(() => getSubjectsForClass(studentClassLevel), [studentClassLevel]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);

      if (!user?.id) {
        setAnalytics(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await PerformanceService.getStudentPerformance(user.id, {
          classLevel: studentClassLevel,
          subject: selectedSubject === 'all' ? undefined : selectedSubject,
        });
        setAnalytics(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.id, studentClassLevel, selectedSubject]);

  useEffect(() => {
    const isValidSubject = selectedSubject === 'all' || subjectOptions.some((subject) => subject === selectedSubject);
    if (!isValidSubject) {
      setSelectedSubject('all');
    }
  }, [selectedSubject, subjectOptions]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#160629' : colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.background}>
        {isDark && <View style={styles.topGlow} />}
        {isDark && <View style={styles.bottomGlow} />}

        <View style={[styles.heroCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
          <Text style={[styles.title, !isDark && { color: colors.textPrimary }]}>Performance Analytics</Text>
          <Text style={[styles.heroText, !isDark && { color: colors.textSecondary }]}>
            Review your own progress for your class. Use the subject filter to focus on the areas you want to improve.
          </Text>
        </View>

        <CustomCard variant={isDark ? 'glass' : 'default'}>
          <Text style={[styles.filterTitle, { fontSize: fontSize.base }, !isDark && { color: colors.textPrimary }]}>Filters</Text>
          <Text style={[styles.filterLabel, { marginTop: spacing.xs }, !isDark && { color: colors.textSecondary }]}>Subject</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedSubject('all')}
              style={[
                styles.chip,
                selectedSubject === 'all'
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={[
                selectedSubject === 'all'
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              ]}>All Subjects</Text>
            </Pressable>
            {subjectOptions.map((subject) => (
              <Pressable
                key={subject}
                onPress={() => setSelectedSubject(subject)}
                style={[
                  styles.chip,
                  selectedSubject === subject
                    ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                    : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                ]}
              >
                <Text style={[
                  selectedSubject === subject
                    ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                    : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                ]}>{subject}</Text>
              </Pressable>
            ))}
          </View>
        </CustomCard>

      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={isDark ? '#a855f7' : colors.primary} />
          <Text style={[styles.loaderText, !isDark && { color: colors.textSecondary }]}>Loading analytics...</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Average</Text>
              <Text style={[styles.summaryValue, !isDark && { color: colors.textPrimary }]}>{analytics?.averageScore ?? 0}%</Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Attempts</Text>
              <Text style={[styles.summaryValue, !isDark && { color: colors.textPrimary }]}>{analytics?.attemptsCount ?? 0}</Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Pass Rate</Text>
              <Text style={[styles.summaryValue, !isDark && { color: colors.textPrimary }]}>{analytics?.passRate ?? 0}%</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Best Subject</Text>
              <Text style={[styles.summaryValueSmall, !isDark && { color: colors.textPrimary }]}>{analytics?.strongestSubject ?? '-'}</Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Weak Subject</Text>
              <Text style={[styles.summaryValueSmall, !isDark && { color: colors.textPrimary }]}>{analytics?.weakestSubject ?? '-'}</Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={[styles.summaryTitle, !isDark && { color: colors.textSecondary }]}>Improvement</Text>
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

          <PerformanceLineChart data={analytics?.trend ?? []} isDark={isDark} />
          <SubjectBarChart data={analytics?.subjectAnalytics ?? []} isDark={isDark} />

          <View style={styles.subjectSummaryGrid}>
            {(analytics?.subjectAnalytics ?? []).map((item) => (
              <View key={item.subject} style={[styles.subjectSummaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
                <Text style={[styles.subjectSummaryTitle, !isDark && { color: colors.textSecondary }]}>{item.subject}</Text>
                <Text style={[styles.subjectSummaryValue, !isDark && { color: colors.textPrimary }]}>{item.averagePercentage}%</Text>
                <Text style={[styles.subjectSummaryMeta, !isDark && { color: colors.textSecondary }]}>Attempts: {item.attempts}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    padding: 16,
    gap: 14,
    minHeight: '100%',
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(113, 50, 255, 0.16)',
  },
  bottomGlow: {
    position: 'absolute',
    right: -120,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(78, 37, 181, 0.18)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  heroText: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  filterTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  filterLabel: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipActiveDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: '#a855f7',
  },
  chipInactiveDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.5)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  chipTextActiveDark: {
    color: '#f3e8ff',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextInactiveDark: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  chipActiveLight: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipInactiveLight: {
    backgroundColor: '#ffffff',
    borderColor: '#bfdbfe',
  },
  chipTextActiveLight: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextInactiveLight: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  loaderBox: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  loaderText: {
    color: '#d8b4fe',
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#a78bfa',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subjectSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  subjectSummaryCard: {
    width: '48%',
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    padding: 12,
    shadowColor: '#a855f7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  subjectSummaryTitle: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  subjectSummaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subjectSummaryMeta: {
    color: '#a78bfa',
    fontSize: 12,
    marginTop: 4,
  },
});
