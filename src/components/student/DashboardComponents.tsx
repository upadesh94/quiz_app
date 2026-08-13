import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { StudentPerformanceAnalytics } from '../../types/models';

export const DashboardHeader = ({ name }: { name: string }) => {
  const { fontSize, spacing } = useResponsive();
  const { colors, isDark } = useAppTheme();
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0f172a', fontSize: fontSize['2xl'] }]}>
          Hi, {name} 👋
        </Text>
        <Text style={[styles.headerSub, { color: isDark ? '#94a3b8' : '#64748b', fontSize: fontSize.sm, marginTop: spacing.xs }]}>
          Let's keep learning & improving!
        </Text>
      </View>
      <View style={[styles.bellIcon, { backgroundColor: isDark ? '#1e1b4b' : '#f1f5f9' }]}>
        <Text style={{ fontSize: 24 }}>🔔</Text>
        <View style={styles.notificationDot} />
      </View>
    </View>
  );
};

export const OverallPerformanceCard = ({ score }: { score: number }) => {
  const { fontSize, spacing } = useResponsive();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
      <View style={styles.heroTop}>
        <View>
          <Text style={{ color: '#dbeafe', fontSize: fontSize.sm, fontWeight: '600' }}>Overall Performance</Text>
          <Text style={{ color: '#ffffff', fontSize: 40, fontWeight: '800', marginTop: spacing.xs }}>{score}%</Text>
          <Text style={{ color: '#bfdbfe', fontSize: fontSize.xs, marginTop: 4 }}>Great job! Keep it up 🚀</Text>
        </View>
        <Text style={{ fontSize: 48 }}>🏆</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${score}%` }]} />
      </View>
    </View>
  );
};

export const StatsGrid = ({ analytics }: { analytics: StudentPerformanceAnalytics }) => {
  const { isDark, colors } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  
  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}><Text>🎯</Text></View>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Accuracy</Text>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.averageScore}%</Text>
        <Text style={[styles.statSub, { color: '#16a34a' }]}>Excellent</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={[styles.statIconBg, { backgroundColor: '#f3e8ff' }]}><Text>📋</Text></View>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Quizzes</Text>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.attemptsCount}</Text>
        <Text style={[styles.statSub, { color: '#9333ea' }]}>Completed</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={[styles.statIconBg, { backgroundColor: '#ffedd5' }]}><Text>🔥</Text></View>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Current Streak</Text>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.currentStreak}</Text>
        <Text style={[styles.statSub, { color: '#ea580c' }]}>Days</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}><Text>⏱️</Text></View>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Avg. Time</Text>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.averageTimeSeconds}s</Text>
        <Text style={[styles.statSub, { color: '#2563eb' }]}>Per Quiz</Text>
      </View>
    </View>
  );
};

export const PerformanceTrendChart = ({ data, width }: { data: number[], width: number }) => {
  const { colors, isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';

  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Performance Trend</Text>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Last 10 Quizzes ⌄</Text>
      </View>
      {data.length > 0 ? (
        <LineChart
          data={{
            labels: data.map((_, i) => `Q${i + 1}`),
            datasets: [{ data: data }]
          }}
          width={width - 40} // Padding
          height={180}
          chartConfig={{
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            backgroundGradientFrom: isDark ? 'transparent' : '#ffffff',
            backgroundGradientTo: isDark ? 'transparent' : '#ffffff',
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            labelColor: (opacity = 1) => isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#8b5cf6" },
            propsForBackgroundLines: { strokeWidth: 1, stroke: isDark ? '#334155' : '#f1f5f9' },
          }}
          bezier
          style={{ marginVertical: 12, borderRadius: 16, marginLeft: -16 }}
          withVerticalLines={false}
        />
      ) : (
         <Text style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>Not enough data</Text>
      )}
    </View>
  );
};

export const SubjectPerformanceList = ({ subjects }: { subjects: any[] }) => {
  const { colors, isDark } = useAppTheme();
  const icons: Record<string, string> = { Mathematics: '🧮', Science: '🔬', English: '📖', History: '🏛️', Geography: '🌍' };
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  
  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Subject Performance</Text>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>View all</Text>
      </View>
      <View style={{ marginTop: 12 }}>
        {subjects.map((sub, i) => (
          <View key={i} style={styles.subjectRow}>
            <View style={[styles.subjectIcon, { backgroundColor: isDark ? '#1e1b4b' : '#f8fafc' }]}>
              <Text style={{fontSize: 20}}>{icons[sub.subject] || '📚'}</Text>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={[styles.subjectName, { color: isDark ? '#FFFFFF' : '#334155' }]}>{sub.subject}</Text>
              <View style={[styles.subjectBarBg, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <View style={[styles.subjectBarFill, { width: `${sub.averagePercentage}%`, backgroundColor: colors.primary }]} />
              </View>
            </View>
            <Text style={[styles.subjectScore, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{sub.averagePercentage}%</Text>
          </View>
        ))}
        {subjects.length === 0 && <Text style={{ color: '#94a3b8', textAlign: 'center', padding: 10 }}>No data</Text>}
      </View>
    </View>
  );
};

export const StrengthsAndWeaknesses = ({ strength, weakness, strScore, weakScore }: any) => {
  const { colors, isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0, flex: 1 }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Strengths & Weak Areas</Text>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>View all</Text>
      </View>
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 11, color: '#16a34a', fontWeight: '700' }}>Top Strength</Text>
        <View style={styles.swRow}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: isDark ? '#FFFFFF' : '#0f172a' }}>{strength || 'N/A'}</Text>
          <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}><Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>{strScore || 0}%</Text></View>
        </View>
      </View>
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: '700' }}>Needs Improvement</Text>
        <View style={styles.swRow}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: isDark ? '#FFFFFF' : '#0f172a' }}>{weakness || 'N/A'}</Text>
          <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}><Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>{weakScore || 0}%</Text></View>
        </View>
      </View>
    </View>
  );
};

export const AnswerDistribution = ({ dist }: any) => {
  const { isDark } = useAppTheme();
  const total = dist.correct + dist.incorrect + dist.skipped || 1;
  const cPerc = Math.round((dist.correct / total) * 100);
  const iPerc = Math.round((dist.incorrect / total) * 100);
  const sPerc = Math.round((dist.skipped / total) * 100);
  
  const data = [
    { name: 'Correct', count: dist.correct, color: '#3b82f6', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
    { name: 'Incorrect', count: dist.incorrect, color: '#ef4444', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
    { name: 'Skipped', count: dist.skipped, color: '#f59e0b', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
  ].filter(d => d.count > 0);

  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';

  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0, flex: 1 }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Answer Distribution</Text>
      {data.length > 0 ? (
        <PieChart
          data={data}
          width={180}
          height={100}
          chartConfig={{ color: () => '#000' }}
          accessor={"count"}
          backgroundColor={"transparent"}
          paddingLeft={"20"}
          absolute
          hasLegend={false}
          style={{ alignSelf: 'center', marginTop: 10 }}
        />
      ) : (
        <Text style={{ color: '#94a3b8', marginTop: 30, textAlign: 'center' }}>No data</Text>
      )}
      <View style={styles.legendContainer}>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#3b82f6'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Correct ({cPerc}%)</Text></View>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#ef4444'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Incorrect ({iPerc}%)</Text></View>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#f59e0b'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Skipped ({sPerc}%)</Text></View>
      </View>
    </View>
  );
};

export const RecentActivityList = ({ activity }: { activity: any[] }) => {
  const { colors, isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0, marginBottom: 30 }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Recent Quiz Activity</Text>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>View all</Text>
      </View>
      <View style={{ marginTop: 12 }}>
        {activity.map((item, i) => (
          <View key={i} style={[styles.activityRow, { borderBottomColor: isDark ? '#334155' : '#f1f5f9', borderBottomWidth: i === activity.length - 1 ? 0 : 1 }]}>
            <View style={[styles.activityIconBg, { backgroundColor: isDark ? '#3b0764' : '#f3e8ff' }]}><Text style={{fontSize: 20}}>📋</Text></View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{item.quizTitle}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                {new Date(item.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.timeSeconds}s/q
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#dcfce7', marginRight: 10 }]}><Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>{Math.round(item.percentage)}%</Text></View>
            <Text style={{ color: '#94a3b8', fontSize: 20 }}>›</Text>
          </View>
        ))}
        {activity.length === 0 && <Text style={{ color: '#94a3b8', textAlign: 'center', padding: 10 }}>No recent activity</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  headerTitle: { fontWeight: '800' },
  headerSub: { fontWeight: '500' },
  bellIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  heroCard: { borderRadius: 20, padding: 24, ...shadows.card, marginBottom: 20, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 24 },
  progressBarFill: { height: '100%', backgroundColor: '#4ade80', borderRadius: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '45%', borderRadius: 16, padding: 16, ...shadows.soft },
  statIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  statSub: { fontSize: 12, fontWeight: '700' },
  chartCard: { borderRadius: 20, padding: 20, ...shadows.soft, marginBottom: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  subjectRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  subjectIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  subjectInfo: { flex: 1, marginRight: 16 },
  subjectName: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  subjectBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 },
  subjectBarFill: { height: '100%', borderRadius: 3 },
  subjectScore: { fontSize: 15, fontWeight: '700', width: 40, textAlign: 'right' },
  swRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, fontWeight: '500' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  activityIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 }
});
