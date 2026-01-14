// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcGdyuTeyhIqw24_HaNvFumS7Tibvm2gw",
  authDomain: "pronunciation-feedback-s-b5e3e.firebaseapp.com",
  projectId: "pronunciation-feedback-s-b5e3e",
  storageBucket: "pronunciation-feedback-s-b5e3e.firebasestorage.app",
  messagingSenderId: "857357410813",
  appId: "1:857357410813:web:48fda850dffde3930c3994",
};

const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with explicit AsyncStorage persistence for React Native
// This ensures user stays logged in even after app is closed
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  // If already initialized, get the existing instance
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
  console.log('⚠️ Firebase Auth already initialized, using existing instance');
}

const db = getFirestore(app);

export { auth, db };
