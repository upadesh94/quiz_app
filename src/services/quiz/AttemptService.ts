import { addDocument, getCollection, deleteDocument, where } from '../../firebase/firestore';
import { AttemptPayload } from '../../types/models';

export class AttemptService {
  static async submitAttempt(payload: AttemptPayload) {
    console.log('[AttemptService] submit:start', {
      studentId: payload.studentId,
      quizId: payload.quizId,
      subject: payload.subject,
      score: payload.score,
      percentage: payload.percentage,
    });

    const id = await addDocument('attempts', payload);

    console.log('[AttemptService] submit:success', {
      id,
      studentId: payload.studentId,
      quizId: payload.quizId,
      percentage: payload.percentage,
    });

    return { id, ...payload };
  }

  static async hasStudentAttemptedQuiz(studentId: string, quizId: string): Promise<boolean> {
    const attempts = await getCollection('attempts', [
      where('studentId', '==', studentId),
      where('quizId', '==', quizId)
    ]);
    return attempts.length > 0;
  }

  static async deleteAttempt(studentId: string, quizId: string): Promise<void> {
    const attempts = await getCollection<{ id: string }>('attempts', [
      where('studentId', '==', studentId),
      where('quizId', '==', quizId)
    ]);
    for (const attempt of attempts) {
      await deleteDocument('attempts', attempt.id);
    }
  }
}
