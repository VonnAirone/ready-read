import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { MaterialIcons } from "@expo/vector-icons"; // ✅ for edit icon

export default function CreatePlayername({ navigation }: any) {
  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);

        try {
          const playerRef = doc(db, "Playername", user.uid);
          const playerSnap = await getDoc(playerRef);

          if (playerSnap.exists()) {
            const existingName = playerSnap.data().playerName;
            if (existingName) {
              setPlayerName(existingName);
              setIsExisting(true);
            }
          }
        } catch (error) {
          console.error("Error checking player name:", error);
        }
      } else {
        setUserId(null);
        setEmail(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleSave = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Please enter a valid player name.");
      return;
    }
    if (!userId || !email) return;

    setSaving(true);
    try {
      const playerRef = doc(db, "Playername", userId);
      await setDoc(
        playerRef,
        {
          playerName,
          uid: userId,
          email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      const studentRef = doc(db, "studentAccounts", userId);
      await setDoc(
        studentRef,
        {
          uid: userId,
          role: "student",
          playerName,
          email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      navigation.replace("GameMenu");
    } catch (error: any) {
      Alert.alert("Error", "Failed to save player name. Please try again.");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleEdit = () => {
    setIsExisting(false); // ✅ allow editing again
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {/* Back to Login button on the left */}
        <TouchableOpacity onPress={handleBackToLogin}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        {/* Edit icon on the right (only show if player name exists) */}
        {isExisting && (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <MaterialIcons name="edit" size={24} color="#FFD700" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.modalPanel}>
        <Text style={styles.title}>
          {isExisting ? "Confirm Your Player Name" : "Create Your Player Name"}
        </Text>

        <TextInput
          style={[
            styles.input,
            isExisting && { backgroundColor: "#555", color: "#bbb" },
          ]}
          placeholder="Enter player name"
          placeholderTextColor="#ccc"
          value={playerName}
          onChangeText={(text) =>
            setPlayerName(text.replace(/[^a-zA-Z ]/g, ""))
          }
          autoCapitalize="words"
          editable={!isExisting}
        />

        <TouchableOpacity
          style={[styles.continueButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#1c1c1c" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 20,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between", // ✅ back left, edit right
    alignItems: "center",
  },
  backText: { fontSize: 16, color: "#FFD700", fontWeight: "600" },
  editButton: {},
  modalPanel: {
    width: "90%",
    backgroundColor: "#2c2c2c",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFD700",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#555",
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#3a3a3a",
    color: "#fff",
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: { color: "#1c1c1c", fontSize: 16, fontWeight: "700" },
});
