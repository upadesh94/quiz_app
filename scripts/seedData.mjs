import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTOa2LT4sNu2mQVVnw_3-aGAYmDNWkSsQ",
  authDomain: "quizapp-77d6d.firebaseapp.com",
  projectId: "quizapp-77d6d",
  storageBucket: "quizapp-77d6d.firebasestorage.app",
  messagingSenderId: "672345219554",
  appId: "1:672345219554:web:f08b471c48609060f499bb",
  measurementId: "G-RV04HMEJT5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function usernameToEmail(username) {
  const normalized = username.trim().toLowerCase().replace(/\s+/g, '.');
  return `${normalized}@quizmaster.local`;
}

async function createDemoAccountsAndData() {
  console.log("Starting seeding process...");
  
  // 1. Create Teacher
  const teacherUsername = 'demo_teacher';
  const teacherPassword = 'Password123!';
  const teacherEmail = usernameToEmail(teacherUsername);
  
  try {
    const tCred = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
    await updateProfile(tCred.user, { displayName: 'Demo Teacher' });
    await setDoc(doc(db, 'users', tCred.user.uid), {
      uid: tCred.user.uid,
      username: teacherUsername,
      email: teacherEmail,
      fullName: 'Demo Teacher',
      role: 'teacher',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Teacher created successfully: username: ${teacherUsername} / password: ${teacherPassword}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('Teacher already exists. Skipping creation.');
    } else {
      console.error('Error creating teacher:', e);
    }
  }

  // 2. Create Student
  const studentUsername = 'demo_student';
  const studentPassword = 'Password123!';
  const studentEmail = usernameToEmail(studentUsername);
  
  try {
    const sCred = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
    await updateProfile(sCred.user, { displayName: 'Demo Student' });
    await setDoc(doc(db, 'users', sCred.user.uid), {
      uid: sCred.user.uid,
      username: studentUsername,
      email: studentEmail,
      fullName: 'Demo Student',
      role: 'student',
      classLevel: 10,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Student created successfully: username: ${studentUsername} / password: ${studentPassword}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('Student already exists. Skipping creation.');
    } else {
      console.error('Error creating student:', e);
    }
  }

  // 3. Create Sample Quiz
  try {
    const quizPayload = {
      title: 'Demo Science Quiz',
      subject: 'Science',
      description: 'A demo quiz for testing.',
      classLevel: 10,
      totalQuestions: 2,
      timeLimitMinutes: 10,
      difficulty: 'easy',
      passPercentage: 50,
      status: 'published',
      isPublished: true,
      createdBy: 'demo_teacher',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const quizRef = await addDoc(collection(db, 'quizzes'), quizPayload);
    console.log(`Quiz created with ID: ${quizRef.id}`);

    await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), {
      quizId: quizRef.id,
      question: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'],
      correctAnswer: 'H2O',
      marks: 1
    });

    await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), {
      quizId: quizRef.id,
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctAnswer: 'Mars',
      marks: 1
    });

    console.log('Sample questions created successfully.');

  } catch (e) {
    console.error('Error creating quiz:', e);
  }
  
  console.log('Seeding completed.');
  process.exit(0);
}

createDemoAccountsAndData();
