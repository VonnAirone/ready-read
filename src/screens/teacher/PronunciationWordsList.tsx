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
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ModifyPronunciation() {
  const route = useRoute<any>();
  const { roomId } = route.params;

  const [pronunciations, setPronunciations] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedWord, setUpdatedWord] = useState("");
  const [updatedDifficulty, setUpdatedDifficulty] = useState("easy");

  // 🔹 Filter State
  const [filter, setFilter] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let q = query(
      collection(db, "PronunciationRoom"),
      where("roomId", "==", roomId),
      where("createdBy", "==", user.uid)
    );

    if (filter) {
      q = query(
        collection(db, "PronunciationRoom"),
        where("roomId", "==", roomId),
        where("createdBy", "==", user.uid),
        where("difficulty", "==", filter)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPronunciations(data);
    });

    return () => unsubscribe();
  }, [roomId, filter]);

  const handleUpdate = async () => {
    if (!updatedWord || !updatedDifficulty) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    try {
      const docRef = doc(db, "PronunciationRoom", editingId!);
      await updateDoc(docRef, {
        word: updatedWord,
        difficulty: updatedDifficulty,
      });
      Alert.alert("Updated", "Word updated successfully.");
      setEditingId(null);
    } catch (err) {
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "PronunciationRoom", id));
      Alert.alert("Deleted", "Word deleted successfully.");
    } catch (err) {
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Header with Filter Icon */}
      <View style={styles.header}>
        <Text style={styles.title}>Modify Pronunciations</Text>
        <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="filter" size={26} color="black" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Filter Picker Dropdown */}
      {showFilter && (
        <View style={styles.filterWrapper}>
          <Picker
            selectedValue={filter}
            onValueChange={(value) => setFilter(value)}
          >
            <Picker.Item label="All" value={null} />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>
      )}

      <FlatList
        data={pronunciations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
          </View>
        )}
      />

      {/* 🔹 Modal for Editing */}
      <Modal
        visible={editingId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingId(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Pronunciation</Text>

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

            <View style={styles.modalButtons}>
              <Button title="Save" onPress={handleUpdate} color="green" />
              <Button title="Cancel" onPress={() => setEditingId(null)} color="gray" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  filterWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  word: { fontSize: 18, fontWeight: "500", marginBottom: 5 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  edit: { color: "blue", fontWeight: "bold" },
  delete: { color: "red", fontWeight: "bold" },
  // 🔹 Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    overflow: "hidden",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
