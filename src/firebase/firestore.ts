import {
  CollectionReference,
  DocumentData,
  QueryConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestoreDb } from './config';

function sanitizePayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, itemValue]) => {
      if (/password|token/i.test(key)) {
        acc[key] = '***';
      } else {
        acc[key] = sanitizePayload(itemValue);
      }
      return acc;
    }, {});
  }

  return value;
}

function logFirestore(action: string, details: Record<string, unknown>) {
  console.log(`[Firestore] ${action}`, sanitizePayload(details));
}

function typedCollection<T extends DocumentData>(name: string) {
  return collection(firestoreDb, name) as CollectionReference<T>;
}

export async function getCollection<T extends DocumentData>(name: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  logFirestore('getCollection:start', { collection: name, constraintsCount: constraints.length });
  const collectionRef = typedCollection<T>(name);
  const collectionQuery = constraints.length ? query(collectionRef, ...constraints) : collectionRef;
  const snapshot = await getDocs(collectionQuery);
  logFirestore('getCollection:success', { collection: name, count: snapshot.size });
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T & { id: string });
}

export async function addDocument<T extends DocumentData>(name: string, payload: T) {
  logFirestore('addDocument:start', { collection: name, payload });
  const ref = await addDoc(typedCollection<T>(name), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  logFirestore('addDocument:success', { collection: name, id: ref.id });
  return ref.id;
}

export async function setDocument<T extends DocumentData>(name: string, id: string, payload: T) {
  logFirestore('setDocument:start', { collection: name, id, payload });
  await setDoc(doc(firestoreDb, name, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  logFirestore('setDocument:success', { collection: name, id });
}

export async function updateDocument<T extends DocumentData>(name: string, id: string, payload: Partial<T>) {
  logFirestore('updateDocument:start', { collection: name, id, payload });
  await updateDoc(doc(firestoreDb, name, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  logFirestore('updateDocument:success', { collection: name, id });
}

export async function getDocument<T extends DocumentData>(name: string, id: string) {
  logFirestore('getDocument:start', { collection: name, id });
  const snapshot = await getDoc(doc(firestoreDb, name, id));
  if (!snapshot.exists()) {
    logFirestore('getDocument:notFound', { collection: name, id });
    return null;
  }

  logFirestore('getDocument:success', { collection: name, id });
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function deleteDocument(name: string, id: string) {
  logFirestore('deleteDocument:start', { collection: name, id });
  await deleteDoc(doc(firestoreDb, name, id));
  logFirestore('deleteDocument:success', { collection: name, id });
}

export { where };
