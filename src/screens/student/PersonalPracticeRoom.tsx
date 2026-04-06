// Personal Practice Room - Independent pronunciation practice
// Sequential micro-level progression with first-attempt scoring
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";
import { getSequentialContent, getContentTypeForMicroLevel, ContentItem } from "../../data/gameContent";
import { READER_LEVEL_INFO } from "../../data/assessmentData";
import { speechRecognitionService } from "../../services/speechRecognition";
import { calculateScore } from "../../services/scoring";
import { getReadingScaleLabel } from "../../services/scoring";
import { WordMatchResult } from "../../types";

export default function PersonalPracticeRoom({ navigation, route }: any) {
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);

  // Level state
  const [studentLevel, setStudentLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentMacroLevel, setCurrentMacroLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentMicroLevel, setCurrentMicroLevel] = useState(1);

  // Content
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);

  // First-attempt tracking
  const [firstAttemptScores, setFirstAttemptScores] = useState<Record<number, number>>({});
  const [isFirstAttemptForLevel, setIsFirstAttemptForLevel] = useState(true);

  // Word-level feedback
  const [wordResults, setWordResults] = useState<WordMatchResult[]>([]);
  const [allWordsCorrect, setAllWordsCorrect] = useState(false);

  // Diagnostic screen
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // UI
  const [playerName, setPlayerName] = useState("Student");
  const [userId, setUserId] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);

  const currentContentType = getContentTypeForMicroLevel(currentMicroLevel);
  const currentWord = currentContent?.content || "";

  // Initialize personal practice
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        try {
          const snap = await getDoc(doc(db, "Playername", user.uid));
          setPlayerName(snap.exists() ? snap.data().playerName || "Student" : "Student");
        } catch {
          setPlayerName("Student");
        }

        try {
          await loadPersonalProgress(user.uid);
        } catch {
          // loadPersonalProgress failed; loading state must still be cleared
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load content whenever micro-level changes
  useEffect(() => {
    if (!loading) {
      const content = getSequentialContent(studentLevel, currentMacroLevel, currentMicroLevel);
      setCurrentContent(content);
    }
  }, [studentLevel, currentMacroLevel, currentMicroLevel, loading]);

  // Load personal practice progress from Firebase
  const loadPersonalProgress = async (uid: string) => {
    try {
      const personalDocId = `${uid}_PERSONAL_PRACTICE`;
      const progressSnap = await getDoc(doc(db, "StudentProgress", personalDocId));

      if (progressSnap.exists()) {
        const data = progressSnap.data();

        const level = data.studentLevel || data.readerLevel || 1;
        const macro = data.currentMacroLevel || data.macroLevel || 1;

        setStudentLevel(level);
        setCurrentMacroLevel(macro);

        // New format: currentMicroLevel + firstAttemptScores
        if (data.currentMicroLevel !== undefined) {
          setCurrentMicroLevel(data.currentMicroLevel);
          if (data.firstAttemptScores) {
            setFirstAttemptScores(data.firstAttemptScores);
          }
          if (data.macroLevelComplete) {
            setShowDiagnostic(true);
          }
        } else if (data.currentContentType) {
          // Backward compat: migrate from old format
          const contentType = data.currentContentType || 'words';
          const idx = data.currentIndex || 0;
          let microLevel = 1;
          if (contentType === 'words') microLevel = idx + 1;
          else if (contentType === 'sentences') microLevel = idx + 11;
          else microLevel = idx + 21;
          setCurrentMicroLevel(microLevel);

          if (data.showMacroResults) {
            setShowDiagnostic(true);
          }
        }
      }
      // First-time user: defaults are already set (level 1, macro 1, micro 1)
    } catch (error) {
    }
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
          studentLevel,
          readerLevel: studentLevel,
          currentMacroLevel,
          macroLevel: currentMacroLevel,
          currentMicroLevel,
          firstAttemptScores,
          macroLevelComplete: showDiagnostic,
          isPersonalPractice: true,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
    }
  };

  // Handle recording
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone access is needed to record pronunciation.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
      });
      recordingRef.current = recording;
      setRecording(true);
    } catch (error) {
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setRecording(false);
      setProcessing(true);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri || !currentWord) {
        setProcessing(false);
        return;
      }

      // Real speech recognition
      const transcriptionResult = await speechRecognitionService.transcribeAudio(uri, currentWord);
      const transcription = transcriptionResult.text;

      if (!transcription || transcription.trim() === '') {
        setProcessing(false);
        Alert.alert("No Audio Detected", "Please try again and speak clearly into the microphone.");
        return;
      }

      setRecognizedText(transcription);

      // Calculate overall score
      const overallScore = calculateScore(transcription, currentWord);
      setScore(overallScore);

      // Get word-level results
      const results = speechRecognitionService.getWordLevelResults(currentWord, transcription);
      setWordResults(results);
      const allCorrect = results.every(r => r.isCorrect);
      setAllWordsCorrect(allCorrect);

      // Record first attempt only
      if (isFirstAttemptForLevel) {
        const updatedScores = { ...firstAttemptScores, [currentMicroLevel]: overallScore };
        setFirstAttemptScores(updatedScores);
        setIsFirstAttemptForLevel(false);

        // Save first-attempt score immediately
        const user = auth.currentUser;
        if (user) {
          const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
          await setDoc(
            doc(db, "StudentProgress", personalDocId),
            {
              firstAttemptScores: updatedScores,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );
        }
      }

      setProcessing(false);
    } catch (error) {
      setProcessing(false);
    }
  };

  // Advance to next micro-level
  const handleNext = async () => {
    if (!allWordsCorrect) return;

    if (currentMicroLevel >= 30) {
      // Completed all 30 micro-levels — show diagnostic
      setShowDiagnostic(true);
      const user = auth.currentUser;
      if (user) {
        const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            macroLevelComplete: true,
            currentMicroLevel: 30,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
      return;
    }

    // Move to next micro-level
    const nextLevel = currentMicroLevel + 1;
    setCurrentMicroLevel(nextLevel);
    resetRecordingState();
    setIsFirstAttemptForLevel(true);

    // Save progress
    const user = auth.currentUser;
    if (user) {
      const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;
      await setDoc(
        doc(db, "StudentProgress", personalDocId),
        {
          currentMicroLevel: nextLevel,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }
  };

  // Retry current micro-level (does not change recorded score)
  const handleRetry = () => {
    setRecognizedText("");
    setScore(null);
    setWordResults([]);
    setAllWordsCorrect(false);
    // isFirstAttemptForLevel stays false — retries don't overwrite
  };

  const resetRecordingState = () => {
    setRecognizedText("");
    setScore(null);
    setWordResults([]);
    setAllWordsCorrect(false);
  };

  // Speak a word using TTS
  const speakWord = (word?: string) => {
    Speech.speak(word || currentWord, {
      language: "en-PH",
      pitch: 1.0,
      rate: 0.75,
    });
  };

  // Calculate average from first-attempt scores
  const calculateAverageScore = (): number => {
    const scores = Object.values(firstAttemptScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Get average for a range of micro-levels
  const getAverageForRange = (start: number, end: number): number => {
    const scores: number[] = [];
    for (let i = start; i <= end; i++) {
      if (firstAttemptScores[i] !== undefined) scores.push(firstAttemptScores[i]);
    }
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Handle macro level completion
  const handleMacroCompletion = async (advance: boolean) => {
    setShowDiagnostic(false);

    const user = auth.currentUser;
    if (!user) return;
    const personalDocId = `${user.uid}_PERSONAL_PRACTICE`;

    if (advance) {
      // Proceed to next level — no score threshold required
      if (currentMacroLevel === 4 && studentLevel < 4) {
        // Advance to next Reader Level
        const newReaderLevel = Math.min(studentLevel + 1, 4) as 1 | 2 | 3 | 4;
        setStudentLevel(newReaderLevel);
        setCurrentMacroLevel(1);
        setCurrentMicroLevel(1);
        setFirstAttemptScores({});
        resetRecordingState();
        setIsFirstAttemptForLevel(true);

        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            studentLevel: newReaderLevel,
            readerLevel: newReaderLevel,
            currentMacroLevel: 1,
            macroLevel: 1,
            currentMicroLevel: 1,
            firstAttemptScores: {},
            macroLevelComplete: false,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      } else if (currentMacroLevel < 4) {
        // Advance to next macro level
        const newMacroLevel = Math.min(currentMacroLevel + 1, 4) as 1 | 2 | 3 | 4;
        setCurrentMacroLevel(newMacroLevel);
        setCurrentMicroLevel(1);
        setFirstAttemptScores({});
        resetRecordingState();
        setIsFirstAttemptForLevel(true);

        await setDoc(
          doc(db, "StudentProgress", personalDocId),
          {
            currentMacroLevel: newMacroLevel,
            macroLevel: newMacroLevel,
            currentMicroLevel: 1,
            firstAttemptScores: {},
            macroLevelComplete: false,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      } else {
        // Reader Level 4, Macro Level 4 — final completion
        Alert.alert(
          "Congratulations!",
          "You've completed all levels! You've mastered Reader Level 4, Macro Level 4. Excellent work!",
          [{ text: "Back to Progress", onPress: () => navigation.goBack() }]
        );
      }
    } else {
      // Practice again — reset micro-level but keep firstAttemptScores
      setCurrentMicroLevel(1);
      resetRecordingState();
      setIsFirstAttemptForLevel(true);

      await setDoc(
        doc(db, "StudentProgress", personalDocId),
        {
          currentMicroLevel: 1,
          macroLevelComplete: false,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }
  };

  if (loading) {
    return (
      <ScreenLayout>
        <ActivityIndicator size="large" color={COLORS.white} />
      </ScreenLayout>
    );
  }

  // Diagnostic Result Screen
  if (showDiagnostic) {
    const avgScore = calculateAverageScore();
    const readingScale = getReadingScaleLabel(avgScore);
    const wordsAvg = getAverageForRange(1, 10);
    const sentencesAvg = getAverageForRange(11, 20);
    const paragraphsAvg = getAverageForRange(21, 30);

    return (
      <ScreenLayout>
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Macro Level {currentMacroLevel} Complete!
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreBigText}>{avgScore}%</Text>
              <Text style={styles.scoreSubLabel}>Average Score</Text>
            </View>

            <View style={styles.readingScaleBadge}>
              <Text style={styles.readingScaleLabel}>Reading Scale</Text>
              <Text style={styles.readingScaleValue}>{readingScale}</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Words (1-10):</Text>
                <Text style={styles.detailValue}>{wordsAvg}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sentences (11-20):</Text>
                <Text style={styles.detailValue}>{sentencesAvg}%</Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Paragraphs (21-30):</Text>
                <Text style={styles.detailValue}>{paragraphsAvg}%</Text>
              </View>
            </View>

            {!(currentMacroLevel === 4 && studentLevel === 4) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.advanceButton]}
                onPress={() => handleMacroCompletion(true)}
              >
                <Text style={styles.actionButtonText}>
                  {currentMacroLevel === 4 && studentLevel < 4
                    ? `Advance to Reader Level ${studentLevel + 1}`
                    : "Proceed to Next Level"
                  }
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => handleMacroCompletion(false)}
            >
              <Text style={styles.actionButtonText}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.exitButtonText}>Exit to Progress</Text>
            </TouchableOpacity>
          </ScrollView>
      </ScreenLayout>
    );
  }

  // Get content type label for display
  const contentTypeLabel =
    currentContentType === 'sentences' ? 'Read this sentence:'
      : currentContentType === 'paragraphs' ? 'Read this paragraph:'
      : 'Pronounce this word:';

  const microLevelInType =
    currentMicroLevel <= 10 ? currentMicroLevel
      : currentMicroLevel <= 20 ? currentMicroLevel - 10
      : currentMicroLevel - 20;

  const mispronounced = wordResults.filter(w => !w.isCorrect);

  // Main Practice Screen
  return (
    <ScreenLayout>
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
            {currentContentType.charAt(0).toUpperCase() + currentContentType.slice(1)} ({microLevelInType}/10) — Micro Level {currentMicroLevel}/30
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Content Display */}
          <View style={styles.wordContainer}>
            <Text style={styles.wordLabel}>{contentTypeLabel}</Text>
            <View style={[
              styles.wordCard,
              currentContentType === 'paragraphs' && styles.passageCard,
              currentContentType === 'sentences' && styles.sentenceCard
            ]}>
              <ScrollView
                style={currentContentType === 'paragraphs' ? styles.paragraphScrollContainer : undefined}
                contentContainerStyle={currentContentType === 'paragraphs' ? styles.paragraphScrollContent : undefined}
                showsVerticalScrollIndicator={currentContentType === 'paragraphs'}
                nestedScrollEnabled={true}
              >
                {/* Word-level highlighting when results exist */}
                {wordResults.length > 0 ? (
                  <Text style={[
                    styles.word,
                    currentContentType === 'sentences' && styles.sentenceText,
                    currentContentType === 'paragraphs' && styles.paragraphText
                  ]}>
                    {wordResults.map((wr, idx) => (
                      <Text
                        key={idx}
                        style={wr.isCorrect ? undefined : styles.mispronounedWordInline}
                      >
                        {wr.expected}{idx < wordResults.length - 1 ? ' ' : ''}
                      </Text>
                    ))}
                  </Text>
                ) : (
                  <Text style={[
                    styles.word,
                    currentContentType === 'sentences' && styles.sentenceText,
                    currentContentType === 'paragraphs' && styles.paragraphText
                  ]}>
                    {currentWord || "Content not available"}
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity style={styles.soundButton} onPress={() => speakWord()}>
                <Ionicons name="volume-high" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mispronounced Words Section */}
          {mispronounced.length > 0 && score !== null && (
            <View style={styles.mispronounedSection}>
              <Text style={styles.mispronounedTitle}>Mispronounced words:</Text>
              {mispronounced.map((w, i) => (
                <View key={i} style={styles.mispronounedRow}>
                  <Text style={styles.mispronounedWordText}>{w.expected}</Text>
                  <TouchableOpacity
                    onPress={() => speakWord(w.expected)}
                    style={styles.mispronounedAudioBtn}
                  >
                    <Ionicons name="volume-high" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              <Text style={styles.mispronounedHint}>
                Tap the audio icon to hear the correct pronunciation, then try again.
              </Text>
            </View>
          )}

          {/* Result Display */}
          {score !== null ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {allWordsCorrect ? "All words correct!" : "Some words need practice"}
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
                  <Text style={styles.scoreText}>{score}%</Text>
                </View>
                {!isFirstAttemptForLevel && (
                  <Text style={styles.retryNote}>
                    First-attempt score recorded: {firstAttemptScores[currentMicroLevel]}%
                  </Text>
                )}
              </View>
            </View>
          ) : !processing ? (
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
          ) : (
            <View style={styles.instructionCard}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.instructionTitle}>Processing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {score === null ? (
            // Recording button
            <TouchableOpacity
              style={[styles.micButton, recording && styles.micButtonRecording]}
              onPress={recording ? stopRecording : startRecording}
              activeOpacity={0.8}
              disabled={processing}
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
                    {recording ? "Stop Recording" : "Start Speaking"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : allWordsCorrect ? (
            // Next button — all words correct
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
                    {currentMicroLevel >= 30 ? "View Results" : "Next"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            // Try Again button — some words incorrect
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
    flexShrink: 1,
  },
  sentenceText: {
    fontSize: 24,
    lineHeight: 36,
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 28,
  },
  mispronounedWordInline: {
    color: "#FF5252",
    textDecorationLine: "underline",
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  // Mispronounced words section
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
  mispronounedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginBottom: 8,
  },
  mispronounedWordText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF5252",
    fontFamily: getFontFamily('semibold'),
  },
  mispronounedAudioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  mispronounedHint: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    marginTop: 4,
    textAlign: "center",
  },
  // Instruction & result cards
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
  retryNote: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: getFontFamily('regular'),
    marginTop: 8,
  },
  // Bottom controls
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
  micButtonRecording: {},
  micButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    marginLeft: 12,
  },
  // Diagnostic results screen
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
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  scoreBigText: {
    fontSize: 42,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  scoreSubLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    marginTop: 4,
  },
  readingScaleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  readingScaleLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: getFontFamily('regular'),
    marginBottom: 4,
  },
  readingScaleValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
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
