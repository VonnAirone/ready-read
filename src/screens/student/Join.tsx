import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ModalRoom from "../../components/ModalRoom";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

export default function Join() {
  const navigation = useNavigation<any>();
  const [roomsVisible, setRoomsVisible] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    try {
      setLoading(true); // ⏳ start spinner

      // 1️⃣ Check if room exists in GenerateRoom
      const genQuery = query(
        collection(db, "GenerateRoom"),
        where("roomCode", "==", trimmedCode)
      );
      const genSnap = await getDocs(genQuery);

      if (genSnap.empty) {
        Alert.alert("Aray ko", "Room code not found.");
        return;
      }

      // 2️⃣ Check if room has data in PronunciationRoom
      const dataQuery = query(
        collection(db, "PronunciationRoom"),
        where("roomCode", "==", trimmedCode)
      );
      const dataSnap = await getDocs(dataQuery);

      if (dataSnap.empty) {
        Alert.alert("Info", "Room has no Data.");
        return;
      }

      // ✅ Room exists and has data
      const roomDoc = dataSnap.docs[0];
      const roomData = roomDoc.data();

      navigation.replace("Confirm", {
        roomcode: roomData.roomCode,
        roomID: roomDoc.id,
        roomname: roomData.roomName || "No Name",
        name: roomData.name || "",
        playername: roomData.playername || "",
        email: roomData.email || "",
      });
    } catch (err) {
      console.error("Error entering room:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false); // ✅ stop spinner
    }
  };


  return (
    <LinearGradient colors={["#1E1E2E", "#121212"]} style={styles.container}>
      {/* ✅ Top-right Rooms Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.roomsButton}
          onPress={() => setRoomsVisible(true)}
        >
          <Ionicons name="list-circle-outline" size={22} color="#fff" />
          <Text style={styles.roomsButtonText}>Rooms</Text>
        </TouchableOpacity>
      </View>

      {/* 🔑 Join Room Card */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>🔑 Join a Room</Text>
        <Text style={styles.subtitle}>
          Enter the room code provided by your teacher
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Code"
          placeholderTextColor="#888"
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity
          style={styles.enterButton}
          onPress={handleEnter}
          disabled={loading} // prevent double click
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.enterButtonText}>✔ ENTER</Text>
          )}
        </TouchableOpacity>

      </View>

      {/* 📋 Room List Modal */}
      <ModalRoom visible={roomsVisible} onClose={() => setRoomsVisible(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
  },
  topBar: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
  },
  roomsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5AC8FA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  roomsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  formContainer: {
    backgroundColor: "#2A2A3C",
    borderRadius: 20,
    padding: 25,
    width: "85%", // makes card more balanced
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD60A",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    marginBottom: 20,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  enterButton: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  enterButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

