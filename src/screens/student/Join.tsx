// src/Join.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../firebase"; // ✅ your firebase config
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Join() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(true);
  const [code, setCode] = useState("");

  const handleEnter = async () => {
  const trimmedCode = code.trim();
  if (!trimmedCode) return;

  try {
    const q = query(
      collection(db, "PronunciationRoom"),
      where("roomCode", "==", trimmedCode)
    );
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      Alert.alert("Error", "Room code not found.");
      return;
    }

    const roomDoc = querySnap.docs[0];
    const roomData = roomDoc.data();
    console.log("📌 Room Data:", roomData);

    setModalVisible(false);

    // ✅ Pass full room data instead of quizId
    navigation.replace("Read", {
      roomId: roomDoc.id,
      roomCode: trimmedCode,
      roomData,
    });
  } catch (err) {
    console.error("Error entering room:", err);
    Alert.alert("Error", "Something went wrong. Try again.");
  }
};


  return (
    <ImageBackground
      source={require("../../../assets/icon.png")}
      style={styles.container}
    >
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔑 Enter Room Code</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Code"
              placeholderTextColor="#aaa"
              value={code}
              onChangeText={setCode}
            />

            <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
              <Text style={styles.enterButtonText}>✔ ENTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.cancelButtonText}>✖ CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E2E",
    padding: 25,
    borderRadius: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    marginBottom: 20,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  enterButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  enterButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
