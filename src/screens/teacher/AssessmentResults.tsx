import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase, auth } from '../../services/supabase';
import { COLORS } from '../../constants/theme';
import { ScreenLayout } from '../../components/ScreenLayout';
import { getFontFamily } from '../../../styles/fonts';

const { width } = Dimensions.get('window');
const STAT_CARD_WIDTH = (width - 52) / 2;

interface AssessmentData {
  id: string;
  name: string;
  email: string;
  roomName: string;
  roomCode: string;
  assessmentScore: number;
  readerLevel: number;
  assessmentDate: Date;
}

interface AssessmentResultsProps {
  navigation: any;
}

export default function AssessmentResults({ navigation }: AssessmentResultsProps) {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const { data: rooms } = await supabase
        .from('game_rooms')
        .select('room_code, room_name')
        .eq('created_by', user.id);

      const teacherRooms = new Map<string, { roomName: string; roomCode: string }>();
      (rooms ?? []).forEach(r => teacherRooms.set(r.room_code, { roomName: r.room_name, roomCode: r.room_code }));

      const { data: progressRows } = await supabase
        .from('student_progress')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('assessment_completed', true);

      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = 100;

      const assessmentsList: AssessmentData[] = (progressRows ?? []).map(row => {
        let assessmentScore = 0;
        if (Array.isArray(row.assessment_results)) {
          const totalPoints = row.assessment_results.reduce((sum: number, item: any) => sum + (item.score || 0), 0);
          assessmentScore = row.assessment_results.length > 0 ? Math.round(totalPoints / row.assessment_results.length) : 0;
        }
        totalScore += assessmentScore;
        highestScore = Math.max(highestScore, assessmentScore);
        lowestScore = Math.min(lowestScore, assessmentScore);

        const roomInfo = teacherRooms.get(row.room_code) || { roomName: 'Unknown Room', roomCode: row.room_code || 'N/A' };
        return {
          id: row.id,
          name: row.player_name || row.name || 'Unknown Player',
          email: row.email || 'No email',
          roomName: roomInfo.roomName,
          roomCode: roomInfo.roomCode,
          assessmentScore,
          readerLevel: row.reader_level || row.student_level || 0,
          assessmentDate: row.updated_at ? new Date(row.updated_at) : new Date(),
        };
      });

      assessmentsList.sort((a, b) => b.assessmentScore - a.assessmentScore);
      const averageScore = assessmentsList.length > 0 ? Math.round(totalScore / assessmentsList.length) : 0;
      setStats({
        totalAssessments: assessmentsList.length,
        averageScore,
        highestScore: assessmentsList.length > 0 ? highestScore : 0,
        lowestScore: assessmentsList.length > 0 ? lowestScore : 0,
      });
      setAssessments(assessmentsList);
    } catch (error) {
      console.error('AssessmentResults: failed to load results', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const getReaderLevelColor = (level: number) => {
    const colors: Record<number, string> = { 1: '#4CAF50', 2: '#2196F3', 3: '#FF9800', 4: '#9C27B0' };
    return colors[level] || '#9E9E9E';
  };

  const getReaderLevelLabel = (level: number) => {
    const labels: Record<number, string> = { 1: 'Foundation', 2: 'Developing', 3: 'Proficient', 4: 'Advanced' };
    return labels[level] || `L${level}`;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading assessments...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout noPadding>
      {/* Gradient Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Assessment Results</Text>
          <Text style={styles.subtitle}>{assessments.length} completed</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{assessments.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2×2 Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="clipboard-outline" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{stats.totalAssessments}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up-outline" size={22} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{stats.averageScore}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FFFDE7' }]}>
              <Ionicons name="trophy-outline" size={22} color="#FFD700" />
            </View>
            <Text style={styles.statValue}>{stats.highestScore}%</Text>
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="speedometer-outline" size={22} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>{stats.lowestScore}%</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
        </View>

        {/* Results List */}
        <Text style={styles.sectionTitle}>Student Rankings</Text>
        {assessments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="clipboard-outline" size={56} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Assessments Yet</Text>
            <Text style={styles.emptySubtitle}>Students will appear here once they complete their assessments</Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {assessments.map((assessment, index) => {
              const scoreColor = getScoreColor(assessment.assessmentScore);
              const rankColor = RANK_COLORS[index] || '#9CA3AF';
              const isTopThree = index < 3;

              return (
                <View key={assessment.id} style={[styles.resultCard, isTopThree && { borderColor: `${rankColor}50` }]}>
                  {/* Rank + Avatar + Name */}
                  <View style={styles.resultLeft}>
                    <View style={[styles.rankBadge, { backgroundColor: isTopThree ? rankColor : '#F3F4F6' }]}>
                      <Text style={[styles.rankText, { color: isTopThree ? 'white' : '#6B7280' }]}>
                        #{index + 1}
                      </Text>
                    </View>

                    <LinearGradient
                      colors={[scoreColor, `${scoreColor}CC`]}
                      style={styles.resultAvatar}
                    >
                      <Text style={styles.resultAvatarText}>{getInitials(assessment.name)}</Text>
                    </LinearGradient>

                    <View style={styles.resultNameBlock}>
                      <Text style={styles.resultName} numberOfLines={1}>{assessment.name}</Text>
                      <Text style={styles.resultRoom} numberOfLines={1}>{assessment.roomName}</Text>
                    </View>
                  </View>

                  {/* Score + Meta */}
                  <View style={styles.resultRight}>
                    <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                      <Text style={styles.scoreText}>{assessment.assessmentScore}%</Text>
                    </View>
                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>{getScoreLabel(assessment.assessmentScore)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    gap: 12,
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
  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 15,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 16,
  },
  resultsList: {
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resultLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: 12,
    fontFamily: getFontFamily('bold'),
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultAvatarText: {
    fontSize: 15,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  resultNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 2,
  },
  resultRoom: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
  },
  resultRight: {
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    paddingLeft: 8,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 58,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: getFontFamily('semibold'),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
  },
});
