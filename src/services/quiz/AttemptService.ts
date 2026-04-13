import { addDocument } from '../../firebase/firestore';
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
}
