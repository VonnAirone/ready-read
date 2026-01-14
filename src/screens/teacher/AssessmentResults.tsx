import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
} from 'firebase/firestore';
import { COLORS, GRADIENTS } from '../../constants/theme';
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

      const assessmentsList: AssessmentData[] = [];

      // Get all rooms created by this teacher
      const roomsQuery = query(
        collection(db, 'GenerateRoom'),
        where('createdBy', '==', user.uid)
      );
      const roomsSnapshot = await getDocs(roomsQuery);
      const teacherRooms = new Map();
      
      roomsSnapshot.forEach((doc) => {
        const data = doc.data();
        teacherRooms.set(data.roomCode, {
          roomName: data.roomName,
          roomCode: data.roomCode,
        });
      });

      // Get student progress data with completed assessments
      const progressQuery = query(
        collection(db, 'StudentProgress'),
        where('teacherId', '==', user.uid),
        where('assessmentCompleted', '==', true)
      );
      const progressSnapshot = await getDocs(progressQuery);

      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = 100;

      progressSnapshot.forEach((progressDoc) => {
        const progressData = progressDoc.data();
        
        // Calculate assessment score from assessment results
        let assessmentScore = 0;
        if (progressData.assessmentResults && Array.isArray(progressData.assessmentResults)) {
          const totalPoints = progressData.assessmentResults.reduce(
            (sum: number, item: any) => sum + (item.score || 0), 
            0
          );
          assessmentScore = progressData.assessmentResults.length > 0 
            ? Math.round(totalPoints / progressData.assessmentResults.length)
            : 0;
        }

        totalScore += assessmentScore;
        highestScore = Math.max(highestScore, assessmentScore);
        lowestScore = Math.min(lowestScore, assessmentScore);

        const roomInfo = teacherRooms.get(progressData.roomCode) || {
          roomName: 'Unknown Room',
          roomCode: progressData.roomCode || 'N/A',
        };

        assessmentsList.push({
          id: progressDoc.id,
          name: progressData.playerName || progressData.name || 'Unknown Player',
          email: progressData.email || 'No email',
          roomName: roomInfo.roomName,
          roomCode: roomInfo.roomCode,
          assessmentScore,
          readerLevel: progressData.readerLevel || progressData.studentLevel || 0,
          assessmentDate: progressData.assessmentDate?.toDate() || progressData.updatedAt?.toDate() || new Date(),
        });
      });

      // Sort by assessment score (highest first)
      assessmentsList.sort((a, b) => b.assessmentScore - a.assessmentScore);

      const averageScore = assessmentsList.length > 0 
        ? Math.round(totalScore / assessmentsList.length) 
        : 0;

      setStats({
        totalAssessments: assessmentsList.length,
        averageScore,
        highestScore: assessmentsList.length > 0 ? highestScore : 0,
        lowestScore: assessmentsList.length > 0 ? lowestScore : 0,
      });

      setAssessments(assessmentsList);
    } catch (error) {
      console.error('Error loading assessment data:', error);
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
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading assessments...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
                <Ionicons name="clipboard-outline" size={60} color="rgba(255,255,255,0.3)" />
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
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
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
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.8)',
  },
  tableContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    textAlign: 'center',
  },
  tableBody: {
    gap: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  studentDetails: {
    flex: 1,
  },
  studentNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'white',
  },
  roomNameSmall: {
    fontSize: 11,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.8)',
  },
  noDataRow: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.6)',
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
    color: 'white',
    marginTop: 16,
  },
});
