import { Quiz } from '../../types/models';
import { addDocument, getCollection, getDocument, where } from '../../firebase/firestore';

export class QuizService {
  static async getQuizById(quizId: string): Promise<Quiz | null> {
    return getDocument<Quiz>('quizzes', quizId);
  }

  static async getAvailableQuizzes(): Promise<Quiz[]> {
    const data = await getCollection<Quiz>('quizzes', [where('isPublished', '==', true)]);

    if (data.length > 0) {
      return data;
    }

    return [
      {
        id: 'quiz-1',
        title: 'Algebra Basics',
        subject: 'Math',
        classLevel: 8,
        totalQuestions: 10,
        timeLimitMinutes: 10,
        isPublished: true,
      },
    ];
  }

  static async createQuiz(payload: {
    title: string;
    subject: string;
    description?: string;
    classLevel: 8 | 9 | 10;
    timeLimitMinutes: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    passPercentage?: number;
    negativeMarking?: number;
    instructions?: string;
    shuffleQuestions?: boolean;
    allowReview?: boolean;
    tags?: string[];
    status?: 'draft' | 'published';
    createdBy: string;
    isPublished?: boolean;
  }) {
    const id = await addDocument('quizzes', {
      title: payload.title,
      subject: payload.subject,
      description: payload.description ?? '',
      classLevel: payload.classLevel,
      timeLimitMinutes: payload.timeLimitMinutes,
      difficulty: payload.difficulty ?? 'medium',
      passPercentage: payload.passPercentage ?? 40,
      negativeMarking: payload.negativeMarking ?? 0,
      instructions: payload.instructions ?? '',
      shuffleQuestions: payload.shuffleQuestions ?? false,
      allowReview: payload.allowReview ?? true,
      tags: payload.tags ?? [],
      status: payload.status ?? 'published',
      totalQuestions: 0,
      createdBy: payload.createdBy,
      isPublished: payload.isPublished ?? true,
      createdAt: new Date().toISOString(),
    });

    return id;
  }

  static async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    return getCollection<Quiz>('quizzes', [where('createdBy', '==', teacherId)]);
  }
}
