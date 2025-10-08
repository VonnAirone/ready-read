import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, db } from "../../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export default function RoomGenerator({ navigation }: any) {
  const [roomName, setRoomName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quizId, setQuizId] = useState(""); // 👈 new

  // 🔑 Fetch teacher's name automatically
  useEffect(() => {
    const fetchTeacherName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const teacherDoc = await getDoc(doc(db, "teacherAccounts", user.uid));
        if (teacherDoc.exists()) {
          const data = teacherDoc.data();
          setCreatorName(data.name || user.email || "Unknown Teacher");
        } else {
          setCreatorName(user.email || "Unknown Teacher");
        }
      } catch (err) {
        console.error("Error fetching teacher name:", err);
        setCreatorName(user.email || "Unknown Teacher");
      }
    };

    fetchTeacherName();
  }, []);

  // Generate unique room code + quizId
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedQuizId = Math.random().toString(36).substring(2, 10); // 👈 random quizId
    setRoomCode(code);
    setQuizId(generatedQuizId);
  };

  // Save to Firestore (only teachers can)
  const saveRoom = async () => {
    if (!roomName || !creatorName || !roomCode || !quizId) {
      Alert.alert("Error", "Please fill in all fields and generate a code.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      // Check if this user is a teacher
      const teacherDoc = await getDoc(doc(db, "teacherAccounts", user.uid));
      if (!teacherDoc.exists()) {
        Alert.alert("Access Denied", "Only teachers can create rooms.");
        return;
      }

      // Save room to Firestore
      const docRef = await addDoc(collection(db, "GenerateRoom"), {
        roomName,
        creatorName,
        roomCode,
        quizId, // 👈 auto-generated
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        creatorEmail: user.email,
      });

      Alert.alert(
        "Success",
        `Room "${roomName}" created with code: ${roomCode}\nQuiz ID: ${quizId}`
      );

      // ✅ Navigate to Room.tsx after creating
      navigation.navigate("Room", {
        roomId: docRef.id,
        roomName,
        creatorName,
        roomCode,
        quizId,
      });

      setRoomName("");
      setRoomCode("");
      setQuizId("");
    } catch (err: any) {
      console.error("Error saving room:", err);
      Alert.alert("Error", "Could not save room. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={async () => {
          try {
            await auth.signOut(); // 👈 sign out first
            navigation.replace("Login"); // rebuilds stack with Login
          } catch (err) {
            console.error("Error signing out:", err);
          }
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create a Room</Text>

      {/* Room Name */}
      <TextInput
        style={styles.input}
        placeholder="Room Name"
        value={roomName}
        onChangeText={setRoomName}
      />

      {/* Creator Name (auto-filled, read-only) */}
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={creatorName}
        editable={false}
      />

      {/* Room Code */}
      <View style={styles.codeRow}>
        <Text style={styles.roomCode}>Room Code: {roomCode || "____"}</Text>
        <TouchableOpacity style={styles.generateBtn} onPress={generateCode}>
          <Text style={styles.btnText}>Generate</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveRoom}>
        <Text style={styles.btnText}>Save Room</Text>
      </TouchableOpacity>

      {/* View Rooms Button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#007AFF", marginTop: 10 }]}
        onPress={() => navigation.navigate("Room")}
      >
        <Text style={styles.btnText}>View Rooms</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  backBtn: { alignSelf: "flex-start", marginBottom: 10 },
  backText: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  roomCode: { fontSize: 18, fontWeight: "600", color: "#444" },
  generateBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: "green",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
