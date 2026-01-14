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
  Modal,
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
  determineReaderLevel,
  type AssessmentItem 
} from "../../data/assessmentData";

import { getSubLevelContent, GAME_CONTENT } from "../../data/gameContent";

export default function RegularRoom({ route }: any) {
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
  const [studentLevel, setStudentLevel] = useState<1 | 2 | 3 | 4>(1);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [streakCount, setStreakCount] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);

type ContentType = 'words' | 'sentences' | 'paragraphs';

  // 🔹 Macro Level Progression State
  const [currentMacroLevel, setCurrentMacroLevel] = useState(1);
  const [currentContentType, setCurrentContentType] = useState<'words' | 'sentences' | 'paragraphs'>('words');
  const [macroLevelProgress, setMacroLevelProgress] = useState({
    1: {
      words: { completed: false, scores: [] as number[], totalScore: 0 },
      sentences: { completed: false, scores: [] as number[], totalScore: 0 },
      paragraphs: { completed: false, scores: [] as number[], totalScore: 0 }
    },
    2: {
      words: { completed: false, scores: [] as number[], totalScore: 0 },
      sentences: { completed: false, scores: [] as number[], totalScore: 0 },
      paragraphs: { completed: false, scores: [] as number[], totalScore: 0 }
    },
    3: {
      words: { completed: false, scores: [] as number[], totalScore: 0 },
      sentences: { completed: false, scores: [] as number[], totalScore: 0 },
      paragraphs: { completed: false, scores: [] as number[], totalScore: 0 }
    },
    4: {
      words: { completed: false, scores: [] as number[], totalScore: 0 },
      sentences: { completed: false, scores: [] as number[], totalScore: 0 },
      paragraphs: { completed: false, scores: [] as number[], totalScore: 0 }
    }
  });
  const [showMacroResults, setShowMacroResults] = useState(false);
  const [pendingMacroResults, setPendingMacroResults] = useState(false);

  // Handle pending macro results - show results when progress data is available
  useEffect(() => {
    if (pendingMacroResults && macroLevelProgress && Object.keys(macroLevelProgress).length > 0) {
      setPendingMacroResults(false);
      setShowMacroResults(true);
    }
  }, [pendingMacroResults, macroLevelProgress]);

  const currentWord: string = words[currentIndex] ?? ""; // ✅ always defined
  
  // Add loading state
  const [isContentLoading, setIsContentLoading] = useState(true);
  
  // Update current assessment item when index changes
  useEffect(() => {
    if (isAssessment && ASSESSMENT_ITEMS[currentIndex]) {
      setCurrentAssessmentItem(ASSESSMENT_ITEMS[currentIndex]);
    }
  }, [currentIndex, isAssessment]);

  // Safety check: Load content if words array is empty
  useEffect(() => {
    if (words.length === 0 && !isAssessment) {
      console.log('⚠️ No words available, loading fallback content');
      const fallbackWords = getReaderLevelWords(studentLevel);
      setWords(fallbackWords);
      setUsingStarter(fallbackWords === STARTER_WORDS);
    }
    setIsContentLoading(words.length === 0);
  }, [words, isAssessment, studentLevel]);

  // 🔹 Get practice words based on Reader Level
  const getReaderLevelWords = (readerLevel: 1 | 2 | 3 | 4): string[] => {
    const readerLevelContent = GAME_CONTENT[`reader-level-${readerLevel}`];
    if (readerLevelContent && readerLevelContent.macroLevels.macroLevel1.words.length > 0) {
      return readerLevelContent.macroLevels.macroLevel1.words.slice(0, 10).map(item => item.content);
    }
    return STARTER_WORDS; // Fallback if no content available
  };

  // 🔹 Get Reader Level display name
  const getReaderLevelName = (level: 1 | 2 | 3 | 4): string => {
    const levels = {
      1: 'Foundation Reader',
      2: 'Developing Reader', 
      3: 'Proficient Reader',
      4: 'Advanced Reader'
    };
    return levels[level];
  };

  // 🔹 Get Reader Level colors
  const getReaderLevelColor = (level: 1 | 2 | 3 | 4, isBorder: boolean = false): string => {
    const colors = {
      1: isBorder ? "rgba(76, 175, 80, 0.6)" : "rgba(76, 175, 80, 0.3)", // Green
      2: isBorder ? "rgba(33, 150, 243, 0.6)" : "rgba(33, 150, 243, 0.3)", // Blue  
      3: isBorder ? "rgba(255, 152, 0, 0.6)" : "rgba(255, 152, 0, 0.3)", // Orange
      4: isBorder ? "rgba(156, 39, 176, 0.6)" : "rgba(156, 39, 176, 0.3)" // Purple
    };
    return colors[level];
  };

  // 🔹 Load content for current macro level and content type
  const loadMacroLevelContent = (readerLevel: 1 | 2 | 3 | 4, macroLevel: 1 | 2 | 3 | 4, contentType: 'words' | 'sentences' | 'paragraphs') => {
    const readerLevelContent = GAME_CONTENT[`reader-level-${readerLevel}`];
    if (!readerLevelContent) {
      console.log(`❌ No content for reader-level-${readerLevel}`);
      return [];
    }

    const macroLevelContent = readerLevelContent.macroLevels[`macroLevel${macroLevel}` as keyof typeof readerLevelContent.macroLevels];
    if (!macroLevelContent) {
      console.log(`❌ No macroLevel${macroLevel} content`);
      return [];
    }

    // Return exactly 10 items for each content type (words, sentences, paragraphs)
    const content = macroLevelContent[contentType].slice(0, 10).map(item => item.content);
    console.log(`📚 Loaded ${content.length} ${contentType} for Reader Level ${readerLevel}, Macro Level ${macroLevel}`);
    return content;
  };

  // 🔹 Calculate macro level completion score
  const calculateMacroLevelScore = () => {
    const currentMacroProgress = macroLevelProgress[currentMacroLevel as keyof typeof macroLevelProgress];
    const { words, sentences, paragraphs } = currentMacroProgress;
    const totalItems = words.scores.length + sentences.scores.length + paragraphs.scores.length;
    const totalScore = words.totalScore + sentences.totalScore + paragraphs.totalScore;
    
    return totalItems > 0 ? Math.round(totalScore / totalItems) : 0;
  };

  // 🔹 Determine if user should advance to next macro level
  const shouldAdvanceToNextMacro = () => {
    const avgScore = calculateMacroLevelScore();
    return avgScore >= 70; // 70% threshold for advancement
  };

  // 🔹 Complete current content type and move to next
  const completeContentType = async () => {
    const currentScores = [...scoresArray];
    const totalScore = currentScores.reduce((sum, score) => sum + score, 0);



    // Update progress for current content type
    const updatedProgress = {
      ...macroLevelProgress,
      [currentMacroLevel]: {
        ...macroLevelProgress[currentMacroLevel as keyof typeof macroLevelProgress],
        [currentContentType]: {
          completed: true,
          scores: currentScores,
          totalScore: totalScore
        }
      }
    };
    
    setMacroLevelProgress(updatedProgress);

    // Move to next content type or complete macro level
    if (currentContentType === 'words') {
      console.log(`🔄 Transitioning from words to sentences - Reader Level ${studentLevel}, Macro Level ${currentMacroLevel}`);
      setCurrentContentType('sentences');
      setCurrentIndex(0);
      setScoresArray([]);
      // Reset UI state for new content type
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      const sentenceContent = loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'sentences');
      console.log(`✅ Sentence content loaded, length: ${sentenceContent.length}`);
      setWords(sentenceContent);
      
      // Save progress immediately after transitioning to sentences
      const user = auth.currentUser;
      if (user) {
        try {
          if (isPersonalRoom) {
            const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
            await setDoc(
              doc(db, "StudentProgress", personalDocId),
              {
                currentMacroLevel,
                currentContentType: 'sentences',
                macroLevelProgress: updatedProgress,
                currentIndex: 0,
                scoresArray: [],
                updatedAt: Timestamp.now(),
              },
              { merge: true }
            );
          } else {
            const docId = `${user.uid}_${roomData.roomCode}`;
            await setDoc(
              doc(db, "StudentProgress", docId),
              {
                currentMacroLevel,
                currentContentType: 'sentences',
                macroLevelProgress: updatedProgress,
                currentWordIndex: 0,
                scores: [],
                updatedAt: Timestamp.now(),
              },
              { merge: true }
            );
          }

        } catch (error) {
          console.error("Error saving progress after sentences transition:", error);
        }
      }
    } else if (currentContentType === 'sentences') {
      setCurrentContentType('paragraphs');
      setCurrentIndex(0);
      setScoresArray([]);
      // Reset UI state for new content type
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
      const paragraphContent = loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'paragraphs');
      setWords(paragraphContent);
      
      // Save progress immediately after transitioning to paragraphs
      const user = auth.currentUser;
      if (user) {
        try {
          if (isPersonalRoom) {
            const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
            await setDoc(
              doc(db, "StudentProgress", personalDocId),
              {
                currentMacroLevel,
                currentContentType: 'paragraphs',
                macroLevelProgress: updatedProgress,
                currentIndex: 0,
                scoresArray: [],
                updatedAt: Timestamp.now(),
              },
              { merge: true }
            );
          } else {
            const docId = `${user.uid}_${roomData.roomCode}`;
            await setDoc(
              doc(db, "StudentProgress", docId),
              {
                currentMacroLevel,
                currentContentType: 'paragraphs',
                macroLevelProgress: updatedProgress,
                currentWordIndex: 0,
                scores: [],
                updatedAt: Timestamp.now(),
              },
              { merge: true }
            );
          }

        } catch (error) {
          console.error("Error saving progress after paragraphs transition:", error);
        }
      }
    } else {
      // Completed all content types for current macro level
      await completeMacroLevel();
    }
  };

  // 🔹 Complete current macro level and show results
  const completeMacroLevel = async () => {
    // Ensure final content type (paragraphs) progress is saved before showing results
    const currentScores = [...scoresArray];
    const totalScore = currentScores.reduce((sum, score) => sum + score, 0);
    
    const updatedProgress = {
      ...macroLevelProgress,
      [currentMacroLevel]: {
        ...macroLevelProgress[currentMacroLevel as keyof typeof macroLevelProgress],
        [currentContentType]: {
          completed: true,
          scores: currentScores,
          totalScore: totalScore
        }
      }
    };
    
    setMacroLevelProgress(updatedProgress);
    
    // Immediately save the completion state BEFORE showing results
    const user = auth.currentUser;
    if (user) {
      try {
        if (isPersonalRoom) {
          const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
          const saveData = {
            playerName,
            name: playerName,
            email: user.email || "",
            userId: user.uid,
            roomCode: "PERSONAL_PRACTICE",
            roomName: "Personal Practice Room",
            currentIndex: currentIndex,
            totalWords: words.length,
            scores: scoresArray,
            scoresArray: scoresArray,
            studentLevel,
            readerLevel: studentLevel, // Alias for consistency
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            currentMacroLevel,
            macroLevel: currentMacroLevel, // Alias for consistency
            currentContentType,
            macroLevelProgress: updatedProgress,
            showMacroResults: true, // Critical: Save the results flag immediately
            isPersonalPractice: true,
            updatedAt: Timestamp.now(),
          };
          
          // WAIT for the save to complete before showing results
          await setDoc(doc(db, "StudentProgress", personalDocId), saveData, { merge: true });
        } else {
          const docId = `${user.uid}_${roomData.roomCode}`;
          const saveData = {
            userId: user.uid,
            playerName,
            name: playerName,
            email: user.email || "",
            roomCode: roomData.roomCode,
            roomName: roomData.roomName || "Unknown",
            teacherId: roomData.teacherId || roomData.createdBy || "",
            currentWordIndex: currentIndex,
            totalWords: words.length,
            scores: scoresArray,
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            currentMacroLevel,
            currentContentType,
            macroLevelProgress: updatedProgress,
            showMacroResults: true, // Critical: Save the results flag immediately
            updatedAt: Timestamp.now(),
          };
          
          // WAIT for the save to complete before showing results
          await setDoc(doc(db, "StudentProgress", docId), saveData, { merge: true });
        }
        
          console.log("✅ Database save complete");
        // Only NOW show the results after save is complete
        setPendingMacroResults(true);
        
      } catch (error) {
        console.error("Error saving macro completion state:", error);
        // Still show results even if save fails
        setPendingMacroResults(true);
      }
    } else {
      setPendingMacroResults(true);
    }
  };

  // 🔹 Handle macro level completion decision
  const handleMacroCompletion = async (advance: boolean) => {
    // First clear the macro results flag and save immediately
    setShowMacroResults(false);
    setPendingMacroResults(false);
    
    const user = auth.currentUser;
    if (user) {
      try {
        const baseData = {
          userId: user.uid,
          playerName,
          name: playerName,
          email: user.email || "",
          showMacroResults: false, // Clear the results flag immediately
          updatedAt: Timestamp.now(),
        };
        
        if (isPersonalRoom) {
          const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
          await setDoc(
            doc(db, "StudentProgress", personalDocId),
            baseData,
            { merge: true }
          );
        } else {
          const docId = `${user.uid}_${roomData.roomCode}`;
          await setDoc(
            doc(db, "StudentProgress", docId),
            {
              ...baseData,
              roomCode: roomData.roomCode,
              roomName: roomData.roomName || "Unknown",
              teacherId: roomData.teacherId || roomData.createdBy || "",
            },
            { merge: true }
          );
        }
        console.log("✅ Cleared macro results flag immediately");
      } catch (error) {
        console.error("❌ Error clearing macro results flag:", error);
      }
    }
    
    if (advance && currentMacroLevel < 4) {
      // Advance to next macro level
      setCurrentMacroLevel(prev => prev + 1);
      setCurrentContentType('words');
      setCurrentIndex(0);
      setScoresArray([]);
      setMacroLevelProgress(prev => ({
        ...prev,
        [currentMacroLevel + 1]: {
          words: { completed: false, scores: [], totalScore: 0 },
          sentences: { completed: false, scores: [], totalScore: 0 },
          paragraphs: { completed: false, scores: [], totalScore: 0 }
        }
      }));
      
      const newMacroLevel = (currentMacroLevel + 1) as 1 | 2 | 3 | 4;
      const wordContent = loadMacroLevelContent(studentLevel, newMacroLevel, 'words');
      setWords(wordContent);
      // Reset UI state for new macro level
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
    } else {
      // Repeat current macro level
      setCurrentContentType('words');
      setCurrentIndex(0);
      setScoresArray([]);
      setMacroLevelProgress(prev => ({
        ...prev,
        [currentMacroLevel]: {
          words: { completed: false, scores: [], totalScore: 0 },
          sentences: { completed: false, scores: [], totalScore: 0 },
          paragraphs: { completed: false, scores: [], totalScore: 0 }
        }
      }));
      
      const wordContent = loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'words');
      setWords(wordContent);
      // Reset UI state for repeat
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
    }
    
    // Save progress with updated state
    setTimeout(() => saveProgress(), 100);
  };

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
        setStudentLevel(data.studentLevel || 1);
        
        // Initialize macro level progression
        const level = data.studentLevel || 1;
        const macro = data.currentMacroLevel || 1;
        const contentType = data.currentContentType || 'words';
        
        setCurrentMacroLevel(macro);
        setCurrentContentType(contentType as ContentType);
        

        
        // Initialize or restore macro level progress FIRST
        if (data.macroLevelProgress) {
          setMacroLevelProgress(data.macroLevelProgress);
        } else {
          // Initialize fresh macro level progress
          setMacroLevelProgress(prev => ({
            ...prev,
            [macro]: {
              words: { completed: false, scores: [], totalScore: 0 },
              sentences: { completed: false, scores: [], totalScore: 0 },
              paragraphs: { completed: false, scores: [], totalScore: 0 }
            }
          }));
        }
        
        // Check if macro results should be shown - AFTER setting progress data
        if (data.showMacroResults) {
          // Use pending flag to ensure macro progress state is set before showing results
          setPendingMacroResults(true);
          return; // Don't load content, just show results
        }
        
        // Load content for current state
        const contentToLoad = loadMacroLevelContent(
          level as 1 | 2 | 3 | 4, 
          macro as 1 | 2 | 3 | 4, 
          contentType as 'words' | 'sentences' | 'paragraphs'
        );
        setWords(contentToLoad);
        
        // Set current index based on current content type, not saved index
        if (data.currentIndex !== undefined && data.currentContentType === contentType) {
          setCurrentIndex(data.currentIndex);
        } else {
          setCurrentIndex(0); // Start fresh for new content type
        }
        
        if (Array.isArray(data.scoresArray) && data.currentContentType === contentType) {
          setScoresArray(data.scoresArray);
        } else {
          setScoresArray([]);
        }
      } else {
        // First time in personal room - start fresh with macro level system
        setIsAssessment(false);
        setUsingStarter(false);
        setStudentLevel(1);
        setCurrentMacroLevel(1);
        setCurrentContentType('words');
        setCurrentIndex(0);
        
        // Initialize fresh macro level progress
        setMacroLevelProgress(prev => ({
          ...prev,
          1: {
            words: { completed: false, scores: [], totalScore: 0 },
            sentences: { completed: false, scores: [], totalScore: 0 },
            paragraphs: { completed: false, scores: [], totalScore: 0 }
          }
        }));
        
        // Load words for Reader Level 1, Macro Level 1
        const wordContent = loadMacroLevelContent(1, 1, 'words');
        setWords(wordContent);
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
        // Only navigate away if we're sure there's no user and auth has finished loading
        setPlayerName("Anonymous");
        setUserId(null);
        // Add a small delay to ensure this isn't just an auth restoration delay
        setTimeout(() => {
          if (!auth.currentUser) {
            // Uncomment the line below if you want to redirect to login on logout
            // navigation.navigate('Login');
          }
        }, 1000);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Don't fetch progress until auth state is determined
    if (isAuthLoading) return;
    
    const fetchProgress = async () => {
      setIsContentLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setWords(STARTER_WORDS);
        setUsingStarter(true);
        setIsContentLoading(false);
        return;
      }
      
      // Handle personal practice room differently
      if (isPersonalRoom) {
        await setupPersonalPracticeRoom(user);
        setIsContentLoading(false);
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
            // Don't set assessmentPhase - we're going straight to practice
            
            // Restore progress state
            if (data.currentWordIndex !== undefined) {
              setCurrentIndex(data.currentWordIndex);
            }
            if (Array.isArray(data.scores)) {
              setScoresArray(data.scores);
            }
            
            // Restore macro level progress state
            if (data.currentMacroLevel !== undefined) {
              setCurrentMacroLevel(data.currentMacroLevel);
            }
            if (data.currentContentType) {
              setCurrentContentType(data.currentContentType);
            }
            if (data.macroLevelProgress) {
              setMacroLevelProgress(data.macroLevelProgress);
            }
            
            // Check if macro results should be shown
            if (data.showMacroResults) {
              // Use pending mechanism like personal rooms
              setPendingMacroResults(true);
              setIsContentLoading(false);
              return; // Don't load content, just show results
            }
            
            // Load appropriate content based on progress
            const contentToLoad = loadMacroLevelContent(
              data.studentLevel,
              data.currentMacroLevel || 1,
              data.currentContentType || 'words'
            );
            
            if (contentToLoad.length > 0) {
              setWords(contentToLoad);
            } else {
              setWords(STARTER_WORDS);
              setUsingStarter(true);
            }
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
      } finally {
        setIsContentLoading(false);
      }
    };
    fetchProgress();
  }, [roomData, isAuthLoading]);

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
    
    return determineReaderLevel(totalScore);
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
          userId: user.uid,
          playerName,
          name: playerName,
          email: user.email || "",
          roomCode: roomData.roomCode,
          roomName: roomData.roomName || "Unknown",
          teacherId: roomData.teacherId || roomData.createdBy || "",
          assessmentCompleted: true,
          studentLevel: level,
          readerLevel: level,
          macroLevel: 1,
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
    
    // Stay in results phase - don't transition immediately
    // User will click continue button to start practice
  };

  // 🔹 Transition to practice content after user clicks continue
  const startPracticeContent = () => {
    setIsContentLoading(true);
    setIsAssessment(false);
    
    console.log(`🔄 Starting practice content for Reader Level ${studentLevel}`);
    
    // Always load content based on Reader Level from our 4-Level system
    const readerLevelContent = GAME_CONTENT[`reader-level-${studentLevel}`];
    
    if (readerLevelContent) {
      console.log(`📚 Found Reader Level ${studentLevel} content structure`);
      
      // Start with Macro Level 1, Sub-level 1 (words)
      const macroLevel1 = readerLevelContent.macroLevels.macroLevel1;
      console.log(`📖 Macro Level 1 has ${macroLevel1.words.length} words available`);
      
      const practiceWords = macroLevel1.words.slice(0, 10).map(item => item.content);
      
      if (practiceWords.length > 0) {
        setWords(practiceWords);
        setUsingStarter(false);
        setCurrentIndex(0);
        setIsContentLoading(false);
        console.log(`✅ Loaded Reader Level ${studentLevel} content:`, practiceWords);
      } else {
        // Fallback to starter words if no content available
        setWords(STARTER_WORDS);
        setUsingStarter(true);
        setCurrentIndex(0);
        setIsContentLoading(false);
        console.log(`⚠️ No content for Reader Level ${studentLevel}, using starter words`);
      }
    } else {
      setWords(STARTER_WORDS);
      setUsingStarter(true);
      setCurrentIndex(0);
      setIsContentLoading(false);
      console.log(`⚠️ Reader Level ${studentLevel} not found, using starter words`);
    }
    
    setRecognizedText("");
    setScore(null);
    setCompleted(false);
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
      const config = (currentAssessmentItem?.type === 'passage' || currentContentType === 'paragraphs')
        ? GoogleSpeechService.getPassageConfig()
        : GoogleSpeechService.getPronunciationConfig();
      
      console.log('Using transcription config for content type:', {
        isAssessment,
        currentAssessmentItemType: currentAssessmentItem?.type,
        currentContentType,
        configType: (currentAssessmentItem?.type === 'passage' || currentContentType === 'paragraphs') ? 'passage' : 'pronunciation'
      });

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
        console.log('Transcription completed:', {
          transcript,
          length: transcript.length,
          contentType: currentContentType,
          currentWord: currentWord.substring(0, 50) + '...' // Show first 50 chars for context
        });
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
            // Normal room scoringopooop
            setScoresArray((prev) => [...prev, finalScore]);
            adjustDifficulty(finalScore);
            // Save after score is properly set
            setTimeout(() => saveProgress(), 100);
          }
        } else {
          // Handle empty transcript - prompt user to try again instead of accepting 0 score
          console.log('⚠️ Empty transcript - prompting user to try again');
          Alert.alert(
            "No Audio Detected", 
            "We couldn't detect any audio. Please try again and speak clearly into the microphone.",
            [{ text: "Try Again", style: "default" }]
          );
          setScore(null);
          setCompleted(false);
          // Don't save progress or add to scores array
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
      if (!user) {
        console.log("No user found, skipping save");
        return;
      }
      
      console.log("Saving progress:", {
        currentIndex,
        scoresArrayLength: scoresArray.length,
        currentWord,
        isPersonalRoom
      });
      
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
            currentWordIndex: currentIndex, // Deprecated, keeping for compatibility
            currentIndex: currentIndex, // Current position within current content type
            totalWords: words.length,
            scores: scoresArray, // Current content type scores
            scoresArray: scoresArray, // Current content type scores array
            studentLevel,
            readerLevel: studentLevel, // Alias for consistency
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            // Macro level progress state
            currentMacroLevel,
            macroLevel: currentMacroLevel, // Alias for consistency
            currentContentType,
            macroLevelProgress,
            showMacroResults, // Save whether macro results should be shown
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
            userId: user.uid,
            playerName,
            name: playerName,
            email: user.email || "",
            roomCode: roomData.roomCode,
            roomName: roomData.roomName || "Unknown",
            teacherId: roomData.teacherId || roomData.createdBy || "",
            currentWordIndex: currentIndex,
            totalWords: words.length,
            scores: scoresArray,
            lastWord: currentWord || "",
            completed: currentIndex >= words.length - 1,
            // Macro level progress state
            currentMacroLevel,
            currentContentType,
            macroLevelProgress,
            showMacroResults, // Save whether macro results should be shown
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
      
      console.log("Progress saved successfully");
    } catch (err) {
      console.error("Save progress error:", err);
      // Show user-friendly error message
      Alert.alert(
        "Save Error", 
        "Failed to save your progress. Please check your internet connection and try again."
      );
    }
  };

  // 🔹 Proceed to next word
  const handleProceed = async () => {
    // ✅ Reset recording states
    setIsProcessing(false);
    setIsRecording(false);
    
    if (isAssessment) {
      // Assessment flow - check if there are more items
      if (currentIndex < ASSESSMENT_ITEMS.length - 1) {
        // More assessment items to complete
        setCurrentIndex(currentIndex + 1);
        setRecognizedText("");
        setScore(null);
        setCompleted(false);
      } else {
        // All assessment items completed
        completeAssessment();
      }
    } else {
      // Normal room flow with macro level progression
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRecognizedText("");
        setScore(null);
        setCompleted(false);
        // Save progress when moving to next word
        setTimeout(() => saveProgress(), 100);
      } else {
        if (usingStarter) {
          setUsingStarter(false);
          setWords(roomData.words || [roomData.word]);
          setCurrentIndex(0);
          setRecognizedText("");
          setScore(null);
          setCompleted(false);
        } else {
          // Complete current content type and handle macro level progression
          await completeContentType();
          // Don't call saveProgress here - completeContentType handles its own saving
        }
      }
    }
  };

  // 🔹 Start assessment
  const startAssessment = () => {
    setAssessmentPhase('testing');
    setCurrentIndex(0);
  };

  // 🔹 Calculate diagnostic statistics
  const calculateDiagnosticStats = () => {
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalScore = 0;
    let totalAttempts = 0;

    // Aggregate from macro level progress
    Object.values(macroLevelProgress).forEach((macroLevel: any) => {
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

    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Generate detailed diagnostic recommendation based on performance
    let recommendation = '';
    
    if (totalAttempts === 0) {
      recommendation = 'Start practicing to receive personalized recommendations! Complete a few words, sentences, and paragraphs to get detailed feedback on your pronunciation.';
    } else if (averageScore >= 90) {
      recommendation = `Outstanding performance! Your accuracy rate of ${accuracyRate}% shows excellent pronunciation skills. You've correctly pronounced ${totalCorrect} out of ${totalAttempts} items. Consider advancing to the next reader level for more challenging content to continue your growth.`;
    } else if (averageScore >= 80) {
      recommendation = `Great work! You're showing strong pronunciation skills with ${accuracyRate}% accuracy (${totalCorrect} correct out of ${totalAttempts}). To reach the next level:\n\n• Focus on clarity and enunciation for the ${totalIncorrect} items you missed\n• Practice at a steady pace - not too fast, not too slow\n• Continue building confidence with current content before advancing`;
    } else if (averageScore >= 70) {
      recommendation = `Good progress! You're on the right track with ${accuracyRate}% accuracy (${totalCorrect} correct, ${totalIncorrect} incorrect). Areas to improve:\n\n• Pronunciation Clarity: Focus on clear articulation of each word\n• Pacing: Speak at a comfortable speed that allows for proper enunciation\n• Practice: Review challenging words before recording\n• Confidence: Take your time and speak with confidence`;
    } else if (averageScore >= 50) {
      recommendation = `Keep practicing! Your current accuracy is ${accuracyRate}% (${totalCorrect} correct, ${totalIncorrect} incorrect). Here's how to improve:\n\n• Slow Down: Take time to pronounce each word clearly\n• Listen First: Read the content aloud before recording\n• Articulation: Focus on moving your lips and tongue properly\n• Environment: Practice in a quiet space for better recognition\n• Repetition: Practice difficult words multiple times`;
    } else {
      recommendation = `More practice needed! Current accuracy: ${accuracyRate}% (${totalCorrect} correct, ${totalIncorrect} incorrect). Focus on these fundamentals:\n\n• Read Slowly: Take 2-3 seconds per word\n• Enunciate Clearly: Exaggerate mouth movements\n• Quiet Environment: Ensure minimal background noise\n• Pre-Reading: Practice reading aloud before recording\n• Break It Down: Focus on one word at a time\n• Phonetics: Pay attention to beginning and ending sounds\n\nConsider reviewing the content multiple times before attempting to record. You're building important skills!`;
    }

    return {
      totalCorrect,
      totalIncorrect,
      totalAttempts,
      averageScore,
      recommendation
    };
  };

  // 🔹 Get word color based on recognition result
  const getWordColor = () => {
    if (!completed || score === null) return COLORS.white;
    
    if (currentContentType === 'words') {
      // For single words, green if score >= 70%, red otherwise
      return score >= 70 ? '#4CAF50' : '#FF5722';
    }
    
    // For sentences/paragraphs, return white (we'll handle per-word coloring differently)
    return COLORS.white;
  };

  // 🔹 Render colored words for sentences/paragraphs
  const renderColoredWords = () => {
    if (!completed || !recognizedText || !currentWord) {
      return currentWord || "Content not available";
    }

    // For single words, just return the word (color handled by getWordColor)
    if (currentContentType === 'words') {
      return currentWord;
    }

    // For sentences/paragraphs, split and color each word
    const expected = currentWord.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
    const recognized = recognizedText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
    const originalWords = currentWord.split(/\s+/);

    return originalWords.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
      const isCorrect = recognized.includes(cleanWord);
      return (
        <Text 
          key={index} 
          style={{ color: isCorrect ? '#4CAF50' : '#FF5722' }}
        >
          {word}{' '}
        </Text>
      );
    });
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Show loading screen while authentication is being restored */}
        {isAuthLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass" size={48} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.loadingText}>Restoring session...</Text>
          </View>
        ) : (
        <>
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
                  ? "Game Mode" 
                  : `Room ${roomData.roomName}` || "Pronunciation Room"
              }
            </Text>
          </View>
          {!isAssessment && (
            <TouchableOpacity 
              style={[
                styles.readerLevelBadge,
                { 
                  backgroundColor: getReaderLevelColor(studentLevel),
                  borderColor: getReaderLevelColor(studentLevel, true)
                }
              ]}
              onPress={() => setShowStatsModal(true)}
            >
              <Ionicons name="library-outline" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.readerLevelText}>
                LEVEL {studentLevel}
              </Text>
            </TouchableOpacity>
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
                  studentLevel === 4 ? '#FFD700' : 
                  studentLevel === 3 ? '#FF6B35' :
                  studentLevel === 2 ? '#4ECDC4' : '#52C41A'
                } 
              />
              <Text style={styles.resultsTitle}>Assessment Complete!</Text>
              <Text style={styles.levelText}>
                You are a <Text style={styles.levelHighlight}>Reader Level {studentLevel}</Text>
              </Text>
              <Text style={styles.levelName}>
                {getReaderLevelName(studentLevel)}
              </Text>
              
              <View style={styles.levelDescription}>
                <Text style={styles.levelDescText}>
                  {studentLevel === 4 && 
                    "Excellent! You have advanced communication skills. You'll practice with complex academic and abstract content."}
                  {studentLevel === 3 && 
                    "Great work! You have strong academic skills. You'll practice with technical and research-based content."}
                  {studentLevel === 2 && 
                    "Good progress! You're ready for social and workplace communication. You'll practice with professional content."}
                  {studentLevel === 1 && 
                    "Great start! We'll help you build strong foundations with everyday communication and basic vocabulary."}
                </Text>
              </View>

              <View style={styles.scoreBreakdown}>
                <Text style={styles.breakdownTitle}>Assessment Results:</Text>
                {assessmentResults.map((result, index) => (
                  <View key={index} style={styles.scoreItem}>
                    <Text style={styles.scoreWord} numberOfLines={1}>
                      {result.type === 'passage' && result.title ? result.title : result.content.slice(0, 40) + '...'}
                    </Text>
                    <View style={styles.scoreInfo}>
                      <Text style={styles.scoreDifficulty}>Level {result.readerLevel}</Text>
                      <Text style={[
                        styles.scoreValue,
                        { color: result.score >= 70 ? '#4CAF50' : result.score >= 40 ? '#FF9800' : '#FF5722' }
                      ]}>
                        {result.score}%
                      </Text>
                    </View>
                  </View>
                ))}
                
                <View style={styles.totalScore}>
                  <Text style={styles.totalScoreLabel}>Total Score:</Text>
                  <Text style={styles.totalScoreValue}>
                    {Math.round(assessmentResults.reduce((sum, r) => sum + (r.score / 100) * r.points, 0))} / 40 points
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.continueButton}
                onPress={startPracticeContent}
              >
                <Text style={styles.continueButtonText}>
                  Start Reader Level {studentLevel} Practice
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Macro Level Results */}
        {showMacroResults && (
          <View style={styles.content}>
            <View style={styles.assessmentResults}>
              {(() => {
                // Calculate overall performance for this macro level
                const currentMacroProgress = macroLevelProgress[currentMacroLevel];
                let totalScore = 0;
                let totalItems = 0;
                
                if (currentMacroProgress) {
                  (['words', 'sentences', 'paragraphs'] as ContentType[]).forEach(type => {
                    const typeProgress = currentMacroProgress[type];
                    if (typeProgress && typeProgress.scores.length > 0) {
                      totalScore += typeProgress.totalScore;
                      totalItems += typeProgress.scores.length;
                    }
                  });
                }
                
                const averageScore = totalItems > 0 ? Math.round(totalScore / totalItems) : 0;
                const performedWell = averageScore >= 70;
                
                return (
                  <>
                    <Ionicons 
                      name={performedWell ? "trophy-outline" : "school-outline"} 
                      size={80} 
                      color={performedWell ? "#FFD700" : "#FF9800"} 
                    />
                    <Text style={styles.resultsTitle}>
                      {performedWell ? "Excellent Work!" : "Keep Practicing!"}
                    </Text>
                    <Text style={styles.levelText}>
                      {performedWell 
                        ? `You've completed Macro Level ${currentMacroLevel}`
                        : `Macro Level ${currentMacroLevel} needs more practice`
                      }
                    </Text>
                    <Text style={styles.assessmentDescription}>
                      {performedWell 
                        ? "You successfully practiced words, sentences, and paragraphs. Keep up the great progress!"
                        : `You scored ${averageScore}% overall. Practice makes perfect! Try the exercises again to improve your pronunciation skills.`
                      }
                    </Text>
                    
                    <View style={styles.macroButtonContainer}>
                      {performedWell ? (
                        <>
                          <TouchableOpacity 
                            style={[styles.continueButton, { 
                              backgroundColor: '#9C27B0', 
                              marginBottom: 15,
                              width: '100%'
                            }]} 
                            onPress={() => handleMacroCompletion(true)}
                          >
                            <Text style={styles.continueButtonText}>
                              {currentMacroLevel < 4 ? 'Next Level' : 'Complete'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.continueButton, { 
                              backgroundColor: '#7B1FA2', 
                              borderWidth: 2,
                              borderColor: '#9C27B0',
                              width: '100%'
                            }]} 
                            onPress={() => handleMacroCompletion(false)}
                          >
                            <Ionicons name="refresh" size={20} color="white" />
                            <Text style={styles.continueButtonText}>Practice Again</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.continueButton, { 
                            backgroundColor: '#FF9800', 
                            width: '100%'
                          }]} 
                          onPress={() => handleMacroCompletion(false)}
                        >
                          <Ionicons name="refresh" size={20} color="white" />
                          <Text style={styles.continueButtonText}>Try Again</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        )}

        {/* Regular Content - Assessment Testing or Normal Room */}
        {(!isAssessment || assessmentPhase === 'testing') && !showMacroResults && (
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

            {/* Macro Level Progress */}
            {!isAssessment && studentLevel && (
              <View style={styles.macroProgressContainer}>
                <Text style={styles.macroProgressText}>
                  Macro Level {currentMacroLevel} • {currentContentType.charAt(0).toUpperCase() + currentContentType.slice(1)}
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
              {isAssessment 
                ? (currentAssessmentItem?.type === 'sentence' ? 'Read this sentence:' : 'Pronounce this word:')
                : currentContentType === 'sentences' ? 'Read this sentence:'
                : currentContentType === 'paragraphs' ? 'Read this paragraph:' 
                : 'Pronounce this word:'}
            </Text>
            <View style={[
              styles.wordCard, 
              (currentAssessmentItem?.type === 'passage' || currentContentType === 'paragraphs') && styles.passageCard,
              currentContentType === 'sentences' && styles.sentenceCard
            ]}>
              {currentAssessmentItem?.type === 'passage' && currentAssessmentItem.title && (
                <Text style={styles.passageTitle}>{currentAssessmentItem.title}</Text>
              )}
              <ScrollView 
                style={currentContentType === 'paragraphs' ? styles.paragraphScrollContainer : null}
                contentContainerStyle={currentContentType === 'paragraphs' ? styles.paragraphScrollContent : null}
                showsVerticalScrollIndicator={currentContentType === 'paragraphs'}
                nestedScrollEnabled={true}
              >
                <Text style={[
                  styles.word,
                  currentAssessmentItem?.type === 'passage' && styles.passageText,
                  currentContentType === 'sentences' && styles.sentenceText,
                  currentContentType === 'paragraphs' && styles.paragraphText,
                  { color: getWordColor() }
                ]}>
                  {isContentLoading ? "Loading content..." : renderColoredWords()}
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Recognition Result */}
          {completed && score !== null ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {score === 0 && !recognizedText 
                    ? "No audio detected" 
                    : score >= 70 ? "Great job!" : "Try again"}
                </Text>
              </View>
              
              <View style={styles.resultContent}>
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
                      ]}>
                      {score}%
                    </Text>
                  </View>
                )}
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
                      ? currentIndex < ASSESSMENT_ITEMS.length - 1 
                        ? `Next Sentence (${currentIndex + 1}/${ASSESSMENT_ITEMS.length})`
                        : "Complete Assessment"
                      : currentIndex < words.length - 1 
                        ? currentContentType === 'sentences' ? "Next Sentence" 
                          : currentContentType === 'paragraphs' ? "Next Paragraph"
                          : "Next Word"
                        : currentContentType === 'sentences' ? "Complete Sentences" 
                          : currentContentType === 'paragraphs' ? "Complete Paragraphs"
                          : "Complete Words"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        </>
        )}
        </>
        )}

        {/* Diagnostic Stats Modal */}
        <Modal
          visible={showStatsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStatsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Diagnostic Report</Text>
                <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Reader Level Badge */}
                <View style={styles.modalLevelBadge}>
                  <View style={[
                    styles.modalLevelCircle,
                    { backgroundColor: getReaderLevelColor(studentLevel) }
                  ]}>
                    <Text style={styles.modalLevelNumber}>{studentLevel}</Text>
                  </View>
                  <Text style={styles.modalLevelText}>Reader Level {studentLevel}</Text>
                </View>

                {/* Diagnostic Recommendation */}
                <View style={styles.statsSection}>
                  <View style={styles.statsSectionHeader}>
                    <Ionicons name="medical" size={20} color={COLORS.primary} />
                    <Text style={styles.statsSectionTitle}>Diagnostic Recommendation</Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {calculateDiagnosticStats().recommendation}
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
                      <Text style={styles.statValue}>{calculateDiagnosticStats().totalCorrect}</Text>
                      <Text style={styles.statLabel}>Correct Words</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Ionicons name="close-circle" size={32} color="#f5222d" />
                      <Text style={styles.statValue}>{calculateDiagnosticStats().totalIncorrect}</Text>
                      <Text style={styles.statLabel}>Incorrect Words</Text>
                    </View>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Ionicons name="list" size={32} color="#1890ff" />
                      <Text style={styles.statValue}>{calculateDiagnosticStats().totalAttempts}</Text>
                      <Text style={styles.statLabel}>Total Pronounced</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Ionicons name="trophy" size={32} color="#faad14" />
                      <Text style={styles.statValue}>{calculateDiagnosticStats().averageScore}%</Text>
                      <Text style={styles.statLabel}>Average Score</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStatsModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  readerLevelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readerLevelText: {
    fontSize: FONT_SIZES.xs + 1,
    color: COLORS.white,
    fontWeight: "700",
    fontFamily: getFontFamily('bold'),
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    marginTop: SPACING.sm,
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
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
    fontSize: FONT_SIZES.lg,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    marginBottom: SPACING.sm,
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
    fontFamily: getFontFamily('regular'),
    color: COLORS.white,
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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  scoreWord: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    flex: 2,
    marginRight: SPACING.sm,
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
  levelHighlight: {
    fontWeight: "800",
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: getFontFamily('medium'),
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  scoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    marginLeft: SPACING.sm,
  },
  totalScore: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  totalScoreLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
  },
  totalScoreValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  continueButton: {
    backgroundColor: '#4CAF50', // Green color for success action
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    marginRight: SPACING.sm,
  },
  // Sentence and paragraph styles
  sentenceCard: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: 80,
  },
  sentenceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "500",
    lineHeight: FONT_SIZES.lg * 1.4,
    textAlign: "center",
    marginRight: 0,
  },
  paragraphScrollContainer: {
    maxHeight: 200,
    width: '100%',
  },
  paragraphScrollContent: {
    paddingVertical: SPACING.sm,
  },
  paragraphText: {
    fontSize: FONT_SIZES.base,
    fontWeight: "400",
    lineHeight: FONT_SIZES.base * 1.5,
    textAlign: "left",
    marginRight: 0,
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
  // Macro level progress styles
  macroProgressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  macroProgressText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
    textAlign: "center"
  },
  contentTypeProgress: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  contentTypeDot: {
    alignItems: "center",
    minWidth: 30,
  },
  contentTypeDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
  },
  // Colored text styles
  coloredTextContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  coloredTextWords: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  coloredWord: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    fontFamily: getFontFamily('semibold'),
  },
  singleWord: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: "700",
    fontFamily: getFontFamily('bold'),
    textAlign: "center",
  },
  contentTypeDotPending: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  contentTypeDotLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "500",
    fontFamily: getFontFamily('medium'),
  },
  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: "500",
    fontFamily: getFontFamily('medium'),
    marginTop: SPACING.md,
    textAlign: "center",
  },
  // Macro level button styles
  macroButtonContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: SPACING.md,
    width: "100%",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  modalTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: COLORS.black,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalLevelBadge: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  modalLevelCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalLevelNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: COLORS.white,
  },
  modalLevelText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    fontFamily: getFontFamily('semibold'),
    color: COLORS.black,
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  recommendationText: {
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
    color: '#666',
    fontFamily: getFontFamily('regular'),
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: COLORS.black,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontFamily: getFontFamily('regular'),
    textAlign: 'center',
    marginTop: 4,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    fontFamily: getFontFamily('semibold'),
  },
});
