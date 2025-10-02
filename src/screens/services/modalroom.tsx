import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard"; 

export default function ModalRoom({ visible, onClose }: any) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  useEffect(() => {
    if (visible) fetchRooms();
  }, [visible]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "GenerateRoom"));
      const fetched = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRooms(fetched);
    } catch (err) {
      console.error("❌ Error fetching rooms:", err);
    }
    setLoading(false);
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("✅ Copied!", "Room code copied to clipboard.");
  };

  return (
    <>
      {/* 📋 Main Room List Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>📋 Available Rooms</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.roomItem}>
                    <View style={styles.roomLeft}>
                      <Ionicons
                        name="home-outline"
                        size={28}
                        color="#5AC8FA"
                        style={{ marginRight: 10 }}
                      />
                      <View>
                        <Text style={styles.roomName}>{item.roomName}</Text>
                        <Text style={styles.roomCreator}>
                          👤 {item.creatorName || "Unknown"}
                        </Text>
                        <Text style={styles.roomCode}>🔑 {item.roomCode}</Text>
                      </View>
                    </View>

                    {/* ℹ️ Info Icon */}
                    <TouchableOpacity
                      style={styles.infoButton}
                      onPress={() => setSelectedRoom(item)}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={30}
                        color="#FFD60A"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 10 }}
                style={{ maxHeight: 320 }} // scrollable if many rooms
              />
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✖ CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ℹ️ Room Details Modal */}
      <Modal
        visible={!!selectedRoom}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedRoom(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>✨ Room Details</Text>

            {selectedRoom && (
              <ScrollView style={{ maxHeight: 320 }}>
                {/* Creator */}
                <View style={styles.detailBox}>
                  <Ionicons
                    name="person-circle-outline"
                    size={26}
                    color="#4CD964"
                  />
                  <Text style={styles.detailText}>
                    {selectedRoom.creatorName || "Unknown"}
                  </Text>
                </View>

                {/* Room Name */}
                <View style={styles.detailBox}>
                  <Ionicons name="home-outline" size={26} color="#5AC8FA" />
                  <Text style={styles.detailText}>{selectedRoom.roomName}</Text>
                </View>

                {/* Room Code with Copy */}
                <View style={styles.detailBox}>
                  <Ionicons
                    name="key-outline"
                    size={26}
                    color="#FFCC00"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.detailText}>{selectedRoom.roomCode}</Text>

                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopy(selectedRoom.roomCode)}
                  >
                    <Ionicons name="copy-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Room ID */}
                <View style={styles.detailBox}>
                  <Ionicons
                    name="finger-print-outline"
                    size={26}
                    color="#FF3B30"
                  />
                  <Text style={styles.detailText}>{selectedRoom.id}</Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedRoom(null)}
            >
              <Text style={styles.closeText}>✖ CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1E1E2E",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  roomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A3C",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  roomLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roomName: {
    color: "#FFD60A",
    fontSize: 17,
    fontWeight: "700",
  },
  roomCreator: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },
  roomCode: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
  },
  infoButton: {
    marginLeft: 10,
    padding: 4,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  detailContent: {
    backgroundColor: "#1E1E2E",
    padding: 20,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
  },
  detailBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A3C",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailText: {
    color: "#fff",
    fontSize: 17,
    marginLeft: 12,
    fontWeight: "600",
  },
  copyButton: {
  padding: 6,
  backgroundColor: "#444",
  borderRadius: 8,
  marginLeft: "auto", // ✅ pushes it to the right
},

});
