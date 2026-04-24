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
import { LinearGradient } from "expo-linear-gradient";
import { supabase, auth } from "../../services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

const ROOM_COLORS: [string, string][] = [
  ['#4CAF50', '#2E7D32'],
  ['#2196F3', '#1565C0'],
  ['#FF9800', '#E65100'],
  ['#9C27B0', '#6A1B9A'],
  ['#F44336', '#B71C1C'],
  ['#00BCD4', '#00838F'],
];

export default function ManageRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) { setLoading(false); return; }

      const loadRooms = async () => {
        try {
          const { data } = await supabase
            .from('game_rooms')
            .select('*')
            .eq('created_by', user.id);
          setRooms(data ?? []);
        } catch (err) {
          console.error('[ManageRooms] failed to load rooms:', err);
        } finally {
          setLoading(false);
        }
      };

      await loadRooms();

      channel = supabase
        .channel('manage_rooms_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `created_by=eq.${user.id}` }, loadRooms)
        .subscribe();
    };

    init();

    return () => { if (channel) supabase.removeChannel(channel); };
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
              // Fetch the room_code first so we can clean up all child records.
              const { data: roomRow } = await supabase
                .from('game_rooms')
                .select('room_code')
                .eq('id', roomId)
                .single();
              const roomCode = roomRow?.room_code;

              await supabase.from('pronunciation_words').delete().eq('room_id', roomId);
              if (roomCode) {
                await supabase.from('student_progress').delete().eq('room_code', roomCode);
                await supabase.from('joined_rooms').delete().eq('room_code', roomCode);
                await supabase.from('student_result_join').delete().eq('room_code', roomCode);
              }
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

  const getRoomColors = (index: number): [string, string] =>
    ROOM_COLORS[index % ROOM_COLORS.length];

  const getRoomInitial = (name: string) => name.trim()[0]?.toUpperCase() || '?';

  return (
    <ScreenLayout noPadding>
      {/* Gradient Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Manage Rooms</Text>
          {!loading && (
            <Text style={styles.subtitle}>
              {rooms.length} Room{rooms.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("RoomGenerator")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="home-outline" size={56} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Rooms Created</Text>
            <Text style={styles.emptySubtitle}>
              Create your first room to start teaching pronunciation
            </Text>
            <TouchableOpacity
              style={styles.createFirstRoomButton}
              onPress={() => navigation.navigate("RoomGenerator")}
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.createFirstRoomText}>Create Your First Room</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {rooms.map((item, index) => {
              const [colorA, colorB] = getRoomColors(index);
              return (
                <View key={item.id} style={styles.roomCard}>
                  {/* Colored left accent */}
                  <View style={[styles.roomAccent, { backgroundColor: colorA }]} />

                  <View style={styles.roomCardBody}>
                    {/* Room avatar + info */}
                    <View style={styles.roomCardTop}>
                      <LinearGradient colors={[colorA, colorB]} style={styles.roomAvatar}>
                        <Text style={styles.roomAvatarText}>{getRoomInitial(item.room_name)}</Text>
                      </LinearGradient>

                      <View style={styles.roomTitleContainer}>
                        <Text style={styles.roomName} numberOfLines={1}>{item.room_name}</Text>
                        <View style={styles.roomCodeBadge}>
                          <Ionicons name="key-outline" size={13} color="#6B7280" />
                          <Text style={styles.roomCode}>{item.room_code}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* View Students CTA */}
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
                      <View style={styles.manageButtonLeft}>
                        <View style={[styles.manageButtonIcon, { backgroundColor: `${colorA}20` }]}>
                          <Ionicons name="people" size={18} color={colorA} />
                        </View>
                        <Text style={styles.manageButtonText}>View Students</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
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
    paddingTop: 56,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  roomAccent: {
    width: 5,
  },
  roomCardBody: {
    flex: 1,
    padding: 16,
  },
  roomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  roomAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roomAvatarText: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  roomTitleContainer: {
    flex: 1,
    gap: 6,
  },
  roomName: {
    fontSize: 17,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roomCode: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: '#374151',
    letterSpacing: 1,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manageButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButtonText: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  createFirstRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createFirstRoomText: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});
