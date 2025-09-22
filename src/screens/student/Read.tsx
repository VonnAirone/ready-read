import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../firebase";
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { OPENAI_API_KEY } from "@env";

// Levenshtein distance fallback
const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

// Calculate score fallback
const calculateScore = (spoken: string, target: string) => {
  const dist = levenshtein(spoken.toLowerCase().trim(), target.toLowerCase().trim());
  const maxLen = Math.max(spoken.length, target.length);
  const similarity = 1 - dist / maxLen;
  return similarity < 0.5 ? 0 : Math.round(similarity * 100);
};

export default function Read({ route }: any) {
  const { roomData } = route.params;

  const [words, setWords] = useState<string[]>(roomData.words || [roomData.word]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [scoresArray, setScoresArray] = useState<number[]>([]); // store each word's score

  const currentWord = words[currentIndex];

  // Fetch player name and UID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const snap = await getDoc(doc(db, "Playername", user.uid));
          setPlayerName(snap.exists() ? snap.data().playerName || "Anonymous" : "Anonymous");
        } catch (err) {
          console.error(err);
          setPlayerName("Anonymous");
        }
      } else setPlayerName("Anonymous");
    });
    return () => unsubscribe();
  }, []);

  // Real-time words listener
  useEffect(() => {
    const q = query(collection(db, "PronunciationRoom"), where("roomCode", "==", roomData.roomCode));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newWords: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.words && Array.isArray(data.words)) newWords.push(...data.words);
        else if (data.word) newWords.push(data.word);
      });
      if (newWords.length > 0) {
        setWords(newWords);
        if (currentIndex >= newWords.length) setCurrentIndex(newWords.length - 1);
      }
    });
    return () => unsubscribe();
  }, [roomData.roomCode, currentIndex]);

  // Start recognition
  const startRecognition = async () => {
    if (!userId) {
      Alert.alert("Error", "Only the logged-in user can record.");
      return;
    }
    setIsRecording(true);
    if (Platform.OS === "web" || !OPENAI_API_KEY) {
      simulateRecognition();
    }
  };

  const stopRecognition = async () => {
    if (!userId) {
      Alert.alert("Error", "Only the logged-in user can stop recording.");
      return;
    }
    setIsRecording(false);
    simulateRecognition();
  };

  const simulateRecognition = async () => {
    const fakeTranscription = currentWord
      .split("")
      .map(c => (Math.random() > 0.1 ? c : ""))
      .join("");

    setRecognizedText(fakeTranscription);

    let finalScore = calculateScore(fakeTranscription, currentWord);

    if (OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: `Rate the similarity (0-100) between the spoken word "${fakeTranscription}" and the target word "${currentWord}". Only return the number.`,
            max_tokens: 5,
          }),
        });
        const data = await response.json();
        const openAIScore = parseInt(data.choices?.[0]?.text || "", 10);
        if (!isNaN(openAIScore)) finalScore = openAIScore;
      } catch (err) {
        console.error("OpenAI scoring failed:", err);
      }
    }

    setScore(finalScore);
    setCompleted(true);
    setScoresArray(prev => [...prev, finalScore]);
    saveResult(fakeTranscription, finalScore);
  };

  const saveResult = async (spoken: string, percent: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const docId = `${user.uid}_${currentWord}_${roomData.roomCode}`;
      await setDoc(doc(db, "StudentResultJoin", docId), {
        uid: user.uid,
        email: user.email,
        name: playerName,
        spokenWord: spoken,
        targetWord: currentWord,
        score: percent,
        roomCode: roomData.roomCode,
        difficulty: roomData.difficulty,
        createdAt: new Date().toISOString(),
      });
    } catch (err) { console.error(err); }
  };

  const handleProceed = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
    } else {
      const totalScore = scoresArray.reduce((a, b) => a + b, 0);
      const avgScore = Math.round(totalScore / scoresArray.length);
      Alert.alert("Session Completed", `Total Score: ${totalScore}\nAverage Score: ${avgScore}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Determination</Text>
      <View style={styles.wordBox}>
        <Text style={styles.word}>{currentWord}</Text>
      </View>

      {!completed ? (
        <TouchableOpacity
          style={[styles.micButton, isRecording && { backgroundColor: "red" }]}
          onPress={isRecording ? stopRecognition : startRecognition}
        >
          <Ionicons name="mic" size={36} color="#fff" />
          <Text style={styles.micText}>{isRecording ? "Recording..." : "Start Speaking"}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>You said: {recognizedText}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: score != null ? `${score}%` : 0 }]} />
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
    flexGrow: 1,
    backgroundColor: "#1E1E2E",
    alignItems: "stretch",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginVertical: 20,
    textAlign: "center",
  },
  wordBox: {
    backgroundColor: "#2A2A3C",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
    height: "40%",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor:  "#ada8a8ff",
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
    alignSelf: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 30,
    width: "50%", // full width
  },
  micText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  resultContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  progressBar: {
    height: 20,
    width: "100%",
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
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
    width: "50%", // full width button
    alignItems: "center",
  },
  proceedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

