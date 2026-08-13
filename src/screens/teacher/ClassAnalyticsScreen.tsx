import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { TeacherAdvancedAnalytics } from '../../types/models';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, shadows } from '../../utils/theme';
import {
  TeacherStatsGrid,
  PerformanceTrendCard,
  AnswerDistributionDonut,
  WeakAreasList,
  InsightsPlaceholder
} from '../../components/teacher/TeacherDashboardComponents';
import { SubjectPerformanceList, RecentActivityList } from '../../components/student/DashboardComponents'; // Reuse these!
import { CustomInput } from '../../components/common/CustomInput';
import { DateTimePickerWrapper } from '../../components/common/DateTimePickerWrapper';

export function ClassAnalyticsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  const [analytics, setAnalytics] = useState<TeacherAdvancedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<'all' | '8' | '9' | '10'>('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
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
        quizId: selectedQuizId === 'all' ? undefined : selectedQuizId,
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
  }, [user?.id, selectedClass, selectedStudent, selectedQuizId, startDate, endDate]);

  return (
    <View style={[styles.page, { backgroundColor: isDark ? '#160629' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          
          <View style={styles.header}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                <View style={{backgroundColor: colors.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                   <Text style={{color: '#fff', fontSize: 16}}>🎓</Text>
                </View>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0f172a', fontSize: fontSize['2xl'], fontWeight: '800' }}>Performance Analytics</Text>
              </View>
              <Text style={{ color: isDark ? '#cbd5e1' : '#64748b', fontSize: fontSize.sm }}>Your quiz progress, strengths, and personalized next steps</Text>
            </View>
            
            <View style={styles.filtersContainer}>
               <View style={styles.teacherBadge}>
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

          <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
            <View style={{flex: 1}}>
              <CustomInput
                label="Class (all, 8, 9, 10)"
                value={selectedClass}
                onChangeText={(val: any) => setSelectedClass(val)}
                placeholder="all"
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: isDark ? '#a78bfa' : colors.primary }}>Student Name</Text>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, backgroundColor: isDark ? '#0f0a2c' : '#ffffff', color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#4c1d95' : '#93c5fd' }}
              >
                <option value="all">All Students</option>
                {analytics?.studentOptions?.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </View>
            <View style={{flex: 1}}>
              <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: isDark ? '#a78bfa' : colors.primary }}>Quiz Title</Text>
              <select 
                value={selectedQuizId} 
                onChange={(e) => setSelectedQuizId(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, backgroundColor: isDark ? '#0f0a2c' : '#ffffff', color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#4c1d95' : '#93c5fd' }}
              >
                <option value="all">All Quizzes</option>
                {analytics?.quizOptions?.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.title}</option>
                ))}
              </select>
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
            <View style={{flex: 1}}>
              <DateTimePickerWrapper label="Start Date" value={startDate} onChange={setStartDate} isDark={isDark} colors={colors} />
            </View>
            <View style={{flex: 1}}>
              <DateTimePickerWrapper label="End Date" value={endDate} onChange={setEndDate} isDark={isDark} colors={colors} />
            </View>
          </View>

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
             <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>No data available.</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  filtersContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', ...shadows.soft },
  teacherBadge: { flexDirection: 'row', alignItems: 'center', padding: 6, paddingRight: 16, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', ...shadows.soft }
});
