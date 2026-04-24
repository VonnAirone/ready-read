import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase, auth } from '../../services/supabase';
import { COLORS } from '../../constants/theme';
import { ScreenLayout } from '../../components/ScreenLayout';
import { getFontFamily } from '../../../styles/fonts';

interface StudentData {
  id: string;
  name: string;
  email: string;
  roomName: string;
  roomCode: string;
  readerLevel: number;
  macroLevel: number;
  assessmentCompleted: boolean;
  lastActivity: Date;
  macroLevelProgress?: any;
  scores?: number[];
}

interface StudentListProps {
  navigation: any;
}

const READER_LEVEL_COLORS: Record<number, { color: string; bg: string; label: string }> = {
  1: { color: '#4CAF50', bg: '#E8F5E9', label: 'Foundation' },
  2: { color: '#2196F3', bg: '#E3F2FD', label: 'Developing' },
  3: { color: '#FF9800', bg: '#FFF3E0', label: 'Proficient' },
  4: { color: '#9C27B0', bg: '#F3E5F5', label: 'Advanced' },
};

export default function StudentList({ navigation }: StudentListProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
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
        .eq('teacher_id', user.id);

      const studentsList: StudentData[] = (progressRows ?? []).map(row => {
        const roomInfo = teacherRooms.get(row.room_code) || { roomName: 'Unknown Room', roomCode: row.room_code || 'N/A' };
        return {
          id: row.id,
          name: row.player_name || row.name || 'Unknown Player',
          email: row.email || 'No email',
          roomName: roomInfo.roomName,
          roomCode: roomInfo.roomCode,
          readerLevel: row.reader_level || 0,
          macroLevel: row.macro_level || 0,
          assessmentCompleted: row.assessment_completed || false,
          lastActivity: row.updated_at ? new Date(row.updated_at) : new Date(),
          macroLevelProgress: row.macro_level_progress || {},
          scores: row.scores || [],
        };
      });

      studentsList.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      setStudents(studentsList);
    } catch (error) {
      console.error('[StudentList] Failed to load student data:', error);
      Alert.alert("Error", "Could not load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getReaderInfo = (level: number) =>
    READER_LEVEL_COLORS[level] || { color: '#9E9E9E', bg: '#F5F5F5', label: `Level ${level}` };

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading students...</Text>
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
          <Text style={styles.title}>Active Students</Text>
          <Text style={styles.subtitle}>{students.length} enrolled</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{students.length}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={56} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Students Yet</Text>
            <Text style={styles.emptySubtitle}>Students will appear here once they join your rooms</Text>
          </View>
        ) : (
          students.map((student) => {
            const readerInfo = getReaderInfo(student.readerLevel);
            return (
              <View key={student.id} style={styles.studentCard}>
                {/* Avatar + Name row */}
                <View style={styles.cardTop}>
                  <LinearGradient
                    colors={[readerInfo.color, `${readerInfo.color}CC`]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
                  </LinearGradient>

                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                    <Text style={styles.studentEmail} numberOfLines={1}>{student.email}</Text>
                  </View>

                  <View style={styles.cardTopRight}>
                    <Text style={styles.lastActivityText}>{formatLastActivity(student.lastActivity)}</Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: student.assessmentCompleted ? '#4CAF50' : '#FF9800' }
                    ]} />
                  </View>
                </View>

                {/* Room chip */}
                <View style={styles.roomChip}>
                  <Ionicons name="home-outline" size={14} color="#6B7280" />
                  <Text style={styles.roomChipText} numberOfLines={1}>{student.roomName}</Text>
                  <View style={styles.roomCodePill}>
                    <Text style={styles.roomCodePillText}>{student.roomCode}</Text>
                  </View>
                </View>

                {/* Level badges + View button */}
                <View style={styles.cardBottom}>
                  <View style={styles.levelsRow}>
                    <View style={[styles.levelPill, { backgroundColor: readerInfo.bg }]}>
                      <Ionicons name="book-outline" size={13} color={readerInfo.color} />
                      <Text style={[styles.levelPillText, { color: readerInfo.color }]}>
                        {readerInfo.label}
                      </Text>
                    </View>
                    <View style={styles.macroLevelPill}>
                      <Ionicons name="layers-outline" size={13} color="#6B7280" />
                      <Text style={styles.macroLevelText}>Macro {student.macroLevel}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedStudent(student);
                      setShowDiagnosticModal(true);
                    }}
                  >
                    <Ionicons name="eye-outline" size={16} color="white" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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
              {/* Modal Handle */}
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
                    colors={[getReaderInfo(selectedStudent.readerLevel).color, `${getReaderInfo(selectedStudent.readerLevel).color}CC`]}
                    style={styles.modalAvatar}
                  >
                    <Text style={styles.modalAvatarText}>{getInitials(selectedStudent.name)}</Text>
                  </LinearGradient>
                  <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                  <Text style={styles.modalStudentEmail}>{selectedStudent.email}</Text>

                  <View style={styles.modalLevelRow}>
                    <View style={[styles.levelPill, { backgroundColor: getReaderInfo(selectedStudent.readerLevel).bg }]}>
                      <Text style={[styles.levelPillText, { color: getReaderInfo(selectedStudent.readerLevel).color }]}>
                        Reader Level {selectedStudent.readerLevel} — {getReaderInfo(selectedStudent.readerLevel).label}
                      </Text>
                    </View>
                    <View style={styles.macroLevelPill}>
                      <Text style={styles.macroLevelText}>Macro Level {selectedStudent.macroLevel}</Text>
                    </View>
                  </View>
                </View>

                {/* Performance stats */}
                {(() => {
                  const stats = calculateDiagnosticStats(selectedStudent);
                  return (
                    <>
                      <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { borderTopColor: '#4CAF50' }]}>
                          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                          <Text style={styles.statBoxValue}>{stats.totalCorrect}</Text>
                          <Text style={styles.statBoxLabel}>Correct</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#F44336' }]}>
                          <Ionicons name="close-circle" size={28} color="#F44336" />
                          <Text style={styles.statBoxValue}>{stats.totalIncorrect}</Text>
                          <Text style={styles.statBoxLabel}>Incorrect</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#2196F3' }]}>
                          <Ionicons name="list" size={28} color="#2196F3" />
                          <Text style={styles.statBoxValue}>{stats.totalAttempts}</Text>
                          <Text style={styles.statBoxLabel}>Attempts</Text>
                        </View>
                        <View style={[styles.statBox, { borderTopColor: '#FFD700' }]}>
                          <Ionicons name="trophy" size={28} color="#FFD700" />
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

const calculateDiagnosticStats = (student: StudentData) => {
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
    recommendation = 'This student has not started practicing yet. Encourage them to begin their pronunciation practice journey!';
  } else if (averageScore >= 90) {
    recommendation = `Outstanding performance! Accuracy rate of ${accuracyRate}%. Consider advancing to the next reader level.`;
  } else if (averageScore >= 80) {
    recommendation = `Great work! Strong pronunciation skills at ${accuracyRate}% accuracy. Focus on clarity for the ${totalIncorrect} missed items.`;
  } else if (averageScore >= 70) {
    recommendation = `Good progress at ${accuracyRate}% accuracy. Focus on: pronunciation clarity, pacing, and reviewing challenging words before recording.`;
  } else if (averageScore >= 50) {
    recommendation = `Needs more practice (${accuracyRate}% accuracy). Slow down, listen first, focus on articulation, and practice in a quiet environment.`;
  } else {
    recommendation = `Significant improvement needed (${accuracyRate}% accuracy). Focus on reading slowly, enunciating clearly, and breaking words into syllables. Consider scheduling extra practice sessions.`;
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  lastActivityText: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  roomChipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
  },
  roomCodePill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomCodePillText: {
    fontSize: 11,
    fontFamily: getFontFamily('semibold'),
    color: '#374151',
    letterSpacing: 0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  levelPillText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
  },
  macroLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  macroLevelText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: '#6B7280',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
    flexShrink: 0,
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalAvatarText: {
    fontSize: 26,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  modalStudentName: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  modalStudentEmail: {
    fontSize: 14,
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
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBoxValue: {
    fontSize: 22,
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
