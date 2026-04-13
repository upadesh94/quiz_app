import { getDocument, setDocument } from '../../firebase/firestore';
import { User } from '../../types/models';

export class TeacherProfileService {
  static async getProfile(userId: string) {
    return getDocument<User>('users', userId);
  }

  static async saveProfile(userId: string, payload: { username: string; fullName: string }) {
    await setDocument('users', userId, {
      uid: userId,
      username: payload.username,
      fullName: payload.fullName,
      role: 'teacher',
      isActive: true,
    });
  }
}
