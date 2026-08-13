import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { User } from '../types/models';
import { firebaseAuth, firestoreDb } from './config';

function usernameToEmail(username: string) {
  const normalized = username.trim().toLowerCase().replace(/\s+/g, '.');
  if (normalized === 'quizapp_superadminupadesh') {
    return 'admin@quizmaster.com';
  }
  return `${normalized}@quizmaster.local`;
}

export async function registerWithUsername(params: {
  username: string;
  password: string;
  fullName: string;
  role: User['role'];
  classLevel?: User['classLevel'];
  assignedClasses?: number[];
  teachingSubjects?: string[];
  qualification?: string;
  mobileNumber?: string;
  email?: string;
  isApproved?: boolean;
}) {
  console.log('[FirebaseAuth] register:start', {
    username: params.username,
    role: params.role,
    classLevel: params.classLevel ?? null,
  });
  const email = params.email && params.email.trim() ? params.email.trim() : usernameToEmail(params.username);
  const credential = await createUserWithEmailAndPassword(firebaseAuth, usernameToEmail(params.username), params.password);

  await updateProfile(credential.user, { displayName: params.fullName });

  await setDoc(doc(firestoreDb, 'users', credential.user.uid), {
    uid: credential.user.uid,
    username: params.username,
    email: params.email || email,
    fullName: params.fullName,
    role: params.role,
    classLevel: params.classLevel ?? null,
    assignedClasses: params.assignedClasses ?? (params.role === 'teacher' ? [8, 9, 10] : undefined),
    teachingSubjects: params.teachingSubjects ?? (params.role === 'teacher' ? ['Mathematics', 'Science'] : undefined),
    qualification: params.qualification ?? null,
    mobileNumber: params.mobileNumber ?? null,
    initialPassword: params.password,
    isActive: true,
    isApproved: params.isApproved ?? (params.role === 'teacher' ? false : true),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log('[FirebaseAuth] register:success', {
    uid: credential.user.uid,
    username: params.username,
    role: params.role,
  });

  return credential.user;
}

export async function signInWithUsername(username: string, password: string) {
  console.log('[FirebaseAuth] login:start', { username });
  const email = usernameToEmail(username);
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  console.log('[FirebaseAuth] login:success', { uid: credential.user.uid, username });
  return credential.user;
}

export async function getUserProfile(uid: string) {
  console.log('[FirebaseAuth] profile:get:start', { uid });
  const snapshot = await getDoc(doc(firestoreDb, 'users', uid));
  console.log('[FirebaseAuth] profile:get:success', { uid, found: snapshot.exists() });
  return snapshot.exists() ? snapshot.data() : null;
}
