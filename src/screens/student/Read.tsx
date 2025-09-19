import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Read({ route }: any) {
  const { roomData } = route.params;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!roomData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>No room data found.</Text>
      </View>
    );
  }

 const startRecording = async () => {
  try {
    const recording = new Audio.Recording();
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recordingOptions: Audio.RecordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: 2, // MPEG_4
        audioEncoder: 3, // AAC
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: ".caf",
        audioQuality: 127, // max quality
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: "audio/webm"
      }
    };

    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();

    setRecording(recording);
    setIsRecording(true);
    setRecognizedText("");
    setScore(null);
    setCompleted(false);
  } catch (err) {
    console.error("Failed to start recording:", err);
    setIsRecording(false);
  }
};

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);

      const fakeTranscription = roomData.word
        .split("")
        .map((c) => (Math.random() > 0.1 ? c : ""))
        .join("");
      setRecognizedText(fakeTranscription);

      const resultScore = calculateScore(fakeTranscription, roomData.word);
      setScore(resultScore);
      setCompleted(true);

      // Save to Firestore
      saveResult(fakeTranscription, resultScore);

      console.log("Recording saved at:", uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const calculateScore = (spoken: string, target: string): number => {
    const spokenLower = spoken.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();
    if (spokenLower === targetLower) return 100;

    let matchCount = 0;
    for (let i = 0; i < Math.min(spokenLower.length, targetLower.length); i++) {
      if (spokenLower[i] === targetLower[i]) matchCount++;
    }
    return Math.round((matchCount / targetLower.length) * 100);
  };

  const saveResult = async (spoken: string, percent: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "StudentResultJoin", user.uid),
        {
          email: user.email,
          name: user.displayName || "Anonymous",
          spokenWord: spoken,
          targetWord: roomData.word,
          score: percent,
          createdAt: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving result:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Determination</Text>

      <View style={styles.wordBox}>
        <Text style={styles.word}>{roomData.word}</Text>
      </View>

      {!completed ? (
        <TouchableOpacity
          style={[styles.micButton, isRecording && { backgroundColor: "red" }]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons name="mic" size={28} color="#fff" />
          <Text style={styles.micText}>
            {isRecording ? "Recording..." : "Start Speaking"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>You said: {recognizedText}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${score}%` }]} />
          </View>
          <Text style={styles.scoreText}>Score: {score}%</Text>
          <TouchableOpacity style={styles.proceedButton}>
            <Text style={styles.proceedText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E2E", alignItems: "center", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1E2E" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 40, marginBottom: 40 },
  wordBox: {
    backgroundColor: "#2A2A3C",
    paddingVertical: 50,
    paddingHorizontal: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  word: { fontSize: 26, fontWeight: "700", color: "#fff" },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  micText: { color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: 10 },
  resultContainer: { width: "80%", alignItems: "center" },
  progressBar: {
    height: 20,
    width: "100%",
    backgroundColor: "#2A2A3C",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#00FF7F" },
  result: { color: "#fff", fontSize: 18, marginBottom: 10 },
  scoreText: { color: "#fff", fontSize: 20, marginBottom: 20 },
  proceedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  proceedText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
