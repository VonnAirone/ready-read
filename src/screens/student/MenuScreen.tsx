import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
} from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function GameMenuScreen({ navigation }: any) {
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
          console.error("Error fetching player name:", err);
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
            await signOut(auth); // ✅ properly sign out
            navigation.replace("Login"); // go to login
          } catch (err) {
            console.error("Error signing out:", err);
          }
        },
      },
    ]);
  };

  return (
    <ImageBackground style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          navigation.replace("CreatePlayerName"); // ✅ no logout, just go back
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header with logo + player name */}
          {/* Header with logo + player name */}
    <View style={styles.header}>
      <Image
        source={require("../../../assets/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.playerName}>{playerName}</Text>
    </View>


      {/* Center buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: "#34C759" }]} // ✅ Green Play
          onPress={() => navigation.navigate("Progress")}
        >
          <Text style={styles.buttonText}>▶ PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: "#afaeaeff" }]} // ✅ Purple Join
          onPress={() => navigation.navigate("Join")} 
        >
          <Text style={styles.buttonText}>👥 JOIN</Text>
        </TouchableOpacity>

        {/* ❌ Exit button */}
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: "#FF3B30" }]}
          onPress={handleExit}
        >
          <Text style={styles.buttonText}>❌ EXIT</Text>
        </TouchableOpacity>
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",     
    alignItems: "center",
    marginBottom: 60,
    marginTop:50,
    width: "100%",
  },

  playerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,       
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },

  logo: {
    width: 50,               
    height: 50,
  },

  menuButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    marginVertical: 15,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(167, 155, 155, 0.6)", // soft white line
    width: "80%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
});