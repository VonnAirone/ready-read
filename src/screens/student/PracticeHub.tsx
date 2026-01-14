import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { determineReaderLevel } from '../../data/assessmentData';
import PracticeGame from './PracticeGame';

interface UserProgress {
  readerLevel?: 1 | 2 | 3 | 4;
  hasCompletedAssessment?: boolean;
  lastAssessmentScore?: number;
  lastAssessmentDate?: string;
}

interface PracticeStats {
  totalCorrect: number;
  totalIncorrect: number;
  totalAttempts: number;
  averageScore: number;
}

export default function PracticeHub({ navigation }: any) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    totalCorrect: 0,
    totalIncorrect: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPracticeGame, setShowPracticeGame] = useState(false);
  const [selectedReaderLevel, setSelectedReaderLevel] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadUserProgress(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserProgress = async (uid: string) => {
    try {
      setLoading(true);
      
      // Check if user has completed assessment
      const progressRef = doc(db, 'UserProgress', uid);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data() as UserProgress;
        setUserProgress(progress);
      } else {
        // No progress found - user needs assessment
        setUserProgress({ hasCompletedAssessment: false });
      }

      // Load practice statistics from StudentProgress collection
      await loadPracticeStats(uid);
    } catch (error) {
      console.error('Error loading user progress:', error);
      setUserProgress({ hasCompletedAssessment: false });
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeStats = async (uid: string) => {
    try {
      // Get personal practice progress document
      const personalDocId = `${uid}_PERSONAL_PRACTICE`;
      const personalProgressDoc = await getDoc(doc(db, 'StudentProgress', personalDocId));
      
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalAttempts = 0;
      let totalScore = 0;
      
      if (personalProgressDoc.exists()) {
        const data = personalProgressDoc.data();
        
        // Aggregate scores from macro level progress
        if (data.macroLevelProgress) {
          Object.values(data.macroLevelProgress).forEach((macroLevel: any) => {
            // Count completed words
            if (macroLevel.words?.scores) {
              macroLevel.words.scores.forEach((score: number) => {
                totalAttempts++;
                totalScore += score;
                if (score >= 70) totalCorrect++;
                else totalIncorrect++;
              });
            }
            // Count completed sentences
            if (macroLevel.sentences?.scores) {
              macroLevel.sentences.scores.forEach((score: number) => {
                totalAttempts++;
                totalScore += score;
                if (score >= 70) totalCorrect++;
                else totalIncorrect++;
              });
            }
            // Count completed paragraphs
            if (macroLevel.paragraphs?.scores) {
              macroLevel.paragraphs.scores.forEach((score: number) => {
                totalAttempts++;
                totalScore += score;
                if (score >= 70) totalCorrect++;
                else totalIncorrect++;
              });
            }
          });
        }
        
        // Also check for legacy scoresArray
        if (data.scoresArray && Array.isArray(data.scoresArray)) {
          data.scoresArray.forEach((score: number) => {
            totalAttempts++;
            totalScore += score;
            if (score >= 70) totalCorrect++;
            else totalIncorrect++;
          });
        }
      }
      
      const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
      
      setPracticeStats({
        totalCorrect,
        totalIncorrect,
        totalAttempts,
        averageScore
      });
      
      console.log('📊 Practice Stats:', { totalCorrect, totalIncorrect, totalAttempts, averageScore });
    } catch (error) {
      console.error('Error loading practice stats:', error);
    }
  };

  const handleStartAssessment = () => {
    // Navigate to RegularRoom with assessment mode
    navigation.navigate('PronunciationRoom', {
      roomData: {
        isPersonalRoom: true,
        roomCode: 'ASSESSMENT',
        roomName: 'Assessment',
        isAssessment: true
      },
      fromPersonalProgress: true
    });
  };

  const saveAssessmentResults = async (uid: string, results: any) => {
    try {
      const readerLevel = determineReaderLevel(results.totalScore);
      
      const progressData: UserProgress = {
        readerLevel,
        hasCompletedAssessment: true,
        lastAssessmentScore: results.totalScore,
        lastAssessmentDate: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'UserProgress', uid), progressData, { merge: true });
    } catch (error) {
      console.error('Error saving assessment results:', error);
    }
  };

  const handleStartPractice = (readerLevel?: 1 | 2 | 3 | 4) => {
    const levelToUse = readerLevel || userProgress?.readerLevel || 1;
    setSelectedReaderLevel(levelToUse);
    setShowPracticeGame(true);
  };

  const handleRetakeAssessment = () => {
    Alert.alert(
      'Retake Assessment',
      'This will reassess your reading level. Your current progress will be preserved. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: handleStartAssessment }
      ]
    );
  };

  const handleExitPractice = () => {
    setShowPracticeGame(false);
    if (userId) {
      loadUserProgress(userId); // Refresh progress after practice
    }
  };

  const getReaderLevelInfo = (level: 1 | 2 | 3 | 4) => {
    const info = {
      1: { name: 'Foundation Reader', description: 'Basic everyday communication', color: '#52c41a' },
      2: { name: 'Developing Reader', description: 'Social and workplace interaction', color: '#1890ff' },
      3: { name: 'Proficient Reader', description: 'Academic and technical communication', color: '#722ed1' },
      4: { name: 'Advanced Reader', description: 'Complex and abstract discourse', color: '#f5222d' }
    };
    return info[level];
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Loading your practice hub...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (showPracticeGame) {
    return (
      <PracticeGame 
        initialReaderLevel={selectedReaderLevel}
        onExit={handleExitPractice}
      />
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Hub</Text>
        </View>

        {/* Assessment Status */}
        {!userProgress?.hasCompletedAssessment ? (
          <View style={styles.assessmentCard}>
            <Ionicons name="clipboard" size={48} color={COLORS.primary} />
            <Text style={styles.assessmentTitle}>Take Your Reading Assessment</Text>
            <Text style={styles.assessmentDescription}>
              Complete a 4-passage assessment to determine your Reader Level and unlock personalized practice.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartAssessment}>
              <Text style={styles.primaryButtonText}>Start Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Practice Statistics Card - Always show */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>
                {practiceStats.totalAttempts > 0 ? 'Your Practice Statistics' : 'Practice Statistics'}
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={32} color="#52c41a" />
                  <Text style={styles.statNumber}>{practiceStats.totalCorrect}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-circle" size={32} color="#f5222d" />
                  <Text style={styles.statNumber}>{practiceStats.totalIncorrect}</Text>
                  <Text style={styles.statLabel}>Incorrect</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="bar-chart" size={32} color="#1890ff" />
                  <Text style={styles.statNumber}>{practiceStats.totalAttempts}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={32} color="#faad14" />
                  <Text style={styles.statNumber}>{practiceStats.averageScore}%</Text>
                  <Text style={styles.statLabel}>Average</Text>
                </View>
              </View>
              {practiceStats.totalAttempts === 0 && (
                <Text style={styles.noDataText}>
                  Start practicing to see your statistics!
                </Text>
              )}
            </View>

            {/* Reader Level Display */}
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>Your Reader Level</Text>
                <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeAssessment}>
                  <Ionicons name="refresh" size={16} color={COLORS.primary} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
              
              {userProgress.readerLevel && (
                <View style={styles.levelInfo}>
                  <View 
                    style={[
                      styles.levelBadge, 
                      { backgroundColor: getReaderLevelInfo(userProgress.readerLevel).color }
                    ]}
                  >
                    <Text style={styles.levelNumber}>{userProgress.readerLevel}</Text>
                  </View>
                  <View style={styles.levelDetails}>
                    <Text style={styles.levelName}>
                      {getReaderLevelInfo(userProgress.readerLevel).name}
                    </Text>
                    <Text style={styles.levelDescription}>
                      {getReaderLevelInfo(userProgress.readerLevel).description}
                    </Text>
                    <Text style={styles.lastScore}>
                      Last Assessment: {userProgress.lastAssessmentScore}%
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Practice Options */}
            <View style={styles.practiceSection}>
              <Text style={styles.sectionTitle}>Practice Options</Text>
              
              {/* Current Level Practice */}
              <TouchableOpacity 
                style={[styles.practiceButton, styles.currentLevelButton]}
                onPress={() => handleStartPractice()}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="play-circle" size={32} color={COLORS.white} />
                  <View style={styles.buttonText}>
                    <Text style={styles.buttonTitle}>Continue Your Journey</Text>
                    <Text style={styles.buttonSubtitle}>
                      Practice at your Reader Level {userProgress.readerLevel}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Other Level Options */}
              <Text style={styles.alternativesTitle}>Or practice at a different level:</Text>
              
              <View style={styles.levelButtonsRow}>
                {([1, 2, 3, 4] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      userProgress.readerLevel === level && styles.currentLevel
                    ]}
                    onPress={() => handleStartPractice(level)}
                    disabled={userProgress.readerLevel === level}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      userProgress.readerLevel === level && styles.currentLevelText
                    ]}>
                      Level {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 40, // Balance the back button
  },
  assessmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  assessmentDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  levelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  retakeText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  levelDetails: {
    marginLeft: 16,
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastScore: {
    fontSize: 12,
    color: '#999',
  },
  practiceSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  practiceButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLevelButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 16,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  alternativesTitle: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 12,
    opacity: 0.9,
  },
  levelButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  currentLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  levelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  currentLevelText: {
    opacity: 0.7,
  },
});