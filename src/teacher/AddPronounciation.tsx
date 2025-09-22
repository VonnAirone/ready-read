import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import { collection, serverTimestamp, query, where, getDocs, doc, setDoc } from "firebase/firestore";

export default function AddPronunciation({ route, navigation }: any) {
  const { roomId = null, roomCode = null, roomName = "Unknown Room" } = route.params || {};

  const [difficulty, setDifficulty] = useState("easy");
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add Pronunciation",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => navigation.navigate("Leaderboard", { roomId, roomCode, roomName })}
        >
          <Ionicons name="trophy-outline" size={26} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, roomId, roomCode, roomName]);

  const handleSave = async () => {
  if (!word.trim()) {
    Alert.alert("Error", "Please enter a word to pronounce.");
    return;
  }

  if (!roomCode) {
    Alert.alert("Error", "Missing room code. Cannot save pronunciation.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Error", "You must be logged in.");
    return;
  }

  setLoading(true);

  try {
    const normalizedWord = word.trim().toLowerCase();
    const docId = `${roomCode}_${normalizedWord}_${difficulty}`;

    await setDoc(doc(db, "PronunciationRoom", docId), {
      roomId,
      roomCode,
      roomName,
      difficulty,
      word: normalizedWord,
      createdAt: serverTimestamp(),
      creatorEmail: user.email,
      createdBy: user.uid,
    });

    Alert.alert("Success", "Pronunciation added successfully!");
    setWord("");
    setDifficulty("easy");
  } catch (err: any) {
    console.error("Error saving pronunciation:", err);
    Alert.alert("Error", "Could not save. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pronunciation</Text>
      <Text style={styles.subtitle}>
        Room: {roomName} {roomCode ? `(${roomCode})` : ""}
      </Text>

      <TouchableOpacity
        style={styles.leaderboardBtn}
        onPress={() => navigation.navigate("Leaderboard", { roomCode, roomName, roomId })}
      >
        <Ionicons name="trophy-outline" size={22} color="#fff" />
        <Text style={styles.btnText}> View Leaderboard</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Difficulty</Text>
      <Picker selectedValue={difficulty} style={styles.picker} onValueChange={(itemValue) => setDifficulty(itemValue)}>
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      <Text style={styles.label}>Word to Pronounce</Text>
      <TextInput style={styles.input} placeholder="Enter word" value={word} onChangeText={setWord} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modifyBtn}
        onPress={() => navigation.navigate("Modify", { roomId, roomName, roomCode })}
      >
        <Text style={styles.btnText}>Modify Pronunciations</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20, textAlign: "center" },
  leaderboardBtn: {
    flexDirection: "row",
    backgroundColor: "purple",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  input: { width: "100%", padding: 15, marginVertical: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, backgroundColor: "#f9f9f9" },
  picker: { width: "100%", marginVertical: 10 },
  saveBtn: { backgroundColor: "green", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  modifyBtn: { backgroundColor: "blue", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
