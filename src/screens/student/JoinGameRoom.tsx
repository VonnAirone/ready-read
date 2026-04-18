import React, { useState, useEffect } from "react";
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

interface RecentRoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

function RecentRoomCard({
  room,
  onPress,
}: RecentRoomCardProps): React.JSX.Element {
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

interface AllRoomCardProps {
  room: Room;
  isJoined: boolean;
  isExpanded: boolean;
  verifyCode: string;
  verifying: boolean;
  onPress: (room: Room) => void;
  onVerifyCodeChange: (text: string) => void;
  onVerify: (room: Room) => void;
  onCancel: () => void;
}

function AllRoomCard({
  room,
  isJoined,
  isExpanded,
  verifyCode,
  verifying,
  onPress,
  onVerifyCodeChange,
  onVerify,
  onCancel,
}: AllRoomCardProps): React.JSX.Element {
  return (
    <>
      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => onPress(room)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${room.name}${isJoined ? ", already joined" : ", tap to join"}`}
      >
        <RoomAvatar name={room.name} />
        <View style={styles.roomCardBody}>
          <View style={styles.roomCardNameRow}>
            <Text
              style={[styles.roomCardName, { flexShrink: 1 }]}
              numberOfLines={1}
            >
              {room.name}
            </Text>
            {isJoined ? (
              <View style={styles.joinedBadge}>
                <Text style={styles.joinedBadgeText}>Joined</Text>
              </View>
            ) : (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>
          <View style={styles.codeChip}>
            <Text style={styles.codeChipText}>{room.code}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.verifyCard}>
          <Text style={styles.verifyPrompt}>Enter room code to join</Text>
          <TextInput
            style={styles.verifyInput}
            placeholder="Room code"
            placeholderTextColor="#D1D5DB"
            value={verifyCode}
            onChangeText={onVerifyCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            accessibilityLabel="Room code input"
          />
          <View style={styles.verifyButtonRow}>
            <TouchableOpacity
              style={[styles.verifyBtn, styles.cancelBtn]}
              onPress={onCancel}
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.verifyBtn, styles.confirmBtn]}
              onPress={() => onVerify(room)}
              disabled={verifying}
              accessibilityRole="button"
              accessibilityLabel="Verify code"
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function Join(): React.JSX.Element {
  const navigation = useNavigation<any>();

  // Join-by-code form
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Recently visited
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // All rooms
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);

  // Joined state for the All Rooms section
  const [joinedRoomCodes, setJoinedRoomCodes] = useState<string[]>([]);

  // Inline verification for All Rooms
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadRecentRooms();
    loadAllRooms();
  }, []);

  // ── Data loaders ────────────────────────────────────────────────────────────

  const loadRecentRooms = async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoadingRecent(false);
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

      // Populate joinedRoomCodes so the All Rooms section can use it
      setJoinedRoomCodes(Array.from(joinedCodes));

      if (joinedCodes.size > 0) {
        const { data: roomRows } = await supabase
          .from("game_rooms")
          .select("id, room_code, room_name, created_by")
          .in("room_code", Array.from(joinedCodes).slice(0, 30));

        setRecentRooms(
          (roomRows ?? []).map((r) => ({
            id: r.id,
            code: r.room_code,
            name: r.room_name || "Unnamed Room",
            teacherId: r.created_by || "",
          }))
        );
      }
    } catch (error) {
      console.error("JoinGameRoom: failed to load recent rooms", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const loadAllRooms = async (): Promise<void> => {
    try {
      const { data: roomRows } = await supabase
        .from("game_rooms")
        .select("id, room_code, room_name, created_by");

      setAllRooms(
        (roomRows ?? []).map((r) => ({
          id: r.id,
          code: r.room_code || "",
          name: r.room_name || "Unnamed Room",
          teacherId: r.created_by || "",
        }))
      );
    } catch (error) {
      console.error("JoinGameRoom: failed to load all rooms", error);
    } finally {
      setLoadingAll(false);
    }
  };

  // ── Navigation helpers ───────────────────────────────────────────────────────

  const handleRoomPress = (room: Room): void => {
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

      const wordRow = wordRows[0];
      navigation.replace("Confirm", {
        roomcode: trimmedCode,
        roomID: wordRow.id,
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

  // ── All Rooms verification ──────────────────────────────────────────────────

  const handleAllRoomPress = (room: Room): void => {
    if (joinedRoomCodes.includes(room.code)) {
      handleRoomPress(room);
    } else {
      setExpandedRoomId(expandedRoomId === room.id ? null : room.id);
      setVerifyCode("");
    }
  };

  const handleVerify = async (room: Room): Promise<void> => {
    if (verifyCode.trim() !== room.code) {
      Alert.alert("Invalid Code", "The code you entered is incorrect.");
      return;
    }

    setVerifying(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const { data: existingRow } = await supabase
          .from("joined_rooms")
          .select("room_codes")
          .eq("id", user.id)
          .single();

        const existing: string[] = existingRow?.room_codes ?? [];
        if (!existing.includes(room.code)) {
          await supabase.from("joined_rooms").upsert({
            id: user.id,
            room_codes: [...existing, room.code],
            updated_at: new Date().toISOString(),
          });
        }
        setJoinedRoomCodes((prev) => [...prev, room.code]);
      }
    } catch (_) {
      // Non-fatal — proceed to navigation even if the upsert fails
    }

    setVerifying(false);
    setExpandedRoomId(null);
    navigation.replace("PronunciationRoom", { roomData: room });
  };

  const handleCancelVerify = (): void => {
    setExpandedRoomId(null);
    setVerifyCode("");
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

        {/* ── Recently Visited ──────────────────────────────────────────── */}
        {!loadingRecent && recentRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={16} color="#8C52FF" />
              <Text style={styles.sectionTitle}>Recently Visited</Text>
            </View>

            {recentRooms.map((room) => (
              <RecentRoomCard
                key={room.id}
                room={room}
                onPress={handleRoomPress}
              />
            ))}
          </View>
        )}

        {/* ── All Rooms ─────────────────────────────────────────────────── */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={16} color="#8C52FF" />
            <Text style={[styles.sectionTitle, { flex: 1 }]}>All Rooms</Text>
            {!loadingAll && (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {allRooms.length} room{allRooms.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>

          {loadingAll ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color="#8C52FF" />
              <Text style={styles.stateText}>Loading rooms...</Text>
            </View>
          ) : allRooms.length === 0 ? (
            <View style={styles.centeredState}>
              <Text style={styles.stateText}>No rooms available</Text>
            </View>
          ) : (
            allRooms.map((room) => (
              <AllRoomCard
                key={room.id}
                room={room}
                isJoined={joinedRoomCodes.includes(room.code)}
                isExpanded={expandedRoomId === room.id}
                verifyCode={verifyCode}
                verifying={verifying}
                onPress={handleAllRoomPress}
                onVerifyCodeChange={setVerifyCode}
                onVerify={handleVerify}
                onCancel={handleCancelVerify}
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

  // Room card (shared by Recent and All Rooms)
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
  roomCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
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

  // Joined / New badges
  joinedBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  joinedBadgeText: {
    fontSize: 11,
    color: "#059669",
    fontFamily: getFontFamily("semibold"),
  },
  newBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: getFontFamily("semibold"),
  },

  // Inline verify card
  verifyCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 16,
    marginTop: -4,
    marginBottom: 10,
  },
  verifyPrompt: {
    fontSize: 13,
    color: "#374151",
    fontFamily: getFontFamily("regular"),
    marginBottom: 10,
  },
  verifyInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#8C52FF",
    textAlign: "center",
    fontFamily: getFontFamily("semibold"),
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  verifyButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  verifyBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: getFontFamily("semibold"),
  },
  confirmBtn: {
    backgroundColor: "#8C52FF",
  },
  confirmBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: getFontFamily("semibold"),
  },

  // Loading / empty states
  centeredState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  stateText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: getFontFamily("regular"),
  },
});
