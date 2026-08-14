import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { TeacherAdvancedAnalytics } from '../../types/models';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, shadows, radii } from '../../utils/theme';
import {
  TeacherStatsGrid,
  PerformanceTrendCard,
  AnswerDistributionDonut,
  WeakAreasList,
  InsightsPlaceholder
} from '../../components/teacher/TeacherDashboardComponents';
import { SubjectPerformanceList, RecentActivityList } from '../../components/student/DashboardComponents';
import { CustomInput } from '../../components/common/CustomInput';
import { DateTimePickerWrapper } from '../../components/common/DateTimePickerWrapper';

export function ClassAnalyticsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  const [analytics, setAnalytics] = useState<TeacherAdvancedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'all' | '8' | '9' | '10'>('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const contentWidth = screenWidth - (containerPadding * 2);

  const loadAnalytics = async () => {
    if (!user?.id) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await PerformanceService.getTeacherAdvancedAnalytics(user.id, {
        classLevel: selectedClass === 'all' ? undefined : (Number(selectedClass) as 8 | 9 | 10),
        studentId: selectedStudent === 'all' ? undefined : selectedStudent,
        subject: selectedSubject === 'all' ? undefined : selectedSubject,
        quizId: selectedQuizId === 'all' ? undefined : selectedQuizId,
        searchQuery: searchQuery.trim() || undefined,
        startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      });
      setAnalytics(response);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, selectedClass, selectedStudent, selectedSubject, selectedQuizId, searchQuery, startDate, endDate]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedClass !== 'all' || selectedStudent !== 'all' || selectedSubject !== 'all' || selectedQuizId !== 'all' || startDate !== undefined || endDate !== undefined;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedStudent('all');
    setSelectedSubject('all');
    setSelectedQuizId('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const selectStyle = {
    width: '100%',
    padding: 10,
    borderRadius: radii.md,
    backgroundColor: isDark ? '#0f0a2c' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#cbd5e1',
    borderWidth: 1,
    fontSize: 14,
  };

  return (
    <View style={[styles.page, { backgroundColor: isDark ? '#160629' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                <View style={{backgroundColor: colors.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                   <Text style={{color: '#fff', fontSize: 16}}>🎓</Text>
                </View>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0f172a', fontSize: fontSize['2xl'], fontWeight: '800' }}>Performance Analytics</Text>
              </View>
              <Text style={{ color: isDark ? '#cbd5e1' : '#64748b', fontSize: fontSize.sm }}>Search student scores, track subject progress & quiz performance</Text>
            </View>
            
            <View style={styles.filtersContainer}>
               <View style={[styles.teacherBadge, isDark && { backgroundColor: 'rgba(15, 10, 44, 0.88)', borderColor: 'rgba(168, 85, 247, 0.4)' }]}>
                  <View style={{backgroundColor: '#e0e7ff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
                    <Text style={{color: '#4f46e5', fontWeight: '700', fontSize: 12}}>TS</Text>
                  </View>
                  <View>
                    <Text style={{fontWeight: '700', color: isDark ? '#FFFFFF' : '#0f172a', fontSize: 13}}>{user?.fullName || 'Teacher'}</Text>
                    <Text style={{color: '#94a3b8', fontSize: 11}}>Grade {selectedClass === 'all' ? 'All' : selectedClass}</Text>
                  </View>
               </View>
            </View>
          </View>

          {/* Search & Filter Panel */}
          <View
            style={[
              styles.filterPanel,
              {
                backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff',
                borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#e2e8f0',
              },
            ]}
          >
            <View style={{ marginBottom: 12 }}>
              <CustomInput
                label="🔍 Search Student, Quiz, or Subject"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Type student name, roll no, quiz title or subject..."
              />
            </View>

            {/* Class selection pills */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 6, color: isDark ? '#d8b4fe' : '#0f172a' }}>
                Class Level Filter:
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {(['all', '8', '9', '10'] as const).map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <Pressable
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      style={[
                        styles.chip,
                        isSelected
                          ? [styles.chipActive, isDark && { backgroundColor: '#a855f7', borderColor: '#a855f7' }]
                          : [styles.chipInactive, isDark && { backgroundColor: 'rgba(15, 10, 44, 0.5)', borderColor: 'rgba(168, 85, 247, 0.3)' }],
                      ]}
                    >
                      <Text
                        style={[
                          isSelected ? styles.chipTextActive : styles.chipTextInactive,
                          isDark && !isSelected && { color: '#c4b5fd' },
                        ]}
                      >
                        {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Select Dropdowns Row */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: isDark ? '#a78bfa' : colors.primary }}>
                  Student
                </Text>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={selectStyle as any}
                >
                  <option value="all">All Students</option>
                  {analytics?.studentOptions?.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: isDark ? '#a78bfa' : colors.primary }}>
                  Subject
                </Text>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={selectStyle as any}
                >
                  <option value="all">All Subjects</option>
                  {analytics?.subjectOptions?.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: isDark ? '#a78bfa' : colors.primary }}>
                  Quiz Title
                </Text>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  style={selectStyle as any}
                >
                  <option value="all">All Quizzes</option>
                  {analytics?.quizOptions?.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.title}
                    </option>
                  ))}
                </select>
              </View>
            </View>

            {/* Date Pickers & Reset */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: 'flex-end' }}>
              <View style={{ flex: 1, width: '100%' }}>
                <DateTimePickerWrapper label="Start Date" value={startDate} onChange={setStartDate} isDark={isDark} colors={colors} />
              </View>
              <View style={{ flex: 1, width: '100%' }}>
                <DateTimePickerWrapper label="End Date" value={endDate} onChange={setEndDate} isDark={isDark} colors={colors} />
              </View>
              {hasActiveFilters ? (
                <Pressable
                  onPress={resetFilters}
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: radii.md,
                    borderWidth: 1,
                    borderColor: isDark ? '#ef4444' : '#fca5a5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: isDark ? '#fca5a5' : '#b91c1c', fontWeight: '700', fontSize: 13 }}>
                    ✕ Clear Filters
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Active Filter Summary Banner */}
          {hasActiveFilters && analytics ? (
            <View
              style={{
                backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#eff6ff',
                borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : '#bfdbfe',
                borderWidth: 1,
                borderRadius: radii.md,
                padding: 12,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: isDark ? '#e9d5ff' : '#1e40af', fontWeight: '700', fontSize: fontSize.sm }}>
                🎯 Filtered Analysis: {analytics.filteredAttempts} quiz {analytics.filteredAttempts === 1 ? 'attempt' : 'attempts'} match your selection.
              </Text>
              <Text style={{ color: isDark ? '#34d399' : '#15803d', fontWeight: '800', fontSize: fontSize.sm }}>
                Avg Score: {analytics.averageScore}%
              </Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: isDark ? '#cbd5e1' : '#64748b' }}>Loading analytics...</Text>
            </View>
          ) : analytics ? (
            <View>
              <TeacherStatsGrid analytics={analytics} />
              
              <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 20 }}>
                <View style={{flex: 2}}>
                   <PerformanceTrendCard data={analytics.trend.map(t => t.percentage)} width={isTablet ? (contentWidth * 0.66) - 10 : contentWidth} />
                </View>
                <View style={{flex: 1}}>
                   <AnswerDistributionDonut dist={analytics.answerDistribution} />
                </View>
              </View>

              <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 20, marginTop: 10 }}>
                <View style={{flex: 1}}>
                   <SubjectPerformanceList subjects={analytics.subjectAnalytics} />
                </View>
                <View style={{flex: 1}}>
                   <WeakAreasList weakSubjects={analytics.weakStudents.length > 0 ? analytics.subjectAnalytics.reverse() : analytics.subjectAnalytics} />
                </View>
              </View>
              
              <View style={{ marginTop: 10 }}>
                 <InsightsPlaceholder />
              </View>

              <View style={{ marginTop: 10 }}>
                 <RecentActivityList activity={analytics.rawAttempts} />
              </View>
            </View>
          ) : (
             <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>No data available for the selected filters.</Text>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  container: { paddingTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  filtersContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  filterPanel: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    ...shadows.soft,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#1d4ed8',
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
  teacherBadge: { flexDirection: 'row', alignItems: 'center', padding: 6, paddingRight: 16, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', ...shadows.soft }
});
