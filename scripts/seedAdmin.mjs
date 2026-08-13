import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seedSuperAdmin() {
  const email = 'admin@quizmaster.com';
  const password = 'itsme@adminupadesh'; // Change this in production
  const username = 'quizapp_superadminupadesh';

  console.log(`[SEED] Attempting to create Super Admin account for ${username}...`);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(`[SEED] Authentication created. UID: ${user.uid}`);

    await setDoc(doc(db, 'users', user.uid), {
      username: username,
      fullName: 'System Super Admin',
      email: email,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString()
    });

    console.log('[SEED] ✅ Super Admin document created in Firestore successfully.');
    console.log('[SEED] You can now log into the application using these credentials.');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('[SEED] ⚠️ Super Admin account already exists in Firebase Auth. Skipping creation.');
    } else {
      console.error('[SEED] ❌ Error creating Super Admin:', error);
    }
    process.exit(1);
  }
}

seedSuperAdmin();
