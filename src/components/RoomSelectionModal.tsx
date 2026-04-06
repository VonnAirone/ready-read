import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../services/firebase";
import { collection, getDocs, doc, getDoc, setDoc, query, where } from "firebase/firestore";
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
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [joinedRoomCodes, setJoinedRoomCodes] = useState<string[]>([]);
  const navigation = useNavigation<any>();

  // Load user's joined rooms from Firestore
  const loadJoinedRooms = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const joinedCodes = new Set<string>();

      // Check JoinedRooms collection
      const userDocRef = doc(db, "JoinedRooms", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        (data.roomCodes || []).forEach((code: string) => joinedCodes.add(code));
      }

      // Also check StudentProgress collection for rooms with existing progress
      const progressQuery = query(
        collection(db, "StudentProgress"),
        where("userId", "==", user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.roomCode) {
          joinedCodes.add(data.roomCode);
        }
      });
      
      setJoinedRoomCodes(Array.from(joinedCodes));
    } catch (error) {
      console.error("Failed to load joined rooms:", error);
    }
  };

  // Save joined room to Firestore
  const saveJoinedRoom = async (roomCode: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "JoinedRooms", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let existingRoomCodes: string[] = [];
      if (userDoc.exists()) {
        existingRoomCodes = userDoc.data().roomCodes || [];
      }
      
      // Add room code if not already in the list
      if (!existingRoomCodes.includes(roomCode)) {
        existingRoomCodes.push(roomCode);
        await setDoc(userDocRef, {
          roomCodes: existingRoomCodes,
          updatedAt: new Date().toISOString()
        });
        setJoinedRoomCodes(existingRoomCodes);
      }
    } catch (error) {
      console.error("Failed to save joined room:", error);
      Alert.alert("Error", "Could not save room. Please try again.");
    }
  };

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
      console.error("Failed to fetch rooms:", error);
      Alert.alert("Error", "Could not load rooms. Please check your connection and try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRooms();
      loadJoinedRooms();
      setShowCodeVerification(false);
      setSelectedRoom(null);
      setEnteredCode("");
    }
  }, [visible]);

  const handleRoomSelect = async (room: Room) => {
    setSelectedRoom(room);
    
    // Check if user has already joined this room
    const hasJoinedBefore = joinedRoomCodes.includes(room.code);
    
    if (hasJoinedBefore) {
      // Skip code verification and navigate directly
      onClose();
      navigation.navigate("PronunciationRoom", { roomData: room });
    } else {
      // Show code verification for first-time entry
      setShowCodeVerification(true);
      setEnteredCode("");
    }
  };

  const handleVerifyCode = async () => {
    if (!selectedRoom) return;
    
    const trimmedCode = enteredCode.trim();
    
    if (!trimmedCode) {
      Alert.alert("Required", "Please enter the room code.");
      return;
    }

    setVerifying(true);
    
    // Verify the entered code matches the room code
    if (trimmedCode === selectedRoom.code) {
      // Code is correct - save this room as joined
      await saveJoinedRoom(selectedRoom.code);
      
      setVerifying(false);
      setShowCodeVerification(false);
      onClose();
      navigation.navigate("PronunciationRoom", { roomData: selectedRoom });
    } else {
      // Code is incorrect
      setVerifying(false);
      Alert.alert("Invalid Code", "The room code you entered is incorrect. Please try again.");
    }
  };

  const handleCancelVerification = () => {
    setShowCodeVerification(false);
    setSelectedRoom(null);
    setEnteredCode("");
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
                {rooms.map((room, idx) => {
                  const hasJoined = joinedRoomCodes.includes(room.code);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.roomItem}
                      onPress={() => handleRoomSelect(room)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.roomInfo}>
                        <View style={styles.roomNameContainer}>
                          <Text style={styles.roomName}>{room.name}</Text>
                          {hasJoined && (
                            <View style={styles.joinedBadge}>
                              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                              <Text style={styles.joinedBadgeText}>Joined</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  );
                })}
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

        {/* Room Code Verification Modal */}
        <Modal
          visible={showCodeVerification}
          animationType="fade"
          transparent
        >
          <View style={styles.verificationOverlay}>
            <View style={styles.verificationBox}>
              <View style={styles.verificationHeader}>
                <Ionicons name="lock-closed" size={32} color={COLORS.white} />
                <Text style={styles.verificationTitle}>Enter Room Code</Text>
                <Text style={styles.verificationSubtitle}>
                  {selectedRoom?.name}
                </Text>
              </View>

              <View style={styles.verificationContent}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter room code"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={enteredCode}
                  onChangeText={setEnteredCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={10}
                />

                <View style={styles.verificationButtons}>
                  <TouchableOpacity
                    style={[styles.verificationButton, styles.cancelButton]}
                    onPress={handleCancelVerification}
                    disabled={verifying}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.verificationButton, styles.verifyButton]}
                    onPress={handleVerifyCode}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
  roomNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginBottom: 4,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  joinedBadgeText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
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
  // Room Code Verification Styles
  verificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    overflow: "hidden",
  },
  verificationHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    marginTop: 12,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    marginTop: 4,
  },
  verificationContent: {
    padding: 24,
  },
  codeInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    textAlign: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    letterSpacing: 2,
  },
  verificationButtons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  verificationButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
  },
  verifyButton: {
    backgroundColor: COLORS.white,
  },
  verifyButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: getFontFamily('bold'),
  },
});