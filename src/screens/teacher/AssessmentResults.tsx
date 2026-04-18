import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, auth } from '../../services/supabase';
import { COLORS } from '../../constants/theme';
import { ScreenLayout } from '../../components/ScreenLayout';
import { getFontFamily } from '../../../styles/fonts';

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
      setStats({ totalAssessments: assessmentsList.length, averageScore, highestScore: assessmentsList.length > 0 ? highestScore : 0, lowestScore: assessmentsList.length > 0 ? lowestScore : 0 });
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

  const getReaderLevelColor = (level: number) => {
    const colors = {
      1: '#4CAF50',
      2: '#2196F3',
      3: '#FF9800',
      4: '#9C27B0',
    };
    return colors[level as keyof typeof colors] || '#666';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
    <ScreenLayout>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Assessment Results</Text>
          <View style={styles.headerRight}>
            <Text style={styles.studentCount}>{assessments.length}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="clipboard-outline" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{stats.totalAssessments}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{stats.highestScore}%</Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="speedometer-outline" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{stats.lowestScore}%</Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 1.5 }]}>Student</Text>
              <Text style={styles.headerText}>Score</Text>
              <Text style={styles.headerText}>Level</Text>
              <Text style={styles.headerText}>Date</Text>
            </View>

            {assessments.length === 0 ? (
              <View style={styles.noDataRow}>
                <Ionicons name="clipboard-outline" size={60} color="#D1D5DB" />
                <Text style={styles.noDataText}>No completed assessments yet</Text>
                <Text style={styles.noDataSubtext}>
                  Students will appear here once they complete their assessments
                </Text>
              </View>
            ) : (
              <View style={styles.tableBody}>
                {assessments.map((assessment, index) => (
                  <View key={assessment.id} style={styles.tableRow}>
                    <View style={[styles.nameCell, { flex: 1.5 }]}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.studentDetails}>
                        <Text style={styles.studentNameTable} numberOfLines={1}>
                          {assessment.name}
                        </Text>
                        <Text style={styles.roomNameSmall} numberOfLines={1}>
                          {assessment.roomName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scoreCell}>
                      <View style={[
                        styles.scoreBadge,
                        { backgroundColor: getScoreColor(assessment.assessmentScore) }
                      ]}>
                        <Text style={styles.scoreText}>{assessment.assessmentScore}%</Text>
                      </View>
                    </View>
                    <View style={styles.levelCell}>
                      <View style={[
                        styles.levelBadge,
                        { backgroundColor: getReaderLevelColor(assessment.readerLevel) }
                      ]}>
                        <Text style={styles.levelText}>{assessment.readerLevel}</Text>
                      </View>
                    </View>
                    <View style={styles.dateCell}>
                      <Text style={styles.dateText}>{formatDate(assessment.assessmentDate)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
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
    paddingTop: 20,
    paddingBottom: 16,
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
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  tableContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    textAlign: 'center',
  },
  tableBody: {
    gap: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  nameCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontFamily: getFontFamily('bold'),
    color: '#374151',
  },
  studentDetails: {
    flex: 1,
  },
  studentNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
  },
  roomNameSmall: {
    fontSize: 11,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    marginTop: 2,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  levelCell: {
    flex: 1,
    alignItems: 'center',
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  noDataRow: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#374151',
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
    marginTop: 16,
  },
});
