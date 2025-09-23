// src/screens/student/Start.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

interface WordData {
  word: string;
  // Add any additional fields your words have
}

interface StartProps {
  roomCode: string;
}

export default function Start({ roomCode }: StartProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recognizedText, setRecognizedText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      if (!roomCode) {
        Alert.alert("Error", "No room code provided.");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "GenerateRoom"),
          where("roomCode", "==", roomCode)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const docData = querySnap.docs[0].data();
          setWords(docData.words || []); // Adjust based on your DB structure
        } else {
          Alert.alert("Error", "Room not found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [roomCode]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecognizedText("");
      setScore(null);
      setCompleted(false);
    } else {
      Alert.alert("All words are completed!");
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Please grant microphone access.");
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  // Stop recording and process (placeholder for speech recognition)
  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording saved at:", uri);
      setRecording(null);

      // Here you would process the audio to get recognized text
      // For example, send to a Speech-to-Text API
      // For now, we simulate recognition:
      setRecognizedText(words[currentIndex]?.word || "");
      setScore(100); // Simulated perfect score
      setCompleted(true);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const currentWord = words[currentIndex]?.word || "";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Start Reading</Text>
      <View style={styles.wordContainer}>
        <Text style={styles.word}>{currentWord}</Text>
      </View>

      <View style={styles.recognitionContainer}>
        <Text style={styles.recognizedText}>
          {recognizedText || "Speak the word into the mic"}
        </Text>
        <TouchableOpacity
          style={styles.micButton}
          onPress={recording ? stopRecording : startRecording}
        >
          <Ionicons
            name={recording ? "stop-circle" : "mic-circle"}
            size={80}
            color={recording ? "red" : "green"}
          />
        </TouchableOpacity>
      </View>

      {completed && (
        <Text style={styles.score}>Score: {score ?? 0}</Text>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
  },
  wordContainer: {
    marginVertical: 40,
  },
  word: {
    fontSize: 36,
    fontWeight: "bold",
  },
  recognitionContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  recognizedText: {
    fontSize: 18,
    marginBottom: 20,
  },
  micButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 10,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  nextText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
