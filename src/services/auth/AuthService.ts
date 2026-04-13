import { getUserProfile, registerWithUsername, signInWithUsername } from '../../firebase/auth';
import { getCollection, where } from '../../firebase/firestore';
import { StudentService } from '../teacher/StudentService';
import { User, UserRole } from '../../types/models';

const DEMO_STUDENT = {
  username: 'student_demo',
  password: 'student123',
};

const DEMO_TEACHER = {
  username: 'teacher_demo',
  password: 'teacher123',
};

type TeacherManagedStudent = {
  id: string;
  username: string;
  fullName: string;
  classLevel?: 8 | 9 | 10;
  role: 'student';
  initialPassword?: string;
  isActive?: boolean;
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
};

function isFirebaseEmailAlreadyUsed(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes('email-already-in-use');
}

export class AuthService {
  static getDemoCredentials() {
    return {
      student: DEMO_STUDENT,
      teacher: DEMO_TEACHER,
    };
  }

  static async login(username: string, password: string, role: UserRole) {
    console.log('[AuthService] login:start', { username, role });

    if (role === 'student' && username === DEMO_STUDENT.username && password === DEMO_STUDENT.password) {
      console.log('[AuthService] login:demo-success', { username, role: 'student' });
      return {
        token: 'demo-student-token',
        user: {
          id: 'demo-student-1',
          username: DEMO_STUDENT.username,
          fullName: 'Demo Student',
          role: 'student' as const,
          classLevel: 9 as const,
        },
      };
    }

    if (role === 'teacher' && username === DEMO_TEACHER.username && password === DEMO_TEACHER.password) {
      console.log('[AuthService] login:demo-success', { username, role: 'teacher' });
      return {
        token: 'demo-teacher-token',
        user: {
          id: 'demo-teacher-1',
          username: DEMO_TEACHER.username,
          fullName: 'Demo Teacher',
          role: 'teacher' as const,
        },
      };
    }

    try {
      const firebaseUser = await signInWithUsername(username, password);
      const profile = await getUserProfile(firebaseUser.uid);

      const appUser: User = {
        id: firebaseUser.uid,
        username: (profile?.username as string) ?? username,
        fullName: (profile?.fullName as string) ?? firebaseUser.displayName ?? username,
        role: (profile?.role as UserRole) ?? role,
        classLevel: profile?.classLevel as User['classLevel'],
        mobileNumber: profile?.mobileNumber as User['mobileNumber'],
        parentName: profile?.parentName as User['parentName'],
        parentMobileNumber: profile?.parentMobileNumber as User['parentMobileNumber'],
        email: profile?.email as User['email'],
        address: profile?.address as User['address'],
        rollNumber: profile?.rollNumber as User['rollNumber'],
        section: profile?.section as User['section'],
        admissionNumber: profile?.admissionNumber as User['admissionNumber'],
        dateOfBirth: profile?.dateOfBirth as User['dateOfBirth'],
        gender: profile?.gender as User['gender'],
      };

      if (appUser.role !== role) {
        throw new Error(`Please login from ${appUser.role} section.`);
      }

      const token = await firebaseUser.getIdToken();

      if (role === 'student') {
        const records = await getCollection<TeacherManagedStudent>('users', [where('username', '==', appUser.username)]);
        const studentRecord = records.find((item) => item.role === 'student');

        if (studentRecord && studentRecord.isActive === false) {
          throw new Error('Your student account is inactive. Please contact your teacher.');
        }

        if (studentRecord) {
          appUser.classLevel = studentRecord.classLevel ?? appUser.classLevel;
          appUser.mobileNumber = studentRecord.mobileNumber ?? appUser.mobileNumber;
          appUser.parentName = studentRecord.parentName ?? appUser.parentName;
          appUser.parentMobileNumber = studentRecord.parentMobileNumber ?? appUser.parentMobileNumber;
          appUser.email = studentRecord.email ?? appUser.email;
          appUser.address = studentRecord.address ?? appUser.address;
          appUser.rollNumber = studentRecord.rollNumber ?? appUser.rollNumber;
          appUser.section = studentRecord.section ?? appUser.section;
          appUser.admissionNumber = studentRecord.admissionNumber ?? appUser.admissionNumber;
          appUser.dateOfBirth = studentRecord.dateOfBirth ?? appUser.dateOfBirth;
          appUser.gender = studentRecord.gender ?? appUser.gender;
        }
      }

      console.log('[AuthService] login:success', {
        uid: appUser.id,
        username: appUser.username,
        role: appUser.role,
      });

      return {
        token,
        user: appUser,
      };
    } catch (firebaseError) {
      // Fallback for students created by teacher in Firestore without Firebase Auth credentials.
      if (role === 'student') {
        const records = await getCollection<TeacherManagedStudent>('users', [where('username', '==', username)]);
        const studentRecord = records.find(
          (item) => item.role === 'student' && (item.initialPassword ?? '') === password,
        );

        if (studentRecord) {
          if (studentRecord.isActive === false) {
            throw new Error('Your student account is inactive. Please contact your teacher.');
          }

          // Ensure Firebase Email/Password account exists for this approved/teacher-managed student.
          try {
            await registerWithUsername({
              username: studentRecord.username,
              password,
              fullName: studentRecord.fullName,
              role: 'student',
              classLevel: studentRecord.classLevel,
            });

            console.log('[AuthService] login:fallback-student-provisioned-firebase-auth', {
              username: studentRecord.username,
            });
          } catch (provisionError) {
            if (!isFirebaseEmailAlreadyUsed(provisionError)) {
              throw provisionError;
            }
          }

          const firebaseUser = await signInWithUsername(username, password);
          const profile = await getUserProfile(firebaseUser.uid);

          console.log('[AuthService] login:fallback-student-success', {
            uid: firebaseUser.uid,
            username,
            role: 'student',
          });

          return {
            token: await firebaseUser.getIdToken(),
            user: {
              id: firebaseUser.uid,
              username: (profile?.username as string) ?? studentRecord.username,
              fullName: (profile?.fullName as string) ?? studentRecord.fullName,
              role: 'student' as const,
              classLevel: (profile?.classLevel as User['classLevel']) ?? studentRecord.classLevel,
              mobileNumber: (profile?.mobileNumber as User['mobileNumber']) ?? studentRecord.mobileNumber,
              parentName: (profile?.parentName as User['parentName']) ?? studentRecord.parentName,
              parentMobileNumber: (profile?.parentMobileNumber as User['parentMobileNumber']) ?? studentRecord.parentMobileNumber,
              email: (profile?.email as User['email']) ?? studentRecord.email,
              address: (profile?.address as User['address']) ?? studentRecord.address,
              rollNumber: (profile?.rollNumber as User['rollNumber']) ?? studentRecord.rollNumber,
              section: (profile?.section as User['section']) ?? studentRecord.section,
              admissionNumber: (profile?.admissionNumber as User['admissionNumber']) ?? studentRecord.admissionNumber,
              dateOfBirth: (profile?.dateOfBirth as User['dateOfBirth']) ?? studentRecord.dateOfBirth,
              gender: (profile?.gender as User['gender']) ?? studentRecord.gender,
            },
          };
        }
      }

      console.log('[AuthService] login:failed', {
        username,
        role,
        reason: firebaseError instanceof Error ? firebaseError.message : 'unknown',
      });

      throw new Error('Invalid username or password');
    }
  }

  static async register(params: {
    username: string;
    password: string;
    fullName: string;
    role: UserRole;
    classLevel?: User['classLevel'];
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
  }) {
    console.log('[AuthService] register:start', {
      username: params.username,
      role: params.role,
      classLevel: params.classLevel ?? null,
    });

    if (params.role === 'student') {
      const requestId = await StudentService.submitRegistrationRequest({
        username: params.username,
        fullName: params.fullName,
        classLevel: (params.classLevel ?? 10) as 8 | 9 | 10,
        initialPassword: params.password,
        mobileNumber: params.mobileNumber ?? '',
        parentName: params.parentName,
        parentMobileNumber: params.parentMobileNumber,
        email: params.email,
        address: params.address,
        rollNumber: params.rollNumber,
        section: params.section,
        admissionNumber: params.admissionNumber,
        dateOfBirth: params.dateOfBirth,
        gender: params.gender,
      });

      return {
        uid: requestId,
        username: params.username,
        role: params.role,
        success: true,
        requiresApproval: true,
      };
    }

    const firebaseUser = await registerWithUsername({
      username: params.username,
      password: params.password,
      fullName: params.fullName,
      role: params.role,
      classLevel: params.classLevel,
    });

    return {
      uid: firebaseUser.uid,
      username: params.username,
      role: params.role,
      success: true,
      requiresApproval: false,
    };
  }
}
