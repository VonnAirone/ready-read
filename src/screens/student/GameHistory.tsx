// src/screens/Progress.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export default function Progress() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [roomsVisible, setRoomsVisible] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  const auth = getAuth();

  // ✅ Watch for authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRooms(currentUser.email);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // ✅ Fetch all rooms where the student has results
  const fetchRooms = async (email: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "StudentResultJoin"),
        where("email", "==", email)
      );
      const snap = await getDocs(q);

      const roomsData: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (!roomsData.find((r) => r.roomCode === data.roomCode)) {
          roomsData.push({ roomCode: data.roomCode, roomName: data.roomName });
        }
      });

      setRooms(roomsData);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch results of selected room
  const fetchResults = async (roomCode: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "StudentResultJoin"),
        where("email", "==", user.email),
        where("roomCode", "==", roomCode)
      );
      const snap = await getDocs(q);

      const res: any[] = [];
      snap.forEach((doc) => res.push({ id: doc.id, ...doc.data() }));

      setResults(res);
      setSelectedRoom(roomCode);
      setRoomsVisible(false);
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1E1E2E", "#121212"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />
      <SafeAreaView style={styles.safeArea}>
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

        <View style={styles.content}>
          {/* ✅ Title */}
          <Text style={styles.title}>📊 My Progress</Text>
          {selectedRoom ? (
            <Text style={styles.subtitle}>
              Showing results for: {selectedRoom}
            </Text>
          ) : (
            <Text style={styles.subtitle}>Select a room to view progress</Text>
          )}

          {/* ✅ Results List */}
          {loading ? (
            <ActivityIndicator size="large" color="#FFD60A" style={{ marginTop: 20 }} />
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.resultCard}>
                  <Text style={styles.resultText}>
                    📝 Word: {item.word} - ✅ Score: {item.score}
                  </Text>
                </View>
              )}
            />
          ) : (
            !loading &&
            selectedRoom && (
              <Text style={styles.noData}>⚠ No results in this room yet.</Text>
            )
          )}
        </View>

        {/* 📋 Rooms Modal */}
        <Modal visible={roomsVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Select a Room</Text>
              {rooms.length > 0 ? (
                rooms.map((room, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.roomItem}
                    onPress={() => fetchResults(room.roomCode)}
                  >
                    <Text style={styles.roomText}>
                      {room.roomName} ({room.roomCode})
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noData}>No rooms found</Text>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setRoomsVisible(false)}
              >
                <Text style={styles.closeText}>✖ Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  topBar: { 
    paddingTop: 20, 
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  roomsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5AC8FA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roomsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD60A",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 20,
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "#2A2A3C",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    width: 320,
  },
  resultText: { color: "#fff", fontSize: 16 },
  noData: { color: "#FF4C4C", marginTop: 20, fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#2A2A3C",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD60A",
    marginBottom: 10,
  },
  roomItem: {
    padding: 12,
    backgroundColor: "#444",
    borderRadius: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  roomText: { color: "#fff", fontSize: 16 },
  closeButton: { marginTop: 15 },
  closeText: { color: "#FF3B30", fontSize: 16, fontWeight: "700" },
});
