import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase, auth } from "../../services/supabase";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { COLORS, GRADIENTS, FONT_SIZES, SPACING } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";
import { useNavigation } from "@react-navigation/native";

import { calculateScore } from "../../services/scoring";
import { WordFeedbackCard } from "../../components/practice/WordFeedbackCard";
import { MacroLevelPanel, MacroLevelRecord } from "../../components/practice/MacroLevelPanel";

import { getAzureSpeechService, type AzureWordResult } from "../../services/azureSpeech";

import {
  ASSESSMENT_ITEMS,
  STARTER_WORDS,
  determineReaderLevel,
  type AssessmentItem
} from "../../data/assessmentData";

import {
  resetUserSession,
  getOrCreateSessionId,
} from "../../utils/contentIntegration";
import { getContentByType } from "../../utils/contentLoader";
import type { ContentItem } from "../../types/content";

export default function RegularRoom({ route }: any) {
  // Personal practice mode: roomData may be { isPersonalRoom: true } or fully absent
  const params = route?.params || {};
  const { roomData = { isPersonalRoom: true }, fromPersonalProgress = false } = params;

  const navigation = useNavigation<any>();
  
  const isPersonalRoom = roomData?.isPersonalRoom || fromPersonalProgress;

  const [words, setWords] = useState<string[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentAssessmentItem, setCurrentAssessmentItem] = useState<AssessmentItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [wordResults, setWordResults] = useState<AzureWordResult[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [scoresArray, setScoresArray] = useState<number[]>([]);
  const [usingStarter, setUsingStarter] = useState(true);
  const [isAssessment, setIsAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<(AssessmentItem & {score: number})[]>([]);
  const [assessmentPhase, setAssessmentPhase] = useState<'intro' | 'testing' | 'results'>('intro');
  const [studentLevel, setStudentLevel] = useState<1 | 2 | 3 | 4>(1);
  // Tracks the furthest reader level ever reached — used to keep higher levels unlocked
  // even when the student navigates back to an earlier reader level for extra practice.
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<1 | 2 | 3 | 4>(1);
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

  // Macro level map — status + best scores (mirrors PersonalPracticeRoom)
  const [macroLevelMap, setMacroLevelMap] = useState<Record<number, MacroLevelRecord>>({
    1: { status: 'in_progress', bestScore: 0, microBestScores: {} },
    2: { status: 'locked',      bestScore: 0, microBestScores: {} },
    3: { status: 'locked',      bestScore: 0, microBestScores: {} },
    4: { status: 'locked',      bestScore: 0, microBestScores: {} },
  });
  const [panelVisible, setPanelVisible] = useState(false);
  // Best score per item: key = `${macroLevel}-${contentType}-${index}`
  const [itemBestScores, setItemBestScores] = useState<Record<string, number>>({});

  // In-memory snapshots per reader level — updated synchronously before any setState calls
  // so panel navigation always restores the correct state without Firestore timing issues.
  const readerLevelSnapshotsRef = useRef<Record<number, {
    currentMacroLevel: number;
    currentContentType: 'words' | 'sentences' | 'paragraphs';
    currentIndex: number;
    scoresArray: number[];
    macroLevelProgress: any;
    macroLevelMap: any;
    itemBestScores: any;
    showMacroResults: boolean;
  }>>({});

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
      (async () => {
        try {
          const fallbackItems = await getReaderLevelWords(studentLevel);
          if (fallbackItems.length > 0) {
            setContentItems(fallbackItems);
            setWords(fallbackItems.map(item => item.text));
            setUsingStarter(false);
          } else {
            setContentItems([]);
            setWords(STARTER_WORDS);
            setUsingStarter(true);
          }
        } catch (error) {
          console.error('[RegularRoom] Failed to load fallback words:', error);
          setContentItems([]);
          setWords(STARTER_WORDS);
          setUsingStarter(true);
        }
      })();
    }
    setIsContentLoading(words.length === 0);
  }, [words, isAssessment, studentLevel]);

  // 🔹 Get words for Reader Level, Macro Level 1 (sequential)
  const getReaderLevelWords = async (readerLevel: 1 | 2 | 3 | 4): Promise<ContentItem[]> => {
    return loadMacroLevelContent(readerLevel, 1, 'words');
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

  // 🔹 Load sequential content for a macro level and content type (no randomization = no duplicates)
  const loadMacroLevelContent = async (readerLevel: 1 | 2 | 3 | 4, macroLevel: 1 | 2 | 3 | 4, contentType: 'words' | 'sentences' | 'paragraphs'): Promise<ContentItem[]> => {
    try {
      const typeKey = contentType === 'words' ? 'word' : contentType === 'sentences' ? 'sentence' : 'paragraph';
      const items = await getContentByType(`r${readerLevel}`, `m${macroLevel}`, typeKey);
      // Take exactly 10 items in sequential order
      return items.slice(0, 10);
    } catch (error) {
      console.error('[RegularRoom] Failed to load content:', error);
      return [];
    }
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
      setCurrentContentType('sentences');
      setCurrentIndex(0);
      setScoresArray([]);
      // Reset UI state for new content type
      setRecognizedText("");
      setWordResults([]);
      setScore(null);
      setCompleted(false);
      const sentenceContent = await loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'sentences');
      
      if (!sentenceContent || sentenceContent.length === 0) {
        Alert.alert("No Content", "No sentences available for this level. Please try again later.");
        return;
      }
      
      setContentItems(sentenceContent);
      setWords(sentenceContent.map(item => item.text));
      
      // Save progress immediately after transitioning to sentences
      const user = auth.currentUser;
      if (user) {
        try {
          if (isPersonalRoom) {
            await supabase.from('student_progress').upsert({
              id: `${user.id}_PERSONAL_PRACTICE`,
              user_id: user.id,
              current_macro_level: currentMacroLevel,
              current_content_type: 'sentences',
              macro_level_progress: updatedProgress,
              current_index: 0,
              scores_array: [],
              updated_at: new Date().toISOString(),
            });
          } else {
            await supabase.from('student_progress').upsert({
              id: `${user.id}_${roomData.roomCode}`,
              user_id: user.id,
              current_macro_level: currentMacroLevel,
              current_content_type: 'sentences',
              macro_level_progress: updatedProgress,
              current_word_index: 0,
              scores: [],
              updated_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('[RegularRoom] Failed to save words→sentences transition:', error);
        }
      }
    } else if (currentContentType === 'sentences') {
      setCurrentContentType('paragraphs');
      setCurrentIndex(0);
      setScoresArray([]);
      // Reset UI state for new content type
      setRecognizedText("");
      setWordResults([]);
      setScore(null);
      setCompleted(false);
      const paragraphContent = await loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'paragraphs');
      
      if (!paragraphContent || paragraphContent.length === 0) {
        Alert.alert("No Content", "No paragraphs available for this level. Please try again later.");
        return;
      }
      
      setContentItems(paragraphContent);
      setWords(paragraphContent.map(item => item.text));
      
      // Save progress immediately after transitioning to paragraphs
      const user = auth.currentUser;
      if (user) {
        try {
          if (isPersonalRoom) {
            await supabase.from('student_progress').upsert({
              id: `${user.id}_PERSONAL_PRACTICE`,
              user_id: user.id,
              current_macro_level: currentMacroLevel,
              current_content_type: 'paragraphs',
              macro_level_progress: updatedProgress,
              current_index: 0,
              scores_array: [],
              updated_at: new Date().toISOString(),
            });
          } else {
            await supabase.from('student_progress').upsert({
              id: `${user.id}_${roomData.roomCode}`,
              user_id: user.id,
              current_macro_level: currentMacroLevel,
              current_content_type: 'paragraphs',
              macro_level_progress: updatedProgress,
              current_word_index: 0,
              scores: [],
              updated_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('[RegularRoom] Failed to save sentences→paragraphs transition:', error);
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

    // Mark macro level as completed and unlock the next one
    setMacroLevelMap(prev => {
      const levelRecord = prev[currentMacroLevel] ?? { status: 'in_progress', bestScore: 0, microBestScores: {} };
      // Compute best score = average of all item best scores for this level
      const allBests = Object.entries(itemBestScores)
        .filter(([k]) => k.startsWith(`${currentMacroLevel}-`))
        .map(([, v]) => v);
      const avgBest = allBests.length > 0
        ? Math.round(allBests.reduce((a, b) => a + b, 0) / allBests.length)
        : levelRecord.bestScore;

      const updated: Record<number, MacroLevelRecord> = {
        ...prev,
        [currentMacroLevel]: {
          ...levelRecord,
          status: 'completed',
          bestScore: Math.max(avgBest, levelRecord.bestScore),
          completedAt: new Date().toISOString(),
        },
      };
      const next = currentMacroLevel + 1;
      if (next <= 4 && updated[next]?.status === 'locked') {
        updated[next] = { ...updated[next], status: 'in_progress' };
      }
      return updated;
    });

    // Immediately save the completion state BEFORE showing results
    const user = auth.currentUser;
    if (user) {
      try {
        if (isPersonalRoom) {
          await supabase.from('student_progress').upsert({
            id: `${user.id}_PERSONAL_PRACTICE`,
            user_id: user.id,
            player_name: playerName,
            name: playerName,
            email: user.email || "",
            room_code: "PERSONAL_PRACTICE",
            room_name: "Personal Practice Room",
            current_index: currentIndex,
            total_words: words.length,
            scores: scoresArray,
            scores_array: scoresArray,
            student_level: studentLevel,
            reader_level: studentLevel,
            last_word: currentWord || "",
            completed: currentIndex >= words.length - 1,
            current_macro_level: currentMacroLevel,
            macro_level: currentMacroLevel,
            current_content_type: currentContentType,
            macro_level_progress: updatedProgress,
            show_macro_results: true,
            is_personal_practice: true,
            updated_at: new Date().toISOString(),
          });
        } else {
          await supabase.from('student_progress').upsert({
            id: `${user.id}_${roomData.roomCode}`,
            user_id: user.id,
            player_name: playerName,
            name: playerName,
            email: user.email || "",
            room_code: roomData.roomCode,
            room_name: roomData.roomName || "Unknown",
            teacher_id: roomData.teacherId || roomData.createdBy || "",
            current_word_index: currentIndex,
            total_words: words.length,
            scores: scoresArray,
            last_word: currentWord || "",
            completed: currentIndex >= words.length - 1,
            current_macro_level: currentMacroLevel,
            current_content_type: currentContentType,
            macro_level_progress: updatedProgress,
            show_macro_results: true,
            updated_at: new Date().toISOString(),
          });
        }
        
        // Only NOW show the results after save is complete
        setPendingMacroResults(true);
        
      } catch (error) {
        console.error('[RegularRoom] Failed to save macro level completion:', error);
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
        if (isPersonalRoom) {
          await supabase.from('student_progress').upsert({
            id: `${user.id}_PERSONAL_PRACTICE`,
            user_id: user.id,
            player_name: playerName,
            name: playerName,
            email: user.email || "",
            show_macro_results: false,
            updated_at: new Date().toISOString(),
          });
        } else {
          await supabase.from('student_progress').upsert({
            id: `${user.id}_${roomData.roomCode}`,
            user_id: user.id,
            player_name: playerName,
            name: playerName,
            email: user.email || "",
            room_code: roomData.roomCode,
            room_name: roomData.roomName || "Unknown",
            teacher_id: roomData.teacherId || roomData.createdBy || "",
            show_macro_results: false,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('[RegularRoom] Failed to save macro completion flag:', error);
      }
    }

    if (advance && currentMacroLevel < 4) {
      // Compute next level once — avoids stale closure in functional state updaters
      const newMacroLevel = (currentMacroLevel + 1) as 1 | 2 | 3 | 4;
      // Advance to next macro level
      setCurrentMacroLevel(newMacroLevel);
      setCurrentContentType('words');
      setCurrentIndex(0);
      setScoresArray([]);
      setMacroLevelProgress(prev => ({
        ...prev,
        [newMacroLevel]: {
          words: { completed: false, scores: [], totalScore: 0 },
          sentences: { completed: false, scores: [], totalScore: 0 },
          paragraphs: { completed: false, scores: [], totalScore: 0 }
        }
      }));
      const wordContent = await loadMacroLevelContent(studentLevel, newMacroLevel, 'words');
      setContentItems(wordContent || []);
      setWords((wordContent || []).map(item => item.text));
      // Reset UI state for new macro level
      setRecognizedText("");
      setWordResults([]);
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
      
      const wordContent = await loadMacroLevelContent(studentLevel, currentMacroLevel as 1 | 2 | 3 | 4, 'words');
      setContentItems(wordContent || []);
      setWords((wordContent || []).map(item => item.text));
      // Reset UI state for repeat
      setRecognizedText("");
      setWordResults([]);
      setScore(null);
      setCompleted(false);
    }
    
    // Save progress
    saveProgress();
  };

  // Navigate to a different reader level — saves current progress in-memory then restores target level
  const navigateToReaderLevel = async (targetReaderLevel: number) => {
    if (targetReaderLevel < 1 || targetReaderLevel > 4) return;

    // ── Step 1: Snapshot current level synchronously into the ref ──────────
    // This MUST happen before any setState calls so we capture the state
    // values from this render's closure, not a stale future render.
    readerLevelSnapshotsRef.current[studentLevel] = {
      currentMacroLevel,
      currentContentType,
      currentIndex,
      scoresArray,
      macroLevelProgress,
      macroLevelMap,
      itemBestScores,
      showMacroResults,
    };

    // Also fire-and-forget a Firestore save so progress survives app restarts
    if (isPersonalRoom) {
      saveProgress();
    }

    // ── Step 2: Reset transient UI ─────────────────────────────────────────
    setRecognizedText("");
    setWordResults([]);
    setScore(null);
    setCompleted(false);
    setShowMacroResults(false);
    setPendingMacroResults(false);
    setStudentLevel(targetReaderLevel as 1 | 2 | 3 | 4);
    setPanelVisible(false);

    // ── Step 3: Restore target level from in-memory snapshot ───────────────
    const snapshot = readerLevelSnapshotsRef.current[targetReaderLevel];

    if (snapshot) {
      const { currentMacroLevel: macro, currentContentType: contentType } = snapshot;
      setCurrentMacroLevel(macro);
      setCurrentContentType(contentType as ContentType);
      setCurrentIndex(snapshot.currentIndex);
      setScoresArray(snapshot.scoresArray);
      if (snapshot.macroLevelProgress) setMacroLevelProgress(snapshot.macroLevelProgress);
      if (snapshot.macroLevelMap) setMacroLevelMap(snapshot.macroLevelMap);
      if (snapshot.itemBestScores) setItemBestScores(snapshot.itemBestScores);

      const content = await loadMacroLevelContent(
        targetReaderLevel as 1 | 2 | 3 | 4,
        macro as 1 | 2 | 3 | 4,
        contentType as 'words' | 'sentences' | 'paragraphs'
      );
      setContentItems(content || []);
      setWords((content || []).map(item => item.text));
    } else {
      // First visit to this level — check Supabase for a persisted snapshot
      let restoredFromFirestore = false;
      const user = auth.currentUser;
      if (isPersonalRoom && user) {
        try {
          const { data: progressRow } = await supabase
            .from('student_progress')
            .select('reader_level_progress')
            .eq('id', `${user.id}_PERSONAL_PRACTICE`)
            .single();
          if (progressRow) {
            const saved = progressRow.reader_level_progress?.[targetReaderLevel];
            if (saved) {
              const macro = saved.currentMacroLevel ?? 1;
              const contentType: ContentType = saved.currentContentType ?? 'words';
              setCurrentMacroLevel(macro);
              setCurrentContentType(contentType);
              setCurrentIndex(saved.currentIndex ?? 0);
              setScoresArray(saved.scoresArray ?? []);
              if (saved.macroLevelProgress) setMacroLevelProgress(saved.macroLevelProgress);
              if (saved.macroLevelMap) setMacroLevelMap(saved.macroLevelMap);
              if (saved.itemBestScores) setItemBestScores(saved.itemBestScores);

              // Also populate in-memory snapshot for subsequent navigations
              readerLevelSnapshotsRef.current[targetReaderLevel] = saved;

              const content = await loadMacroLevelContent(
                targetReaderLevel as 1 | 2 | 3 | 4,
                macro as 1 | 2 | 3 | 4,
                contentType as 'words' | 'sentences' | 'paragraphs'
              );
              setContentItems(content || []);
              setWords((content || []).map(item => item.text));
              restoredFromFirestore = true;
            }
          }
        } catch (_) {
          // Fall through to fresh start
        }
      }

      if (!restoredFromFirestore) {
        // No saved state — start fresh at words for this reader level
        setCurrentMacroLevel(1);
        setCurrentContentType('words');
        setCurrentIndex(0);
        setScoresArray([]);
        setMacroLevelMap({
          1: { status: 'in_progress', bestScore: 0, microBestScores: {} },
          2: { status: 'locked',      bestScore: 0, microBestScores: {} },
          3: { status: 'locked',      bestScore: 0, microBestScores: {} },
          4: { status: 'locked',      bestScore: 0, microBestScores: {} },
        });
        const content = await loadMacroLevelContent(targetReaderLevel as 1 | 2 | 3 | 4, 1, 'words');
        setContentItems(content || []);
        setWords((content || []).map(item => item.text));
      }
    }
  };

  // Navigate to any unlocked or completed macro level via the panel
  const navigateToMacroLevel = async (targetLevel: number) => {
    const record = macroLevelMap[targetLevel];
    if (!record || record.status === 'locked') return;

    setCurrentMacroLevel(targetLevel);
    setCurrentContentType('words');
    setCurrentIndex(0);
    setScoresArray([]);
    setRecognizedText("");
    setWordResults([]);
    setScore(null);
    setCompleted(false);
    setShowMacroResults(false);
    setPendingMacroResults(false);

    const wordContent = await loadMacroLevelContent(studentLevel, targetLevel as 1 | 2 | 3 | 4, 'words');
    setContentItems(wordContent || []);
    setWords((wordContent || []).map(item => item.text));
    
    // Save macro level navigation
    const user = auth.currentUser;
    if (user && !isPersonalRoom) {
      try {
        const docId = `${user.id}_${roomData.roomCode}`;
        await supabase.from('student_progress').upsert({
          id: docId,
          user_id: user.id,
          current_macro_level: targetLevel,
          current_content_type: 'words',
          current_index: 0,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[RegularRoom] Failed to save macro level navigation:', error);
      }
    }
    
    setPanelVisible(false);
  };

  // Setup personal practice room
  const setupPersonalPracticeRoom = async (user: any) => {
    try {
      const personalDocId = `${user.id}_PERSONAL_PRACTICE`;
      const { data: progressRow } = await supabase
        .from('student_progress')
        .select('*')
        .eq('id', personalDocId)
        .single();

      if (progressRow) {
        // Load personal progress data
        setIsAssessment(false);
        setUsingStarter(false);
        const loadedLevel = (progressRow.student_level || 1) as 1 | 2 | 3 | 4;
        setStudentLevel(loadedLevel);
        setHighestUnlockedLevel(loadedLevel);

        // Initialize macro level progression
        const level = progressRow.student_level || 1;
        const macro = progressRow.current_macro_level || 1;
        const contentType = progressRow.current_content_type || 'words';

        setCurrentMacroLevel(macro);
        setCurrentContentType(contentType as ContentType);

        // Initialize or restore macro level progress FIRST
        if (progressRow.macro_level_progress) {
          setMacroLevelProgress(progressRow.macro_level_progress);
        } else {
          setMacroLevelProgress(prev => ({
            ...prev,
            [macro]: {
              words: { completed: false, scores: [], totalScore: 0 },
              sentences: { completed: false, scores: [], totalScore: 0 },
              paragraphs: { completed: false, scores: [], totalScore: 0 }
            }
          }));
        }

        // Restore macroLevelMap and itemBestScores
        if (progressRow.macro_level_map) {
          setMacroLevelMap(progressRow.macro_level_map);
        } else {
          setMacroLevelMap(prev => {
            const restored: Record<number, MacroLevelRecord> = { ...prev };
            for (let l = 1; l <= 4; l++) {
              if (l < macro) restored[l] = { ...restored[l], status: 'completed' };
              else if (l === macro) restored[l] = { ...restored[l], status: 'in_progress' };
              else restored[l] = { ...restored[l], status: 'locked' };
            }
            return restored;
          });
        }
        if (progressRow.item_best_scores) {
          setItemBestScores(progressRow.item_best_scores);
        }

        // Check if macro results should be shown - AFTER setting progress data
        if (progressRow.show_macro_results) {
          setPendingMacroResults(true);
          return;
        }

        // Load content for current state
        const contentToLoad = await loadMacroLevelContent(
          level as 1 | 2 | 3 | 4,
          macro as 1 | 2 | 3 | 4,
          contentType as 'words' | 'sentences' | 'paragraphs'
        );
        setContentItems(contentToLoad || []);
        setWords((contentToLoad || []).map(item => item.text));

        if (progressRow.current_index !== undefined && progressRow.current_content_type === contentType) {
          setCurrentIndex(progressRow.current_index);
        } else {
          setCurrentIndex(0);
        }

        if (Array.isArray(progressRow.scores_array) && progressRow.current_content_type === contentType) {
          setScoresArray(progressRow.scores_array);
        } else {
          setScoresArray([]);
        }
      } else {
        // First time in personal room - start fresh with macro level system
        setIsAssessment(false);
        setUsingStarter(false);
        setStudentLevel(1);
        setHighestUnlockedLevel(1);
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
        const wordContent = await loadMacroLevelContent(1, 1, 'words');
        setContentItems(wordContent || []);
        setWords((wordContent || []).map(item => item.text));
      }
    } catch (error) {
      setContentItems([]);
      setWords(STARTER_WORDS);
      setUsingStarter(true);
    }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        setUserId(user.id);
        try {
          const { data: playerRow } = await supabase
            .from('player_names')
            .select('player_name')
            .eq('id', user.id)
            .single();
          setPlayerName(playerRow?.player_name || "Anonymous");
        } catch (error) {
          console.error('[RegularRoom] Failed to load player name:', error);
          setPlayerName("Anonymous");
        }
      } else {
        setPlayerName("Anonymous");
        setUserId(null);
        setTimeout(() => {
          if (!auth.currentUser) {
            Alert.alert(
              'Session Expired',
              'Your session has expired. Please log in again.',
              [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
          }
        }, 1000);
      }
      setIsAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Don't fetch progress until auth state is determined
    if (isAuthLoading) return;
    
    const fetchProgress = async () => {
      setIsContentLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setContentItems([]);
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
      
      try {
        const { data: progressRow } = await supabase
          .from('student_progress')
          .select('*')
          .eq('id', `${user.id}_${roomData.roomCode}`)
          .single();

        if (progressRow) {
          // Check if student has completed assessment
          if (progressRow.assessment_completed && progressRow.student_level) {
            setIsAssessment(false);
            setUsingStarter(false);
            setStudentLevel(progressRow.student_level);
            setHighestUnlockedLevel(progressRow.student_level as 1 | 2 | 3 | 4);

            // Restore progress state
            if (progressRow.current_word_index !== undefined) {
              setCurrentIndex(progressRow.current_word_index);
            }
            if (Array.isArray(progressRow.scores)) {
              setScoresArray(progressRow.scores);
            }

            // Restore macro level progress state
            if (progressRow.current_macro_level !== undefined) {
              setCurrentMacroLevel(progressRow.current_macro_level);
            }
            if (progressRow.current_content_type) {
              setCurrentContentType(progressRow.current_content_type);
            }
            if (progressRow.macro_level_progress) {
              setMacroLevelProgress(progressRow.macro_level_progress);
            }

            // Restore macroLevelMap and itemBestScores
            if (progressRow.macro_level_map) {
              setMacroLevelMap(progressRow.macro_level_map);
            } else {
              const macro = progressRow.current_macro_level || 1;
              setMacroLevelMap(prev => {
                const restored: Record<number, MacroLevelRecord> = { ...prev };
                for (let l = 1; l <= 4; l++) {
                  if (l < macro) restored[l] = { ...restored[l], status: 'completed' };
                  else if (l === macro) restored[l] = { ...restored[l], status: 'in_progress' };
                  else restored[l] = { ...restored[l], status: 'locked' };
                }
                return restored;
              });
            }
            if (progressRow.item_best_scores) {
              setItemBestScores(progressRow.item_best_scores);
            }
            // Check if macro results should be shown
            if (progressRow.show_macro_results) {
              setPendingMacroResults(true);
              setIsContentLoading(false);
              return;
            }

            // Load appropriate content based on progress
            const contentToLoad = await loadMacroLevelContent(
              progressRow.student_level,
              progressRow.current_macro_level || 1,
              progressRow.current_content_type || 'words'
            );

            if (contentToLoad && contentToLoad.length > 0) {
              setContentItems(contentToLoad);
              setWords(contentToLoad.map(item => item.text));
            } else {
              setContentItems([]);
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
        setContentItems([]);
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
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  // ✅ Handle navigation away during recording
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (_e: unknown) => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
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
    setHighestUnlockedLevel(level);
    setAssessmentPhase('results');
    
    // Save assessment results
    const user = auth.currentUser;
    if (user) {
      try {
        const { error: saveError } = await supabase.from('student_progress').upsert({
          id: `${user.id}_${roomData.roomCode}`,
          user_id: user.id,
          player_name: playerName,
          name: playerName,
          email: user.email || "",
          room_code: roomData.roomCode,
          room_name: roomData.roomName || "Unknown",
          teacher_id: roomData.teacherId || roomData.createdBy || "",
          assessment_completed: true,
          student_level: level,
          reader_level: level,
          macro_level: 1,
          assessment_results: assessmentResults,
          current_word_index: 0,
          total_words: 0,
          scores: [],
          completed: false,
          updated_at: new Date().toISOString(),
        });
        if (saveError) throw saveError;
      } catch (saveError) {
        console.error('[RegularRoom] Failed to save assessment results:', saveError);
        throw saveError;
      }
    }
    
    // Stay in results phase - don't transition immediately
    // User will click continue button to start practice
  };

  // 🔹 Transition to practice content after assessment completes
  const startPracticeContent = async () => {
    setIsContentLoading(true);
    setIsAssessment(false);
    try {
      const practiceItems = await loadMacroLevelContent(studentLevel, 1, 'words');
      if (practiceItems.length > 0) {
        setContentItems(practiceItems);
        setWords(practiceItems.map(item => item.text));
        setUsingStarter(false);
      } else {
        setContentItems([]);
        setWords(STARTER_WORDS);
        setUsingStarter(true);
      }
      setCurrentIndex(0);
    } catch (error) {
      console.error('[RegularRoom] Failed to load practice content:', error);
      setContentItems([]);
      setWords(STARTER_WORDS);
      setUsingStarter(true);
      setCurrentIndex(0);
    } finally {
      setIsContentLoading(false);
    }
  };

  // Azure Speech is initialized globally in App.tsx

  // 🔹 Azure Pronunciation Assessment transcription
  const transcribeAudio = async (uri: string): Promise<{ transcript: string; pronScore: number; words: AzureWordResult[] }> => {
    try {
      let service;
      try {
        service = getAzureSpeechService();
      } catch (err: any) {
        console.error('Azure Speech service unavailable:', err.message);
        throw new Error('Speech assessment service is unavailable. Please check your configuration and try again.');
      }

      const referenceText = currentAssessmentItem?.content || currentWord;

      if (!referenceText) {
        throw new Error('No reference text available for pronunciation assessment');
      }

      const result = await service.assessPronunciation(uri, referenceText);

      if (!result.recognizedText || result.recognizedText.trim().length === 0) {
        return { transcript: '', pronScore: 0, words: [] };
      }

      return { transcript: result.recognizedText, pronScore: result.pronScore, words: result.words };
    } catch (err: any) {
      // Distinguish API/network failures from empty-audio results so callers can
      // show the right message (service error vs. no audio detected).
      const message: string = err?.message ?? String(err);
      const isApiError = message.includes('401') || message.includes('403')
        || message.includes('network') || message.includes('timeout')
        || message.includes('unavailable');
      if (isApiError) {
        throw err; // Re-throw so stopRecognition can show a service-specific alert
      }
      return { transcript: '', pronScore: 0, words: [] };
    }
  };

  // 🔹 Start recording
  const startRecognition = async () => {
    if (!userId) return Alert.alert("Error", "Login required to record.");
    if (isRecording) return; // ✅ Prevent double-tap
    // Guard: don't let students record against an empty reference text
    const referenceText = currentAssessmentItem?.content || currentWord;
    if (!referenceText.trim()) {
      return Alert.alert("Content Not Ready", "Please wait for the content to load before recording.");
    }
    
    try {
      // ✅ Always cleanup any existing recording first
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.error('[RegularRoom] Failed to clean up previous recording:', cleanupError);
        }
        recordingRef.current = null;
      }

      // ✅ Request permissions
      const permission = await Audio.requestPermissionsAsync();
      
      if (!permission.granted) {
        return Alert.alert("Error", "Microphone permission is required.");
      }

      // ✅ Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Use WAV PCM on Android so Azure Speech can decode it (M4A/AAC is rejected)
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });
      
      recordingRef.current = recording;
      setIsRecording(true);
      
      
    } catch (err) {
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
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null; // ✅ Clear reference immediately
      
      
      if (uri) {
        // Enhanced audio file validation
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          
          
          if (blob.size === 0) {
            Alert.alert("Recording Issue", "Recording is empty. Please ensure you're speaking into the microphone and try again.");
            return;
          }
          
          if (blob.size < 1000) { // Less than 1KB is likely too short
            Alert.alert("Recording Issue", `Recording seems very short (${Math.round(blob.size / 1024)}KB). Please speak longer and try again.`);
            return;
          }
          
        } catch (fileCheckError) {
          Alert.alert("File Error", "Could not validate recorded audio. Please try recording again.");
          return;
        }
        
        const { transcript, pronScore, words } = await transcribeAudio(uri);
        setRecognizedText(transcript);
        setWordResults(words);

        if (transcript) {
          const finalScore = pronScore > 0 ? Math.round(pronScore) : calculateScore(transcript, currentWord);
          setScore(finalScore);
          setCompleted(true);
          setAttempts(prev => [...prev, finalScore]);

          // Track best score per item (keeps highest ever)
          if (!isAssessment) {
            const itemKey = `${currentMacroLevel}-${currentContentType}-${currentIndex}`;
            setItemBestScores(prev => {
              const existing = prev[itemKey] ?? 0;
              if (finalScore <= existing) return prev;
              const updated = { ...prev, [itemKey]: finalScore };
              setMacroLevelMap(map => {
                const rec = map[currentMacroLevel] ?? { status: 'in_progress', bestScore: 0, microBestScores: {} };
                const allBests = Object.entries(updated)
                  .filter(([k]) => k.startsWith(`${currentMacroLevel}-`))
                  .map(([, v]) => v);
                const avg = allBests.length > 0
                  ? Math.round(allBests.reduce((a, b) => a + b, 0) / allBests.length)
                  : rec.bestScore;
                return { ...map, [currentMacroLevel]: { ...rec, bestScore: Math.max(avg, rec.bestScore) } };
              });
              return updated;
            });
          }

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
            // Pass finalScore directly so saveProgress doesn't read stale state
            saveProgress(finalScore);
          }
        } else {
          // Handle empty transcript - prompt user to try again instead of accepting 0 score
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
  // latestScore: pass the just-computed score to avoid reading stale React state
  const saveProgress = async (latestScore?: number) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      if (isPersonalRoom) {
        const personalDocId = `${user.id}_PERSONAL_PRACTICE`;

        // Build reader level progress map from in-memory snapshots + current state
        const levelSnapshot = {
          currentMacroLevel,
          currentContentType,
          currentIndex,
          scoresArray,
          macroLevelProgress,
          macroLevelMap,
          itemBestScores,
          showMacroResults,
        };
        const readerLevelProgress = {
          ...readerLevelSnapshotsRef.current,
          [studentLevel]: levelSnapshot,
        };

        await supabase.from('student_progress').upsert({
          id: personalDocId,
          user_id: user.id,
          player_name: playerName,
          name: playerName,
          email: user.email || "",
          room_code: "PERSONAL_PRACTICE",
          room_name: "Personal Practice Room",
          current_word_index: currentIndex,
          current_index: currentIndex,
          total_words: words.length,
          scores: scoresArray,
          scores_array: scoresArray,
          student_level: studentLevel,
          reader_level: studentLevel,
          last_word: currentWord || "",
          completed: currentIndex >= words.length - 1,
          current_macro_level: currentMacroLevel,
          macro_level: currentMacroLevel,
          current_content_type: currentContentType,
          macro_level_progress: macroLevelProgress,
          macro_level_map: macroLevelMap,
          item_best_scores: itemBestScores,
          reader_level_progress: readerLevelProgress,
          show_macro_results: showMacroResults,
          is_personal_practice: true,
          updated_at: new Date().toISOString(),
        });

        // Save individual score record for progress tracking
        await supabase.from('student_result_join').insert({
          id: `personal_${user.id}_${Date.now()}`,
          user_id: user.id,
          player_name: playerName,
          score: latestScore !== undefined ? latestScore : (score || 0),
          room_code: 'PERSONAL_PRACTICE',
        });
      } else {
        // Regular room progress saving
        await supabase.from('student_progress').upsert({
          id: `${user.id}_${roomData.roomCode}`,
          user_id: user.id,
          player_name: playerName,
          name: playerName,
          email: user.email || "",
          room_code: roomData.roomCode,
          room_name: roomData.roomName || "Unknown",
          teacher_id: roomData.teacherId || roomData.createdBy || "",
          current_word_index: currentIndex,
          total_words: words.length,
          scores: scoresArray,
          last_word: currentWord || "",
          completed: currentIndex >= words.length - 1,
          current_macro_level: currentMacroLevel,
          current_content_type: currentContentType,
          macro_level_progress: macroLevelProgress,
          macro_level_map: macroLevelMap,
          item_best_scores: itemBestScores,
          show_macro_results: showMacroResults,
          updated_at: new Date().toISOString(),
        });
      }

    } catch (err) {
      Alert.alert(
        "Save Error",
        "Failed to save your progress. Please check your internet connection and try again."
      );
    }
  };

  // 🔹 Proceed to next word — requires score >= 70 (allWordsGreen must be true for button to render)
  const handleProceed = async () => {
    // ✅ Reset recording states
    setIsProcessing(false);
    setIsRecording(false);

    // Hard guard: do not advance if pronunciation score is below threshold
    if (!isAssessment && (score === null || score < 70)) return;

    if (isAssessment) {
      // Assessment flow - check if there are more items
      if (currentIndex < ASSESSMENT_ITEMS.length - 1) {
        // More assessment items to complete
        setCurrentIndex(currentIndex + 1);
        setRecognizedText("");
        setWordResults([]);
        setScore(null);
        setCompleted(false);
        setAttempts([]);
      } else {
        // All assessment items completed
        try {
          await completeAssessment();
        } catch (err) {
          Alert.alert("Error", "Failed to save assessment results. Please try again.");
          setAssessmentPhase('testing');
          setIsProcessing(false);
        }
      }
    } else {
      // Normal room flow with macro level progression
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRecognizedText("");
        setWordResults([]);
        // Pass the current score explicitly so saveProgress doesn't read stale state
        const scoreToSave = score ?? 0;
        setScore(null);
        setCompleted(false);
        setAttempts([]);
        saveProgress(scoreToSave);
      } else {
        if (usingStarter) {
          setUsingStarter(false);
          const fallbackWords = roomData.words || (roomData.word ? [roomData.word] : []);
          if (fallbackWords.length > 0) setWords(fallbackWords);
          setContentItems([]);
          setCurrentIndex(0);
          setRecognizedText("");
          setWordResults([]);
          setScore(null);
          setCompleted(false);
          setAttempts([]);
        } else {
          // Complete current content type and handle macro level progression
          await completeContentType();
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

  // Words Azure explicitly flagged — errorType is the authoritative signal.
  // Insertion (extra spoken word) excluded; it doesn't mean a target word was wrong.
  const mispronounced = completed && score !== null
    ? wordResults.filter(w => w.errorType === 'Mispronunciation' || w.errorType === 'Omission')
    : [];

  // 🔹 True when every word is rendered green — gates "Next" vs "Try Again"
  const allWordsGreen = completed && score !== null && (() => {
    if (wordResults.length > 0) {
      // Trust Azure errorType — a word is only "green" when Azure said None
      return wordResults.every(
        w => w.errorType !== 'Mispronunciation' && w.errorType !== 'Omission'
      );
    }
    // Fallback: no word-level results, use overall score
    if (currentContentType === 'words') return score >= 70;
    if (!recognizedText || !currentWord) return false;
    const recognized = recognizedText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
    return currentWord.split(/\s+/).filter(w => w).every((word, i) =>
      recognized[i] === word.toLowerCase().replace(/[^\w]/g, '')
    );
  })();

  // 🔹 Get word color based on recognition result
  const getWordColor = () => {
    if (!completed || score === null) return '#111827';

    if (currentContentType === 'words') {
      // For single words, green if score >= 70%, red otherwise
      return score >= 70 ? '#4CAF50' : '#FF5722';
    }

    // For sentences/paragraphs, return dark (we'll handle per-word coloring differently)
    return '#111827';
  };

  // 🔹 Speak a word/phrase using TTS
  const speakWord = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'en-PH', rate: 0.85, volume: 1.0 });
  }, []);

  // 🔹 Render colored words for sentences/paragraphs
  const renderColoredWords = () => {
    if (!completed || !currentWord) {
      return currentWord || "Content not available";
    }

    // For single words, color is handled by getWordColor on the parent Text
    if (currentContentType === 'words') {
      return currentWord;
    }

    const originalWords = currentWord.split(/\s+/).filter(w => w);

    // Use Azure word-level results when available — most accurate
    if (wordResults.length > 0) {
      // Build a map from lowercase word → isCorrect based on Azure scores
      const azureMap = new Map<string, boolean>();
      wordResults.forEach(w => {
        const key = w.word.toLowerCase();
        // A word is correct if accuracy >= 70 and not a mispronunciation or omission
        const correct = w.accuracyScore >= 70 && w.errorType !== 'Mispronunciation' && w.errorType !== 'Omission';
        azureMap.set(key, correct);
      });

      return originalWords.map((word, index) => {
        const clean = word.toLowerCase().replace(/[^\w]/g, '');
        // Default to correct if Azure didn't return a result for this word
        const isCorrect = azureMap.has(clean) ? azureMap.get(clean)! : true;
        return (
          <Text key={index} style={{ color: isCorrect ? '#4CAF50' : '#FF5722' }}>
            {word}{' '}
          </Text>
        );
      });
    }

    // Fallback: positional text comparison when Azure word results are unavailable
    if (!recognizedText) return currentWord;
    const recognized = recognizedText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);

    return originalWords.map((word, index) => {
      const clean = word.toLowerCase().replace(/[^\w]/g, '');
      const isCorrect = recognized[index] === clean;
      return (
        <Text key={index} style={{ color: isCorrect ? '#4CAF50' : '#FF5722' }}>
          {word}{' '}
        </Text>
      );
    });
  };

  return (
    <ScreenLayout>
        {!isAssessment && (
          <MacroLevelPanel
            visible={panelVisible}
            onClose={() => setPanelVisible(false)}
            studentLevel={highestUnlockedLevel}
            activeLevel={studentLevel}
            onNavigateReaderLevel={navigateToReaderLevel}
          />
        )}

        {/* Show loading screen while authentication is being restored */}
        {isAuthLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass" size={48} color="#374151" />
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
            <Ionicons name="chevron-back" size={24} color="#374151" />
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
                : roomData?.roomName
                  ? `Room ${roomData.roomName}`
                  : "Pronunciation Room"
              }
            </Text>
          </View>
          {!isAssessment && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                  READER LVL {studentLevel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setPanelVisible(true)}
                accessibilityLabel="Open level navigation"
              >
                <Ionicons name="menu" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Assessment Intro */}
        {isAssessment && assessmentPhase === 'intro' && (
          <View style={styles.content}>
            <View style={styles.assessmentIntro}>
              <Ionicons name="school" size={64} color={COLORS.primary} />
              <Text style={styles.assessmentTitle}>Pronunciation Assessment</Text>
              <Text style={styles.assessmentDescription}>
                We'll help you find your pronunciation level by having you read a passage 
                of varying difficulty. This will only take a few minutes and helps us customize your learning experience.
              </Text>
              
              <View style={styles.assessmentFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={20} color={COLORS.primary} />
                  <Text style={styles.featureText}>Takes 3-5 minutes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                  <Text style={styles.featureText}>Determines your level</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
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
                const currentMacroProgress = macroLevelProgress[currentMacroLevel as keyof typeof macroLevelProgress];
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

          {/* Mispronounced Words Section */}
          {mispronounced.length > 0 && (
            <View style={styles.mispronounedSection}>
              <Text style={styles.mispronounedTitle}>Mispronounced words:</Text>
              {mispronounced.map((w, i) => (
                <WordFeedbackCard
                  key={i}
                  word={w.word}
                  phonemes={w.phonemes}
                  accuracyScore={w.accuracyScore}
                />
              ))}
            </View>
          )}

          {/* Recognition Result */}
          {completed && score !== null ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {score === 0 && !recognizedText
                    ? "No audio detected"
                    : score >= 70 && mispronounced.length === 0
                      ? "Great job!"
                      : score >= 70 && mispronounced.length > 0
                        ? "Good job, but review these words"
                        : "Try again"}
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

                {attempts.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.scoreLabel, { marginBottom: 6 }]}>Attempt History</Text>
                    {attempts.map((s, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: '#374151', fontSize: 13, width: 80 }}>
                          Attempt {i + 1}
                        </Text>
                        <View style={[styles.scoreBar, { flex: 1, height: 8 }]}>
                          <View style={[
                            styles.scoreBarFill,
                            {
                              width: `${s}%`,
                              height: 8,
                              backgroundColor: s >= 70 ? '#4CAF50' : s >= 40 ? '#FF9800' : '#FF5722',
                            }
                          ]} />
                        </View>
                        <Text style={{ color: '#374151', fontSize: 13, width: 42, textAlign: 'right' }}>
                          {s}%{i === attempts.length - 1 && allWordsGreen ? ' ✓' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.instructionCard}>
              <Ionicons name="mic-outline" size={48} color="#9CA3AF" />
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
          {/* Hear correct pronunciation — shown when score is low */}
          {completed && score !== null && score < 70 && currentWord && (
            <TouchableOpacity
              style={styles.hearWordButton}
              onPress={() => speakWord(currentWord)}
              activeOpacity={0.75}
            >
              <Ionicons name="volume-high" size={18} color="#FF5722" />
              <Text style={styles.hearWordText}>Hear correct pronunciation</Text>
            </TouchableOpacity>
          )}
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
          ) : allWordsGreen ? (
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
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => {
                setCompleted(false);
                setRecognizedText("");
                setWordResults([]);
                setScore(null);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF5722', '#FF8A50']}
                style={styles.micButtonGradient}
              >
                <View style={styles.micButtonContent}>
                  <Ionicons name="refresh" size={28} color={COLORS.white} />
                  <Text style={styles.micButtonText}>Try Again</Text>
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    fontFamily: getFontFamily('bold'),
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#6B7280",
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
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: "#6B7280",
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
    color: "#6B7280",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  wordCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "center",
  },
  word: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: "700",
    color: "#111827",
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
  hearWordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(255, 87, 34, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 87, 34, 0.5)",
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
  hearWordText: {
    color: '#FF5722',
    fontSize: FONT_SIZES.sm,
    fontFamily: getFontFamily('medium'),
  },
  mispronounedSection: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.3)",
  },
  mispronounedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5252",
    fontFamily: getFontFamily('semibold'),
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    fontFamily: getFontFamily('semibold'),
  },
  resultContent: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: FONT_SIZES.sm,
    color: "#6B7280",
    fontFamily: getFontFamily('regular'),
    marginBottom: SPACING.xs,
  },
  resultText: {
    fontSize: FONT_SIZES.lg,
    color: "#111827",
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
    color: "#6B7280",
    fontFamily: getFontFamily('regular'),
    marginBottom: SPACING.sm,
  },
  scoreBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
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
    color: "#111827",
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: SPACING.lg,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: "#111827",
    fontFamily: getFontFamily('semibold'),
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  instructionText: {
    fontSize: FONT_SIZES.base,
    color: "#6B7280",
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
    color: "#111827",
    fontFamily: getFontFamily('bold'),
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  assessmentDescription: {
    fontSize: FONT_SIZES.base,
    color: "#374151",
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
    color: "#374151",
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
    color: "#111827",
    fontFamily: getFontFamily('bold'),
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  levelText: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: "600",
    color: "#111827",
    fontFamily: getFontFamily('semibold'),
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  levelDescription: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  levelDescText: {
    fontSize: FONT_SIZES.base,
    color: "#374151",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 22,
  },
  scoreBreakdown: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  breakdownTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: "#111827",
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
    borderBottomColor: "#E5E7EB",
  },
  scoreWord: {
    fontSize: FONT_SIZES.base,
    color: "#111827",
    fontFamily: getFontFamily('semibold'),
    flex: 2,
    marginRight: SPACING.sm,
  },
  scoreDifficulty: {
    fontSize: FONT_SIZES.sm,
    color: "#6B7280",
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
    color: "#6B7280",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    fontStyle: "italic",
  },
  levelHighlight: {
    fontWeight: "800",
    color: COLORS.primary,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  levelName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "500",
    color: "#374151",
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
    borderTopColor: "#E5E7EB",
  },
  totalScoreLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: "#111827",
    fontFamily: getFontFamily('semibold'),
  },
  totalScoreValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: "#111827",
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
    color: "#111827",
    fontFamily: getFontFamily('bold'),
    textAlign: "center",
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  macroProgressText: {
    color: "#374151",
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
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  // Colored text styles
  coloredTextContainer: {
    width: "100%",
    backgroundColor: "#F9FAFB",
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
    borderColor: "#D1D5DB",
  },
  contentTypeDotLabel: {
    color: "#374151",
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
    color: "#374151",
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
