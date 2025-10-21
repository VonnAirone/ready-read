import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import RoomSelectionModal from "../../components/RoomSelectionModal";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

export default function Join() {
  const navigation = useNavigation<any>();
  const [roomsVisible, setRoomsVisible] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    try {
      setLoading(true); // ⏳ start spinner

      // 1️⃣ Check if room exists in GenerateRoom
      const genQuery = query(
        collection(db, "GenerateRoom"),
        where("roomCode", "==", trimmedCode)
      );
      const genSnap = await getDocs(genQuery);

      if (genSnap.empty) {
        Alert.alert("Aray ko", "Room code not found.");
        return;
      }

      // 2️⃣ Check if room has data in PronunciationRoom
      const dataQuery = query(
        collection(db, "PronunciationRoom"),
        where("roomCode", "==", trimmedCode)
      );
      const dataSnap = await getDocs(dataQuery);

      if (dataSnap.empty) {
        Alert.alert("Info", "Room has no Data.");
        return;
      }

      // ✅ Room exists and has data
      const roomDoc = dataSnap.docs[0];
      const roomData = roomDoc.data();

      navigation.replace("Confirm", {
        roomcode: roomData.roomCode,
        roomID: roomDoc.id,
        roomname: roomData.roomName || "No Name",
        name: roomData.name || "",
        playername: roomData.playername || "",
        email: roomData.email || "",
      });
    } catch (err) {
      console.error("Error entering room:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false); // ✅ stop spinner
    }
  };


  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={15} style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.roomsButton}
            onPress={() => setRoomsVisible(true)}
          >
            <Ionicons name="list" size={20} color={COLORS.white} />
            <Text style={styles.roomsButtonText}>Rooms</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Join a Room</Text>
            <Text style={styles.subtitle}>
              Enter the room code provided by your teacher
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Room Code"
              placeholderTextColor="rgba(140, 82, 255, 0.5)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={8}
            />

            <TouchableOpacity
              style={[styles.enterButton, loading && styles.buttonDisabled]}
              onPress={handleEnter}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                  <Text style={styles.enterButtonText}>ENTER ROOM</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Room List Modal */}
        <RoomSelectionModal visible={roomsVisible} onClose={() => setRoomsVisible(false)} />
        
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
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
  },
  backButtonIcon: {
    color: COLORS.white
  },  
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
  },
  roomsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  roomsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: getFontFamily('regular'),
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 25,
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    fontFamily: getFontFamily('medium'),
    borderWidth: 2,
    borderColor: "rgba(140, 82, 255, 0.1)",
    letterSpacing: 2,
  },
  enterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  enterButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: getFontFamily('medium'),
    marginLeft: 10,
    letterSpacing: 1,
  },
});

