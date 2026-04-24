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
const CARD_WIDTH = (width - 56) / 2;

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
          onPress: async () => {
            try {
              await auth.signOut();
            } catch (err) {
              console.error('[TeacherDashboard] signOut failed:', err);
              Alert.alert('Logout Failed', 'Could not sign out. Please check your connection and try again.');
            }
          },
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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const statCards = [
    { title: 'Total Rooms', value: stats.totalRooms, icon: 'home' as const, color: '#4CAF50', bg: '#E8F5E9', onPress: () => navigation.navigate('Room') },
    { title: 'Students', value: stats.activeStudents, icon: 'people' as const, color: '#2196F3', bg: '#E3F2FD', onPress: () => navigation.navigate('StudentList') },
    { title: 'Assessments', value: stats.completedAssessments, icon: 'clipboard' as const, color: '#FF9800', bg: '#FFF3E0', onPress: () => navigation.navigate('AssessmentResults') },
    { title: 'Avg Score', value: `${stats.avgScore}%`, icon: 'trending-up' as const, color: COLORS.primary, bg: '#EDE9FE', onPress: () => navigation.navigate('AssessmentResults') },
  ];

  const quickActions = [
    { title: 'Create Room', desc: 'Set up a new practice room', icon: 'add-circle' as const, colors: ['#4CAF50', '#2E7D32'] as [string, string], onPress: () => navigation.navigate('RoomGenerator') },
    { title: 'Manage Rooms', desc: 'View and edit existing rooms', icon: 'settings' as const, colors: ['#2196F3', '#1565C0'] as [string, string], onPress: () => navigation.navigate('Room') },
    { title: 'Students', desc: 'Monitor student progress', icon: 'people' as const, colors: [COLORS.primary, COLORS.secondary] as [string, string], onPress: () => navigation.navigate('StudentList') },
    { title: 'Assessments', desc: 'Review completed assessments', icon: 'bar-chart' as const, colors: ['#FF9800', '#E65100'] as [string, string], onPress: () => navigation.navigate('AssessmentResults') },
  ];

  return (
    <ScreenLayout noPadding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.teacherName}>{teacherName}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(teacherName)}</Text>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Inline Stats Strip */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{stats.totalRooms}</Text>
              <Text style={styles.headerStatLabel}>Rooms</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{stats.activeStudents}</Text>
              <Text style={styles.headerStatLabel}>Students</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{stats.completedAssessments}</Text>
              <Text style={styles.headerStatLabel}>Assessments</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{stats.avgScore}%</Text>
              <Text style={styles.headerStatLabel}>Avg Score</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.title} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.85}>
                <LinearGradient colors={action.colors} style={styles.actionGradient}>
                  <View style={styles.actionIconWrap}>
                    <Ionicons name={action.icon} size={26} color="white" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.length === 0 ? (
              <View style={styles.noActivityContainer}>
                <View style={styles.noActivityIcon}>
                  <Ionicons name="time-outline" size={40} color="#9CA3AF" />
                </View>
                <Text style={styles.noActivityText}>No recent activity</Text>
                <Text style={styles.noActivitySubtext}>
                  Activity will appear here as students join and practice
                </Text>
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
                    {activity.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 26,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 11,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 18,
    minHeight: 120,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
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
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
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
    paddingVertical: 32,
  },
  noActivityIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noActivityText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
    marginBottom: 6,
  },
  noActivitySubtext: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
