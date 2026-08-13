import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Dimensions, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { StudentPerformanceAnalytics } from '../../types/models';
import {
  DashboardHeader,
  OverallPerformanceCard,
  StatsGrid,
  PerformanceTrendChart,
  SubjectPerformanceList,
  StrengthsAndWeaknesses,
  AnswerDistribution,
  RecentActivityList
} from '../../components/student/DashboardComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentDashboard'>;

export function StudentDashboard({ navigation }: Props) {
  const { containerPadding, spacing, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<StudentPerformanceAnalytics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // We need screen width for the charts
  const screenWidth = Dimensions.get('window').width - (containerPadding * 2);

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

  return (
    <View style={[styles.page, { backgroundColor: isDark ? '#160629' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          
          <DashboardHeader name={user?.fullName?.split(' ')[0] || 'Student'} />

          {isLoadingStats ? (
            <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: isDark ? '#cbd5e1' : '#64748b' }}>Loading dashboard...</Text>
            </View>
          ) : analytics ? (
            <View>
              <OverallPerformanceCard score={analytics.averageScore} />
              
              <StatsGrid analytics={analytics} />
              
              <PerformanceTrendChart 
                data={analytics.trend.map(t => t.percentage)} 
                width={screenWidth} 
              />
              
              <SubjectPerformanceList subjects={analytics.subjectAnalytics} />
              
              <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12 }}>
                <StrengthsAndWeaknesses 
                  strength={analytics.strongestSubject}
                  strScore={analytics.subjectAnalytics.find(s => s.subject === analytics.strongestSubject)?.averagePercentage}
                  weakness={analytics.weakestSubject}
                  weakScore={analytics.subjectAnalytics.find(s => s.subject === analytics.weakestSubject)?.averagePercentage}
                />
                <AnswerDistribution dist={analytics.answerDistribution} />
              </View>
              
              <View style={{ marginTop: 12 }}>
                <RecentActivityList activity={analytics.recentActivity} />
              </View>
            </View>
          ) : (
             <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>Failed to load data.</Text>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  container: { paddingTop: 20 },
});
