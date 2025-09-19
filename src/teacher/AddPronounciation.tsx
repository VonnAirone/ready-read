// src/teacher/AddPronunciation.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddPronunciation({ route, navigation }: any) {
  // ✅ Provide fallback values in case navigation params are missing
  const { roomId = null, roomCode = null, roomName = "Unknown Room" } =
    route.params || {};

  const [difficulty, setDifficulty] = useState("easy");
  const [word, setWord] = useState("");

  const handleSave = async () => {
    if (!word.trim()) {
      Alert.alert("Error", "Please enter a word to pronounce.");
      return;
    }

    if (!roomCode) {
      Alert.alert("Error", "Missing room code. Cannot save pronunciation.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      await addDoc(collection(db, "PronunciationRoom"), {
        roomId, // ✅ store roomId so we can filter later
        roomCode,
        roomName,
        difficulty,
        word,
        createdAt: serverTimestamp(),
        creatorEmail: user.email,
        createdBy: user.uid,
      });

      Alert.alert("Success", "Pronunciation added successfully!");
      setWord(""); // clear text box
      setDifficulty("easy");
    } catch (err: any) {
      console.error("Error saving pronunciation:", err);
      Alert.alert("Error", "Could not save. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pronunciation</Text>
      <Text style={styles.subtitle}>
        Room: {roomName} {roomCode ? `(${roomCode})` : ""}
      </Text>

      {/* Difficulty Picker */}
      <Text style={styles.label}>Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        style={styles.picker}
        onValueChange={(itemValue) => setDifficulty(itemValue)}
      >
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      {/* Word Input */}
      <Text style={styles.label}>Word to Pronounce</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter word"
        value={word}
        onChangeText={setWord}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>

      {/* Modify Button */}
      <TouchableOpacity
        style={styles.modifyBtn}
        onPress={() =>
          navigation.navigate("Modify", {
            roomId,
            roomName,
            roomCode,
          })
        }
      >
        <Text style={styles.btnText}>Modify Pronunciations</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "100%",
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: "green",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  modifyBtn: {
    backgroundColor: "blue",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
