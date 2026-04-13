export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  classLevel?: 8 | 9 | 10;
  mobileNumber?: string;
  parentName?: string;
  parentMobileNumber?: string;
  email?: string;
  address?: string;
  rollNumber?: string;
  section?: string;
  admissionNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description?: string;
  classLevel: 8 | 9 | 10;
  totalQuestions: number;
  timeLimitMinutes: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  passPercentage?: number;
  negativeMarking?: number;
  instructions?: string;
  shuffleQuestions?: boolean;
  allowReview?: boolean;
  tags?: string[];
  status?: 'draft' | 'published';
  isPublished?: boolean;
  createdBy?: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks?: number;
}

export interface StudentRecord {
  id: string;
  username: string;
  fullName: string;
  mobileNumber?: string;
  parentName?: string;
  parentMobileNumber?: string;
  email?: string;
  address?: string;
  rollNumber?: string;
  section?: string;
  admissionNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  initialPassword?: string;
  classLevel: 8 | 9 | 10;
  isActive: boolean;
  role: 'student';
}

export interface StudentRegistrationRequest {
  id: string;
  username: string;
  fullName: string;
  initialPassword: string;
  mobileNumber: string;
  parentName?: string;
  parentMobileNumber?: string;
  email?: string;
  address?: string;
  rollNumber?: string;
  section?: string;
  admissionNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  classLevel: 8 | 9 | 10;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface SubjectAnalytics {
  subject: string;
  attempts: number;
  averagePercentage: number;
}

export interface TrendPoint {
  label: string;
  percentage: number;
}

export interface AttemptPayload {
  studentId: string;
  studentName?: string;
  quizId: string;
  quizTitle?: string;
  teacherId?: string;
  subject: string;
  classLevel: 8 | 9 | 10;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, string>;
  startedAt: string;
  completedAt: string;
}

export interface AttemptResult {
  quizId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

export interface StudentPerformanceAnalytics {
  studentId: string;
  averageScore: number;
  attemptsCount: number;
  passRate: number;
  subjectAnalytics: SubjectAnalytics[];
  trend: TrendPoint[];
  strongestSubject?: string;
  weakestSubject?: string;
  improvementDelta: number;
}

export interface TeacherClassAnalytics {
  teacherId: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  subjectAnalytics: SubjectAnalytics[];
  trend: TrendPoint[];
}

export interface TeacherAnalyticsFilters {
  classLevel?: 8 | 9 | 10;
  studentId?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  resultType?: 'all' | 'passed' | 'failed';
}

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export interface ClassBarPoint {
  label: string;
  value: number;
}

export interface StudentLeaderboardEntry {
  studentId: string;
  studentName: string;
  classLevel: 8 | 9 | 10;
  averageScore: number;
  attempts: number;
  weakestSubject?: string;
  weakestSubjectScore?: number;
}

export interface SubjectHeatmapPoint {
  subject: string;
  averageScore: number;
  level: 'low' | 'medium' | 'high';
}

export interface TeacherAdvancedAnalytics extends TeacherClassAnalytics {
  filteredAttempts: number;
  passCount: number;
  failCount: number;
  passFailPie: PieSlice[];
  classPerformance: ClassBarPoint[];
  studentOptions: Array<{ id: string; name: string }>;
  subjectOptions: string[];
  weakestSubject?: string;
  strongestSubject?: string;
  weakStudentsCount: number;
  totalStudents: number;
  topPerformers: StudentLeaderboardEntry[];
  weakStudents: StudentLeaderboardEntry[];
  subjectHeatmap: SubjectHeatmapPoint[];
  subjectDistribution: PieSlice[];
}
