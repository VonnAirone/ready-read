// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcGdyuTeyhIqw24_HaNvFumS7Tibvm2gw",
  authDomain: "pronunciation-feedback-s-b5e3e.firebaseapp.com",
  projectId: "pronunciation-feedback-s-b5e3e",
  storageBucket: "pronunciation-feedback-s-b5e3e.firebasestorage.app",
  messagingSenderId: "857357410813",
  appId: "1:857357410813:web:48fda850dffde3930c3994",
};

const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistence for React Native
// React Native has built-in auth persistence with AsyncStorage
let auth;
try {
  auth = initializeAuth(app);
} catch (error) {
  // If already initialized, get the existing instance
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
