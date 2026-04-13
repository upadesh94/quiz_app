(async () => {
  const [{ initializeApp }, { getAuth, signInAnonymously }, { addDoc, collection, getDocs, getFirestore, query, where, serverTimestamp }] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);

  const firebaseConfig = {
    apiKey: 'AIzaSyBTOa2LT4sNu2mQVVnw_3-aGAYmDNWkSsQ',
    authDomain: 'quizapp-77d6d.firebaseapp.com',
    projectId: 'quizapp-77d6d',
    storageBucket: 'quizapp-77d6d.firebasestorage.app',
    messagingSenderId: '672345219554',
    appId: '1:672345219554:web:9a431977b8030ee5f499bb',
    measurementId: 'G-3X3HP2NCRY',
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInAnonymously(auth);

  const username = 'manglsing_rathod';
  const password = '123123';

  const existing = await getDocs(query(collection(db, 'users'), where('username', '==', username)));

  if (!existing.empty) {
    console.log(`[seed] Student already exists with username: ${username}`);
    process.exit(0);
  }

  const payload = {
    username,
    fullName: 'Manglsing Rathod',
    classLevel: 10,
    initialPassword: password,
    mobileNumber: '9876543210',
    parentName: 'Ramesh Rathod',
    parentMobileNumber: '9876500000',
    email: 'manglsing.rathod@example.com',
    address: 'Demo Address, Jaipur',
    rollNumber: 'R-102',
    section: 'A',
    admissionNumber: 'ADM-2026-102',
    dateOfBirth: '2009-07-15',
    gender: 'male',
    role: 'student',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'users'), payload);
  console.log('[seed] Student created successfully');
  console.log(`[seed] id: ${ref.id}`);
  console.log(`[seed] username: ${username}`);
  console.log(`[seed] password: ${password}`);
})().catch((error) => {
  console.error('[seed] Failed to create demo student');
  console.error(error?.message || error);
  process.exit(1);
});
