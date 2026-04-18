import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase, auth } from "../services/supabase";
import { COLORS } from "../constants/theme";
import { ScreenLayout } from "../components/ScreenLayout";
import { getFontFamily } from "../../styles/fonts";
import { useNavigation } from "@react-navigation/native";

type Player = {
  id: string;
  name: string;
  score: number;
  difficulty?: string;
};

type LeaderboardProps = {
  route: any;
};

const DIFFICULTY_LEVELS = ["all", "easy", "medium", "hard"] as const;

const Leaderboard: React.FC<LeaderboardProps> = ({ route }) => {
  const { roomCode, roomName } = route.params || {};
  const navigation = useNavigation<any>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user || !roomCode) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const { data: roomRows } = await supabase
          .from('game_rooms')
          .select('id')
          .eq('room_code', roomCode);

        if (!isMounted) return;
        if (!roomRows || roomRows.length === 0) {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);

        let query = supabase
          .from('student_result_join')
          .select('id, name, player_name, score, difficulty')
          .eq('room_code', roomCode)
          .order('score', { ascending: false })
          .limit(50);
        if (difficultyFilter !== "all") query = query.eq('difficulty', difficultyFilter);

        const { data: rows } = await query;
        if (!isMounted) return;

        setPlayers((rows ?? []).map(r => ({
          id: r.id,
          name: r.name || r.player_name || "Unknown",
          score: r.score || 0,
          difficulty: r.difficulty || "unknown",
        })));
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching leaderboard:", error);
        setAuthorized(false);
        setLoading(false);
      }
    };

    loadLeaderboard();

    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_result_join', filter: `room_code=eq.${roomCode}` }, loadLeaderboard)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode, difficultyFilter]);

  const getMedalIcon = (index: number) => {
    if (index === 0) return { name: "trophy" as const, color: "#FFD700" };
    if (index === 1) return { name: "trophy" as const, color: "#C0C0C0" };
    if (index === 2) return { name: "trophy" as const, color: "#CD7F32" };
    return null;
  };

  const renderItem = ({ item, index }: { item: Player; index: number }) => {
    const maxScore = players.length > 0 && players[0].score > 0 ? players[0].score : 1;
    const percentage = Math.round((item.score / maxScore) * 100);
    const medal = getMedalIcon(index);
    const isTopThree = index < 3;

    return (
      <View style={[styles.row, isTopThree && styles.topRow]}>
        <View style={styles.rankContainer}>
          {medal ? (
            <Ionicons name={medal.name} size={20} color={medal.color} />
          ) : (
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.score}>{item.score}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!authorized) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
          <Text style={styles.unauthorizedText}>
            You are not authorized to view this leaderboard.
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Leaderboard</Text>
          {roomName && (
            <Text style={styles.subtitle}>{roomName}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDropdown((prev) => !prev)}
        >
          <Ionicons name="filter" size={20} color="#374151" />
          <Text style={styles.filterLabel}>{difficultyFilter.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Difficulty Filter Dropdown */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {DIFFICULTY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.dropdownItem,
                difficultyFilter === level && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setDifficultyFilter(level);
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownText,
                difficultyFilter === level && styles.dropdownTextActive,
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
              {difficultyFilter === level && (
                <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      {players.length > 0 ? (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No scores yet</Text>
          <Text style={styles.emptySubtext}>Scores will appear here once students start practicing</Text>
        </View>
      )}
    </ScreenLayout>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: "#6B7280",
    marginTop: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterLabel: {
    fontSize: 11,
    fontFamily: getFontFamily('semibold'),
    color: "#111827",
  },
  dropdown: {
    position: "absolute",
    top: 76,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: `${COLORS.primary}10`,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[700],
  },
  dropdownTextActive: {
    fontFamily: getFontFamily('semibold'),
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topRow: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  rankContainer: {
    width: 36,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: "#6B7280",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: "#111827",
    marginLeft: 8,
  },
  progressContainer: {
    flex: 1.5,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  score: {
    width: 48,
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: "#111827",
    textAlign: "right",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: "#6B7280",
  },
  unauthorizedText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: "#6B7280",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
});
