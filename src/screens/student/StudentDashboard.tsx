import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

export default function StudentDashboard({ navigation }: any) {
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const playerRef = doc(db, "Playername", user.uid);
          const snap = await getDoc(playerRef);

          if (snap.exists()) {
            setPlayerName(snap.data().playerName);
          }
        } catch (err) {
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleExit = () => {
    Alert.alert("Exit", "Do you really want to exit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await signOut(auth);
            // onAuthStateChanged in App.tsx handles navigation to auth stack automatically
          } catch (err) {
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout>
        {/* Main Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>What would you like to do?</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.menuButton, styles.playButton]}
              onPress={() => navigation.navigate("PersonalProgress")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="play-circle" size={32} color={COLORS.white} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>PRACTICE</Text>
                  <Text style={styles.buttonSubtitle}>Improve your pronunciation</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.joinButton]}
              onPress={() => navigation.navigate("Join")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="people" size={32} color={COLORS.white} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>JOIN ROOM</Text>
                  <Text style={styles.buttonSubtitle}>Connect with your teacher</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.exitButton]}
              onPress={handleExit}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="log-out" size={32} color={COLORS.white} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>SIGN OUT</Text>
                  <Text style={styles.buttonSubtitle}>Exit the application</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
  
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  playerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    marginBottom: 2,
  },
  playerName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  menuSection: {
    flex: 1,
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 40,
    fontFamily: getFontFamily('semibold'),
  },
  buttonContainer: {
    gap: 20,
  },
  menuButton: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  playButton: {
    backgroundColor: "rgba(52, 199, 89, 0.9)",
  },
  joinButton: {
    backgroundColor: "rgba(0, 122, 255, 0.9)",
  },
  exitButton: {
    backgroundColor: "rgba(255, 59, 48, 0.9)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: getFontFamily('regular'),
  },
});