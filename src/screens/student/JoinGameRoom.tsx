import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import RoomSelectionModal from "../../components/RoomSelectionModal";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

interface JoinedRoom {
  id: string;
  code: string;
  name: string;
  teacherId: string;
}

export default function Join() {
  const navigation = useNavigation<any>();
  const [roomsVisible, setRoomsVisible] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentRooms, setRecentRooms] = useState<JoinedRoom[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    loadRecentRooms();
  }, []);

  const loadRecentRooms = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoadingRecent(false);
        return;
      }

      const joinedCodes = new Set<string>();

      // Check JoinedRooms collection
      const userDocRef = doc(db, "JoinedRooms", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        (data.roomCodes || []).forEach((code: string) => joinedCodes.add(code));
      }

      // Also check StudentProgress collection
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

      // Fetch room details for joined rooms
      if (joinedCodes.size > 0) {
        const roomsQuery = query(
          collection(db, "GenerateRoom"),
          where("roomCode", "in", Array.from(joinedCodes).slice(0, 10))
        );
        const roomsSnapshot = await getDocs(roomsQuery);
        
        const rooms: JoinedRoom[] = roomsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            code: data.roomCode || '',
            name: data.roomName || 'Unnamed Room',
            teacherId: data.createdBy || ''
          };
        });
        
        setRecentRooms(rooms);
      }
    } catch (error) {
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleRoomPress = (room: JoinedRoom) => {
    navigation.replace("PronunciationRoom", {
      roomData: {
        roomCode: room.code,
        roomID: room.id,
        roomName: room.name,
        name: "",
        playername: "",
        email: "",
        difficulty: "easy",
        teacherId: room.teacherId,
        createdBy: room.teacherId,
      },
    });
  };

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

      // Get teacher ID from GenerateRoom
      const generateRoomData = genSnap.docs[0].data();
      const teacherId = generateRoomData.createdBy || "";

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
        teacherId: teacherId,
        createdBy: teacherId,
      });
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false); // ✅ stop spinner
    }
  };


  return (
    <ScreenLayout>
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={15} style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.roomsButton}
            onPress={() => setRoomsVisible(true)}
          >
            <Ionicons name="list" size={20} color={COLORS.white} />
            <Text style={styles.roomsButtonText}>Rooms</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Join a Room</Text>
            <Text style={styles.subtitle}>
              Enter the room code provided by your teacher
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Room Code"
              placeholderTextColor="rgba(140, 82, 255, 0.5)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={8}
            />

            <TouchableOpacity
              style={[styles.enterButton, loading && styles.buttonDisabled]}
              onPress={handleEnter}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                  <Text style={styles.enterButtonText}>ENTER ROOM</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Recently Joined Rooms Section */}
          {!loadingRecent && recentRooms.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Ionicons name="time-outline" size={20} color={COLORS.white} />
                <Text style={styles.recentTitle}>Recently Joined Rooms</Text>
              </View>
              
              <View style={styles.recentRoomsList}>
                {recentRooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={styles.recentRoomItem}
                    onPress={() => handleRoomPress(room)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recentRoomIcon}>
                      <Ionicons name="bookmark" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.recentRoomInfo}>
                      <Text style={styles.recentRoomName}>{room.name}</Text>
                      <Text style={styles.recentRoomCode}>Code: {room.code}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Room List Modal */}
        <RoomSelectionModal visible={roomsVisible} onClose={() => setRoomsVisible(false)} />
        
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  backButtonIcon: {
    color: COLORS.white
  },  
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
  },
  roomsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  roomsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    marginLeft: 8,
  },
  recentSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  recentTitle: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  recentRoomsList: {
    gap: 10,
  },
  recentRoomItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  recentRoomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentRoomInfo: {
    flex: 1,
  },
  recentRoomName: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginBottom: 4,
  },
  recentRoomCode: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
  },
  content: {
    paddingVertical: 20,
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 25,
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    fontFamily: getFontFamily('medium'),
    borderWidth: 2,
    borderColor: "rgba(140, 82, 255, 0.1)",
    letterSpacing: 2,
  },
  enterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  enterButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: getFontFamily('medium'),
    marginLeft: 10,
    letterSpacing: 1,
  },
});

