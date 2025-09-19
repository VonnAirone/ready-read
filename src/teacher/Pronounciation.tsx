// src/teacher/ModifyPronunciation.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Dropdown
import { useRoute } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function ModifyPronunciation() {
  const route = useRoute<any>();
  const { roomId } = route.params;
  const [pronunciations, setPronunciations] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedWord, setUpdatedWord] = useState("");
  const [updatedDifficulty, setUpdatedDifficulty] = useState("easy");

  const fetchPronunciations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "PronunciationRoom"),
        where("roomId", "==", roomId),
        where("createdBy", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPronunciations(data);
    } catch (err) {
      console.error("Error fetching pronunciations:", err);
    }
  };

  useEffect(() => {
    fetchPronunciations();
  }, []);

  const handleUpdate = async (id: string) => {
    if (!updatedWord || !updatedDifficulty) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    try {
      const docRef = doc(db, "PronunciationRoom", id);
      await updateDoc(docRef, {
        word: updatedWord,
        difficulty: updatedDifficulty,
      });
      Alert.alert("Updated", "Word updated successfully.");
      setEditingId(null);
      fetchPronunciations();
    } catch (err) {
      console.error("Error updating pronunciation:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "PronunciationRoom", id));
      Alert.alert("Deleted", "Word deleted successfully.");
      setPronunciations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting pronunciation:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modify Pronunciations</Text>

      <FlatList
        data={pronunciations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {editingId === item.id ? (
              <>
                <Text style={styles.label}>Word</Text>
                <TextInput
                  style={styles.input}
                  value={updatedWord}
                  onChangeText={setUpdatedWord}
                  placeholder="Word to pronounce"
                />

                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={updatedDifficulty}
                    onValueChange={(value) => setUpdatedDifficulty(value)}
                  >
                    <Picker.Item label="Easy" value="easy" />
                    <Picker.Item label="Medium" value="medium" />
                    <Picker.Item label="Hard" value="hard" />
                  </Picker>
                </View>

                <Button
                  title="Save"
                  onPress={() => handleUpdate(item.id)}
                  color="green"
                />
                <Button
                  title="Cancel"
                  onPress={() => setEditingId(null)}
                  color="gray"
                />
              </>
            ) : (
              <>
                <Text style={styles.word}>
                  {item.word} ({item.difficulty})
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(item.id);
                      setUpdatedWord(item.word);
                      setUpdatedDifficulty(item.difficulty);
                    }}
                  >
                    <Text style={styles.edit}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.delete}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { padding: 15, marginBottom: 10, borderRadius: 10, backgroundColor: "#f1f1f1" },
  word: { fontSize: 18, fontWeight: "500", marginBottom: 5 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6,
    padding: 10, marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6,
    marginBottom: 12, overflow: "hidden",
  },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  edit: { color: "blue", fontWeight: "bold" },
  delete: { color: "red", fontWeight: "bold" },
});
