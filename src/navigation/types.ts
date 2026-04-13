import { UserRole } from '../types/models';

export type RootStackParamList = {
  Splash: undefined;
  RoleSelection: undefined;
  Login: { role: UserRole };
  Register: { role: UserRole };
  ForgotPassword: undefined;
  StudentDashboard: undefined;
  AvailableQuizzes: undefined;
  QuizAttempt: { quizId: string };
  QuizResult: { quizId: string; score: number; totalMarks: number; percentage: number };
  PerformanceAnalytics: undefined;
  TeacherDashboard: undefined;
  CreateQuiz: undefined;
  AddQuestions: { quizId: string };
  ManageStudents: undefined;
  ClassAnalytics: undefined;
  Profile: undefined;
};
