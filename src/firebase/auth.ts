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
  return `${normalized}@quizmaster.local`;
}

export async function registerWithUsername(params: {
  username: string;
  password: string;
  fullName: string;
  role: User['role'];
  classLevel?: User['classLevel'];
}) {
  console.log('[FirebaseAuth] register:start', {
    username: params.username,
    role: params.role,
    classLevel: params.classLevel ?? null,
  });
  const email = usernameToEmail(params.username);
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, params.password);

  await updateProfile(credential.user, { displayName: params.fullName });

  await setDoc(doc(firestoreDb, 'users', credential.user.uid), {
    uid: credential.user.uid,
    username: params.username,
    email,
    fullName: params.fullName,
    role: params.role,
    classLevel: params.classLevel ?? null,
    isActive: true,
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
