import {
  addDocument,
  deleteDocument,
  getCollection,
  getDocument,
  updateDocument,
  where,
} from '../../firebase/firestore';
import { StudentRecord, StudentRegistrationRequest } from '../../types/models';

type StudentPayload = {
  username: string;
  fullName: string;
  classLevel: 8 | 9 | 10;
  initialPassword?: string;
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
};

export class StudentService {
  static async getStudentByUsername(username: string): Promise<StudentRecord | null> {
    const records = await getCollection<StudentRecord>('users', [
      where('role', '==', 'student'),
      where('username', '==', username),
    ]);

    return records[0] ?? null;
  }

  static async updateStudentSelfProfile(
    username: string,
    payload: {
      fullName: string;
      mobileNumber?: string;
      parentName?: string;
      parentMobileNumber?: string;
      email?: string;
      address?: string;
    },
  ) {
    const records = await getCollection<StudentRecord>('users', [
      where('role', '==', 'student'),
      where('username', '==', username),
    ]);

    const student = records[0];
    if (!student?.id) {
      throw new Error('Student profile not found.');
    }

    await updateDocument('users', student.id, {
      fullName: payload.fullName,
      mobileNumber: payload.mobileNumber ?? '',
      parentName: payload.parentName ?? '',
      parentMobileNumber: payload.parentMobileNumber ?? '',
      email: payload.email ?? '',
      address: payload.address ?? '',
      role: 'student',
    });
  }

  static async addStudent(payload: StudentPayload) {
    console.log('[StudentService] add:start', {
      username: payload.username,
      classLevel: payload.classLevel,
      mobileNumber: payload.mobileNumber,
    });

    const id = await addDocument('users', {
      username: payload.username,
      fullName: payload.fullName,
      classLevel: payload.classLevel,
      initialPassword: payload.initialPassword ?? '',
      mobileNumber: payload.mobileNumber,
      parentName: payload.parentName ?? '',
      parentMobileNumber: payload.parentMobileNumber ?? '',
      email: payload.email ?? '',
      address: payload.address ?? '',
      rollNumber: payload.rollNumber ?? '',
      section: payload.section ?? '',
      admissionNumber: payload.admissionNumber ?? '',
      dateOfBirth: payload.dateOfBirth ?? '',
      gender: payload.gender ?? 'other',
      role: 'student',
      isActive: true,
    });

    console.log('[StudentService] add:success', { id, username: payload.username });

    return id;
  }

  static async updateStudent(studentId: string, payload: StudentPayload) {
    console.log('[StudentService] update:start', {
      studentId,
      username: payload.username,
      classLevel: payload.classLevel,
    });

    await updateDocument('users', studentId, {
      username: payload.username,
      fullName: payload.fullName,
      classLevel: payload.classLevel,
      ...(payload.initialPassword ? { initialPassword: payload.initialPassword } : {}),
      mobileNumber: payload.mobileNumber,
      parentName: payload.parentName ?? '',
      parentMobileNumber: payload.parentMobileNumber ?? '',
      email: payload.email ?? '',
      address: payload.address ?? '',
      rollNumber: payload.rollNumber ?? '',
      section: payload.section ?? '',
      admissionNumber: payload.admissionNumber ?? '',
      dateOfBirth: payload.dateOfBirth ?? '',
      gender: payload.gender ?? 'other',
      role: 'student',
    });

    console.log('[StudentService] update:success', { studentId, username: payload.username });
  }

  static async deleteStudent(studentId: string) {
    console.log('[StudentService] delete:start', { studentId });
    await deleteDocument('users', studentId);
    console.log('[StudentService] delete:success', { studentId });
  }

  static async getStudentsByClass(classLevel?: 8 | 9 | 10): Promise<StudentRecord[]> {
    if (classLevel) {
      return getCollection<StudentRecord>('users', [
        where('role', '==', 'student'),
        where('classLevel', '==', classLevel),
      ]);
    }

    return getCollection<StudentRecord>('users', [where('role', '==', 'student')]);
  }

  static async submitRegistrationRequest(payload: StudentPayload) {
    const existingStudents = await getCollection<StudentRecord>('users', [where('username', '==', payload.username)]);
    if (existingStudents.length > 0) {
      throw new Error('Username already exists. Please choose another one.');
    }

    const existingRequests = await getCollection<StudentRegistrationRequest>('studentRegistrationRequests', [
      where('username', '==', payload.username),
      where('status', '==', 'pending'),
    ]);
    if (existingRequests.length > 0) {
      throw new Error('Your request is already pending teacher approval.');
    }

    const requestId = await addDocument('studentRegistrationRequests', {
      username: payload.username,
      fullName: payload.fullName,
      initialPassword: payload.initialPassword ?? '',
      mobileNumber: payload.mobileNumber,
      parentName: payload.parentName ?? '',
      parentMobileNumber: payload.parentMobileNumber ?? '',
      email: payload.email ?? '',
      address: payload.address ?? '',
      rollNumber: payload.rollNumber ?? '',
      section: payload.section ?? '',
      admissionNumber: payload.admissionNumber ?? '',
      dateOfBirth: payload.dateOfBirth ?? '',
      gender: payload.gender ?? 'other',
      classLevel: payload.classLevel,
      status: 'pending' as const,
    });

    return requestId;
  }

  static async getPendingRegistrationRequests(): Promise<StudentRegistrationRequest[]> {
    return getCollection<StudentRegistrationRequest>('studentRegistrationRequests', [where('status', '==', 'pending')]);
  }

  static async approveRegistrationRequest(requestId: string, approvedBy: string) {
    const request = await getDocument<StudentRegistrationRequest>('studentRegistrationRequests', requestId);
    if (!request) {
      throw new Error('Registration request not found.');
    }

    if (request.status !== 'pending') {
      throw new Error('This request is already processed.');
    }

    const duplicate = await getCollection<StudentRecord>('users', [where('username', '==', request.username)]);
    if (duplicate.length > 0) {
      throw new Error('Username already exists in student records.');
    }

    await this.addStudent({
      username: request.username,
      fullName: request.fullName,
      classLevel: request.classLevel,
      initialPassword: request.initialPassword,
      mobileNumber: request.mobileNumber,
      parentName: request.parentName,
      parentMobileNumber: request.parentMobileNumber,
      email: request.email,
      address: request.address,
      rollNumber: request.rollNumber,
      section: request.section,
      admissionNumber: request.admissionNumber,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
    });

    await updateDocument('studentRegistrationRequests', requestId, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
    });
  }

  static async rejectRegistrationRequest(requestId: string, rejectedReason?: string) {
    await updateDocument('studentRegistrationRequests', requestId, {
      status: 'rejected',
      rejectedReason: rejectedReason ?? 'Not provided',
    });
  }
}
