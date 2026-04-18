import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
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
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    return colors[level - 1] || '#DDA0DD';
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

  const StudentCard = ({ student }: { student: StudentData }) => (
    <View style={styles.studentCard}>
      <LinearGradient
        colors={['#F9FAFB', '#F3F4F6']}
        style={styles.studentCardGradient}
      >
        {/* Header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.studentAvatar}>
              <Ionicons name="person" size={24} color="#374151" />
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
            </View>
          </View>
          <View style={styles.activityContainer}>
            <Text style={styles.lastActivity}>{formatLastActivity(student.lastActivity)}</Text>
            <View style={[styles.statusDot, { backgroundColor: student.assessmentCompleted ? '#4CAF50' : '#FF9800' }]} />
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.roomContainer}>
          <View style={styles.roomInfo}>
            <Ionicons name="home-outline" size={16} color="#6B7280" />
            <Text style={styles.roomText}>{student.roomName}</Text>
          </View>
          <View style={styles.roomCodeBadge}>
            <Text style={styles.roomCodeText}>{student.roomCode}</Text>
          </View>
        </View>

        {/* Levels */}
        <View style={styles.levelsContainer}>
          <View style={styles.levelCard}>
            <Text style={styles.levelLabel}>Reader Level</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(student.readerLevel) }]}>
              <Text style={styles.levelValue}>{student.readerLevel}</Text>
            </View>
          </View>
          
          <View style={styles.levelDivider} />
          
          <View style={styles.levelCard}>
            <Text style={styles.levelLabel}>Macro Level</Text>
            <View style={[styles.levelBadge, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.levelValue}>{student.macroLevel}</Text>
            </View>
            <Text style={styles.levelText}>Level {student.macroLevel}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

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
    <ScreenLayout>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Active Students</Text>
          <View style={styles.headerRight}>
            <Text style={styles.studentCount}>{students.length}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Table Header */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Room</Text>
              <Text style={styles.headerText}>Reader Level</Text>
              <Text style={styles.headerText}>Macro Level</Text>
              <Text style={styles.headerText}>Actions</Text>
            </View>

            {/* Table Content */}
            {students.length === 0 ? (
              <View style={styles.noDataRow}>
                <Text style={styles.noDataText}>No active students</Text>
              </View>
            ) : (
              <View style={styles.tableBody}>
                {students.map((student) => (
                  <View key={student.id} style={styles.tableRow}>
                    <View style={styles.nameCell}>
                      <Text style={styles.studentNameTable}>{student.name}</Text>
                      <Text style={styles.studentEmailTable}>{student.email}</Text>
                    </View>
                    <View style={styles.roomCell}>
                      <Text style={styles.roomNameTable}>{student.roomName}</Text>
                      <Text style={styles.roomCodeTable}>{student.roomCode}</Text>
                    </View>
                    <View style={styles.levelCell}>
                      <View>
                        <Text style={styles.levelValueTable}>{student.readerLevel}</Text>
                      </View>
                    </View>
                    <View style={styles.levelCell}>
                      <View>
                        <Text style={styles.levelValueTable}>{student.macroLevel}</Text>
                      </View>
                    </View>
                    <View style={styles.actionCell}>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                          setSelectedStudent(student);
                          setShowDiagnosticModal(true);
                        }}
                      >
                        <Ionicons name="eye-outline" size={18} color="white" />
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Diagnostic Review Modal */}
        {selectedStudent && (
          <Modal
            visible={showDiagnosticModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDiagnosticModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Diagnostic Report</Text>
                  <TouchableOpacity onPress={() => setShowDiagnosticModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Student Info */}
                  <View style={styles.studentInfoSection}>
                    <View style={styles.studentAvatarLarge}>
                      <Ionicons name="person" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                    <Text style={styles.modalStudentEmail}>{selectedStudent.email}</Text>
                  </View>

                  {/* Reader Level Badge */}
                  <View style={styles.modalLevelBadge}>
                    <View style={[
                      styles.modalLevelCircle,
                      { backgroundColor: getLevelColor(selectedStudent.readerLevel) }
                    ]}>
                      <Text style={styles.modalLevelNumber}>{selectedStudent.readerLevel}</Text>
                    </View>
                    <Text style={styles.modalLevelText}>Reader Level {selectedStudent.readerLevel}</Text>
                    <Text style={styles.modalMacroText}>Macro Level {selectedStudent.macroLevel}</Text>
                  </View>

                  {/* Diagnostic Recommendation */}
                  <View style={styles.statsSection}>
                    <View style={styles.statsSectionHeader}>
                      <Ionicons name="medical" size={20} color={COLORS.primary} />
                      <Text style={styles.statsSectionTitle}>Diagnostic Recommendation</Text>
                    </View>
                    <Text style={styles.recommendationText}>
                      {calculateDiagnosticStats(selectedStudent).recommendation}
                    </Text>
                  </View>

                  {/* Performance Stats */}
                  <View style={styles.statsSection}>
                    <View style={styles.statsSectionHeader}>
                      <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
                      <Text style={styles.statsSectionTitle}>Performance Statistics</Text>
                    </View>
                    
                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={32} color="#52c41a" />
                        <Text style={styles.statValue}>{calculateDiagnosticStats(selectedStudent).totalCorrect}</Text>
                        <Text style={styles.statLabel}>Correct Words</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Ionicons name="close-circle" size={32} color="#f5222d" />
                        <Text style={styles.statValue}>{calculateDiagnosticStats(selectedStudent).totalIncorrect}</Text>
                        <Text style={styles.statLabel}>Incorrect Words</Text>
                      </View>
                    </View>

                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Ionicons name="list" size={32} color="#1890ff" />
                        <Text style={styles.statValue}>{calculateDiagnosticStats(selectedStudent).totalAttempts}</Text>
                        <Text style={styles.statLabel}>Total Pronounced</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Ionicons name="trophy" size={32} color="#faad14" />
                        <Text style={styles.statValue}>{calculateDiagnosticStats(selectedStudent).averageScore}%</Text>
                        <Text style={styles.statLabel}>Average Score</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDiagnosticModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
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

  // Aggregate from macro level progress
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

  // Also include current scores array
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

  // Generate detailed diagnostic recommendation based on performance
  let recommendation = '';
  
  if (totalAttempts === 0) {
    recommendation = 'This student has not started practicing yet. Encourage them to begin their pronunciation practice journey!';
  } else if (averageScore >= 90) {
    recommendation = `Outstanding performance! The student's accuracy rate of ${accuracyRate}% shows excellent pronunciation skills. They've correctly pronounced ${totalCorrect} out of ${totalAttempts} items. Consider encouraging them to advance to the next reader level for more challenging content.`;
  } else if (averageScore >= 80) {
    recommendation = `Great work! The student is showing strong pronunciation skills with ${accuracyRate}% accuracy (${totalCorrect} correct out of ${totalAttempts}). To reach the next level:\n\n• Focus on clarity and enunciation for the ${totalIncorrect} items they missed\n• Practice at a steady pace - not too fast, not too slow\n• Continue building confidence with current content before advancing`;
  } else if (averageScore >= 70) {
    recommendation = `Good progress! The student is on the right track with ${accuracyRate}% accuracy (${totalCorrect} correct, ${totalIncorrect} incorrect). Areas to improve:\n\n• Pronunciation Clarity: Focus on clear articulation of each word\n• Pacing: Speak at a comfortable speed that allows for proper enunciation\n• Practice: Review challenging words before recording\n• Confidence: Take time and speak with confidence`;
  } else if (averageScore >= 50) {
    recommendation = `Needs more practice! Current accuracy is ${accuracyRate}% (${totalCorrect} correct, ${totalIncorrect} incorrect). Recommendations:\n\n• Slow Down: Take time to pronounce each word clearly\n• Listen First: Read the content aloud before recording\n• Articulation: Focus on moving lips and tongue properly\n• Environment: Practice in a quiet space for better recognition\n• Repetition: Practice difficult words multiple times`;
  } else {
    recommendation = `Significant improvement needed! Current accuracy: ${accuracyRate}% (${totalCorrect} correct, ${totalIncorrect} incorrect). Focus on these fundamentals:\n\n• Read Slowly: Take 2-3 seconds per word\n• Enunciate Clearly: Exaggerate mouth movements\n• Quiet Environment: Ensure minimal background noise\n• Pre-Reading: Practice reading aloud before recording\n• Break It Down: Focus on one word at a time\n• Phonetics: Pay attention to beginning and ending sounds\n\nConsider scheduling additional practice sessions with this student.`;
  }

  return {
    totalCorrect,
    totalIncorrect,
    totalAttempts,
    averageScore,
    recommendation
  };
};

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
    paddingHorizontal: 20,
  },
  tableContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
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
    alignItems: 'center',
  },
  roomCell: {
    flex: 1,
    alignItems: 'center',
  },
  levelCell: {
    flex: 1,
    alignItems: 'center',
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
  studentNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
    textAlign: 'center',
  },
  studentEmailTable: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  roomNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
    textAlign: 'center',
  },
  roomCodeTable: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  levelBadgeTable: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  levelValueTable: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  levelTextTable: {
    fontSize: 10,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataRow: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: '#6B7280',
    textAlign: 'center',
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
  studentsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  studentCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  studentCardGradient: {
    padding: 20,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  activityContainer: {
    alignItems: 'flex-end',
  },
  lastActivity: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
    marginLeft: 6,
  },
  roomCodeBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomCodeText: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
  },
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelCard: {
    flex: 1,
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    marginBottom: 8,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  levelValue: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  levelText: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: '#6B7280',
    textAlign: 'center',
  },
  levelDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: COLORS.primary,
  },
  modalBody: {
    maxHeight: 450,
    padding: 20,
  },
  studentInfoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalStudentName: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#333',
    marginBottom: 4,
  },
  modalStudentEmail: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#666',
  },
  modalLevelBadge: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  modalLevelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalLevelNumber: {
    fontSize: 28,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  modalLevelText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#333',
    marginBottom: 4,
  },
  modalMacroText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: '#666',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#333',
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#555',
    lineHeight: 22,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#666',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});