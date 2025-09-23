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
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // ✅ For delete icon
import { useNavigation } from "@react-navigation/native";

export default function Room() {
  const [rooms, setRooms] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  const fetchRooms = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Fetch rooms created by this teacher only
      const q = query(
        collection(db, "GenerateRoom"),
        where("createdBy", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const fetchedRooms = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setRooms(fetchedRooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 🔴 Delete room function
  const handleDelete = async (roomId: string) => {
    try {
      await deleteDoc(doc(db, "GenerateRoom", roomId));
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      Alert.alert("Deleted", "Room has been deleted.");
    } catch (err) {
      console.error("Error deleting room:", err);
      Alert.alert("Error", "Could not delete room. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rooms</Text>

      {rooms.length === 0 ? (
        <Text style={styles.subtitle}>No rooms created yet.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
                style={styles.roomCard}
                // ✅ Pass roomId, roomName, and roomCode
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
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  roomCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  roomCode: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
