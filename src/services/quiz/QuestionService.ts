import { addDocument, getCollection, where } from '../../firebase/firestore';
import { Question } from '../../types/models';

export class QuestionService {
  static async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const data = await getCollection<Question>('questions', [where('quizId', '==', quizId)]);

    if (data.length > 0) {
      return data;
    }

    return [
      {
        id: 'q1',
        quizId,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        marks: 1,
      },
      {
        id: 'q2',
        quizId,
        question: 'What is 3 x 3?',
        options: ['6', '8', '9', '12'],
        correctAnswer: '9',
        marks: 1,
      },
    ];
  }

  static async createQuestion(payload: {
    quizId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    marks?: number;
  }) {
    const id = await addDocument('questions', {
      quizId: payload.quizId,
      question: payload.question,
      options: payload.options,
      correctAnswer: payload.correctAnswer,
      marks: payload.marks ?? 1,
    });

    return id;
  }
}
