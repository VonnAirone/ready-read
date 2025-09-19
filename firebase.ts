// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
const auth = getAuth(app);  // 👈 simple auth, no persistence
const db = getFirestore(app);

export { auth, db };
