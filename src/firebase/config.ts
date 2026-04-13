import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBTOa2LT4sNu2mQVVnw_3-aGAYmDNWkSsQ',
  authDomain: 'quizapp-77d6d.firebaseapp.com',
  projectId: 'quizapp-77d6d',
  storageBucket: 'quizapp-77d6d.firebasestorage.app',
  messagingSenderId: '672345219554',
  appId: '1:672345219554:web:9a431977b8030ee5f499bb',
  measurementId: 'G-3X3HP2NCRY',
};

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = (() => {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  // Use dynamic import for React Native-specific persistence
  const { getReactNativePersistence } = require('firebase/auth');
  return initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
})();
export const firestoreDb = getFirestore(firebaseApp);

export async function initializeWebAnalytics() {
  if (Platform.OS !== 'web') {
    return null;
  }

  const { getAnalytics, isSupported } = await import('firebase/analytics');
  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  return getAnalytics(firebaseApp);
}
