import {
  addDocument,
  getCollection,
  getDocument,
  updateDocument,
  where,
} from '../../firebase/firestore';
import { PasswordResetRequest, User, UserRole } from '../../types/models';

export class PasswordResetService {
  static async requestPasswordReset(username: string): Promise<{ target: 'Teacher' | 'Admin'; role: UserRole }> {
    const queryName = username.trim();
    if (!queryName) {
      throw new Error('Please enter your username.');
    }

    // Lookup user in Firestore users collection
    const userRecords = await getCollection<User>('users', [
      where('username', '==', queryName),
    ]);

    let matchedUser = userRecords[0];

    // Fallback search if username case-sensitivity varies
    if (!matchedUser) {
      const allUsers = await getCollection<User>('users');
      matchedUser = allUsers.find((u) => u.username.toLowerCase() === queryName.toLowerCase()) as User;
    }

    if (!matchedUser) {
      throw new Error(`Username "${queryName}" not found in system. Please verify your username.`);
    }

    // Check if there is already a pending reset request
    const existingRequests = await getCollection<PasswordResetRequest>('passwordResetRequests', [
      where('username', '==', matchedUser.username),
      where('status', '==', 'pending'),
    ]);

    if (existingRequests.length > 0) {
      const targetRole = matchedUser.role === 'student' ? 'Teacher' : 'Admin';
      throw new Error(`A password reset notification for @${matchedUser.username} is already pending with the ${targetRole}.`);
    }

    // Create password reset notification request
    const isStudent = matchedUser.role === 'student';
    await addDocument('passwordResetRequests', {
      userId: matchedUser.id || '',
      username: matchedUser.username,
      fullName: matchedUser.fullName || matchedUser.username,
      userRole: matchedUser.role,
      classLevel: matchedUser.classLevel ?? 8,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    });

    return {
      target: isStudent ? 'Teacher' : 'Admin',
      role: matchedUser.role,
    };
  }

  static async getPendingResetRequests(filterForRole: 'admin' | 'teacher'): Promise<PasswordResetRequest[]> {
    const allPending = await getCollection<PasswordResetRequest>('passwordResetRequests', [
      where('status', '==', 'pending'),
    ]);

    if (filterForRole === 'admin') {
      // Super Admin resolves teacher and admin reset notifications
      return allPending.filter((req) => req.userRole === 'teacher' || req.userRole === 'superadmin');
    } else {
      // Teacher resolves student reset notifications
      return allPending.filter((req) => req.userRole === 'student');
    }
  }

  static async resolvePasswordReset(requestId: string, newPassword: string, resolvedBy: string): Promise<void> {
    if (!newPassword || newPassword.trim().length < 4) {
      throw new Error('New password must be at least 4 characters long.');
    }

    const resetReq = await getDocument<PasswordResetRequest>('passwordResetRequests', requestId);
    if (!resetReq) {
      throw new Error('Reset request record not found.');
    }

    // Update target user's password in users collection
    const userRecords = await getCollection<User>('users', [
      where('username', '==', resetReq.username),
    ]);

    const targetUser = userRecords[0];
    if (targetUser && targetUser.id) {
      await updateDocument('users', targetUser.id, {
        initialPassword: newPassword.trim(),
      });
    }

    // Update request status to resolved
    await updateDocument('passwordResetRequests', requestId, {
      status: 'resolved',
      newPassword: newPassword.trim(),
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    });
  }

  static async rejectPasswordReset(requestId: string): Promise<void> {
    await updateDocument('passwordResetRequests', requestId, {
      status: 'rejected',
      resolvedAt: new Date().toISOString(),
    });
  }
}
