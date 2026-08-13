import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, shadows } from '../../utils/theme';
import { TeacherAdvancedAnalytics } from '../../types/models';

export const TeacherStatsGrid = ({ analytics }: { analytics: TeacherAdvancedAnalytics }) => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  
  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#f3e8ff' }]}><Text>🏆</Text></View>
          <Text style={{color: '#16a34a', fontSize: 12, fontWeight: '700'}}>+4%</Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.averageScore}%</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Overall Score</Text>
        <Text style={styles.statSub}>across all quizzes</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}><Text>🎯</Text></View>
          <Text style={{color: '#16a34a', fontSize: 12, fontWeight: '700'}}>+2%</Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.passRate}%</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Pass Rate</Text>
        <Text style={styles.statSub}>of attempted answers</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}><Text>📋</Text></View>
          <Text style={{color: '#16a34a', fontSize: 12, fontWeight: '700'}}>+5%</Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.totalAttempts}</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Quizzes Completed</Text>
        <Text style={styles.statSub}>this month</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#ffedd5' }]}><Text>🔥</Text></View>
          <Text style={{color: '#16a34a', fontSize: 12, fontWeight: '700'}}>+3%</Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.currentStreak} days</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Current Streak</Text>
        <Text style={styles.statSub}>personal best</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#f1f5f9' }]}><Text>⏱️</Text></View>
          <Text style={{color: '#dc2626', fontSize: 12, fontWeight: '700'}}>-8%</Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.averageTimeSeconds}s</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Average Time</Text>
        <Text style={styles.statSub}>per question</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconBg, { backgroundColor: '#ecfdf5' }]}><Text>⭐</Text></View>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{analytics.strongestSubject ? analytics.subjectAnalytics[0].averagePercentage : 0}%</Text>
        <Text style={[styles.statLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Best Score</Text>
        <Text style={styles.statSub}>{analytics.strongestSubject || 'N/A'}</Text>
      </View>
    </View>
  );
};

export const PerformanceTrendCard = ({ data, width }: { data: number[], width: number }) => {
  const { colors, isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';

  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Performance Trend</Text>
      <Text style={[styles.sectionSub, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Score and accuracy across your recent quizzes</Text>
      
      {data.length > 0 ? (
        <LineChart
          data={{
            labels: data.map((_, i) => `Q${i + 1}`),
            datasets: [{ data }]
          }}
          width={width - 40}
          height={180}
          chartConfig={{
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            backgroundGradientFrom: isDark ? 'transparent' : '#ffffff',
            backgroundGradientTo: isDark ? 'transparent' : '#ffffff',
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, // Cyan color from reference
            labelColor: (opacity = 1) => isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#0ea5e9" },
            propsForBackgroundLines: { strokeWidth: 1, stroke: isDark ? '#334155' : '#f1f5f9', strokeDasharray: "4" },
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

export const AnswerDistributionDonut = ({ dist }: any) => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  
  const total = (dist?.correct || 0) + (dist?.incorrect || 0) + (dist?.skipped || 0);
  const cPerc = total > 0 ? Math.round((dist.correct / total) * 100) : 0;
  const iPerc = total > 0 ? Math.round((dist.incorrect / total) * 100) : 0;
  const sPerc = total > 0 ? Math.round((dist.skipped / total) * 100) : 0;
  
  const data = [
    { name: 'Correct', count: dist?.correct || 1, color: '#16a34a', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
    { name: 'Incorrect', count: dist?.incorrect || 0, color: '#dc2626', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
    { name: 'Skipped', count: dist?.skipped || 0, color: '#94a3b8', legendFontColor: isDark ? '#cbd5e1' : '#475569', legendFontSize: 11 },
  ].filter(d => d.count > 0);

  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Answer Distribution</Text>
      <Text style={[styles.sectionSub, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Correct, incorrect and skipped answers</Text>
      
      {total > 0 ? (
        <View style={{alignItems: 'center', marginVertical: 20}}>
            <PieChart
              data={data}
              width={200}
              height={120}
              chartConfig={{ color: () => '#000' }}
              accessor={"count"}
              backgroundColor={"transparent"}
              paddingLeft={"30"}
              absolute
              hasLegend={false}
            />
            {/* Center text for donut hole effect if we wanted to build a custom SVG, but standard PieChart works for MVP */}
        </View>
      ) : (
        <Text style={{ color: '#94a3b8', marginTop: 30, textAlign: 'center' }}>No data</Text>
      )}
      <View style={styles.legendContainer}>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#16a34a'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Correct {cPerc}%</Text></View>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#dc2626'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Incorrect {iPerc}%</Text></View>
         <View style={styles.legendRow}><View style={[styles.legendDot, {backgroundColor: '#94a3b8'}]}/><Text style={[styles.legendText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Skipped {sPerc}%</Text></View>
      </View>
    </View>
  );
};

export const WeakAreasList = ({ weakSubjects }: { weakSubjects: any[] }) => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
       <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Weak Areas</Text>
       <Text style={[styles.sectionSub, { color: isDark ? '#cbd5e1' : '#64748b' }]}>Topics with the lowest accuracy and most mistakes</Text>
       
       <View style={{ marginTop: 12 }}>
         {weakSubjects.length > 0 ? weakSubjects.slice(0, 4).map((sub, i) => (
           <View key={i} style={[styles.weakRow, { borderBottomColor: isDark ? '#334155' : '#f1f5f9', borderBottomWidth: i === 3 ? 0 : 1 }]}>
             <View>
               <Text style={[styles.subjectName, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>{sub.subject}</Text>
               <Text style={{ color: '#94a3b8', fontSize: 12 }}>General</Text>
             </View>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <View style={{marginRight: 12, alignItems: 'flex-end'}}>
                 <Text style={{color: '#dc2626', fontWeight: '700', fontSize: 14}}>{Math.round(sub.average)}%</Text>
                 <Text style={{color: '#94a3b8', fontSize: 10}}>accuracy</Text>
               </View>
               <View style={styles.warningBadge}><Text style={{color: '#dc2626', fontSize: 12}}>⚠️ {5-i}</Text></View>
             </View>
           </View>
         )) : <Text style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No weak areas identified</Text>}
       </View>
    </View>
  );
};

export const InsightsPlaceholder = () => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? 'rgba(15, 10, 44, 0.88)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
       <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
         <Text style={{fontSize: 20, marginRight: 8}}>🤖</Text>
         <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>AI Learning Insights</Text>
       </View>
       <Text style={[styles.sectionSub, { color: isDark ? '#cbd5e1' : '#64748b', marginBottom: 16 }]}>Actionable takeaways from your performance data</Text>
       
       <View style={[styles.insightCard, {backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#ecfdf5', borderColor: '#a7f3d0'}]}>
          <Text style={{fontWeight: '600', color: isDark ? '#4ade80' : '#065f46', marginBottom: 4}}>Excellent discipline</Text>
          <Text style={{color: isDark ? '#a7f3d0' : '#064e3b', fontSize: 13}}>You maintain great accuracy across multiple quizzes. Keep the momentum with periodic review.</Text>
       </View>
       <View style={[styles.insightCard, {backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8', borderColor: '#fef08a'}]}>
          <Text style={{fontWeight: '600', color: isDark ? '#facc15' : '#854d0e', marginBottom: 4}}>Hard questions costing points</Text>
          <Text style={{color: isDark ? '#fef08a' : '#713f12', fontSize: 13}}>Accuracy drops slightly on harder sets. Targeted practice would raise your overall score faster.</Text>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '30%', borderRadius: 16, padding: 16, ...shadows.soft },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  statSub: { fontSize: 11, color: '#94a3b8' },
  chartCard: { borderRadius: 20, padding: 20, ...shadows.soft, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  sectionSub: { fontSize: 12 },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, fontWeight: '500' },
  weakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  subjectName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  warningBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  insightCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 }
});
