import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SubjectBarChart } from '../../components/charts/SubjectBarChart';
import { CustomCard } from '../../components/common/CustomCard';
import { PerformanceLineChart } from '../../components/charts/PerformanceLineChart';
import { CustomInput } from '../../components/common/CustomInput';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { CategoryBarChart } from '../../components/charts/CategoryBarChart';
import { TeacherPieChart } from '../../components/charts/TeacherPieChart';
import { TeacherAdvancedAnalytics } from '../../types/models';
import { useResponsive, getGridColumns } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

export function ClassAnalyticsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
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
    <ScrollView style={[styles.container, { paddingHorizontal: containerPadding }]}>
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
            fontWeight: '700',
            marginBottom: spacing.lg,
            color: colors.textPrimary,
          }}
        >
          📊 Class Analytics
        </Text>

        <View style={styles.filterCard}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm }}>
            Filters
          </Text>

          <Text style={styles.filterLabel}>Class</Text>
          <View style={styles.chipRow}>
            {['all', '8', '9', '10'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setSelectedClass(item as 'all' | '8' | '9' | '10')}
                style={[styles.chip, selectedClass === item ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={selectedClass === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item === 'all' ? 'All' : `Class ${item}`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Result Type</Text>
          <View style={styles.chipRow}>
            {['all', 'passed', 'failed'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setResultType(item as 'all' | 'passed' | 'failed')}
                style={[styles.chip, resultType === item ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={resultType === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Specific Student</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedStudent('all')}
              style={[styles.chip, selectedStudent === 'all' ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={selectedStudent === 'all' ? styles.chipTextActive : styles.chipTextInactive}>All Students</Text>
            </Pressable>
            {(analytics?.studentOptions ?? []).slice(0, 8).map((student) => (
              <Pressable
                key={student.id}
                onPress={() => setSelectedStudent(student.id)}
                style={[styles.chip, selectedStudent === student.id ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={selectedStudent === student.id ? styles.chipTextActive : styles.chipTextInactive}>
                  {student.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Subject</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedSubject('all')}
              style={[styles.chip, selectedSubject === 'all' ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={selectedSubject === 'all' ? styles.chipTextActive : styles.chipTextInactive}>All Subjects</Text>
            </Pressable>
            {(analytics?.subjectOptions ?? []).map((subject) => (
              <Pressable
                key={subject}
                onPress={() => setSelectedSubject(subject)}
                style={[styles.chip, selectedSubject === subject ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={selectedSubject === subject ? styles.chipTextActive : styles.chipTextInactive}>{subject}</Text>
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
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={{ color: '#334155' }}>Loading class analytics...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Attempts</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.xl, fontWeight: '700' }}>
                {analytics?.filteredAttempts ?? 0}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Average</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.xl, fontWeight: '700' }}>
                {analytics?.averageScore ?? 0}%
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Pass Rate</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.xl, fontWeight: '700' }}>
                {analytics?.passRate ?? 0}%
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Total Students</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.xl, fontWeight: '700' }}>
                {analytics?.totalStudents ?? 0}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Weak Students</Text>
              <Text style={{ color: '#b91c1c', fontSize: fontSize.xl, fontWeight: '700' }}>
                {analytics?.weakStudentsCount ?? 0}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Weakest Subject</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.base, fontWeight: '700' }}>
                {analytics?.weakestSubject ?? '-'}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={{ color: '#475569', fontSize: fontSize.sm }}>Strongest Subject</Text>
              <Text style={{ color: '#0f172a', fontSize: fontSize.base, fontWeight: '700' }}>
                {analytics?.strongestSubject ?? '-'}
              </Text>
            </View>
          </View>
        )}

        <CustomCard>
          <PerformanceLineChart data={analytics?.trend ?? []} />
        </CustomCard>

        <CustomCard>
          <SubjectBarChart data={analytics?.subjectAnalytics ?? []} />
        </CustomCard>

        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.md, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TeacherPieChart title="Pass vs Fail" data={analytics?.passFailPie ?? []} />
          </View>
          <View style={{ flex: 1 }}>
            <CategoryBarChart title="Class-wise Average" data={analytics?.classPerformance ?? []} />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <TeacherPieChart title="Subject Distribution" data={analytics?.subjectDistribution ?? []} />
        </View>

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
            color: colors.textPrimary,
          }}
        >
          Weak Area Detection
        </Text>
        <View style={{ flexDirection: isTablet ? 'row' : 'column', flexWrap: 'wrap', gap: spacing.sm }}>
          {(analytics?.subjectHeatmap ?? []).map((item) => {
            const bgColor = item.level === 'low' ? '#FEE2E2' : item.level === 'medium' ? '#FEF3C7' : '#DCFCE7';
            const textColor = item.level === 'low' ? '#B91C1C' : item.level === 'medium' ? '#92400E' : '#166534';

            return (
              <View
                key={item.subject}
                style={{
                  flex: isTablet ? 0.48 : 1,
                  backgroundColor: bgColor,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  padding: spacing.md,
                }}
              >
                <Text style={{ color: textColor, fontWeight: '700', fontSize: fontSize.base }}>{item.subject}</Text>
                <Text style={{ color: textColor, marginTop: 4, fontSize: fontSize.sm }}>
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
              <CustomCard>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: '700',
                    marginBottom: spacing.sm,
                  }}
                >
                  {item.subject}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
                  📍 Attempts: {item.attempts}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: '#334155' }}>
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
            color: colors.textPrimary,
          }}
        >
          Top Performers
        </Text>
        {(analytics?.topPerformers ?? []).map((student, index) => (
          <CustomCard key={`top-${student.studentId}`}>
            <Text style={{ fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
              #{index + 1} {student.studentName}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Avg: {student.averageScore}% | Attempts: {student.attempts}</Text>
          </CustomCard>
        ))}

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.lg,
            marginBottom: spacing.md,
            color: colors.textPrimary,
          }}
        >
          At Risk Students
        </Text>
        {(analytics?.weakStudents ?? []).length === 0 ? (
          <CustomCard>
            <Text style={{ color: colors.textSecondary }}>No weak students found for current filters.</Text>
          </CustomCard>
        ) : (
          (analytics?.weakStudents ?? []).map((student) => (
            <CustomCard key={`weak-${student.studentId}`}>
              <Text style={{ fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>{student.studentName}</Text>
              <Text style={{ color: colors.error, fontWeight: '600', marginBottom: 2 }}>
                Avg: {student.averageScore}%
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                Weak Subject: {student.weakestSubject ?? '-'} ({student.weakestSubjectScore ?? 0}%)
              </Text>
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
    backgroundColor: '#f9fafb',
  },
  filterCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 12,
    marginBottom: 14,
    ...shadows.soft,
  },
  filterLabel: {
    color: '#0f172a',
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
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  chipInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactive: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  resetBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    ...shadows.soft,
  },
});
