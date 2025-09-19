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
import { auth, db } from "../../../firebase";

export default function CreatePlayername({ navigation }: any) {
  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // ✅ Fetch existing player name
        const playerRef = doc(db, "Playername", user.uid);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
          const existingName = playerSnap.data().playerName;
          if (existingName) {
            setPlayerName(existingName); // Auto-fill input
          }
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSave = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Please enter a valid player name.");
      return;
    }
    if (!userId) return;

    setLoading(true);
    try {
      const playerRef = doc(db, "Playername", userId);
      await setDoc(
        playerRef,
        {
          playerName,
          userId,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      navigation.replace("GameMenu"); // ✅ Redirect to game menu
    } catch (error: any) {
      Alert.alert("Error", "Failed to save player name. Please try again.");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>

      {/* 🎮 Game Panel Modal */}
      <View style={styles.modalPanel}>
        <Text style={styles.title}>Create Your Player Name</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter player name"
          placeholderTextColor="#ccc"
          value={playerName}
          onChangeText={setPlayerName}
          editable={!playerName} // ❌ Disable editing if already exists
        />

        <TouchableOpacity
          style={[styles.continueButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
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
    alignItems: "center", // center horizontally
    backgroundColor: "#1c1c1c", // dark game background
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  backText: {
    fontSize: 16,
    color: "#FFD700", // gold accent
    fontWeight: "600",
  },
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
    backgroundColor: "#FFD700", // gold button
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: {
    color: "#1c1c1c",
    fontSize: 16,
    fontWeight: "700",
  },
});
