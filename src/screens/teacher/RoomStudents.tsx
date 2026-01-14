import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../../constants/theme";
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

export default function RoomStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { roomId, roomName, roomCode } = route.params;

  useEffect(() => {
    if (!roomCode) return;

    // Query StudentProgress collection for students in this room
    const q = query(
      collection(db, "StudentProgress"),
      where("roomCode", "==", roomCode)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStudents = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          playerName: data.playerName || "Unknown Player",
          email: data.email || "No email",
          readerLevel: data.readerLevel || 1,
          macroLevel: data.macroLevel || 1,
          userId: data.userId || "",
          joinedAt: data.joinedAt || null,
          macroLevelProgress: data.macroLevelProgress || {},
          scores: data.scores || [],
        };
      });
      
      // Sort by reader level (highest first), then by macro level
      fetchedStudents.sort((a, b) => {
        if (b.readerLevel !== a.readerLevel) {
          return b.readerLevel - a.readerLevel;
        }
        return b.macroLevel - a.macroLevel;
      });

      setStudents(fetchedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const getReaderLevelLabel = (level: number) => {
    return `Reader Level ${level}`;
  };

  const getMacroLevelLabel = (level: number) => {
    return `Macro Level ${level}`;
  };

  const getLevelColor = (readerLevel: number) => {
    const colors = {
      1: "#4CAF50", // Green
      2: "#2196F3", // Blue
      3: "#FF9800", // Orange
      4: "#9C27B0", // Purple
    };
    return colors[readerLevel as keyof typeof colors] || "#666";
  };

  const renderStudent = ({ item, index }: { item: Student; index: number }) => (
    <View style={styles.studentCard}>
      <View
        style={styles.studentCardGradient}
      >
        <View style={styles.studentHeader}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.playerName}
            </Text>
            <View style={styles.levelContainer}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.readerLevel) }]}>
                <Ionicons name="book" size={14} color="white" />
                <Text style={styles.levelText}>
                  {getReaderLevelLabel(item.readerLevel)}
                </Text>
              </View>
              <View style={styles.macroLevelBadge}>
                <Ionicons name="layers" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.macroLevelText}>
                  {getMacroLevelLabel(item.macroLevel)}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedStudent(item);
              setShowDiagnosticModal(true);
            }}
          >
            <Ionicons name="eye-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Students in Room</Text>
            <Text style={styles.subtitle}>{roomName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Room Info */}
        <View style={styles.roomInfoCard}>
          <View style={styles.roomInfoItem}>
            <Ionicons name="key" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.roomInfoText}>Code: {roomCode}</Text>
          </View>
          <View style={styles.roomInfoItem}>
            <Ionicons name="people" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.roomInfoText}>
              {students.length} Student{students.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Students List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.6)" />
            </View>
            <Text style={styles.emptyTitle}>No Students Yet</Text>
            <Text style={styles.emptySubtitle}>
              Students will appear here once they join the room using the room code
            </Text>
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
                    <Text style={styles.modalStudentName}>{selectedStudent.playerName}</Text>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const calculateDiagnosticStats = (student: Student) => {
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  roomInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomInfoText: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  studentCardGradient: {
    padding: 16,
    
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  viewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rankContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rankNumber: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  studentInfo: {
    flex: 1,
    gap: 8,
  },
  studentName: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    letterSpacing: 0.3,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
  macroLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  macroLevelText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
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
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
});
