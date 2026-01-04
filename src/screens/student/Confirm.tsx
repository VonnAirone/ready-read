// src/screens/Confirm.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const Confirm = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { roomcode, roomID, roomname, name, playername, email, words, word, difficulty, teacherId, createdBy } = route.params || {};
  const [modalVisible, setModalVisible] = useState(true);

  const handlePlay = () => {
    setModalVisible(false);

    navigation.replace("PronunciationRoom", {
      roomData: {
        roomCode: roomcode,
        roomID: roomID,
        roomName: roomname,
        name,
        playername,
        email,
        words,
        word,
        difficulty: difficulty || "easy",
        teacherId: teacherId || createdBy || "",
        createdBy: teacherId || createdBy || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Confirm Room</Text>
            <Text style={styles.modalText}>
              Are you sure you want to enter this room?
              {"\n\n"}
              <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                <Text style={{ color: "#ffffffaa" }}>Room name: </Text>{roomname}{"\n"}
                <Text style={{ color: "#ffffffaa" }}> Room Code: </Text>{roomcode}</Text>
            </Text>

            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              <LinearGradient
                colors={['#00C853', '#B2FF59']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playButtonGradient}
              >
                <Text style={styles.playText}>Play</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

export default Confirm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalContent: {
    borderRadius: 25,
    padding: 25,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 25,
    color: "#e0e0e0",
  },
  playButton: {
    width: "60%",
    borderRadius: 30,
    overflow: "hidden",
  },
  playButtonGradient: {
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  playText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
