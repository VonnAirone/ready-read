import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

interface Student {
  id: string;
  playerName: string;
  email?: string;
  readerLevel: number;
  macroLevel: number;
  userId: string;
  joinedAt?: any;
  macroLevelProgress?: any;
  scores?: number[];
}

const READER_LEVEL_INFO: Record<number, { color: string; bg: string; label: string; gradient: [string, string] }> = {
  1: { color: '#4CAF50', bg: '#E8F5E9', label: 'Foundation', gradient: ['#4CAF50', '#2E7D32'] },
  2: { color: '#2196F3', bg: '#E3F2FD', label: 'Developing', gradient: ['#2196F3', '#1565C0'] },
  3: { color: '#FF9800', bg: '#FFF3E0', label: 'Proficient', gradient: ['#FF9800', '#E65100'] },
  4: { color: '#9C27B0', bg: '#F3E5F5', label: 'Advanced', gradient: ['#9C27B0', '#6A1B9A'] },
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function RoomStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { roomId, roomName, roomCode } = route.params ?? {};

  useEffect(() => {
    if (!roomCode) return;

    const loadStudents = async () => {
      try {
        const { data: rows } = await supabase
          .from('student_progress')
          .select('*')
          .eq('room_code', roomCode);

        const fetchedStudents = (rows ?? []).map((row) => ({
          id: row.id,
          playerName: row.player_name || "Unknown Player",
          email: row.email || "No email",
          readerLevel: row.reader_level || 1,
          macroLevel: row.macro_level || 1,
          userId: row.user_id || "",
          joinedAt: row.joined_at || null,
          macroLevelProgress: row.macro_level_progress || {},
          scores: row.scores || [],
        }));

        fetchedStudents.sort((a, b) => {
          if (b.readerLevel !== a.readerLevel) return b.readerLevel - a.readerLevel;
          return b.macroLevel - a.macroLevel;
        });

        setStudents(fetchedStudents);
      } catch (err) {
        console.error('[RoomStudents] failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();

    const channel = supabase
      .channel('room_students_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_progress', filter: `room_code=eq.${roomCode}` }, loadStudents)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  const getLevelInfo = (level: number) =>
    READER_LEVEL_INFO[level] || { color: '#9E9E9E', bg: '#F5F5F5', label: `Level ${level}`, gradient: ['#9E9E9E', '#616161'] as [string, string] };

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const renderStudent = ({ item, index }: { item: Student; index: number }) => {
    const levelInfo = getLevelInfo(item.readerLevel);
    const rankColor = RANK_COLORS[index] || '#9CA3AF';
    const isTopThree = index < 3;

    return (
      <View style={[styles.studentCard, isTopThree && styles.studentCardHighlighted]}>
        {/* Rank badge */}
        <View style={[styles.rankBadge, { backgroundColor: isTopThree ? rankColor : '#F3F4F6' }]}>
          <Text style={[styles.rankText, { color: isTopThree ? 'white' : '#6B7280' }]}>
            #{index + 1}
          </Text>
        </View>

        {/* Avatar */}
        <LinearGradient colors={levelInfo.gradient} style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.playerName)}</Text>
        </LinearGradient>

        {/* Name + levels */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>{item.playerName}</Text>
          <View style={styles.levelBadgesRow}>
            <View style={[styles.levelBadge, { backgroundColor: levelInfo.bg }]}>
              <Text style={[styles.levelBadgeText, { color: levelInfo.color }]}>{levelInfo.label}</Text>
            </View>
            <View style={styles.macroBadge}>
              <Text style={styles.macroBadgeText}>M{item.macroLevel}</Text>
            </View>
          </View>
        </View>

        {/* View button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            setSelectedStudent(item);
            setShowDiagnosticModal(true);
          }}
        >
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenLayout noPadding>
      {/* Gradient Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Room Students</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{roomName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Room info strip */}
      <View style={styles.roomInfoStrip}>
        <View style={styles.roomInfoChip}>
          <Ionicons name="key-outline" size={16} color={COLORS.primary} />
          <Text style={styles.roomInfoChipText}>{roomCode}</Text>
        </View>
        <View style={styles.roomInfoChip}>
          <Ionicons name="people-outline" size={16} color={COLORS.primary} />
          <Text style={styles.roomInfoChipText}>
            {students.length} Student{students.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Students List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="people-outline" size={56} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Students Yet</Text>
          <Text style={styles.emptySubtitle}>
            Students will appear here once they join using room code
          </Text>
          <View style={styles.roomCodeDisplay}>
            <Text style={styles.roomCodeDisplayLabel}>Share this code:</Text>
            <Text style={styles.roomCodeDisplayCode}>{roomCode}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Diagnostic Modal */}
      {selectedStudent && (
        <Modal
          visible={showDiagnosticModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDiagnosticModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Diagnostic Report</Text>
                <TouchableOpacity
                  style={styles.modalCloseIcon}
                  onPress={() => setShowDiagnosticModal(false)}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Student profile */}
                <View style={styles.modalProfile}>
                  <LinearGradient
                    colors={getLevelInfo(selectedStudent.readerLevel).gradient}
                    style={styles.modalAvatar}
                  >
                    <Text style={styles.modalAvatarText}>{getInitials(selectedStudent.playerName)}</Text>
                  </LinearGradient>
                  <Text style={styles.modalStudentName}>{selectedStudent.playerName}</Text>
                  <Text style={styles.modalStudentEmail}>{selectedStudent.email}</Text>
                  <View style={styles.modalLevelRow}>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelInfo(selectedStudent.readerLevel).bg }]}>
                      <Text style={[styles.levelBadgeText, { color: getLevelInfo(selectedStudent.readerLevel).color }]}>
                        {getLevelInfo(selectedStudent.readerLevel).label}
                      </Text>
                    </View>
                    <View style={styles.macroBadge}>
                      <Text style={styles.macroBadgeText}>Macro {selectedStudent.macroLevel}</Text>
                    </View>
                  </View>
                </View>

                {(() => {
                  const stats = calculateDiagnosticStats(selectedStudent);
                  return (
                    <>
                      <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { borderTopColor: '#4CAF50' }]}>
                          <Ionicons name="checkmark-circle" size={26} color="#4CAF50" />
                          <Text style={styles.statBoxValue}>{stats.totalCorrect}</Text>
                          <Text style={styles.statBoxLabel}>Correct</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#F44336' }]}>
                          <Ionicons name="close-circle" size={26} color="#F44336" />
                          <Text style={styles.statBoxValue}>{stats.totalIncorrect}</Text>
                          <Text style={styles.statBoxLabel}>Incorrect</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#2196F3' }]}>
                          <Ionicons name="list" size={26} color="#2196F3" />
                          <Text style={styles.statBoxValue}>{stats.totalAttempts}</Text>
                          <Text style={styles.statBoxLabel}>Attempts</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#FFD700' }]}>
                          <Ionicons name="trophy" size={26} color="#FFD700" />
                          <Text style={styles.statBoxValue}>{stats.averageScore}%</Text>
                          <Text style={styles.statBoxLabel}>Avg Score</Text>
                        </View>
                      </View>

                      <View style={styles.recommendationSection}>
                        <View style={styles.recommendationHeader}>
                          <Ionicons name="medical" size={18} color={COLORS.primary} />
                          <Text style={styles.recommendationTitle}>Recommendation</Text>
                        </View>
                        <Text style={styles.recommendationText}>{stats.recommendation}</Text>
                      </View>
                    </>
                  );
                })()}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDiagnosticModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScreenLayout>
  );
}

const calculateDiagnosticStats = (student: Student) => {
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalScore = 0;
  let totalAttempts = 0;

  if (student.macroLevelProgress) {
    Object.values(student.macroLevelProgress).forEach((macroLevel: any) => {
      ['words', 'sentences', 'paragraphs'].forEach((type) => {
        if (macroLevel[type]?.scores) {
          macroLevel[type].scores.forEach((score: number) => {
            totalAttempts++;
            totalScore += score;
            if (score >= 70) totalCorrect++;
            else totalIncorrect++;
          });
        }
      });
    });
  }

  if (student.scores && Array.isArray(student.scores)) {
    student.scores.forEach((score: number) => {
      totalAttempts++;
      totalScore += score;
      if (score >= 70) totalCorrect++;
      else totalIncorrect++;
    });
  }

  const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
  const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  let recommendation = '';
  if (totalAttempts === 0) {
    recommendation = 'This student has not started practicing yet. Encourage them to begin!';
  } else if (averageScore >= 90) {
    recommendation = `Outstanding! ${accuracyRate}% accuracy. Consider advancing to the next reader level.`;
  } else if (averageScore >= 80) {
    recommendation = `Great work at ${accuracyRate}% accuracy. Focus on the ${totalIncorrect} missed items for improvement.`;
  } else if (averageScore >= 70) {
    recommendation = `Good progress (${accuracyRate}%). Focus on pronunciation clarity, pacing, and reviewing difficult words.`;
  } else if (averageScore >= 50) {
    recommendation = `Needs more practice (${accuracyRate}%). Slow down, listen first, and practice in a quiet environment.`;
  } else {
    recommendation = `Needs significant improvement (${accuracyRate}%). Focus on reading slowly, clear enunciation, and breaking words into syllables.`;
  }

  return { totalCorrect, totalIncorrect, totalAttempts, averageScore, recommendation };
};

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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  roomInfoStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roomInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roomInfoChipText: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 10,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentCardHighlighted: {
    borderColor: '#DDD6FE',
    shadowOpacity: 0.1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: 13,
    fontFamily: getFontFamily('bold'),
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  studentInfo: {
    flex: 1,
    gap: 6,
  },
  studentName: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
  },
  levelBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
  },
  macroBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  macroBadgeText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: '#6B7280',
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  roomCodeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  roomCodeDisplayLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: COLORS.secondary,
  },
  roomCodeDisplayCode: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: COLORS.primary,
    letterSpacing: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalProfile: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 20,
    gap: 6,
  },
  modalAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modalAvatarText: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  modalStudentName: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  modalStudentEmail: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  modalLevelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBoxValue: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  statBoxLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  recommendationSection: {
    marginBottom: 24,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#374151',
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});
