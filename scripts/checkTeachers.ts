import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcGdyuTeyhIqw24_HaNvFumS7Tibvm2gw",
  authDomain: "pronunciation-feedback-s-b5e3e.firebaseapp.com",
  projectId: "pronunciation-feedback-s-b5e3e",
  storageBucket: "pronunciation-feedback-s-b5e3e.firebasestorage.app",
  messagingSenderId: "857357410813",
  appId: "1:857357410813:web:48fda850dffde3930c3994",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTeacherAccounts() {
  try {
    console.log('🔍 Checking for existing teacher accounts...\n');
    
    const teachersRef = collection(db, 'teacherAccounts');
    const snapshot = await getDocs(teachersRef);
    
    if (snapshot.empty) {
      console.log('❌ No teacher accounts found in the database.');
      console.log('\n💡 To create a teacher account:');
      console.log('   1. Login with: ADMIN / ADMIN12345');
      console.log('   2. Register a new teacher account');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} teacher account(s):\n`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('-----------------------------------');
      console.log('Teacher ID:', doc.id);
      console.log('Name:', data.name || 'N/A');
      console.log('Email:', data.email || 'N/A');
      console.log('Role:', data.role || 'N/A');
      console.log('Created:', data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A');
      console.log('-----------------------------------\n');
    });
    
  } catch (error: any) {
    console.error('❌ Error checking teacher accounts:', error.message);
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Firebase security rules may be blocking access.');
      console.log('    Check your Firestore security rules in Firebase Console.');
    }
  }
}

checkTeacherAccounts();
