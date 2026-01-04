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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { COLORS, GRADIENTS } from '../../constants/theme';
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
}

interface StudentListProps {
  navigation: any;
}

export default function StudentList({ navigation }: StudentListProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const studentsList: StudentData[] = [];

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

      // Get student progress data for this teacher
      const progressQuery = query(
        collection(db, 'StudentProgress'),
        where('teacherId', '==', user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);

      // Process each student's progress
      for (const progressDoc of progressSnapshot.docs) {
        const progressData = progressDoc.data();
        
        try {
          // Get player name from StudentProgress document
          const playerName = progressData.playerName || progressData.name || 'Unknown Player';

          // Get room information
          const roomInfo = teacherRooms.get(progressData.roomCode) || {
            roomName: 'Unknown Room',
            roomCode: progressData.roomCode || 'N/A',
          };

          studentsList.push({
            id: progressDoc.id,
            name: playerName,
            email: progressData.email || 'No email',
            roomName: roomInfo.roomName,
            roomCode: roomInfo.roomCode,
            readerLevel: progressData.readerLevel || 0,
            macroLevel: progressData.macroLevel || 0,
            assessmentCompleted: progressData.assessmentCompleted || false,
            lastActivity: progressData.updatedAt?.toDate() || new Date(),
          });
        } catch (error) {
          console.error('Error processing student:', error);
        }
      }

      // Sort by last activity
      studentsList.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      setStudents(studentsList);

    } catch (error) {
      console.error('Error loading student data:', error);
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
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.studentCardGradient}
      >
        {/* Header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.studentAvatar}>
              <Ionicons name="person" size={24} color="white" />
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
            <Ionicons name="home-outline" size={16} color="rgba(255,255,255,0.7)" />
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
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading students...</Text>
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
    paddingHorizontal: 20,
  },
  tableContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
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
  studentNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    textAlign: 'center',
  },
  studentEmailTable: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  roomNameTable: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    textAlign: 'center',
  },
  roomCodeTable: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
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
    color: 'white',
  },
  levelTextTable: {
    fontSize: 10,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  noDataRow: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.7)',
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
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'white',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
  },
  activityContainer: {
    alignItems: 'flex-end',
  },
  lastActivity: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: 'white',
    marginLeft: 6,
  },
  roomCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomCodeText: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: 'white',
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
    color: 'rgba(255,255,255,0.7)',
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
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  levelDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('semibold'),
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
    paddingHorizontal: 40,
  },
});