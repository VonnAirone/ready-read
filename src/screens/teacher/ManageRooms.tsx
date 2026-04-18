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
import { supabase, auth } from "../../services/supabase";
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

    const loadRooms = async () => {
      const { data } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('created_by', user.id);
      setRooms(data ?? []);
      setLoading(false);
    };
    loadRooms();

    const channel = supabase
      .channel('manage_rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `created_by=eq.${user.id}` }, loadRooms)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
              await supabase.from('pronunciation_words').delete().eq('room_id', roomId);
              await supabase.from('game_rooms').delete().eq('id', roomId);
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
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Rooms</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("RoomGenerator")}
          >
            <Ionicons name="add" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading rooms...</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="home-outline" size={80} color="#9CA3AF" />
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
                            <Text style={styles.roomName} numberOfLines={1}>{item.room_name}</Text>
                            <View style={styles.roomCodeContainer}>
                              <Ionicons name="key" size={14} color="#9CA3AF" />
                              <Text style={styles.roomCode}>{item.room_code}</Text>
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
                            roomName: item.room_name,
                            roomCode: item.room_code,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <View style={styles.manageButtonContent}>
                          <Ionicons name="people" size={20} color={COLORS.primary} />
                          <Text style={styles.manageButtonText}>View Students</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    color: '#6B7280',
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
    borderColor: '#E5E7EB',
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
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  roomTitleContainer: {
    flex: 1,
    gap: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  roomName: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    letterSpacing: 0.5,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roomCode: {
    fontSize: 13,
    fontFamily: getFontFamily('semibold'),
    color: '#374151',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manageButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
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
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  createFirstRoomButton: {
    borderRadius: 16,
    backgroundColor: COLORS.primary,
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
