import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase, auth } from "../../services/supabase";
import { getFontFamily } from "../../../styles/fonts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  code: string;
  name: string;
  teacherId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#8C52FF",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
];

function avatarColorForName(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface RoomAvatarProps {
  name: string;
}

function RoomAvatar({ name }: RoomAvatarProps): React.JSX.Element {
  const letter = name.charAt(0).toUpperCase() || "?";
  return (
    <View
      style={[styles.avatar, { backgroundColor: avatarColorForName(name) }]}
    >
      <Text style={styles.avatarLetter}>{letter}</Text>
    </View>
  );
}

interface MyRoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

function MyRoomCard({ room, onPress }: MyRoomCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => onPress(room)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Open room ${room.name}`}
    >
      <RoomAvatar name={room.name} />
      <View style={styles.roomCardBody}>
        <Text style={styles.roomCardName} numberOfLines={1}>
          {room.name}
        </Text>
        <View style={styles.codeChip}>
          <Text style={styles.codeChipText}>{room.code}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function Join(): React.JSX.Element {
  const navigation = useNavigation<any>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Only rooms this student has joined
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loadingMyRooms, setLoadingMyRooms] = useState(true);

  const loadMyRooms = useCallback(async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoadingMyRooms(false);
        return;
      }

      const joinedCodes = new Set<string>();

      const { data: joinedRow } = await supabase
        .from("joined_rooms")
        .select("room_codes")
        .eq("id", user.id)
        .single();
      (joinedRow?.room_codes ?? []).forEach((c: string) => joinedCodes.add(c));

      const { data: progressRows } = await supabase
        .from("student_progress")
        .select("room_code")
        .eq("user_id", user.id);
      (progressRows ?? []).forEach((row) => {
        if (row.room_code) joinedCodes.add(row.room_code);
      });

      if (joinedCodes.size > 0) {
        const { data: roomRows } = await supabase
          .from("game_rooms")
          .select("id, room_code, room_name, created_by")
          .in("room_code", Array.from(joinedCodes).slice(0, 50));

        setMyRooms(
          (roomRows ?? []).map((r) => ({
            id: r.id,
            code: r.room_code,
            name: r.room_name || "Unnamed Room",
            teacherId: r.created_by || "",
          }))
        );
      } else {
        setMyRooms([]);
      }
    } catch (error) {
      console.error("JoinGameRoom: failed to load my rooms", error);
    } finally {
      setLoadingMyRooms(false);
    }
  }, []);

  useEffect(() => {
    loadMyRooms();
  }, [loadMyRooms]);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  const handleRoomPress = (room: Room): void => {
    navigation.navigate("PronunciationRoom", {
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

  const handleEnter = async (): Promise<void> => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    try {
      setLoading(true);

      const { data: roomRows } = await supabase
        .from("game_rooms")
        .select("id, room_code, room_name, created_by")
        .eq("room_code", trimmedCode);

      if (!roomRows || roomRows.length === 0) {
        Alert.alert("Aray ko", "Room code not found.");
        return;
      }

      const roomRow = roomRows[0];
      const teacherId = roomRow.created_by || "";

      const { data: wordRows } = await supabase
        .from("pronunciation_words")
        .select("id, room_code, room_name")
        .eq("room_code", trimmedCode)
        .limit(1);

      if (!wordRows || wordRows.length === 0) {
        Alert.alert("Info", "Room has no Data.");
        return;
      }

      navigation.navigate("Confirm", {
        roomcode: trimmedCode,
        roomID: roomRow.id,
        roomname: roomRow.room_name || "No Name",
        name: "",
        playername: "",
        email: "",
        teacherId,
        createdBy: teacherId,
      });
    } catch (_err) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3FF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Rooms</Text>
            <Text style={styles.heroSubtitle}>
              Find and join your class rooms
            </Text>
          </View>
          <View style={styles.heroIconContainer}>
            <Ionicons name="headset" size={24} color="#8C52FF" />
          </View>
        </View>

        {/* ── Join a Room Card ──────────────────────────────────────────── */}
        <View style={styles.joinCard}>
          <View style={styles.sectionLabelRow}>
            <Ionicons name="add-circle" size={18} color="#8C52FF" />
            <Text style={styles.sectionLabel}>Join a Room</Text>
          </View>
          <Text style={styles.joinSubtitle}>
            Enter the code from your teacher
          </Text>

          <TextInput
            style={styles.joinInput}
            placeholder="e.g. ABC123"
            placeholderTextColor="#D1D5DB"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            accessibilityLabel="Room code input"
          />

          <TouchableOpacity
            style={[
              styles.joinButton,
              (!code.trim() || loading) && styles.joinButtonDisabled,
            ]}
            onPress={handleEnter}
            disabled={!code.trim() || loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Join room"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="enter-outline" size={20} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>Join Room</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── My Rooms ─────────────────────────────────────────────────── */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={16} color="#8C52FF" />
            <Text style={[styles.sectionTitle, { flex: 1 }]}>My Rooms</Text>
            {!loadingMyRooms && (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {myRooms.length} room{myRooms.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>

          {loadingMyRooms ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color="#8C52FF" />
              <Text style={styles.stateText}>Loading rooms...</Text>
            </View>
          ) : myRooms.length === 0 ? (
            <View style={styles.centeredState}>
              <Ionicons name="lock-closed-outline" size={32} color="#D1D5DB" />
              <Text style={styles.stateText}>No rooms yet</Text>
              <Text style={styles.stateSubtext}>
                Enter a code above to join your first room
              </Text>
            </View>
          ) : (
            myRooms.map((room) => (
              <MyRoomCard
                key={room.id}
                room={room}
                onPress={handleRoomPress}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Header
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    color: "#111827",
    fontFamily: getFontFamily("bold"),
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: getFontFamily("regular"),
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // Join a Room Card
  joinCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    fontSize: 16,
    color: "#111827",
    fontFamily: getFontFamily("semibold"),
    marginLeft: 4,
  },
  joinSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: getFontFamily("regular"),
    marginTop: 4,
    marginBottom: 16,
  },
  joinInput: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    color: "#8C52FF",
    textAlign: "center",
    fontFamily: getFontFamily("semibold"),
    letterSpacing: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  joinButton: {
    width: "100%",
    marginTop: 12,
    backgroundColor: "#8C52FF",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: getFontFamily("semibold"),
  },

  // Section wrapper
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    color: "#111827",
    fontFamily: getFontFamily("semibold"),
    marginLeft: 2,
  },
  countPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countPillText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: getFontFamily("regular"),
  },

  // Room card
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: getFontFamily("bold"),
  },
  roomCardBody: {
    flex: 1,
    marginLeft: 12,
  },
  roomCardName: {
    fontSize: 15,
    color: "#111827",
    fontFamily: getFontFamily("semibold"),
    marginBottom: 4,
  },
  codeChip: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE9FE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  codeChipText: {
    fontSize: 11,
    color: "#8C52FF",
    fontFamily: getFontFamily("semibold"),
  },

  // Loading / empty states
  centeredState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  stateText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: getFontFamily("semibold"),
  },
  stateSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: getFontFamily("regular"),
    textAlign: "center",
  },
});
