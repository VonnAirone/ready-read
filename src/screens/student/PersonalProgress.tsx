// src/screens/PersonalProgress.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase, auth } from "../../services/supabase";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";
import { READER_LEVEL_INFO, determineReaderLevel } from "../../data/assessmentData";

interface MacroLevelProgress {
  words: { completed: boolean; scores: number[]; totalScore: number };
  sentences: { completed: boolean; scores: number[]; totalScore: number };
  paragraphs: { completed: boolean; scores: number[]; totalScore: number };
}

interface ProgressStats {
  totalAttempts: number;
  averageScore: number;
  perfectScores: number;
  improvementRate: number;
  readerLevel: 1 | 2 | 3 | 4;
  macroLevel: number;
  macroLevelProgress?: { [key: number]: MacroLevelProgress };
  currentContentType?: 'words' | 'sentences' | 'paragraphs';
  wordsCompleted: number;
  sentencesCompleted: number;
  paragraphsCompleted: number;
  canAdvanceToNextMacro: boolean;
  totalCorrect: number;
  totalIncorrect: number;
}

export default function PersonalProgress({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        fetchPersonalProgress(currentUser.email ?? null);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPersonalProgress = async (_email: string | null) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const personalDocId = `${user.id}_PERSONAL_PRACTICE`;

      const { data: personal } = await supabase
        .from('student_progress')
        .select('reader_level, student_level, macro_level, current_macro_level, macro_level_progress, current_content_type, first_attempt_scores')
        .eq('id', personalDocId)
        .single();

      let currentReaderLevel: 1 | 2 | 3 | 4 = 1;
      let currentMacroLevel = 1;
      let macroLevelProgress: Record<string, any> = {};
      let currentContentType: 'words' | 'sentences' | 'paragraphs' = 'words';

      if (personal) {
        currentReaderLevel = personal.reader_level || personal.student_level || 1;
        currentMacroLevel = personal.macro_level || personal.current_macro_level || 1;
        macroLevelProgress = personal.macro_level_progress || {};
        currentContentType = personal.current_content_type || 'words';
      }

      const { data: allRows } = await supabase
        .from('student_progress')
        .select('id, first_attempt_scores, macro_level_progress, scores, scores_array')
        .eq('user_id', user.id);

      let wordsCompleted = 0;
      let sentencesCompleted = 0;
      let paragraphsCompleted = 0;

      if (personal?.first_attempt_scores) {
        const fas = personal.first_attempt_scores as Record<string, number>;
        Object.keys(fas).forEach(key => {
          const level = parseInt(key);
          if (level <= 10) wordsCompleted++;
          else if (level <= 20) sentencesCompleted++;
          else paragraphsCompleted++;
        });
      } else if (personal?.macro_level_progress) {
        const currentMacroProgress = personal.macro_level_progress[currentMacroLevel] || {
          words: { scores: [] }, sentences: { scores: [] }, paragraphs: { scores: [] }
        };
        wordsCompleted = currentMacroProgress.words?.scores?.length || 0;
        sentencesCompleted = currentMacroProgress.sentences?.scores?.length || 0;
        paragraphsCompleted = currentMacroProgress.paragraphs?.scores?.length || 0;
      }

      let totalCorrect = 0;
      let totalIncorrect = 0;
      let allScoresAcrossRooms: number[] = [];

      (allRows ?? []).forEach((row) => {
        if (row.id === personalDocId) return;

        if (row.first_attempt_scores) {
          Object.values(row.first_attempt_scores).forEach((score: any) => {
            const s = Number(score);
            allScoresAcrossRooms.push(s);
            if (s >= 70) totalCorrect++; else totalIncorrect++;
          });
        }
        if (row.macro_level_progress) {
          Object.values(row.macro_level_progress).forEach((ml: any) => {
            ['words', 'sentences', 'paragraphs'].forEach(type => {
              (ml[type]?.scores ?? []).forEach((score: number) => {
                allScoresAcrossRooms.push(score);
                if (score >= 70) totalCorrect++; else totalIncorrect++;
              });
            });
          });
        }
        (row.scores ?? []).forEach((s: number) => { allScoresAcrossRooms.push(s); if (s >= 70) totalCorrect++; else totalIncorrect++; });
        (row.scores_array ?? []).forEach((s: number) => { allScoresAcrossRooms.push(s); if (s >= 70) totalCorrect++; else totalIncorrect++; });
      });

      const totalAttempts = totalCorrect + totalIncorrect;

      // Calculate average score from all rooms
      const averageScore = allScoresAcrossRooms.length > 0
        ? allScoresAcrossRooms.reduce((a, b) => a + b, 0) / allScoresAcrossRooms.length
        : 0;
      const perfectScores = allScoresAcrossRooms.filter(score => score >= 95).length;

      // Calculate improvement rate from recent vs older scores across all rooms
      const recentScores = allScoresAcrossRooms.slice(0, 10);
      const olderScores = allScoresAcrossRooms.slice(10, 20);
      const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : recentAvg;
      const improvementRate = olderScores.length > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      // Check if all 30 micro-levels completed for current macro level
      const canAdvanceToNextMacro = wordsCompleted + sentencesCompleted + paragraphsCompleted >= 30;

      // Check if user has any progress at all
      if (!allRows || allRows.length === 0 || totalAttempts === 0) {
        setHasProgress(false);
        setLoading(false);
        return;
      }

      // Set stats from ALL rooms
      setStats({
        totalAttempts,
        averageScore,
        perfectScores,
        improvementRate,
        readerLevel: currentReaderLevel,
        macroLevel: currentMacroLevel,
        macroLevelProgress,
        currentContentType,
        wordsCompleted,
        sentencesCompleted,
        paragraphsCompleted,
        canAdvanceToNextMacro,
        totalCorrect,
        totalIncorrect
      });

      setHasProgress(true);
      
    } catch (error) {
      console.error('PersonalProgress: failed to load progress', error);
      setHasProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (!user) return;
    
    // Navigate to the unified room with personal practice mode
    navigation.navigate('PronunciationRoom', { roomData: { isPersonalRoom: true } });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getReaderLevelColor = (level: 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1: return "#96CEB4";  // Light Green
      case 2: return "#FFEAA7";  // Light Yellow
      case 3: return "#74B9FF";  // Light Blue
      case 4: return "#FD79A8";  // Light Pink
      default: return "#DDA0DD";
    }
  };

  const getMacroLevelColor = (level: number) => {
    // Color based on macro level ranges
    if (level >= 25) return "#FFD700";      // Gold
    if (level >= 20) return "#FF6B35";      // Orange
    if (level >= 15) return "#4ECDC4";      // Teal
    if (level >= 10) return "#45B7D1";      // Blue
    if (level >= 5) return "#96CEB4";       // Green
    return "#FFEAA7";                       // Yellow
  };

  const getReaderLevelName = (level: 1 | 2 | 3 | 4): string => {
    return READER_LEVEL_INFO[level]?.label || `Reader Level ${level}`;
  };

  const getReaderLevelDescription = (level: 1 | 2 | 3 | 4): string => {
    return READER_LEVEL_INFO[level]?.description || "";
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your progress...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!hasProgress) {
    return (
      <ScreenLayout>
          <View style={styles.initiationContainer}>
            <View style={styles.initiationContent}>
              <Ionicons name="mic-circle" size={80} color={COLORS.primary} />
              <Text style={styles.initiationTitle}>Start Your Pronunciation Journey</Text>
              <Text style={styles.initiationSubtitle}>
                Begin practicing to track your Reader Level and Macro Level progression!
              </Text>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartPractice}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={24} color={COLORS.white} />
                <Text style={styles.startButtonText}>Start Practicing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Personal Progress</Text>
          
          {stats && (
            <>
              {/* Practice Statistics Card */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Overall Practice Statistics</Text>
                <Text style={styles.statsSubtitle}>Across all rooms and practice sessions</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItemBox}>
                    <Ionicons name="checkmark-circle" size={40} color="#52c41a" />
                    <Text style={styles.statItemNumber}>{stats.totalCorrect}</Text>
                    <Text style={styles.statItemLabel}>Correct</Text>
                  </View>
                  <View style={styles.statItemBox}>
                    <Ionicons name="close-circle" size={40} color="#f5222d" />
                    <Text style={styles.statItemNumber}>{stats.totalIncorrect}</Text>
                    <Text style={styles.statItemLabel}>Incorrect</Text>
                  </View>
                  <View style={styles.statItemBox}>
                    <Ionicons name="bar-chart" size={40} color="#1890ff" />
                    <Text style={styles.statItemNumber}>{stats.totalCorrect + stats.totalIncorrect}</Text>
                    <Text style={styles.statItemLabel}>Total</Text>
                  </View>
                </View>
                {(stats.totalCorrect + stats.totalIncorrect) === 0 && (
                  <Text style={styles.noDataText}>
                    Start practicing to see your statistics!
                  </Text>
                )}
              </View>

              {/* Levels Section */}
              <View style={styles.levelsContainer}>
                {/* Reader Level Card */}
                <View style={styles.levelCard}>
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelLabel}>Current Level</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getReaderLevelColor(stats.readerLevel) }]}>
                      <Text style={styles.levelText}>Reader Level {stats.readerLevel}</Text>
                    </View>
                  </View>
                  <Text style={styles.levelName}>{getReaderLevelName(stats.readerLevel)}</Text>
                  <Text style={styles.levelDescription}>{getReaderLevelDescription(stats.readerLevel)}</Text>
                  
                  {/* Overall Progress Indicator */}
                  <View style={styles.overallProgressContainer}>
                    <Text style={styles.overallProgressLabel}>Overall Completion</Text>
                    <View style={styles.overallProgressBar}>
                      <View 
                        style={[
                          styles.overallProgressFill, 
                          { 
                            width: `${((stats.readerLevel - 1) * 4 + stats.macroLevel) / 16 * 100}%`,
                            backgroundColor: getReaderLevelColor(stats.readerLevel)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.overallProgressText}>
                      {((stats.readerLevel - 1) * 4 + stats.macroLevel)} of 16 total levels completed
                    </Text>
                  </View>
                </View>  
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="school" size={32} color="#4ECDC4" />
                  <Text style={styles.statNumber}>{stats.readerLevel}</Text>
                  <Text style={styles.statLabel}>Reader Level</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="layers" size={32} color="#FF6B35" />
                  <Text style={styles.statNumber}>{stats.macroLevel}/4</Text>
                  <Text style={styles.statLabel}>Macro Level</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.statNumber}>{stats.totalAttempts}</Text>
                  <Text style={styles.statLabel}>Practice Sessions</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="analytics" size={32} color="#96CEB4" />
                  <Text style={styles.statNumber}>{Math.round(stats.averageScore)}%</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </View>
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: '#374151',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 40,
    margin: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  initiationTitle: {
    fontSize: 24,
    color: '#111827',
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
    fontFamily: getFontFamily('semibold'),
  },
  initiationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: getFontFamily('regular'),
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: getFontFamily('bold'),
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: getFontFamily('regular'),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItemBox: {
    alignItems: 'center',
    minWidth: '30%',
  },
  statItemNumber: {
    fontSize: 24,
    color: COLORS.black,
    marginTop: 8,
    fontFamily: getFontFamily('bold'),
  },
  statItemLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: getFontFamily('regular'),
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
    fontFamily: getFontFamily('regular'),
  },
  title: {
    fontSize: 28,
    color: '#111827',
    textAlign: "center",
    marginBottom: 30,
    fontFamily: getFontFamily('bold'),
  },
  levelsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  levelCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: getFontFamily('medium'),
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  levelText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: getFontFamily('bold'),
  },
  levelName: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
    fontFamily: getFontFamily('semibold'),
  },
  levelDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: getFontFamily('regular'),
  },
  overallProgressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  overallProgressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: getFontFamily('medium'),
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  overallProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: "center",
    fontFamily: getFontFamily('regular'),
  },
  nextLevelText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    fontFamily: getFontFamily('medium'),
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
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: getFontFamily('bold'),
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: "center",
    fontFamily: getFontFamily('regular'),
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
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  // Challenge Progress Section Styles
  challengeSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
    fontFamily: getFontFamily('bold'),
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontFamily: getFontFamily('regular'),
  },
  challengeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 4,
    fontFamily: getFontFamily('semibold'),
  },
  challengeProgress: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  advancementBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    gap: 12,
  },
  advancementText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
});