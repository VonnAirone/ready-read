import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../services/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_API_KEY } from "@env";
import { Audio } from "expo-av";
import { COLORS, GRADIENTS, FONT_SIZES, SPACING } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";
import { useNavigation } from "@react-navigation/native";

import { calculateScore } from "../../services/scoring";

import { 
  GoogleSpeechService, 
  initializeGoogleSpeech, 
  getGoogleSpeechService 
} from "../../services/googleSpeech";

import { 
  ASSESSMENT_ITEMS,
  ASSESSMENT_WORDS, 
  STARTER_WORDS, 
  ASSESSMENT_THRESHOLDS,
  ASSESSMENT_CONFIG,
  determineLevel,
  type AssessmentItem 
} from "../../data/assessmentData";

export default function PronunciationRoom({ route }: any) {
  const { roomData, fromPersonalProgress = false } = route.params;
  const navigation = useNavigation<any>();
  
  const isPersonalRoom = roomData?.isPersonalRoom || fromPersonalProgress;

  const [words, setWords] = useState<string[]>([]);
  const [currentAssessmentItem, setCurrentAssessmentItem] = useState<AssessmentItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [scoresArray, setScoresArray] = useState<number[]>([]);
  const [usingStarter, setUsingStarter] = useState(true);
  const [isAssessment, setIsAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<(AssessmentItem & {score: number})[]>([]);
  const [assessmentPhase, setAssessmentPhase] = useState<'intro' | 'testing' | 'results'>('intro');
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [streakCount, setStreakCount] = useState(0);

  const currentWord: string = words[currentIndex] ?? ""; // ✅ always defined
  
  // Update current assessment item when index changes
  useEffect(() => {
    if (isAssessment && ASSESSMENT_ITEMS[currentIndex]) {
      setCurrentAssessmentItem(ASSESSMENT_ITEMS[currentIndex]);
    }
  }, [currentIndex, isAssessment]);

  // Setup personal practice room
  const setupPersonalPracticeRoom = async (user: any) => {
    try {
      // Use StudentProgress collection with personal flag instead of separate collection
      const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
      const personalProgressSnap = await getDoc(doc(db, "StudentProgress", personalDocId));
      
      if (personalProgressSnap.exists()) {
        const data = personalProgressSnap.data();
        
        // Load personal progress data
        setIsAssessment(false);
        setUsingStarter(false);
        setStudentLevel(data.studentLevel || 'beginner');
        
        // Set words based on student level or use default practice words
        const practiceWords = getPracticeWordsByLevel(data.studentLevel || 'beginner');
        setWords(practiceWords);
        
        if (data.currentWordIndex !== undefined) {
          setCurrentIndex(data.currentWordIndex);
        }
        if (Array.isArray(data.scores)) {
          setScoresArray(data.scores);
        }
      } else {
        // First time in personal room - start with assessment or default words
        setIsAssessment(false);
        setUsingStarter(false);
        const defaultWords = getPracticeWordsByLevel('beginner');
        setWords(defaultWords);
        setStudentLevel('beginner');
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error setting up personal practice room:", error);
      setWords(STARTER_WORDS);
      setUsingStarter(true);
    }
  };

  // Get practice words based on student level
  const getPracticeWordsByLevel = (level: string) => {
    const levelWords = {
      beginner: ["cat", "sun", "book", "tree", "house", "water", "happy", "small"],
      intermediate: ["beautiful", "computer", "important", "wonderful", "dangerous", "restaurant", "conversation", "government"],
      advanced: ["pronunciation", "determination", "responsibility", "extraordinary", "communication", "understanding", "opportunity", "investigation"]
    };
    return levelWords[level as keyof typeof levelWords] || levelWords.beginner;
  };
  const recordingRef = useRef<Audio.Recording | null>(null);

  // ✅ Safety check for currentIndex
  useEffect(() => {
    if (words.length > 0 && currentIndex >= words.length) {
      setCurrentIndex(0);
    }
  }, [words, currentIndex]);

  // 🔹 Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const snap = await getDoc(doc(db, "Playername", user.uid));
          setPlayerName(
            snap.exists() ? snap.data().playerName || "Anonymous" : "Anonymous"
          );
        } catch {
          setPlayerName("Anonymous");
        }
      } else {
        setPlayerName("Anonymous");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) {
        setWords(STARTER_WORDS);
        setUsingStarter(true);
        return;
      }
      
      // Handle personal practice room differently
      if (isPersonalRoom) {
        await setupPersonalPracticeRoom(user);
        return;
      }
      
      const docId = `${user.uid}_${roomData.roomCode}`;
      try {
        const snap = await getDoc(doc(db, "StudentProgress", docId));
        if (snap.exists()) {
          const data = snap.data();
          
          // Check if student has completed assessment
          if (data.assessmentCompleted && data.studentLevel) {
            setIsAssessment(false);
            setUsingStarter(false);
            setStudentLevel(data.studentLevel);
            setAssessmentPhase('results');
            
            // Load room words based on student level
            const roomWords = roomData.words || (roomData.word ? [roomData.word] : []);
            if (roomWords.length > 0) {
              setWords(roomWords);
            } else {
              setWords(STARTER_WORDS);
              setUsingStarter(true);
            }
            
            if (data.currentWordIndex !== undefined)
              setCurrentIndex(data.currentWordIndex);
            if (Array.isArray(data.scores)) setScoresArray(data.scores);
          } else {
            // First time in room - trigger assessment
            setIsAssessment(true);
            setAssessmentPhase('intro');
            setWords(ASSESSMENT_ITEMS.map(item => item.content));
            setCurrentAssessmentItem(ASSESSMENT_ITEMS[0]);
            setCurrentIndex(0);
          }
        } else {
          // No progress found - trigger assessment
          setIsAssessment(true);
          setAssessmentPhase('intro');
          setWords(ASSESSMENT_ITEMS.map(item => item.content));
          setCurrentAssessmentItem(ASSESSMENT_ITEMS[0]);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
        setUsingStarter(true);
        setWords(STARTER_WORDS);
      }
    };
    fetchProgress();
  }, [roomData]);

  // 🔹 Live room word updates (after starter)
  useEffect(() => {
    if (usingStarter) return;
    const q = query(
      collection(db, "PronunciationRoom"),
      where("roomCode", "==", roomData.roomCode)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newWords: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.words)) newWords.push(...data.words);
        else if (data.word) newWords.push(data.word);
      });
      if (newWords.length > 0) {
        setWords(newWords);
        if (currentIndex >= newWords.length)
          setCurrentIndex(newWords.length - 1);
      }
    });
    return () => unsubscribe();
  }, [roomData.roomCode, currentIndex, usingStarter]);

  // 🔹 Auto-save on word change
  useEffect(() => {
    if (currentWord) saveProgress();
  }, [currentWord]);

  // ✅ Cleanup recording on component unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.warn);
        recordingRef.current = null;
      }
    };
  }, []);

  // ✅ Handle navigation away during recording
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.warn);
        recordingRef.current = null;
      }
    });

    return unsubscribe;
  }, [navigation]);

  // 🔹 Calculate student level from assessment results
  const calculateStudentLevel = (results: (AssessmentItem & {score: number})[]) => {
    let totalScore = 0;
    
    results.forEach(result => {
      // Weight the score by difficulty points
      totalScore += (result.score / 100) * result.points;
    });
    
    return determineLevel(totalScore);
  };

  // 🔹 Complete assessment and determine level
  const completeAssessment = async () => {
    const level = calculateStudentLevel(assessmentResults);
    setStudentLevel(level);
    setAssessmentPhase('results');
    
    // Save assessment results
    const user = auth.currentUser;
    if (user) {
      const docId = `${user.uid}_${roomData.roomCode}`;
      await setDoc(
        doc(db, "StudentProgress", docId),
        {
          playerName,
          name: playerName,
          email: user.email || "",
          roomCode: roomData.roomCode,
          roomName: roomData.roomName || "Unknown",
          assessmentCompleted: true,
          studentLevel: level,
          assessmentResults,
          assessmentDate: new Date(),
          currentWordIndex: 0,
          totalWords: 0,
          scores: [],
          completed: false,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }
    
    // Transition to normal room content
    setTimeout(() => {
      setIsAssessment(false);
      const roomWords = roomData.words || (roomData.word ? [roomData.word] : []);
      if (roomWords.length > 0) {
        setWords(roomWords);
        setUsingStarter(false);
      } else {
        setWords(STARTER_WORDS);
        setUsingStarter(true);
      }
      setCurrentIndex(0);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
    }, 3000);
  };

  // 🔹 Initialize Google Speech service
  useEffect(() => {
    if (GOOGLE_CLOUD_PROJECT_ID && GOOGLE_CLOUD_API_KEY) {
      initializeGoogleSpeech(GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_API_KEY);
    }
  }, []);

  // 🔹 Google Cloud Speech transcription
  const transcribeAudio = async (uri: string) => {
    try {
      console.log('Starting transcription for audio URI:', uri);
      
      // Check if service is initialized
      const speechService = getGoogleSpeechService();
      console.log('Google Speech service retrieved successfully');
      
      // Use different configurations based on content type
      const config = currentAssessmentItem?.type === 'passage' 
        ? GoogleSpeechService.getPassageConfig()
        : GoogleSpeechService.getPronunciationConfig();
      
      console.log('Using transcription config:', config);

      const result = await speechService.transcribeAudio(uri, config);
      console.log('Transcription result:', result);
      
      // If no transcript, run detailed debug analysis and return empty string
      if (!result.transcript || result.transcript.trim().length === 0) {
        console.log('🔍 No transcript returned - running debug analysis...');
        await speechService.debugTranscription(uri);
        return ""; // Return empty string instead of showing error
      }
      
      return result.transcript;
    } catch (err: any) {
      console.error("Google Speech error:", {
        message: err.message,
        stack: err.stack,
        error: err
      });
      
      // Run debug analysis on error
      try {
        const speechService = getGoogleSpeechService();
        console.log('🔍 Running debug analysis due to error...');
        await speechService.debugTranscription(uri);
      } catch (debugErr) {
        console.log('🔍 Debug analysis also failed:', debugErr);
      }
      
      // Return empty string instead of showing error alert
      return "";
    }
  };

  // 🔹 Start recording
  const startRecognition = async () => {
    if (!userId) return Alert.alert("Error", "Login required to record.");
    if (isRecording) return; // ✅ Prevent double-tap
    
    try {
      // ✅ Always cleanup any existing recording first
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log("Cleanup warning:", cleanupError);
        }
        recordingRef.current = null;
      }

      // ✅ Request permissions
      console.log('🎤 Requesting microphone permissions...');
      const permission = await Audio.requestPermissionsAsync();
      console.log('🎤 Permission result:', permission);
      
      if (!permission.granted) {
        return Alert.alert("Error", "Microphone permission is required.");
      }

      // ✅ Set audio mode
      console.log('🎤 Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      console.log('✅ Audio mode set successfully');

      // ✅ Try simpler recording format - use high quality preset
      const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      
      console.log('🎤 Creating recording with options:', recordingOptions);
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      console.log('✅ Recording object created successfully');
      
      recordingRef.current = recording;
      setIsRecording(true);
      
      console.log('🎤 Recording started - button should show recording state');
      
    } catch (err) {
      console.error("Recording error", err);
      Alert.alert("Recording Error", "Unable to start recording. Please try again.");
      setIsRecording(false);
      recordingRef.current = null;
    }
  };

  // 🔹 Stop recording & score
  const stopRecognition = async () => {
    if (!userId) return Alert.alert("Error", "Login required to stop recording.");
    if (!isRecording) return; // ✅ Prevent double-tap
    
    setIsRecording(false);
    setIsProcessing(true); // ✅ Show processing state
    
    try {
      if (!recordingRef.current) {
        Alert.alert("Error", "No active recording found.");
        return;
      }

      // ✅ Stop and get the URI
      console.log('🎤 Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null; // ✅ Clear reference immediately
      
      console.log('🎤 Recording stopped successfully');
      console.log('📁 Audio file URI:', uri);
      
      if (uri) {
        // Enhanced audio file validation
        try {
          console.log('🔍 Validating recorded audio file...');
          const response = await fetch(uri);
          const blob = await response.blob();
          
          console.log('🎵 Audio file validation:', {
            uri: uri,
            size: blob.size,
            type: blob.type,
            sizeInKB: Math.round(blob.size / 1024),
            exists: blob.size > 0
          });
          
          if (blob.size === 0) {
            Alert.alert("Recording Issue", "Recording is empty. Please ensure you're speaking into the microphone and try again.");
            return;
          }
          
          if (blob.size < 1000) { // Less than 1KB is likely too short
            Alert.alert("Recording Issue", `Recording seems very short (${Math.round(blob.size / 1024)}KB). Please speak longer and try again.`);
            return;
          }
          
          console.log('✅ Audio file validation passed');
        } catch (fileCheckError) {
          console.error('❌ Error validating audio file:', fileCheckError);
          Alert.alert("File Error", "Could not validate recorded audio. Please try recording again.");
          return;
        }
        
        const transcript = await transcribeAudio(uri);
        setRecognizedText(transcript);
        
        if (transcript) {
          const finalScore = calculateScore(transcript, currentWord);
          setScore(finalScore);
          setCompleted(true);
          
          if (isAssessment) {
            // Handle assessment scoring
            if (currentAssessmentItem) {
              const newResult = {
                ...currentAssessmentItem,
                score: finalScore
              };
              setAssessmentResults(prev => [...prev, newResult]);
            }
          } else {
            // Normal room scoring
            setScoresArray((prev) => [...prev, finalScore]);
            adjustDifficulty(finalScore);
            saveProgress();
          }
        } else {
          Alert.alert("Try Again", "I couldn't hear that clearly. Please speak a bit louder and try recording again.");
        }
      } else {
        Alert.alert("Error", "Failed to get recording. Please try again.");
      }
    } catch (err) {
      console.error("Stop recording error", err);
      Alert.alert("Error", "Failed to process recording. Please try again.");
      recordingRef.current = null; // ✅ Ensure cleanup
    } finally {
      setIsProcessing(false); // ✅ Clear processing state
    }
  };

  // 🔹 Adjust difficulty dynamically
  const adjustDifficulty = (newScore: number) => {
    if (newScore >= 80) {
      setStreakCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setDifficulty("hard");
          return 0;
        }
        return next;
      });
    } else if (newScore < 50) {
      setDifficulty("easy");
      setStreakCount(0);
    } else {
      setDifficulty("medium");
    }
  };

  // 🔹 Save StudentProgress
  const saveProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      if (isPersonalRoom) {
        // Save to student progress collection with personal flag
        const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            playerName,
            name: playerName,
            email: user.email || "",
            userId: user.uid,
            roomCode: "PERSONAL_PRACTICE",
            roomName: "Personal Practice Room",
            currentWordIndex: currentIndex,
            totalWords: words.length,
            scores: scoresArray, // Use 'scores' instead of 'personalScores'
            studentLevel,
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            isPersonalPractice: true, // Flag to identify personal practice
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
        
        // Also save individual score records for progress tracking
        await setDoc(
          doc(db, "StudentResultJoin", `personal_${user.uid}_${Date.now()}`),
          {
            email: user.email || "",
            userId: user.uid,
            score: score || 0,
            word: currentWord,
            isPersonalPractice: true,
            createdAt: Timestamp.now(),
          }
        );
      } else {
        // Regular room progress saving
        const docId = `${user.uid}_${roomData.roomCode}`;
        await setDoc(
          doc(db, "StudentProgress", docId),
          {
            playerName,
            name: playerName,
            email: user.email || "",
            roomCode: roomData.roomCode,
            roomName: roomData.roomName || "Unknown",
            currentWordIndex: currentIndex,
            totalWords: words.length,
            scores: scoresArray,
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error("Save progress error:", err);
    }
  };

  // 🔹 Proceed to next word
  const handleProceed = () => {
    // ✅ Reset recording states
    setIsProcessing(false);
    setIsRecording(false);
    
    if (isAssessment) {
      // Single passage assessment - complete immediately
      completeAssessment();
    } else {
      // Normal room flow
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRecognizedText("");
        setScore(null);
        setCompleted(false);
      } else {
        if (usingStarter) {
          setUsingStarter(false);
          setWords(roomData.words || [roomData.word]);
          setCurrentIndex(0);
          setRecognizedText("");
          setScore(null);
          setCompleted(false);
        } else {
          const total = scoresArray.reduce((a, b) => a + b, 0);
          const avg = Math.round(total / scoresArray.length);
          Alert.alert("Session Completed", `Total: ${total}\nAverage: ${avg}`);
        }
        saveProgress();
      }
    }
  };

  // 🔹 Start assessment
  const startAssessment = () => {
    setAssessmentPhase('testing');
    setCurrentIndex(0);
  };

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
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isAssessment 
                ? assessmentPhase === 'intro' 
                  ? "Pronunciation Assessment"
                  : assessmentPhase === 'results'
                    ? "Assessment Complete"
                    : "Pronunciation Assessment"
                : isPersonalRoom
                  ? "Personal Practice"
                : usingStarter 
                  ? "Practice Mode" 
                  : roomData.roomName || "Pronunciation Room"
              }
            </Text>
            <Text style={styles.headerSubtitle}>
              {isAssessment && assessmentPhase === 'testing'
                ? `Start speaking to determine your level`
                : isAssessment && assessmentPhase === 'results'
                  ? `Your level: ${studentLevel}`
                  : isAssessment && assessmentPhase === 'intro'
                    ? "Get ready to discover your pronunciation level"
                    : isPersonalRoom
                      ? `${studentLevel} level • Word ${currentIndex + 1} of ${words.length}`
                      : `Word ${currentIndex + 1} of ${words.length}`
              }
            </Text>
          </View>
          {!isAssessment && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{difficulty.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Assessment Intro */}
        {isAssessment && assessmentPhase === 'intro' && (
          <View style={styles.content}>
            <View style={styles.assessmentIntro}>
              <Ionicons name="school" size={64} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.assessmentTitle}>Pronunciation Assessment</Text>
              <Text style={styles.assessmentDescription}>
                We'll help you find your pronunciation level by having you read a passage 
                of varying difficulty. This will only take a few minutes and helps us customize your learning experience.
              </Text>
              
              <View style={styles.assessmentFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={20} color={COLORS.white} />
                  <Text style={styles.featureText}>Takes 3-5 minutes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={20} color={COLORS.white} />
                  <Text style={styles.featureText}>Determines your level</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.featureText}>Customizes content</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.startAssessmentButton} onPress={startAssessment}>
                <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.buttonGradient}>
                  <Text style={styles.startAssessmentText}>Start Assessment</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isAssessment && assessmentPhase === 'results' && (
          <View style={styles.content}>
            <View style={styles.assessmentResults}>
              <Ionicons 
                name="trophy" 
                size={64} 
                color={
                  studentLevel === 'advanced' ? '#FFD700' : 
                  studentLevel === 'intermediate' ? '#C0C0C0' : '#CD7F32'
                } 
              />
              <Text style={styles.resultsTitle}>Assessment Complete!</Text>
              <Text style={styles.levelText}>
                Your Pronunciation Level: {studentLevel.toUpperCase()}
              </Text>
              
              <View style={styles.levelDescription}>
                <Text style={styles.levelDescText}>
                  {studentLevel === 'advanced' && 
                    "Excellent! You have strong pronunciation skills. You'll practice with challenging words."}
                  {studentLevel === 'intermediate' && 
                    "Good work! You have solid pronunciation fundamentals. You'll practice with moderately challenging words."}
                  {studentLevel === 'beginner' && 
                    "Great start! We'll help you build strong pronunciation foundations with easier words."}
                </Text>
              </View>

              <View style={styles.scoreBreakdown}>
                <Text style={styles.breakdownTitle}>Your Results:</Text>
                {assessmentResults.map((result, index) => (
                  <View key={index} style={styles.scoreItem}>
                    <Text style={styles.scoreWord}>
                      {result.type === 'passage' && result.title ? result.title : result.content}
                    </Text>
                    <Text style={styles.scoreDifficulty}>({result.difficulty})</Text>
                    <Text style={[
                      styles.scoreValue,
                      { color: result.score >= 70 ? '#4CAF50' : result.score >= 40 ? '#FF9800' : '#FF5722' }
                    ]}>
                      {result.score}%
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.transitionText}>
                Starting pronunciation practice in a moment...
              </Text>
            </View>
          </View>
        )}

        {/* Regular Content - Assessment Testing or Normal Room */}
        {(!isAssessment || assessmentPhase === 'testing') && (
          <>
            {/* Progress Bar - only show for normal content */}
            {!isAssessment && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((currentIndex) / words.length) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(((currentIndex) / words.length) * 100)}% Complete
                </Text>
              </View>
            )}

            {/* Main Content */}
            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
          {/* Content Display */}
          <View style={styles.wordContainer}>
            <Text style={styles.wordLabel}>
              {currentAssessmentItem?.type === 'passage' ? 'Read this passage:' : 'Pronounce this word:'}
            </Text>
            <View style={[
              styles.wordCard, 
              currentAssessmentItem?.type === 'passage' && styles.passageCard
            ]}>
              {currentAssessmentItem?.type === 'passage' && currentAssessmentItem.title && (
                <Text style={styles.passageTitle}>{currentAssessmentItem.title}</Text>
              )}
              <Text style={[
                styles.word,
                currentAssessmentItem?.type === 'passage' && styles.passageText
              ]}>
                {currentWord || "Loading..."}
              </Text>
              <TouchableOpacity style={styles.soundButton}>
                <Ionicons name="volume-high" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recognition Result */}
          {recognizedText ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={score && score >= 70 ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={score && score >= 70 ? "#4CAF50" : "#FF5722"} 
                />
                <Text style={styles.resultTitle}>
                  {score && score >= 70 ? "Great job!" : "Try again"}
                </Text>
              </View>
              
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>You said:</Text>
                <Text style={styles.resultText}>"{recognizedText}"</Text>
                
                {score !== null && (
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
                    <Text style={[
                      styles.scoreText,
                      { color: score >= 70 ? "#4CAF50" : score >= 40 ? "#FF9800" : "#FF5722" }
                    ]}>
                      {score}%
                    </Text>
                  </View>
                )}
              </View>

              {completed && (
                <TouchableOpacity style={styles.nextButton} onPress={handleProceed}>
                  <Text style={styles.nextButtonText}>
                    {currentIndex < words.length - 1 ? "Next Word" : "Complete"}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.instructionCard}>
              <Ionicons name="mic-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.instructionTitle}>Ready to practice?</Text>
              <Text style={styles.instructionText}>
                Tap the microphone button below to start recording your pronunciation
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomContainer}>
          {!completed ? (
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
                (isRecording || isProcessing) && { opacity: 0.8 }
              ]}
              onPress={isRecording ? stopRecognition : startRecognition}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={
                  isProcessing 
                    ? ['#9E9E9E', '#757575'] 
                    : isRecording 
                      ? ['#FF5722', '#FF8A50'] 
                      : ['#4CAF50', '#66BB6A']
                }
                style={styles.micButtonGradient}
              >
                <View style={styles.micButtonContent}>
                  <Ionicons 
                    name={
                      isProcessing 
                        ? "hourglass" 
                        : isRecording 
                          ? "stop" 
                          : "mic"
                    } 
                    size={28} 
                    color={COLORS.white} 
                  />
                  <Text style={styles.micButtonText}>
                    {isProcessing 
                      ? "Processing..." 
                      : isRecording 
                        ? "Stop Recording" 
                        : "Start Speaking"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.completedButton}
              onPress={handleProceed}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.secondary}
                style={styles.micButtonGradient}
              >
                <View style={styles.micButtonContent}>
                  <Ionicons name="checkmark" size={28} color={COLORS.white} />
                  <Text style={styles.micButtonText}>
                    {isAssessment 
                      ? "Complete Assessment"
                      : currentIndex < words.length - 1 
                        ? "Next Word" 
                        : "Complete Session"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    marginTop: 2,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
  },
  progressContainer: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.lg,
  },
  wordContainer: {
    marginBottom: SPACING.xl,
  },
  wordLabel: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  wordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: "row",
    justifyContent: "center",
  },
  word: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    textAlign: "center",
    marginRight: SPACING.sm,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginLeft: SPACING.sm,
  },
  resultContent: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    marginBottom: SPACING.xs,
  },
  resultText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    textAlign: "center",
    marginBottom: SPACING.lg,
    fontStyle: "italic",
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    marginBottom: SPACING.xs,
  },
  scoreBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    fontFamily: getFontFamily('bold'),
  },
  nextButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: SPACING.md,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
    color: COLORS.primary,
    fontFamily: getFontFamily('semibold'),
    marginRight: SPACING.xs,
  },
  instructionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: SPACING.lg,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  instructionText: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 22,
  },
  bottomContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  micButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micButtonRecording: {
    transform: [{ scale: 1.05 }],
  },
  micButtonGradient: {
    borderRadius: 25,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  micButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginLeft: SPACING.sm,
  },
  completedButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Assessment Styles
  assessmentIntro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  assessmentTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  assessmentDescription: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  assessmentFeatures: {
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontFamily: getFontFamily('regular'),
    marginLeft: SPACING.sm,
  },
  startAssessmentButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    borderRadius: 25,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startAssessmentText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginRight: SPACING.sm,
  },
  assessmentResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  resultsTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  levelText: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  levelDescription: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  levelDescText: {
    fontSize: FONT_SIZES.base,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 22,
  },
  scoreBreakdown: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  breakdownTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  scoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  scoreWord: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    flex: 1,
  },
  scoreDifficulty: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    flex: 1,
    textAlign: "center",
  },
  scoreValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
    flex: 1,
    textAlign: "right",
  },
  transitionText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    fontStyle: "italic",
  },
  // Passage-specific styles
  passageCard: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 200,
  },
  passageTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    textAlign: "center",
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
    paddingBottom: SPACING.sm,
  },
  passageText: {
    fontSize: FONT_SIZES.base,
    fontWeight: "400",
    lineHeight: FONT_SIZES.base * 1.6,
    textAlign: "left",
    marginBottom: SPACING.lg,
    marginRight: 0,
  },
});
