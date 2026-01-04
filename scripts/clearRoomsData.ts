// Script to clear all rooms data from Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function clearRoomsData() {
  console.log("🔥 Starting to clear rooms data...\n");

  try {
    // Collections to clear
    const collectionsToCheck = [
      "Rooms",           // Teacher-created rooms
      "StudentProgress", // Student progress in rooms
      "RoomProgress",    // Room-level progress tracking
    ];

    for (const collectionName of collectionsToCheck) {
      console.log(`📂 Checking collection: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      if (snapshot.empty) {
        console.log(`   ✓ Collection is already empty\n`);
        continue;
      }

      console.log(`   Found ${snapshot.size} documents`);
      let deletedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        deletedCount++;
        console.log(`   ✓ Deleted: ${docSnapshot.id}`);
      }

      console.log(`   ✅ Deleted ${deletedCount} documents from ${collectionName}\n`);
    }

    console.log("✅ All rooms data cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
}

clearRoomsData();
