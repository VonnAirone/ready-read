// Personal Practice Room - Independent pronunciation practice
// Similar UI to regular room but without teacher supervision
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";
import { GAME_CONTENT } from "../../data/gameContent";
import { READER_LEVEL_INFO } from "../../data/assessmentData";

type ContentType = 'words' | 'sentences' | 'paragraphs';

interface MacroLevelProgress {
  words: { completed: boolean; scores: number[]; totalScore: number };
  sentences: { completed: boolean; scores: number[]; totalScore: number };
  paragraphs: { completed: boolean; scores: number[]; totalScore: number };
}

export default function PersonalPracticeRoom({ navigation, route }: any) {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  
  // Content state
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scoresArray, setScoresArray] = useState<number[]>([]);
  
  // Level progression state
  const [studentLevel, setStudentLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentMacroLevel, setCurrentMacroLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentContentType, setCurrentContentType] = useState<ContentType>('words');
  const [macroLevelProgress, setMacroLevelProgress] = useState<{ [key: number]: MacroLevelProgress }>({
    1: {
      words: { completed: false, scores: [], totalScore: 0 },
      sentences: { completed: false, scores: [], totalScore: 0 },
      paragraphs: { completed: false, scores: [], totalScore: 0 }
    }
  });
  
  // UI state
  const [showMacroResults, setShowMacroResults] = useState(false);
  const [playerName, setPlayerName] = useState("Student");
  const [userId, setUserId] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const currentWord = words[currentIndex] || "";

  // Initialize personal practice
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Get player name
        try {
          const snap = await getDoc(doc(db, "Playername", user.uid));
          setPlayerName(snap.exists() ? snap.data().playerName || "Student" : "Student");
        } catch {
          setPlayerName("Student");
        }
        
        // Load personal practice progress
        await loadPersonalProgress(user.uid);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Load personal practice progress from Firebase
  const loadPersonalProgress = async (uid: string) => {
    try {
      const personalDocId = `${uid}_PERSONAL_PRACTICE`;
      const progressSnap = await getDoc(doc(db, "StudentProgress", personalDocId));
      
      if (progressSnap.exists()) {
        const data = progressSnap.data();
        
        const level = data.studentLevel || data.readerLevel || 1;
        const macro = data.currentMacroLevel || data.macroLevel || 1;
        const contentType = data.currentContentType || 'words';
        
        setStudentLevel(level);
        setCurrentMacroLevel(macro);
        setCurrentContentType(contentType);
        
        // Restore macro level progress
        if (data.macroLevelProgress) {
          setMacroLevelProgress(data.macroLevelProgress);
        }
        
        // Check if should show macro results
        if (data.showMacroResults) {
          setShowMacroResults(true);
          return;
        }
        
        // Load content for current state
        const contentToLoad = loadMacroLevelContent(level, macro, contentType);
        setWords(contentToLoad);
        
        // Restore progress within current content type
        if (data.currentIndex !== undefined && data.currentContentType === contentType) {
          setCurrentIndex(data.currentIndex);
        }
        
        if (Array.isArray(data.scoresArray) && data.currentContentType === contentType) {
          setScoresArray(data.scoresArray);
        }
      } else {
        // First time - initialize with Reader Level 1, Macro Level 1
        const wordContent = loadMacroLevelContent(1, 1, 'words');
        setWords(wordContent);
      }
    } catch (error) {
      console.error("Error loading personal progress:", error);
      // Fallback to default content
      const wordContent = loadMacroLevelContent(1, 1, 'words');
      setWords(wordContent);
    }
  };

  // Load content for specific reader level, macro level, and content type
  const loadMacroLevelContent = (
    readerLevel: 1 | 2 | 3 | 4, 
    macroLevel: 1 | 2 | 3 | 4, 
    contentType: ContentType
  ): string[] => {
    const readerLevelContent = GAME_CONTENT[`reader-level-${readerLevel}`];
    if (!readerLevelContent) return [];

    const macroLevelContent = readerLevelContent.macroLevels[`macroLevel${macroLevel}` as keyof typeof readerLevelContent.macroLevels];
    if (!macroLevelContent) return [];

    // Return exactly 10 items for each content type
    return macroLevelContent[contentType].slice(0, 10).map(item => item.content);
  };

  // Save progress to Firebase
  const saveProgress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
      await setDoc(
        doc(db, "StudentProgress", personalDocId),
        {
          playerName,
          email: user.email || "",
          userId: user.uid,
          roomCode: "PERSONAL_PRACTICE",
          currentIndex,
          totalWords: words.length,
          scoresArray,
          studentLevel,
          readerLevel: studentLevel,
          currentMacroLevel,
          macroLevel: currentMacroLevel,
          currentContentType,
          macroLevelProgress,
          showMacroResults,
          isPersonalPractice: true,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Handle recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      
      // Simulate speech recognition result
      const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
      setRecognizedText(currentWord);
      setScore(randomScore);
      setCompleted(true);
      
      recordingRef.current = null;
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  // Handle next word
  const handleNext = async () => {
    if (score === null) return;

    // Save current score
    const newScores = [...scoresArray, score];
    setScoresArray(newScores);

    // Check if completed current content type (10 items)
    if (currentIndex >= words.length - 1) {
      await completeContentType(newScores);
    } else {
      // Move to next item
      setCurrentIndex(currentIndex + 1);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      await saveProgress();
    }
  };

  // Complete current content type and move to next
  const completeContentType = async (currentScores: number[]) => {
    const totalScore = currentScores.reduce((sum, score) => sum + score, 0);

    // Update macro level progress
    const updatedProgress = {
      ...macroLevelProgress,
      [currentMacroLevel]: {
        ...macroLevelProgress[currentMacroLevel],
        [currentContentType]: {
          completed: true,
          scores: currentScores,
          totalScore: totalScore
        }
      }
    };
    
    setMacroLevelProgress(updatedProgress);

    // Determine next content type
    if (currentContentType === 'words') {
      // Move to sentences
      setCurrentContentType('sentences');
      setCurrentIndex(0);
      setScoresArray([]);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      
      const sentenceContent = loadMacroLevelContent(studentLevel, currentMacroLevel, 'sentences');
      setWords(sentenceContent);
      
      // Save transition
      const user = auth.currentUser;
      if (user) {
        const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            currentContentType: 'sentences',
            currentIndex: 0,
            scoresArray: [],
            macroLevelProgress: updatedProgress,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
    } else if (currentContentType === 'sentences') {
      // Move to paragraphs
      setCurrentContentType('paragraphs');
      setCurrentIndex(0);
      setScoresArray([]);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      
      const paragraphContent = loadMacroLevelContent(studentLevel, currentMacroLevel, 'paragraphs');
      setWords(paragraphContent);
      
      // Save transition
      const user = auth.currentUser;
      if (user) {
        const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            currentContentType: 'paragraphs',
            currentIndex: 0,
            scoresArray: [],
            macroLevelProgress: updatedProgress,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
    } else {
      // Completed all content types - show macro results
      await completeMacroLevel(updatedProgress);
    }
  };

  // Complete macro level and show results
  const completeMacroLevel = async (updatedProgress: any) => {
    const user = auth.currentUser;
    if (user) {
      const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
      await setDoc(
        doc(db, "StudentProgress", personalDocId),
        {
          macroLevelProgress: updatedProgress,
          showMacroResults: true,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }
    
    setShowMacroResults(true);
  };

  // Calculate macro level score
  const calculateMacroLevelScore = () => {
    const currentMacroProgress = macroLevelProgress[currentMacroLevel];
    const { words, sentences, paragraphs } = currentMacroProgress;
    const totalItems = words.scores.length + sentences.scores.length + paragraphs.scores.length;
    const totalScore = words.totalScore + sentences.totalScore + paragraphs.totalScore;
    
    return totalItems > 0 ? Math.round(totalScore / totalItems) : 0;
  };

  // Handle macro level completion decision
  const handleMacroCompletion = async (advance: boolean) => {
    setShowMacroResults(false);
    
    const user = auth.currentUser;
    if (!user) return;

    const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
    
    if (advance) {
      const avgScore = calculateMacroLevelScore();
      if (avgScore >= 70) {
        // Check if we need to advance Reader Level
        if (currentMacroLevel === 4 && studentLevel < 4) {
          // Completed all 4 macro levels of current reader level - advance to next Reader Level
          const newReaderLevel = Math.min(studentLevel + 1, 4) as 1 | 2 | 3 | 4;
          const newMacroLevel = 1; // Start at Macro Level 1 of new Reader Level
          
          setStudentLevel(newReaderLevel);
          setCurrentMacroLevel(newMacroLevel);
          setCurrentContentType('words');
          setCurrentIndex(0);
          setScoresArray([]);
          setRecognizedText("");
          setScore(null);
          setCompleted(false);
          
          // Initialize fresh macro level progress for new Reader Level
          const newProgress = {
            1: {
              words: { completed: false, scores: [], totalScore: 0 },
              sentences: { completed: false, scores: [], totalScore: 0 },
              paragraphs: { completed: false, scores: [], totalScore: 0 }
            }
          };
          setMacroLevelProgress(newProgress);
          
          const wordContent = loadMacroLevelContent(newReaderLevel, newMacroLevel, 'words');
          setWords(wordContent);
          
          await setDoc(
            doc(db, "StudentProgress", personalDocId),
            {
              studentLevel: newReaderLevel,
              readerLevel: newReaderLevel,
              currentMacroLevel: newMacroLevel,
              macroLevel: newMacroLevel,
              currentContentType: 'words',
              currentIndex: 0,
              scoresArray: [],
              macroLevelProgress: newProgress,
              showMacroResults: false,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );
        } else if (currentMacroLevel < 4) {
          // Advance to next macro level within same Reader Level
          const newMacroLevel = Math.min(currentMacroLevel + 1, 4) as 1 | 2 | 3 | 4;
          setCurrentMacroLevel(newMacroLevel);
          setCurrentContentType('words');
          setCurrentIndex(0);
          setScoresArray([]);
          setRecognizedText("");
          setScore(null);
          setCompleted(false);
          
          // Initialize new macro level progress
          const newProgress = {
            ...macroLevelProgress,
            [newMacroLevel]: {
              words: { completed: false, scores: [], totalScore: 0 },
              sentences: { completed: false, scores: [], totalScore: 0 },
              paragraphs: { completed: false, scores: [], totalScore: 0 }
            }
          };
          setMacroLevelProgress(newProgress);
          
          const wordContent = loadMacroLevelContent(studentLevel, newMacroLevel, 'words');
          setWords(wordContent);
          
          await setDoc(
            doc(db, "StudentProgress", personalDocId),
            {
              currentMacroLevel: newMacroLevel,
              macroLevel: newMacroLevel,
              currentContentType: 'words',
              currentIndex: 0,
              scoresArray: [],
              macroLevelProgress: newProgress,
              showMacroResults: false,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );
        } else {
          // Reached Reader Level 4, Macro Level 4 - Final completion
          Alert.alert(
            "🎉 Congratulations!",
            "You've completed all levels! You've mastered Reader Level 4, Macro Level 4. Excellent work!",
            [
              {
                text: "Back to Progress",
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      }
    } else {
      // Retry current macro level
      setCurrentContentType('words');
      setCurrentIndex(0);
      setScoresArray([]);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      
      // Reset progress for current macro level
      const resetProgress = {
        ...macroLevelProgress,
        [currentMacroLevel]: {
          words: { completed: false, scores: [], totalScore: 0 },
          sentences: { completed: false, scores: [], totalScore: 0 },
          paragraphs: { completed: false, scores: [], totalScore: 0 }
        }
      };
      setMacroLevelProgress(resetProgress);
      
      const wordContent = loadMacroLevelContent(studentLevel, currentMacroLevel, 'words');
      setWords(wordContent);
      
      await setDoc(
        doc(db, "StudentProgress", personalDocId),
        {
          currentContentType: 'words',
          currentIndex: 0,
          scoresArray: [],
          macroLevelProgress: resetProgress,
          showMacroResults: false,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }
  };

  // Speak word
  const speakWord = () => {
    Speech.speak(currentWord, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.75,
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Macro Results Screen
  if (showMacroResults) {
    const avgScore = calculateMacroLevelScore();
    const canAdvance = avgScore >= 70;

    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Macro Level {currentMacroLevel} Complete!</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{avgScore}%</Text>
              <Text style={styles.scoreLabel}>Average Score</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Words:</Text>
                <Text style={styles.detailValue}>
                  {macroLevelProgress[currentMacroLevel]?.words?.scores?.length || 0}/10 completed
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sentences:</Text>
                <Text style={styles.detailValue}>
                  {macroLevelProgress[currentMacroLevel]?.sentences?.scores?.length || 0}/10 completed
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Paragraphs:</Text>
                <Text style={styles.detailValue}>
                  {macroLevelProgress[currentMacroLevel]?.paragraphs?.scores?.length || 0}/10 completed
                </Text>
              </View>
            </View>

            {canAdvance ? (
              <>
                <Text style={styles.congratsText}>
                  {currentMacroLevel === 4 && studentLevel < 4
                    ? `🎉 Amazing! You've completed all 4 Macro Levels of Reader Level ${studentLevel}! Ready to advance to Reader Level ${studentLevel + 1}?`
                    : currentMacroLevel === 4 && studentLevel === 4
                      ? "🏆 Incredible! You've mastered the final level - Reader Level 4, Macro Level 4!"
                      : "Excellent work! You're ready to advance to the next Macro Level."
                  }
                </Text>
                {!(currentMacroLevel === 4 && studentLevel === 4) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.advanceButton]}
                    onPress={() => handleMacroCompletion(true)}
                  >
                    <Text style={styles.actionButtonText}>
                      {currentMacroLevel === 4 && studentLevel < 4
                        ? `Advance to Reader Level ${studentLevel + 1}`
                        : "Advance to Next Level"
                      }
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={styles.retryText}>
                  Keep practicing! Score 70% or higher to advance.
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, styles.retryButton]}
                  onPress={() => handleMacroCompletion(false)}
                >
                  <Text style={styles.actionButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.exitButtonText}>Exit to Progress</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Main Practice Screen
  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Practice</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.levelText}>
            Reader Level {studentLevel} - Macro Level {currentMacroLevel}
          </Text>
          <Text style={styles.contentTypeText}>
            {currentContentType.charAt(0).toUpperCase() + currentContentType.slice(1)} ({currentIndex + 1}/{words.length})
          </Text>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Content Display - Matching Regular Room */}
          <View style={styles.wordContainer}>
            <Text style={styles.wordLabel}>
              {currentContentType === 'sentences' ? 'Read this sentence:'
                : currentContentType === 'paragraphs' ? 'Read this paragraph:' 
                : 'Pronounce this word:'}
            </Text>
            <View style={[
              styles.wordCard,
              currentContentType === 'paragraphs' && styles.passageCard,
              currentContentType === 'sentences' && styles.sentenceCard
            ]}>
              <ScrollView 
                style={currentContentType === 'paragraphs' ? styles.paragraphScrollContainer : null}
                contentContainerStyle={currentContentType === 'paragraphs' ? styles.paragraphScrollContent : null}
                showsVerticalScrollIndicator={currentContentType === 'paragraphs'}
                nestedScrollEnabled={true}
              >
                <Text style={[
                  styles.word,
                  currentContentType === 'sentences' && styles.sentenceText,
                  currentContentType === 'paragraphs' && styles.paragraphText
                ]}>
                  {currentWord || "Content not available"}
                </Text>
              </ScrollView>
              <TouchableOpacity style={styles.soundButton} onPress={speakWord}>
                <Ionicons name="volume-high" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recognition Result */}
          {completed && score !== null ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {score >= 70 ? "Great job!" : "Try again"}
                </Text>
              </View>
              
              <View style={styles.resultContent}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Accuracy Score</Text>
                  <View style={styles.scoreBar}>
                    <View 
                      style={[
                        styles.scoreBarFill, 
                        { 
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? "#4CAF50" : score >= 40 ? "#FF9800" : "#FF5722"
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreText}>
                    {score}%
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.instructionCard}>
              <Ionicons name="mic-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.instructionTitle}>Ready to practice?</Text>
              <Text style={styles.instructionText}>
                {currentContentType === 'sentences' 
                  ? "Tap the microphone button below to start reading the sentence"
                  : currentContentType === 'paragraphs'
                    ? "Tap the microphone button below to start reading the paragraph"
                    : "Tap the microphone button below to start recording your pronunciation"
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Controls - Matching Regular Room */}
        <View style={styles.bottomControls}>
          {!completed ? (
            <TouchableOpacity
              style={[styles.micButton, recording && styles.micButtonRecording]}
              onPress={recording ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={recording ? ['#E53935', '#C62828'] : ['#4CAF50', '#388E3C']}
                style={styles.micButtonGradient}
              >
                <View style={styles.micButtonContent}>
                  <Ionicons
                    name={recording ? "stop" : "mic"}
                    size={28}
                    color={COLORS.white}
                  />
                  <Text style={styles.micButtonText}>
                    {recording 
                      ? "Stop Recording" 
                      : currentContentType === 'sentences' 
                        ? "Start Reading"
                        : currentContentType === 'paragraphs'
                          ? "Start Reading"  
                          : "Start Speaking"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.micButtonGradient}
              >
                <View style={styles.micButtonContent}>
                  <Ionicons name="checkmark" size={28} color={COLORS.white} />
                  <Text style={styles.micButtonText}>
                    {currentIndex >= words.length - 1 
                      ? currentContentType === 'sentences' ? "Complete Sentences" 
                        : currentContentType === 'paragraphs' ? "Complete Paragraphs"
                        : "Complete Words"
                      : currentContentType === 'sentences' ? "Next Sentence" 
                        : currentContentType === 'paragraphs' ? "Next Paragraph"
                        : "Next Word"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  placeholder: {
    width: 40,
  },
  progressInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    fontFamily: getFontFamily('semibold'),
  },
  contentTypeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 4,
    fontFamily: getFontFamily('regular'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  wordContainer: {
    marginBottom: 24,
  },
  wordLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    marginBottom: 12,
  },
  wordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: "row",
    justifyContent: "center",
  },
  sentenceCard: {
    padding: 24,
  },
  passageCard: {
    padding: 20,
    maxHeight: 300,
  },
  paragraphScrollContainer: {
    maxHeight: 250,
  },
  paragraphScrollContent: {
    paddingRight: 10,
  },
  word: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    textAlign: "center",
    marginRight: 12,
  },
  sentenceText: {
    fontSize: 24,
    lineHeight: 36,
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 28,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginTop: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  resultContent: {
    alignItems: "center",
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    marginBottom: 8,
  },
  scoreBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  micButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  micButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    // No need for background color override with gradient
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  micButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    marginLeft: 12,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  resultsContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: getFontFamily('bold'),
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  detailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  detailLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('medium'),
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  congratsText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: getFontFamily('regular'),
  },
  retryText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: getFontFamily('regular'),
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
  },
  advanceButton: {
    backgroundColor: "#4CAF50",
  },
  retryButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    fontFamily: getFontFamily('semibold'),
  },
  exitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  exitButtonText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: getFontFamily('regular'),
  },
});
