import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
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
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

export default function ManageRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (roomId: string) => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "GenerateRoom", roomId));
              Alert.alert("Success", "Room has been deleted successfully.");
            } catch (err) {
              Alert.alert("Error", "Could not delete room. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Rooms</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("RoomGenerator")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading rooms...</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="home-outline" size={80} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.emptyTitle}>No Rooms Created</Text>
              <Text style={styles.emptySubtitle}>
                Create your first room to start teaching pronunciation
              </Text>
              <TouchableOpacity
                style={styles.createFirstRoomButton}
                onPress={() => navigation.navigate("RoomGenerator")}
              >
                <View style={styles.createFirstRoomContent}>
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text style={styles.createFirstRoomText}>Create Your First Room</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.roomCount}>
                {rooms.length} Room{rooms.length !== 1 ? 's' : ''} Created
              </Text>
              <View style={styles.roomsContainer}>
                {rooms.map((item, index) => (
                  <View key={item.id} style={styles.roomCard}>
                    <View
                      style={styles.roomCardGradient}
                    >
                      <View style={styles.roomCardHeader}>
                        <View style={styles.roomHeaderLeft}>
      
                          <View style={styles.roomTitleContainer}>
                            <Text style={styles.roomName} numberOfLines={1}>{item.roomName}</Text>
                            <View style={styles.roomCodeContainer}>
                              <Ionicons name="key" size={14} color="rgba(255,255,255,0.6)" />
                              <Text style={styles.roomCode}>{item.roomCode}</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.divider} />

                      <TouchableOpacity 
                        style={styles.manageButton}
                        onPress={() =>
                          navigation.navigate("RoomStudents", {
                            roomId: item.id,
                            roomName: item.roomName,
                            roomCode: item.roomCode,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <View style={styles.manageButtonContent}>
                          <Ionicons name="people" size={20} color="white" />
                          <Text style={styles.manageButtonText}>View Students</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomCount: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  roomsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  roomCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomCardGradient: {
    padding: 20,
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  roomIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roomTitleContainer: {
    flex: 1,
    gap: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  roomName: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    letterSpacing: 0.5,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roomCode: {
    fontSize: 13,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  manageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manageButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  createFirstRoomButton: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createFirstRoomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  createFirstRoomText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});
