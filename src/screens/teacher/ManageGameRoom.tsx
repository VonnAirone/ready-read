// src/teacher/Room.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Room() {
  const [rooms, setRooms] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // ✅ Real-time snapshot
    const q = query(
      collection(db, "GenerateRoom"),
      where("createdBy", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRooms(fetchedRooms);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (roomId: string) => {
    try {
      await deleteDoc(doc(db, "GenerateRoom", roomId));
      Alert.alert("Deleted", "Room has been deleted.");
    } catch (err) {
      console.error("Error deleting room:", err);
      Alert.alert("Error", "Could not delete room. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Your Rooms</Text>

      {/* ✅ Add Room Button (Top Right) if rooms exist */}
      {rooms.length > 0 && (
        <TouchableOpacity
          style={styles.addRoomButton}
          onPress={() => navigation.navigate("RoomGenerator")}
        >
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
          <Text style={styles.addRoomText}>Add Room</Text>
        </TouchableOpacity>
      )}

      {rooms.length === 0 ? (
        <View style={styles.noRoomContainer}>
          <Text style={styles.subtitle}>No rooms created yet.</Text>
          <TouchableOpacity
            style={styles.createRoomButton}
            onPress={() => navigation.navigate("RoomGenerator")}
          >
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              style={styles.gradientButton}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createRoomText}>Create Room</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() =>
                navigation.navigate("AddPronunciation", {
                  roomId: item.id,
                  roomName: item.roomName,
                  roomCode: item.roomCode,
                })
              }
            >
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{item.roomName}</Text>
                <Text style={styles.roomCode}>Code: {item.roomCode}</Text>
              </View>

              {/* Delete Icon */}
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f8ff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6d6c69ff",
    marginTop: 50,
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  noRoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createRoomButton: {
    marginTop: 20,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  createRoomText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  addRoomButton: {
    position: "absolute",
    top: 55,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5AC8FA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addRoomText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  roomCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#1E1E2E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  roomCode: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 5,
  },
});
