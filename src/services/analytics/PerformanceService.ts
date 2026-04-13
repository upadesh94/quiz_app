import { getCollection, where } from '../../firebase/firestore';
import {
  AttemptPayload,
  ClassBarPoint,
  PieSlice,
  StudentLeaderboardEntry,
  StudentPerformanceAnalytics,
  SubjectHeatmapPoint,
  SubjectAnalytics,
  TeacherAdvancedAnalytics,
  TeacherAnalyticsFilters,
  TeacherClassAnalytics,
  TrendPoint,
} from '../../types/models';

type AttemptDoc = AttemptPayload & { id: string };

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

function toSubjectAnalytics(attempts: AttemptDoc[]): SubjectAnalytics[] {
  const grouped = attempts.reduce<Record<string, { total: number; count: number }>>((acc, item) => {
    const key = item.subject || 'General';
    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 };
    }

    acc[key].total += Number(item.percentage) || 0;
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.keys(grouped)
    .map((subject) => ({
      subject,
      attempts: grouped[subject].count,
      averagePercentage: roundToTwo(grouped[subject].total / grouped[subject].count),
    }))
    .sort((a, b) => b.averagePercentage - a.averagePercentage);
}

function toTrendPoints(attempts: AttemptDoc[]): TrendPoint[] {
  return attempts
    .slice()
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-8)
    .map((attempt, index) => ({
      label: `A${index + 1}`,
      percentage: Number(attempt.percentage) || 0,
    }));
}

function toPassFailPie(attempts: AttemptDoc[]): PieSlice[] {
  const passCount = attempts.filter((item) => item.passed).length;
  const failCount = attempts.length - passCount;
  return [
    { label: 'Passed', value: passCount, color: '#16a34a' },
    { label: 'Failed', value: failCount, color: '#dc2626' },
  ];
}

function toSubjectDistribution(attempts: AttemptDoc[]): PieSlice[] {
  const grouped = attempts.reduce<Record<string, number>>((acc, item) => {
    const key = item.subject || 'General';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const palette = ['#2563EB', '#7C3AED', '#0EA5E9', '#16A34A', '#F59E0B', '#DC2626'];

  return Object.keys(grouped)
    .map((subject, index) => ({
      label: subject,
      value: grouped[subject],
      color: palette[index % palette.length],
    }))
    .sort((a, b) => b.value - a.value);
}

function levelFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score < 40) {
    return 'low';
  }
  if (score < 70) {
    return 'medium';
  }
  return 'high';
}

function toSubjectHeatmap(subjectAnalytics: SubjectAnalytics[]): SubjectHeatmapPoint[] {
  return subjectAnalytics.map((item) => ({
    subject: item.subject,
    averageScore: item.averagePercentage,
    level: levelFromScore(item.averagePercentage),
  }));
}

function toStudentLeaderboard(attempts: AttemptDoc[]): StudentLeaderboardEntry[] {
  const grouped = attempts.reduce<
    Record<
      string,
      {
        name: string;
        classLevel: 8 | 9 | 10;
        total: number;
        count: number;
        subjectMap: Record<string, { total: number; count: number }>;
      }
    >
  >((acc, item) => {
    if (!item.studentId) {
      return acc;
    }

    if (!acc[item.studentId]) {
      acc[item.studentId] = {
        name: item.studentName || item.studentId,
        classLevel: item.classLevel,
        total: 0,
        count: 0,
        subjectMap: {},
      };
    }

    acc[item.studentId].total += Number(item.percentage) || 0;
    acc[item.studentId].count += 1;

    const subject = item.subject || 'General';
    if (!acc[item.studentId].subjectMap[subject]) {
      acc[item.studentId].subjectMap[subject] = { total: 0, count: 0 };
    }
    acc[item.studentId].subjectMap[subject].total += Number(item.percentage) || 0;
    acc[item.studentId].subjectMap[subject].count += 1;

    return acc;
  }, {});

  return Object.entries(grouped).map(([studentId, value]) => {
    const averageScore = value.count > 0 ? roundToTwo(value.total / value.count) : 0;

    const weakest = Object.entries(value.subjectMap)
      .map(([subject, metrics]) => ({
        subject,
        average: roundToTwo(metrics.total / Math.max(metrics.count, 1)),
      }))
      .sort((a, b) => a.average - b.average)[0];

    return {
      studentId,
      studentName: value.name,
      classLevel: value.classLevel,
      averageScore,
      attempts: value.count,
      weakestSubject: weakest?.subject,
      weakestSubjectScore: weakest?.average,
    };
  });
}

function toClassPerformance(attempts: AttemptDoc[]): ClassBarPoint[] {
  const grouped = attempts.reduce<Record<string, { total: number; count: number }>>((acc, item) => {
    const key = `Class ${item.classLevel ?? 'N/A'}`;
    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 };
    }

    acc[key].total += Number(item.percentage) || 0;
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.keys(grouped)
    .map((key) => ({
      label: key,
      value: roundToTwo(grouped[key].total / Math.max(grouped[key].count, 1)),
    }))
    .sort((a, b) => b.value - a.value);
}

function applyTeacherFilters(attempts: AttemptDoc[], filters: TeacherAnalyticsFilters): AttemptDoc[] {
  return attempts.filter((attempt) => {
    if (filters.classLevel && attempt.classLevel !== filters.classLevel) {
      return false;
    }

    if (filters.studentId && attempt.studentId !== filters.studentId) {
      return false;
    }

    if (filters.subject && attempt.subject !== filters.subject) {
      return false;
    }

    if (filters.resultType === 'passed' && !attempt.passed) {
      return false;
    }

    if (filters.resultType === 'failed' && attempt.passed) {
      return false;
    }

    if (filters.startDate) {
      const start = new Date(`${filters.startDate}T00:00:00.000Z`).getTime();
      if (new Date(attempt.completedAt).getTime() < start) {
        return false;
      }
    }

    if (filters.endDate) {
      const end = new Date(`${filters.endDate}T23:59:59.999Z`).getTime();
      if (new Date(attempt.completedAt).getTime() > end) {
        return false;
      }
    }

    return true;
  });
}

export class PerformanceService {
  static async getStudentPerformance(studentId: string): Promise<StudentPerformanceAnalytics> {
    const attempts = await getCollection<AttemptDoc>('attempts', [where('studentId', '==', studentId)]);
    const attemptsCount = attempts.length;
    const totalPercentage = attempts.reduce((total, item) => total + (Number(item.percentage) || 0), 0);
    const passCount = attempts.filter((item) => item.passed).length;

    const subjectAnalytics = toSubjectAnalytics(attempts);
    const trend = toTrendPoints(attempts);
    const strongestSubject = subjectAnalytics[0]?.subject;
    const weakestSubject = subjectAnalytics[subjectAnalytics.length - 1]?.subject;
    const improvementDelta =
      trend.length > 1 ? roundToTwo(trend[trend.length - 1].percentage - trend[0].percentage) : 0;

    return {
      studentId,
      averageScore: attemptsCount > 0 ? roundToTwo(totalPercentage / attemptsCount) : 0,
      attemptsCount,
      passRate: attemptsCount > 0 ? roundToTwo((passCount / attemptsCount) * 100) : 0,
      subjectAnalytics,
      trend,
      strongestSubject,
      weakestSubject,
      improvementDelta,
    };
  }

  static async getTeacherClassAnalytics(teacherId: string): Promise<TeacherClassAnalytics> {
    const attempts = await getCollection<AttemptDoc>('attempts', [where('teacherId', '==', teacherId)]);
    const totalAttempts = attempts.length;
    const totalPercentage = attempts.reduce((total, item) => total + (Number(item.percentage) || 0), 0);
    const passCount = attempts.filter((item) => item.passed).length;

    return {
      teacherId,
      totalAttempts,
      averageScore: totalAttempts > 0 ? roundToTwo(totalPercentage / totalAttempts) : 0,
      passRate: totalAttempts > 0 ? roundToTwo((passCount / totalAttempts) * 100) : 0,
      subjectAnalytics: toSubjectAnalytics(attempts),
      trend: toTrendPoints(attempts),
    };
  }

  static async getTeacherAdvancedAnalytics(
    teacherId: string,
    filters: TeacherAnalyticsFilters = {},
  ): Promise<TeacherAdvancedAnalytics> {
    const allAttempts = await getCollection<AttemptDoc>('attempts', [where('teacherId', '==', teacherId)]);
    const filtered = applyTeacherFilters(allAttempts, filters);

    const totalAttempts = filtered.length;
    const totalPercentage = filtered.reduce((total, item) => total + (Number(item.percentage) || 0), 0);
    const passCount = filtered.filter((item) => item.passed).length;
    const failCount = totalAttempts - passCount;

    const studentMap = allAttempts.reduce<Record<string, { id: string; name: string }>>((acc, item) => {
      if (item.studentId) {
        acc[item.studentId] = {
          id: item.studentId,
          name: item.studentName || item.studentId,
        };
      }
      return acc;
    }, {});

    const subjectAnalytics = toSubjectAnalytics(filtered);
    const leaderboard = toStudentLeaderboard(filtered);
    const topPerformers = leaderboard
      .slice()
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
    const weakStudents = leaderboard
      .filter((item) => item.averageScore < 40)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 10);

    return {
      teacherId,
      totalAttempts,
      filteredAttempts: totalAttempts,
      averageScore: totalAttempts > 0 ? roundToTwo(totalPercentage / totalAttempts) : 0,
      passRate: totalAttempts > 0 ? roundToTwo((passCount / totalAttempts) * 100) : 0,
      passCount,
      failCount,
      subjectAnalytics,
      trend: toTrendPoints(filtered),
      passFailPie: toPassFailPie(filtered),
      classPerformance: toClassPerformance(filtered),
      studentOptions: Object.values(studentMap),
      subjectOptions: Array.from(new Set(allAttempts.map((item) => item.subject).filter(Boolean))).sort(),
      weakestSubject: subjectAnalytics[subjectAnalytics.length - 1]?.subject,
      strongestSubject: subjectAnalytics[0]?.subject,
      weakStudentsCount: weakStudents.length,
      totalStudents: leaderboard.length,
      topPerformers,
      weakStudents,
      subjectHeatmap: toSubjectHeatmap(subjectAnalytics),
      subjectDistribution: toSubjectDistribution(filtered),
    };
  }
}
