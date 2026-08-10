import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SubjectBarChart } from '../../components/charts/SubjectBarChart';
import { CustomCard } from '../../components/common/CustomCard';
import { PerformanceLineChart } from '../../components/charts/PerformanceLineChart';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { useAppSelector } from '../../hooks/useAppSelector';
import { AttemptService } from '../../services/quiz/AttemptService';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { CategoryBarChart } from '../../components/charts/CategoryBarChart';
import { TeacherPieChart } from '../../components/charts/TeacherPieChart';
import { TeacherAdvancedAnalytics } from '../../types/models';
import { useResponsive, getGridColumns } from '../../utils/responsive';
import { useAppTheme, radii, shadows } from '../../utils/theme';

export function ClassAnalyticsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const numColumns = getGridColumns(screenWidth, isTablet);
  const [analytics, setAnalytics] = useState<TeacherAdvancedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<'all' | '8' | '9' | '10'>('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [resultType, setResultType] = useState<'all' | 'passed' | 'failed'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadAnalytics = async () => {
    if (!user?.id) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await PerformanceService.getTeacherAdvancedAnalytics(user.id, {
        classLevel: selectedClass === 'all' ? undefined : (Number(selectedClass) as 8 | 9 | 10),
        studentId: selectedStudent === 'all' ? undefined : selectedStudent,
        subject: selectedSubject === 'all' ? undefined : selectedSubject,
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        resultType,
      });
      setAnalytics(response);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllowRetake = async (studentId: string, quizId: string) => {
    if (window.confirm('Are you sure you want to allow this student to retake the quiz? This will delete their current attempt.')) {
      await AttemptService.deleteAttempt(studentId, quizId);
      loadAnalytics();
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [
    user?.id,
    selectedClass,
    selectedStudent,
    selectedSubject,
    resultType,
    startDate,
    endDate,
  ]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#160629' : colors.background, paddingHorizontal: containerPadding }]}>
      {isDark && <View style={styles.topGlow} />}
      {isDark && <View style={styles.bottomGlow} />}

      <View
        style={{
          maxWidth: isTablet ? 900 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '800',
            marginBottom: spacing.lg,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          📊 Class Analytics
        </Text>

        <View style={[styles.filterCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
          <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm }}>
            Filters
          </Text>

          <Text style={[styles.filterLabel, !isDark && { color: colors.textSecondary }]}>Class</Text>
          <View style={styles.chipRow}>
            {['all', '8', '9', '10'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setSelectedClass(item as 'all' | '8' | '9' | '10')}
                style={[
                  styles.chip,
                  selectedClass === item
                    ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                    : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                ]}
              >
                <Text style={
                  selectedClass === item
                    ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                    : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                }>
                  {item === 'all' ? 'All' : `Class ${item}`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }, !isDark && { color: colors.textSecondary }]}>Result Type</Text>
          <View style={styles.chipRow}>
            {['all', 'passed', 'failed'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setResultType(item as 'all' | 'passed' | 'failed')}
                style={[
                  styles.chip,
                  resultType === item
                    ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                    : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                ]}
              >
                <Text style={
                  resultType === item
                    ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                    : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                }>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }, !isDark && { color: colors.textSecondary }]}>Specific Student</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedStudent('all')}
              style={[
                styles.chip,
                selectedStudent === 'all'
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                selectedStudent === 'all'
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>All Students</Text>
            </Pressable>
            {(analytics?.studentOptions ?? []).slice(0, 8).map((student) => (
              <Pressable
                key={student.id}
                onPress={() => setSelectedStudent(student.id)}
                style={[
                  styles.chip,
                  selectedStudent === student.id
                    ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                    : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                ]}
              >
                <Text style={
                  selectedStudent === student.id
                    ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                    : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                }>
                  {student.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }, !isDark && { color: colors.textSecondary }]}>Subject</Text>
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
              <Text style={
                selectedSubject === 'all'
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>All Subjects</Text>
            </Pressable>
            {(analytics?.subjectOptions ?? []).map((subject) => (
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
                <Text style={
                  selectedSubject === subject
                    ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                    : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                }>{subject}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <CustomInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                label="Start Date"
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                label="End Date"
              />
            </View>
          </View>

          <Pressable
            onPress={() => {
              setSelectedClass('all');
              setSelectedStudent('all');
              setSelectedSubject('all');
              setResultType('all');
              setStartDate('');
              setEndDate('');
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <ActivityIndicator size="small" color={isDark ? '#a855f7' : colors.primary} />
            <Text style={{ color: isDark ? '#d8b4fe' : colors.textSecondary }}>Loading class analytics...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Attempts</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>
                {analytics?.filteredAttempts ?? 0}
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Average</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>
                {analytics?.averageScore ?? 0}%
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Pass Rate</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>
                {analytics?.passRate ?? 0}%
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Total Students</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>
                {analytics?.totalStudents ?? 0}
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Weak Students</Text>
              <Text style={{ color: isDark ? '#f87171' : colors.error, fontSize: fontSize.xl, fontWeight: '800' }}>
                {analytics?.weakStudentsCount ?? 0}
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Weakest Subject</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.base, fontWeight: '800' }}>
                {analytics?.weakestSubject ?? '-'}
              </Text>
            </View>
            <View style={[styles.summaryCard, !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }]}>
              <Text style={{ color: isDark ? '#a78bfa' : colors.textSecondary, fontSize: fontSize.sm }}>Strongest Subject</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontSize: fontSize.base, fontWeight: '800' }}>
                {analytics?.strongestSubject ?? '-'}
              </Text>
            </View>
          </View>
        )}

        <CustomCard variant={isDark ? 'glass' : 'default'}>
          <PerformanceLineChart data={analytics?.trend ?? []} isDark={isDark} />
        </CustomCard>

        <CustomCard variant={isDark ? 'glass' : 'default'}>
          <SubjectBarChart data={analytics?.subjectAnalytics ?? []} isDark={isDark} />
        </CustomCard>

        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.md, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TeacherPieChart title="Pass vs Fail" data={analytics?.passFailPie ?? []} isDark={isDark} />
          </View>
          <View style={{ flex: 1 }}>
            <CategoryBarChart title="Class-wise Average" data={analytics?.classPerformance ?? []} isDark={isDark} />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <TeacherPieChart title="Subject Distribution" data={analytics?.subjectDistribution ?? []} isDark={isDark} />
        </View>

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          Weak Area Detection
        </Text>
        <View style={{ flexDirection: isTablet ? 'row' : 'column', flexWrap: 'wrap', gap: spacing.sm }}>
          {(analytics?.subjectHeatmap ?? []).map((item) => {
            const bgColor = item.level === 'low' ? 'rgba(239, 68, 68, 0.2)' : item.level === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)';
            const textColor = item.level === 'low' ? '#fca5a5' : item.level === 'medium' ? '#fcd34d' : '#86efac';
            const borderColor = item.level === 'low' ? 'rgba(239, 68, 68, 0.4)' : item.level === 'medium' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(34, 197, 94, 0.4)';

            return (
              <View
                key={item.subject}
                style={{
                  flex: isTablet ? 0.48 : 1,
                  backgroundColor: bgColor,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: borderColor,
                  padding: spacing.md,
                }}
              >
                <Text style={{ color: textColor, fontWeight: '800', fontSize: fontSize.base }}>{item.subject}</Text>
                <Text style={{ color: textColor, marginTop: 4, fontSize: fontSize.sm, opacity: 0.9 }}>
                  Avg: {item.averageScore}%
                </Text>
              </View>
            );
          })}
        </View>

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.lg,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          Performance by Subject
        </Text>
        <View
          style={{
            flexDirection: isTablet ? 'row' : 'column',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {(analytics?.subjectAnalytics ?? []).map((item) => (
            <View
              key={item.subject}
              style={isTablet ? { flex: 1 / numColumns, minWidth: '45%' } : { width: '100%' }}
            >
              <CustomCard variant={isDark ? 'glass' : 'default'}>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: '800',
                    marginBottom: spacing.sm,
                    color: isDark ? '#FFFFFF' : colors.textPrimary
                  }}
                >
                  {item.subject}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#c4b5fd' : colors.textSecondary, marginBottom: spacing.xs }}>
                  📍 Attempts: {item.attempts}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#c4b5fd' : colors.textSecondary }}>
                  🎯 Avg Score: {item.averagePercentage}%
                </Text>
              </CustomCard>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          Top Performers
        </Text>
        {(analytics?.topPerformers ?? []).map((student, index) => (
          <CustomCard variant={isDark ? 'glass' : 'default'} key={`top-${student.studentId}`}>
            <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : colors.textPrimary, marginBottom: 4 }}>
              #{index + 1} {student.studentName}
            </Text>
            <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary }}>Avg: {student.averageScore}% | Attempts: {student.attempts}</Text>
          </CustomCard>
        ))}

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.lg,
            marginBottom: spacing.md,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          At Risk Students
        </Text>
        {(analytics?.weakStudents ?? []).length === 0 ? (
          <CustomCard variant={isDark ? 'glass' : 'default'}>
            <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary }}>No weak students found for current filters.</Text>
          </CustomCard>
        ) : (
          (analytics?.weakStudents ?? []).map((student) => (
            <CustomCard variant={isDark ? 'glass' : 'default'} key={`weak-${student.studentId}`}>
              <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : colors.textPrimary, marginBottom: 4 }}>{student.studentName}</Text>
              <Text style={{ color: isDark ? '#f87171' : colors.error, fontWeight: '600', marginBottom: 2 }}>
                Avg: {student.averageScore}%
              </Text>
              <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary }}>
                Weak Subject: {student.weakestSubject ?? '-'} ({student.weakestSubjectScore ?? 0}%)
              </Text>
            </CustomCard>
          ))
        )}

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.lg,
            marginBottom: spacing.md,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          Recent Attempts
        </Text>
        {(analytics?.rawAttempts ?? []).length === 0 ? (
          <CustomCard variant={isDark ? 'glass' : 'default'}>
            <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary }}>No attempts found for current filters.</Text>
          </CustomCard>
        ) : (
          (analytics?.rawAttempts ?? []).slice(0, 10).map((attempt) => (
            <CustomCard variant={isDark ? 'glass' : 'default'} key={`attempt-${attempt.id}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : colors.textPrimary, marginBottom: 4 }}>
                    {attempt.studentName || attempt.studentId}
                  </Text>
                  <Text style={{ color: isDark ? '#a78bfa' : colors.primary, marginBottom: 2 }}>
                    Quiz: {attempt.quizTitle || attempt.quizId}
                  </Text>
                  <Text style={{ color: attempt.percentage >= 40 ? (isDark ? '#4ade80' : colors.success) : (isDark ? '#f87171' : colors.error), fontWeight: '600' }}>
                    Score: {attempt.percentage}%
                  </Text>
                  <Text style={{ color: isDark ? '#64748b' : colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    Completed: {new Date(attempt.completedAt).toLocaleString()}
                  </Text>
                </View>
                <CustomButton 
                  title="Allow Retake" 
                  variant="secondary" 
                  onPress={() => handleAllowRetake(attempt.studentId, attempt.quizId)}
                />
              </View>
            </CustomCard>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  filterCard: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#a855f7',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
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
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactiveDark: {
    color: '#c4b5fd',
    fontWeight: '600',
    fontSize: 12,
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
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactiveLight: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 12,
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetBtnText: {
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
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
});
