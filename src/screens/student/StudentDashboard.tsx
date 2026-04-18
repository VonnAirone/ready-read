import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { supabase, auth } from "../../services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";
import { getOrCreateSessionId } from "../../utils/contentLoader";

const READER_LEVEL_LABELS: Record<number, string> = {
  1: "Foundation",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
};

const PRONUNCIATION_TIPS = [
  "Slow down! Speaking clearly beats speaking fast every time.",
  "Open your mouth wider for vowel sounds like 'A', 'E', and 'O'.",
  "Practice in front of a mirror to see your mouth shape.",
  "Record yourself and listen back — it trains your ear too.",
  "Break long words into syllables before reading them aloud.",
  "Focus on stressed syllables — they carry the word's meaning.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTipOfTheDay(): string {
  const day = new Date().getDay();
  return PRONUNCIATION_TIPS[day % PRONUNCIATION_TIPS.length];
}

interface DashboardStats {
  readerLevel: number;
  microLevelsDone: number;
  avgScore: number;
}

export default function StudentDashboard({ navigation }: any) {
  const [playerName, setPlayerName] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const initSession = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const id = await getOrCreateSessionId(user.uid);
          setSessionId(id);
        } catch (error) {
          console.warn("[StudentDashboard] Session init failed:", error);
        }
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (!user) return;

      try {
        const { data: playerRow } = await supabase
          .from('player_names')
          .select('player_name')
          .eq('id', user.id)
          .single();
        if (playerRow) setPlayerName(playerRow.player_name || "");
      } catch (error) {
        console.error("StudentDashboard: failed to load player name", error);
      }

      try {
        let readerLevel = 1;
        const { data: personal } = await supabase
          .from('student_progress')
          .select('student_level, reader_level')
          .eq('id', `${user.id}_PERSONAL_PRACTICE`)
          .single();
        if (personal) readerLevel = personal.student_level || personal.reader_level || 1;

        const { data: allRows } = await supabase
          .from('student_progress')
          .select('first_attempt_scores, macro_level_progress, scores, scores_array')
          .eq('user_id', user.id);

        const allScores: number[] = [];
        (allRows ?? []).forEach((d) => {
          if (d.first_attempt_scores) Object.values(d.first_attempt_scores).forEach((s: any) => allScores.push(Number(s)));
          if (d.macro_level_progress) Object.values(d.macro_level_progress).forEach((macro: any) => {
            ["words", "sentences", "paragraphs"].forEach((type) => {
              (macro[type]?.scores ?? []).forEach((s: number) => allScores.push(s));
            });
          });
          (d.scores ?? []).forEach((s: number) => allScores.push(s));
          (d.scores_array ?? []).forEach((s: number) => allScores.push(s));
        });

        const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        setStats({ readerLevel, microLevelsDone: allScores.length, avgScore: avg });
      } catch {
        setStats({ readerLevel: 1, microLevelsDone: 0, avgScore: 0 });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error("StudentDashboard: sign out failed", error);
          }
        },
      },
    ]);
  };

  const handleJoinRoom = () => {
    if (auth.currentUser) {
      navigation.navigate("RoomTab", { screen: "JoinRoom", params: { sessionId, userId: auth.currentUser.uid } });
    } else {
      Alert.alert("Error", "Please log in to join a room.");
    }
  };

  const handlePersonalPractice = () => {
    if (auth.currentUser) {
      navigation.navigate("PracticeTab", { screen: "PersonalPractice", params: { sessionId, userId: auth.currentUser.uid } });
    } else {
      Alert.alert("Error", "Please log in to access personal practice.");
    }
  };

  const handleMyProgress = () => {
    navigation.navigate("PracticeTab", { screen: "PersonalPractice" });
  };

  const initials = playerName
    ? playerName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const readerLevel = stats?.readerLevel ?? 1;
  const levelLabel = READER_LEVEL_LABELS[readerLevel];
  const tip = getTipOfTheDay();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.playerName} numberOfLines={1}>
              {playerName || "Student"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
          >
            <LinearGradient
              colors={["#8C52FF", "#543199"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner — Daily Practice CTA ── */}
        <TouchableOpacity onPress={handlePersonalPractice} activeOpacity={0.92}>
          <LinearGradient
            colors={["#8C52FF", "#6A3BB5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Decorative dots */}
            <View style={styles.heroDot1} />
            <View style={styles.heroDot2} />

            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>Daily Speaking{"\n"}PRACTICE</Text>
                <TouchableOpacity
                  style={styles.heroBtn}
                  onPress={handlePersonalPractice}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroBtnText}>Start reading</Text>
                  <Ionicons name="arrow-forward" size={15} color="#8C52FF" />
                </TouchableOpacity>
              </View>
              <View style={styles.heroIllustration}>
                <View style={styles.heroBookCircle}>
                  <Ionicons name="book" size={40} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.heroBubble}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Reading Progress ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading progress</Text>
          <Text style={styles.sectionSubtitle}>
            {stats
              ? `${stats.microLevelsDone} items completed · ${levelLabel} level · Avg score: ${
                  stats.avgScore > 0 ? `${stats.avgScore}%` : "—"
                }`
              : "Loading your progress…"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Current Task ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Task</Text>

          <TouchableOpacity style={styles.taskCard} onPress={handleJoinRoom} activeOpacity={0.88}>
            <LinearGradient
              colors={["#7B4FD0", "#9B6FE8"]}
              style={styles.taskIllustration}
            >
              <Ionicons name="people" size={28} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
            <View style={styles.taskInfo}>
              <Text style={styles.taskType}>Next Session</Text>
              <Text style={styles.taskTitle}>Join Game Room</Text>
              {stats && stats.avgScore > 0 && (
                <Text style={styles.taskScore}>
                  Last score:{" "}
                  <Text style={styles.taskScoreValue}>{stats.avgScore}%</Text>
                </Text>
              )}
              <TouchableOpacity
                style={styles.taskStartBtn}
                onPress={handleJoinRoom}
                activeOpacity={0.8}
              >
                <Text style={styles.taskStartText}>Join room</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── History / Quick Actions ── */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <TouchableOpacity onPress={handleMyProgress}>
              <Text style={styles.seeAllText}>See all practices</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Practice history item */}
          <TouchableOpacity style={styles.historyItem} onPress={handlePersonalPractice} activeOpacity={0.85}>
            <LinearGradient
              colors={["#8C52FF", "#A87AFF"]}
              style={styles.historyIcon}
            >
              <Ionicons name="mic" size={18} color="#FFF" />
            </LinearGradient>
            <View style={styles.historyItemInfo}>
              <Text style={styles.historyItemTitle}>Personal Practice</Text>
              {stats && stats.avgScore > 0 ? (
                <Text style={styles.historyItemScore}>
                  Score: <Text style={styles.historyScoreValue}>{stats.avgScore}%</Text>
                </Text>
              ) : (
                <Text style={styles.historyItemScore}>Words, sentences & paragraphs</Text>
              )}
            </View>
            <Text style={styles.historyItemLevel}>{levelLabel}</Text>
          </TouchableOpacity>

          {/* Tip of the Day */}
          <View style={styles.tipItem}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="bulb" size={18} color="#FCC454" />
            </View>
            <View style={styles.historyItemInfo}>
              <Text style={styles.historyItemTitle}>Tip of the Day</Text>
              <Text style={styles.tipText} numberOfLines={2}>{tip}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 13,
    fontFamily: getFontFamily("regular"),
    color: "#9CA3AF",
    marginBottom: 2,
  },
  playerName: {
    fontSize: 22,
    fontFamily: getFontFamily("bold"),
    color: "#111827",
    letterSpacing: -0.3,
  },
  avatarContainer: {
    borderRadius: 26,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: getFontFamily("bold"),
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // ── Hero Banner ──
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    overflow: "hidden",
    minHeight: 160,
  },
  heroDot1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -30,
    right: 60,
  },
  heroDot2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -20,
    right: 20,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLeft: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: getFontFamily("bold"),
    color: "#FFFFFF",
    lineHeight: 30,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 8,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontSize: 14,
    fontFamily: getFontFamily("semibold"),
    color: "#8C52FF",
  },
  heroIllustration: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  heroBookCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBubble: {
    position: "absolute",
    top: -8,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Sections ──
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily("bold"),
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily("regular"),
    color: "#6B7280",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginVertical: 20,
  },

  // ── Task Card ──
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  taskIllustration: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 11,
    fontFamily: getFontFamily("regular"),
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  taskTitle: {
    fontSize: 17,
    fontFamily: getFontFamily("bold"),
    color: "#111827",
    marginBottom: 4,
  },
  taskScore: {
    fontSize: 13,
    fontFamily: getFontFamily("regular"),
    color: "#6B7280",
    marginBottom: 8,
  },
  taskScoreValue: {
    fontFamily: getFontFamily("bold"),
    color: "#22C55E",
  },
  taskStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskStartText: {
    fontSize: 14,
    fontFamily: getFontFamily("semibold"),
    color: COLORS.primary,
  },

  // ── History ──
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: getFontFamily("semibold"),
    color: COLORS.primary,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(252,196,84,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 15,
    fontFamily: getFontFamily("semibold"),
    color: "#111827",
    marginBottom: 3,
  },
  historyItemScore: {
    fontSize: 13,
    fontFamily: getFontFamily("regular"),
    color: "#6B7280",
  },
  historyScoreValue: {
    fontFamily: getFontFamily("bold"),
    color: "#22C55E",
  },
  historyItemLevel: {
    fontSize: 12,
    fontFamily: getFontFamily("regular"),
    color: "#9CA3AF",
  },
  tipText: {
    fontSize: 13,
    fontFamily: getFontFamily("regular"),
    color: "#6B7280",
    lineHeight: 18,
  },
});
