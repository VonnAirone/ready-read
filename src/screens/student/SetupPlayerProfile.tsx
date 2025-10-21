import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // ✅ for edit icon
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

export default function SetupPlayerProfile({ navigation }: any) {
  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);

        try {
          const playerRef = doc(db, "Playername", user.uid);
          const playerSnap = await getDoc(playerRef);

          if (playerSnap.exists()) {
            const existingName = playerSnap.data().playerName;
            if (existingName) {
              setPlayerName(existingName);
              setIsExisting(true);
            }
          }
        } catch (error) {
          console.error("Error checking player name:", error);
        }
      } else {
        setUserId(null);
        setEmail(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleSave = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Please enter a valid player name.");
      return;
    }
    if (!userId || !email) return;

    setSaving(true);
    try {
      const playerRef = doc(db, "Playername", userId);
      await setDoc(
        playerRef,
        {
          playerName,
          uid: userId,
          email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      const studentRef = doc(db, "studentAccounts", userId);
      await setDoc(
        studentRef,
        {
          uid: userId,
          role: "student",
          playerName,
          email,
          createdAt: new Date(),
        },
        { merge: true }
      );

      navigation.replace("GameMenu");
    } catch (error: any) {
      Alert.alert("Error", "Failed to save player name. Please try again.");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleEdit = () => {
    setIsExisting(false); // ✅ allow editing again
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Ionicons name="arrow-back" size={15} style={styles.backButtonIcon}/>
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.modalPanel}>
            <Text style={styles.title}>
              {isExisting ? "Enter Name" : "Create Your Player Name"}
            </Text>

            <TextInput
              style={[
                styles.input,
                isExisting && { color: "#bbb" },
              ]}
              placeholder="Enter player name"
              placeholderTextColor="#ccc"
              value={playerName}
              onChangeText={(text) =>
                setPlayerName(text.replace(/[^a-zA-Z ]/g, ""))
              }
              autoCapitalize="words"
              editable={!isExisting}
            />

            <TouchableOpacity
              style={[styles.continueButton, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#1c1c1c" />
              ) : (
                <Text style={styles.continueText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
  },
  topBar: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "flex-start",
  },
  backButtonIcon: {
    color: COLORS.white
  },  
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
  },
  modalPanel: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
    fontFamily: getFontFamily('medium'),
  },
  input: {
    width: "100%",
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    fontFamily: getFontFamily('regular'),
    minHeight: 48,
  },
  continueButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: { 
    color: "#fff", 
    fontSize: 16, 
    fontFamily: getFontFamily('regular'),
  }
});
