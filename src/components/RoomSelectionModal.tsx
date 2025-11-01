import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { COLORS, GRADIENTS } from "../constants/theme";
import { getFontFamily } from "../../styles/fonts";

interface Room {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  words?: string[];
  roomCode?: string;   
  roomName?: string;    
  createdBy?: string;   
}

interface ModalRoomProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalRoom({ visible, onClose }: ModalRoomProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const fetchRooms = async () => {
  setLoading(true);
    try {
      const roomsCollection = collection(db, "GenerateRoom");
      const roomSnapshot = await getDocs(roomsCollection);
      
      const roomList = roomSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.roomCode || '',
          name: data.roomName || '',  
          teacherId: data.createdBy || '',
          ...data
        };
      }) as Room[];
      
      setRooms(roomList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRooms();
    }
  }, [visible]);

  const handleJoinRoom = (room: Room) => {
    onClose();
    navigation.navigate("PronunciationRoom", { roomData: room });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select a Room</Text>
            <TouchableOpacity
              style={styles.closeButtonTop}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={styles.loadingText}>Loading rooms...</Text>
              </View>
            ) : rooms.length > 0 ? (
              <ScrollView 
                style={styles.roomsList}
                contentContainerStyle={styles.roomsListContent}
                showsVerticalScrollIndicator={false}
              >
                {rooms.map((room, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.roomItem}
                    onPress={() => handleJoinRoom(room)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomCode}>Code: {room.code}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.noData}>No rooms available</Text>
                <Text style={styles.noDataSubtext}>Ask your teacher to create a room</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 0,
    width: "90%",
    height: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  closeButtonTop: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 12,
    fontFamily: getFontFamily('regular'),
  },
  roomsList: {
    flex: 1,
  },
  roomsListContent: {
    paddingVertical: 10,
  },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 60,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noData: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  noDataSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
  },
  closeText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: getFontFamily('bold'),
  },
});