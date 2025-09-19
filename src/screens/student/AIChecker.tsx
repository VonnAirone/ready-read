import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AIchecker({ route }) {
  const { targetWord } = route.params;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState<number | null>(null);

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
      audioQuality: 127, // HIGH
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };

  // Start recording
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecognizedText("");
      setScore(null);
      setLoading(false);

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      setLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording saved at:", uri);

      // Simulate AI transcription
      const fakeTranscription = await simulateTranscription(uri);
      setRecognizedText(fakeTranscription);

      // Calculate score
      const resultScore = calculateScore(fakeTranscription, targetWord);
      setScore(resultScore);
      setLoading(false);

      // Save to Firestore
      saveResult(fakeTranscription, resultScore);
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setLoading(false);
    }
  };

  const simulateTranscription = async (uri: string): Promise<string> => {
    return targetWord
      .split("")
      .map((c) => (Math.random() > 0.1 ? c : ""))
      .join("");
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
          targetWord,
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
      <Text style={styles.title}>AI Pronunciation Checker</Text>
      <Text style={styles.word}>Target Word: {targetWord}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : score === null ? (
        <TouchableOpacity
          style={[styles.micButton, isRecording && { backgroundColor: "red" }]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.micText}>{isRecording ? "Recording..." : "Start Speaking"}</Text>
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
  container: { flex: 1, backgroundColor: "#1E1E2E", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 20 },
  word: { fontSize: 20, fontWeight: "600", color: "#aaa", marginBottom: 40 },
  micButton: { backgroundColor: "#007AFF", paddingVertical: 16, paddingHorizontal: 36, borderRadius: 30, marginBottom: 20 },
  micText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  resultContainer: { width: "80%", alignItems: "center" },
  progressBar: { height: 20, width: "100%", backgroundColor: "#2A2A3C", borderRadius: 10, marginVertical: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#00FF7F" },
  result: { color: "#fff", fontSize: 18, marginBottom: 10 },
  scoreText: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 },
  proceedButton: { backgroundColor: "#007AFF", paddingVertical: 14, paddingHorizontal: 50, borderRadius: 30 },
  proceedText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
