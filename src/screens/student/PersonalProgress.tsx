// src/screens/PersonalProgress.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

interface ProgressStats {
  totalAttempts: number;
  averageScore: number;
  perfectScores: number;
  improvementRate: number;
  currentLevel: string;
  nextLevel: string;
  progressToNext: number;
}

export default function PersonalProgress({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [hasProgress, setHasProgress] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchPersonalProgress(currentUser.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchPersonalProgress = async (email: string) => {
    setLoading(true);
    try {
      // Query for all student results (both room and personal practice)
      // We'll filter for personal practice on client side if needed
      const q = query(
        collection(db, "StudentResultJoin"),
        where("email", "==", email)
      );
      
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setHasProgress(false);
        setLoading(false);
        return;
      }

      setHasProgress(true);
      
      // Get all results and sort by createdAt (client-side sorting)
      const allResults = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })).sort((a: any, b: any) => {
        // Sort by createdAt descending (newest first)
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime.getTime() - aTime.getTime();
      });
      
      const scores = allResults.map((result: any) => result.score || 0);
      
      // Calculate stats
      const totalAttempts = scores.length;
      const averageScore = scores.reduce((a, b) => a + b, 0) / totalAttempts;
      const perfectScores = scores.filter(score => score >= 95).length;
      
      // Get recent scores for improvement calculation
      const recentScores = scores.slice(0, 10);
      const olderScores = scores.slice(10, 20);
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : recentAvg;
      const improvementRate = olderScores.length > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      // Determine level based on average score
      let currentLevel = "Beginner";
      let nextLevel = "Intermediate";
      let progressToNext = 0;

      if (averageScore >= 90) {
        currentLevel = "Expert";
        nextLevel = "Master";
        progressToNext = Math.min(100, ((averageScore - 90) / 10) * 100);
      } else if (averageScore >= 75) {
        currentLevel = "Advanced";
        nextLevel = "Expert";
        progressToNext = ((averageScore - 75) / 15) * 100;
      } else if (averageScore >= 60) {
        currentLevel = "Intermediate";
        nextLevel = "Advanced";
        progressToNext = ((averageScore - 60) / 15) * 100;
      } else if (averageScore >= 40) {
        currentLevel = "Beginner";
        nextLevel = "Intermediate";
        progressToNext = ((averageScore - 40) / 20) * 100;
      } else {
        currentLevel = "Novice";
        nextLevel = "Beginner";
        progressToNext = (averageScore / 40) * 100;
      }

      setStats({
        totalAttempts,
        averageScore,
        perfectScores,
        improvementRate,
        currentLevel,
        nextLevel,
        progressToNext
      });

      // Set recent scores for display
      setRecentScores(allResults.slice(0, 5));
      
    } catch (error) {
      console.error("Error fetching progress:", error);
      setHasProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (!user) return;
    
    // Create personal practice room data
    const personalRoomData = {
      roomCode: `PERSONAL_${user.uid}`, // Unique personal room code
      roomName: "Personal Practice Room",
      description: "Your private practice space",
      isPersonalRoom: true,
      userId: user.uid,
      userEmail: user.email,
      createdAt: new Date().toISOString(), // Convert to string for serialization
    };
    
    // Navigate to pronunciation room with personal room data
    navigation.navigate("PronunciationRoom", { 
      roomData: personalRoomData,
      fromPersonalProgress: true 
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Master": return "#FFD700";
      case "Expert": return "#FF6B35";
      case "Advanced": return "#4ECDC4";
      case "Intermediate": return "#45B7D1";
      case "Beginner": return "#96CEB4";
      default: return "#FFEAA7";
    }
  };

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Analyzing your progress...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!hasProgress) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.initiationContainer}>
            <View style={styles.initiationContent}>
              <Ionicons name="mic-circle" size={80} color={COLORS.white} />
              <Text style={styles.initiationTitle}>Start Your Pronunciation Journey</Text>
              <Text style={styles.initiationSubtitle}>
                No progress found yet. Begin practicing to track your pronunciation improvement!
              </Text>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartPractice}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                <Text style={styles.startButtonText}>Start Practicing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Personal Progress</Text>
          
          {stats && (
            <>
              {/* Current Level Section */}
              <View style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelLabel}>Current Level</Text>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(stats.currentLevel) }]}>
                    <Text style={styles.levelText}>{stats.currentLevel}</Text>
                  </View>
                </View>
                
                <Text style={styles.nextLevelText}>Next: {stats.nextLevel}</Text>
                {renderProgressBar(stats.progressToNext)}
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.statNumber}>{stats.totalAttempts}</Text>
                  <Text style={styles.statLabel}>Total Attempts</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="analytics" size={32} color="#4ECDC4" />
                  <Text style={styles.statNumber}>{Math.round(stats.averageScore)}%</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="star" size={32} color="#FF6B35" />
                  <Text style={styles.statNumber}>{stats.perfectScores}</Text>
                  <Text style={styles.statLabel}>Perfect Scores</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="trending-up" size={32} color={stats.improvementRate >= 0 ? "#96CEB4" : "#FF7675"} />
                  <Text style={styles.statNumber}>
                    {stats.improvementRate >= 0 ? '+' : ''}{Math.round(stats.improvementRate)}%
                  </Text>
                  <Text style={styles.statLabel}>Improvement</Text>
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.recentCard}>
                <Text style={styles.recentTitle}>Recent Performance</Text>
                {recentScores.map((result, index) => (
                  <View key={index} style={styles.recentItem}>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentWord}>{result.word || 'Practice'}</Text>
                      <Text style={styles.recentDate}>
                        {result.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                      </Text>
                    </View>
                    <View style={[styles.recentScore, { backgroundColor: result.score >= 80 ? '#96CEB4' : result.score >= 60 ? '#FFEAA7' : '#FF7675' }]}>
                      <Text style={styles.recentScoreText}>{result.score}%</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.practiceButton}
                onPress={handleStartPractice}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={24} color={COLORS.white} />
                <Text style={styles.practiceButtonText}>Continue Practicing</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 12,
    fontFamily: getFontFamily('regular'),
  },
  initiationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initiationContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 40,
    margin: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  initiationTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
    fontFamily: getFontFamily('semibold'),
  },
  initiationSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: getFontFamily('regular'),
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    fontFamily: getFontFamily('semibold'),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: getFontFamily('bold'),
  },
  levelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    fontFamily: getFontFamily('semibold'),
  },
  nextLevelText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
    fontFamily: getFontFamily('regular'),
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    minWidth: 40,
    fontFamily: getFontFamily('semibold'),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: getFontFamily('bold'),
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontFamily: getFontFamily('regular'),
  },
  recentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 16,
    fontFamily: getFontFamily('semibold'),
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  recentInfo: {
    flex: 1,
  },
  recentWord: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: getFontFamily('medium'),
  },
  recentDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: getFontFamily('regular'),
  },
  recentScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recentScoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    fontFamily: getFontFamily('semibold'),
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 199, 89, 0.9)",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 30,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  practiceButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
});