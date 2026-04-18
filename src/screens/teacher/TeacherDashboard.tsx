import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase, auth } from '../../services/supabase';
import { COLORS } from '../../constants/theme';
import { ScreenLayout } from '../../components/ScreenLayout';
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

      const { data: teacherRow } = await supabase
        .from('teacher_accounts')
        .select('name')
        .eq('id', user.id)
        .single();
      if (teacherRow) setTeacherName(teacherRow.name || 'Teacher');

      const { data: rooms } = await supabase
        .from('game_rooms')
        .select('id')
        .eq('created_by', user.id);
      const totalRooms = rooms?.length ?? 0;

      const { data: progressRows } = await supabase
        .from('student_progress')
        .select('email, assessment_completed, scores')
        .eq('teacher_id', user.id);

      const uniqueStudents = new Set<string>();
      let completedAssessments = 0;
      let totalScores = 0;
      let scoreCount = 0;

      (progressRows ?? []).forEach((row) => {
        if (row.email) uniqueStudents.add(row.email);
        if (row.assessment_completed) completedAssessments++;
        if (Array.isArray(row.scores)) {
          row.scores.forEach((s: number) => { totalScores += s; scoreCount++; });
        }
      });

      const avgScore = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;
      setStats({ totalRooms, activeStudents: uniqueStudents.size, completedAssessments, avgScore });
      setRecentActivity([]);
    } catch (error) {
      console.error('TeacherDashboard: failed to load stats', error);
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
    <ScreenLayout>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.teacherName}>{teacherName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#6B7280" />
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
                <Ionicons name="time-outline" size={48} color="#D1D5DB" />
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
    color: '#9CA3AF',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
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
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
  },
  noActivityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noActivityText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  noActivitySubtext: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});