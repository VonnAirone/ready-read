import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";
import { READER_LEVEL_INFO } from "../../data/assessmentData";

interface ProgressStats {
  readerLevel: 1 | 2 | 3 | 4;
  macroLevel: number;
  currentContentType: 'words' | 'sentences' | 'paragraphs';
  wordsCompleted: number;
  sentencesCompleted: number;
  paragraphsCompleted: number;
  averageScore: number;
  totalAttempts: number;
}

const LEVEL_GRADIENTS: Record<number, [string, string]> = {
  1: ["#8C52FF", "#6A3BB5"],
  2: ["#3B82F6", "#1D4ED8"],
  3: ["#10B981", "#047857"],
  4: ["#F59E0B", "#D97706"],
};

const ITEMS_PER_TYPE = 10;

export default function PersonalProgress({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPersonalProgress();
    }, [])
  );

  const fetchPersonalProgress = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) return;

      const personalDocId = `${user.id}_PERSONAL_PRACTICE`;

      const { data: personal } = await supabase
        .from('student_progress')
        .select('reader_level, student_level, macro_level, current_macro_level, macro_level_progress, current_content_type, scores_array')
        .eq('id', personalDocId)
        .single();

      const currentReaderLevel: 1 | 2 | 3 | 4 = (personal?.reader_level || personal?.student_level || 1) as 1 | 2 | 3 | 4;
      const currentMacroLevel: number = personal?.macro_level || personal?.current_macro_level || 1;
      const currentContentType: 'words' | 'sentences' | 'paragraphs' = personal?.current_content_type || 'words';

      let wordsCompleted = 0;
      let sentencesCompleted = 0;
      let paragraphsCompleted = 0;

      if (personal?.macro_level_progress) {
        const currentMacroProgress = personal.macro_level_progress[currentMacroLevel] || {
          words: { scores: [] }, sentences: { scores: [] }, paragraphs: { scores: [] }
        };
        wordsCompleted = currentMacroProgress.words?.scores?.length || 0;
        sentencesCompleted = currentMacroProgress.sentences?.scores?.length || 0;
        paragraphsCompleted = currentMacroProgress.paragraphs?.scores?.length || 0;
      }

      // Aggregate personal practice scores only — do not mix in game room rows
      let allScores: number[] = [];
      if (personal?.macro_level_progress) {
        Object.values(personal.macro_level_progress).forEach((ml: any) => {
          ['words', 'sentences', 'paragraphs'].forEach(type => {
            (ml[type]?.scores ?? []).forEach((s: number) => allScores.push(s));
          });
        });
      }
      // Include any in-progress scores not yet flushed to macro_level_progress
      if (Array.isArray(personal?.scores_array)) {
        (personal.scores_array as number[]).forEach(s => allScores.push(s));
      }

      const totalAttempts = allScores.length;
      const averageScore = totalAttempts > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalAttempts)
        : 0;

      if (totalAttempts === 0 && wordsCompleted === 0 && sentencesCompleted === 0 && paragraphsCompleted === 0) {
        setHasProgress(false);
        return;
      }

      setStats({
        readerLevel: currentReaderLevel,
        macroLevel: currentMacroLevel,
        currentContentType,
        wordsCompleted,
        sentencesCompleted,
        paragraphsCompleted,
        averageScore,
        totalAttempts,
      });
      setHasProgress(true);
    } catch (error) {
      console.error('PersonalProgress: failed to load progress', error);
      setHasProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = () => {
    navigation.navigate('PronunciationRoom', { roomData: { isPersonalRoom: true } });
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!hasProgress) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <LinearGradient colors={["#8C52FF", "#6A3BB5"]} style={styles.emptyIconWrap}>
            <Ionicons name="mic" size={36} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No practice yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your first word to start tracking your progress here.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handlePractice} activeOpacity={0.85}>
            <Ionicons name="play-circle" size={20} color="#fff" />
            <Text style={styles.ctaText}>Start Practicing</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  const levelLabel = READER_LEVEL_INFO[stats!.readerLevel]?.label || `Reader Level ${stats!.readerLevel}`;
  const gradient = LEVEL_GRADIENTS[stats!.readerLevel] ?? LEVEL_GRADIENTS[1];
  const scoreColor = stats!.averageScore >= 80 ? "#22C55E" : stats!.averageScore >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <ScreenLayout noPadding>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Progress</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Level Hero Card */}
        <LinearGradient colors={gradient} style={styles.heroCard}>
          <View style={styles.heroDot1} />
          <View style={styles.heroDot2} />
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Reader Level {stats!.readerLevel}</Text>
              <Text style={styles.heroLevelName}>{levelLabel}</Text>
            </View>
            <View style={styles.macroBadge}>
              <Text style={styles.macroLabel}>Macro</Text>
              <Text style={styles.macroValue}>{stats!.macroLevel}/4</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats!.averageScore}%</Text>
              <Text style={styles.heroStatLabel}>Avg Score</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats!.totalAttempts}</Text>
              <Text style={styles.heroStatLabel}>Items Practiced</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Macro Level Progress</Text>
          <Text style={styles.sectionSubtitle}>Level {stats!.macroLevel} — {stats!.currentContentType} in focus</Text>

          <View style={styles.progressCard}>
            <ProgressRow
              label="Words"
              icon="text"
              done={stats!.wordsCompleted}
              total={ITEMS_PER_TYPE}
              active={stats!.currentContentType === 'words'}
              color="#8C52FF"
            />
            <ProgressRow
              label="Sentences"
              icon="chatbubble-ellipses"
              done={stats!.sentencesCompleted}
              total={ITEMS_PER_TYPE}
              active={stats!.currentContentType === 'sentences'}
              color="#3B82F6"
            />
            <ProgressRow
              label="Paragraphs"
              icon="document-text"
              done={stats!.paragraphsCompleted}
              total={ITEMS_PER_TYPE}
              active={stats!.currentContentType === 'paragraphs'}
              color="#10B981"
              isLast
            />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaButton} onPress={handlePractice} activeOpacity={0.85}>
            <Ionicons name="mic" size={20} color="#fff" />
            <Text style={styles.ctaText}>Continue Practicing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

function ProgressRow({
  label, icon, done, total, active, color, isLast,
}: {
  label: string;
  icon: string;
  done: number;
  total: number;
  active: boolean;
  color: string;
  isLast?: boolean;
}) {
  const pct = Math.min(done / total, 1);
  const completed = done >= total;

  return (
    <View style={[styles.progressRow, !isLast && styles.progressRowBorder]}>
      <View style={[styles.progressIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.progressInfo}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <View style={styles.progressMeta}>
            {active && !completed && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>In Progress</Text>
              </View>
            )}
            {completed && (
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            )}
            <Text style={styles.progressCount}>{Math.min(done, total)}/{total}</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 32 },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // Empty state
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  headerSpacer: { width: 36 },

  // Hero card
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroDot1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: 40,
  },
  heroDot2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -20,
    right: -10,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroLevelName: {
    fontSize: 26,
    fontFamily: getFontFamily('bold'),
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  macroBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroStatValue: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    marginBottom: 14,
    textTransform: 'capitalize',
  },

  // Progress card
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  progressRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activePillText: {
    fontSize: 11,
    fontFamily: getFontFamily('semibold'),
    color: '#7C3AED',
  },
  progressCount: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#FFFFFF',
  },
});
