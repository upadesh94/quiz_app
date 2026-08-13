import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBTOa2LT4sNu2mQVVnw_3-aGAYmDNWkSsQ',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'quizapp-77d6d.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'quizapp-77d6d',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'quizapp-77d6d.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '672345219554',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:672345219554:web:f08b471c48609060f499bb',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RV04HMEJT5'
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
