import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
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

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalRooms: number;
  activeStudents: number;
  completedAssessments: number;
  avgScore: number;
}

interface RecentActivity {
  id: string;
  type: 'room_created' | 'student_joined' | 'assessment_completed';
  title: string;
  subtitle: string;
  timestamp: Date;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TeacherDashboardProps {
  navigation: any;
}

export default function TeacherDashboard({ navigation }: TeacherDashboardProps) {
  const [teacherName, setTeacherName] = useState('Teacher');
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    activeStudents: 0,
    completedAssessments: 0,
    avgScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get teacher info
      const teacherDoc = await getDoc(doc(db, 'teacherAccounts', user.uid));
      if (teacherDoc.exists()) {
        setTeacherName(teacherDoc.data().name || 'Teacher');
      }

      // Get teacher's rooms
      const roomsQuery = query(
        collection(db, 'GenerateRoom'),
        where('createdBy', '==', user.uid)
      );
      const roomsSnapshot = await getDocs(roomsQuery);
      const totalRooms = roomsSnapshot.size;

      // Get student progress data
      const progressQuery = query(
        collection(db, 'StudentProgress'),
        where('teacherId', '==', user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      const uniqueStudents = new Set();
      let completedAssessments = 0;
      let totalScores = 0;
      let scoreCount = 0;

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        uniqueStudents.add(data.email);
        if (data.assessmentCompleted) {
          completedAssessments++;
        }
        if (data.scores && Array.isArray(data.scores)) {
          data.scores.forEach((score: number) => {
            totalScores += score;
            scoreCount++;
          });
        }
      });

      const avgScore = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;

      setStats({
        totalRooms,
        activeStudents: uniqueStudents.size,
        completedAssessments,
        avgScore,
      });

      // No recent activity data - will show empty state
      setRecentActivity([]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => auth.signOut()
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const DashboardCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.actionGradient}
      >
        <Ionicons name={icon} size={28} color="white" />
        <Text style={styles.actionTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.teacherName}>{teacherName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            <DashboardCard
              title="Total Rooms"
              value={stats.totalRooms}
              icon="home-outline"
              color="#4CAF50"
              onPress={() => navigation.navigate('Room')}
            />
            <DashboardCard
              title="Active Students"
              value={stats.activeStudents}
              icon="people-outline"
              color="#2196F3"
              onPress={() => navigation.navigate('StudentList')}
            />
            <DashboardCard
              title="Assessments"
              value={stats.completedAssessments}
              icon="clipboard-outline"
              color="#FF9800"
              onPress={() => navigation.navigate('AssessmentResults')}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <QuickAction
              title="Create Room"
              icon="add-circle-outline"
              color="#4CAF50"
              onPress={() => navigation.navigate('RoomGenerator')}
            />
            <QuickAction
              title="Manage Rooms"
              icon="settings-outline"
              color="#2196F3"
              onPress={() => navigation.navigate('Room')}
            />
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.length === 0 ? (
              <View style={styles.noActivityContainer}>
                <Ionicons name="time-outline" size={48} color="rgba(255,255,255,0.5)" />
                <Text style={styles.noActivityText}>No recent activity</Text>
                <Text style={styles.noActivitySubtext}>Activity will appear here as students join and practice</Text>
              </View>
            ) : (
              recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={activity.icon} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {activity.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    marginBottom: 16,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
  activityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  noActivityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noActivityText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    textAlign: 'center',
  },
  noActivitySubtext: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});