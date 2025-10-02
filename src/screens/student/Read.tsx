import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../services/firebase";
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
import { OPENAI_API_KEY } from "@env";
import { Audio } from "expo-av";

// ✅ Import scoring service
import { calculateScore } from "../services/scoring";

const STARTER_WORDS = ["cat", "sun", "determination"];

export default function Read({ route }: any) {
  const { roomData } = route.params;

  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [scoresArray, setScoresArray] = useState<number[]>([]);
  const [usingStarter, setUsingStarter] = useState(true);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [streakCount, setStreakCount] = useState(0);

  const currentWord: string = words[currentIndex] ?? ""; // ✅ always defined
  const recordingRef = useRef<Audio.Recording | null>(null);

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

  // 🔹 Restore last session or start fresh
  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) {
        setWords(STARTER_WORDS);
        return;
      }
      const docId = `${user.uid}_${roomData.roomCode}`;
      try {
        const snap = await getDoc(doc(db, "StudentProgress", docId));
        if (snap.exists()) {
          const data = snap.data();
          setUsingStarter(false);
          setWords(roomData.words || [roomData.word]);
          if (data.currentWordIndex !== undefined)
            setCurrentIndex(data.currentWordIndex);
          if (Array.isArray(data.scores)) setScoresArray(data.scores);
        } else {
          setUsingStarter(true);
          setWords(STARTER_WORDS);
        }
      } catch {
        setUsingStarter(true);
        setWords(STARTER_WORDS);
      }
    };
    fetchProgress();
  }, [roomData.roomCode]);

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

  // 🔹 Whisper transcription
  const transcribeWithWhisper = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/mp4",
        name: "speech.mp4",
      } as any);
      formData.append("model", "whisper-1");
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        }
      );
      const data = await response.json();
      return data.text?.trim() || "";
    } catch (err) {
      console.error("Whisper error:", err);
      return "";
    }
  };

  // 🔹 Start recording
  const startRecognition = async () => {
    if (!userId) return Alert.alert("Error", "Login required to record.");
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error", err);
    }
  };

  // 🔹 Stop recording & score
  const stopRecognition = async () => {
    if (!userId) return Alert.alert("Error", "Login required to stop recording.");
    setIsRecording(false);
    try {
      if (!recordingRef.current) return;
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        const transcript = await transcribeWithWhisper(uri);
        setRecognizedText(transcript);
        const finalScore = calculateScore(transcript, currentWord);
        setScore(finalScore);
        setCompleted(true);
        setScoresArray((prev) => [...prev, finalScore]);
        adjustDifficulty(finalScore);
        saveProgress();
      }
    } catch (err) {
      console.error("Stop recording error", err);
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
          lastWord: currentWord || "", // ✅ never undefined
          completed: currentIndex >= words.length - 1,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Save progress error:", err);
    }
  };

  // 🔹 Proceed to next word
  const handleProceed = () => {
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
      } else {
        const total = scoresArray.reduce((a, b) => a + b, 0);
        const avg = Math.round(total / scoresArray.length);
        Alert.alert("Session Completed", `Total: ${total}\nAverage: ${avg}`);
      }
      saveProgress();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {usingStarter ? "Starter Practice" : "Pronunciation Room"}
      </Text>
      <View style={styles.wordBox}>
        <Text style={styles.word}>{currentWord}</Text>
      </View>
      {!completed ? (
        <TouchableOpacity
          style={[styles.micButton, isRecording && { backgroundColor: "red" }]}
          onPress={isRecording ? stopRecognition : startRecognition}
        >
          <Ionicons name="mic" size={36} color="#fff" />
          <Text style={styles.micText}>
            {isRecording ? "Recording..." : "Start Speaking"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>You said: {recognizedText}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: score != null ? `${score}%` : 0 },
              ]}
            />
          </View>
          <Text style={styles.scoreText}>Score: {score}%</Text>
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  wordBox: {
    backgroundColor: "#2A2A3C",
    paddingVertical: 50,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  word: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  micButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 40,
    width: "70%",
  },
  micText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  resultContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  progressBar: {
    height: 20,
    width: "90%",
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00FF7F",
  },
  result: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  scoreText: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 25,
    textAlign: "center",
  },
  proceedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 20,
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  proceedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
