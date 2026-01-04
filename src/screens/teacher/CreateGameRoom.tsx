import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

export default function CreateGameRoom({ navigation }: any) {
  const [roomName, setRoomName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quizId, setQuizId] = useState(""); // 👈 new

  // 🔑 Fetch teacher's name automatically
  useEffect(() => {
    const fetchTeacherName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const teacherDoc = await getDoc(doc(db, "teacherAccounts", user.uid));
        if (teacherDoc.exists()) {
          const data = teacherDoc.data();
          setCreatorName(data.name || user.email || "Unknown Teacher");
        } else {
          setCreatorName(user.email || "Unknown Teacher");
        }
      } catch (err) {
        console.error("Error fetching teacher name:", err);
        setCreatorName(user.email || "Unknown Teacher");
      }
    };

    fetchTeacherName();
  }, []);

  // Generate unique room code + quizId
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedQuizId = Math.random().toString(36).substring(2, 10); // 👈 random quizId
    setRoomCode(code);
    setQuizId(generatedQuizId);
  };

  // Save to Firestore (only teachers can)
  const saveRoom = async () => {
    if (!roomName || !creatorName || !roomCode || !quizId) {
      Alert.alert("Error", "Please fill in all fields and generate a code.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      // Check if this user is a teacher
      const teacherDoc = await getDoc(doc(db, "teacherAccounts", user.uid));
      if (!teacherDoc.exists()) {
        Alert.alert("Access Denied", "Only teachers can create rooms.");
        return;
      }

      // Save room to Firestore
      const docRef = await addDoc(collection(db, "GenerateRoom"), {
        roomName,
        creatorName,
        roomCode,
        quizId, // 👈 auto-generated
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        creatorEmail: user.email,
      });

      Alert.alert(
        "Success",
        `Room "${roomName}" created successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to Room management after creation
              navigation.navigate("Room", {
                roomId: docRef.id,
                roomName,
                creatorName,
                roomCode,
                quizId,
              });
            },
          },
        ]
      );

      setRoomName("");
      setRoomCode("");
      setQuizId("");
    } catch (err: any) {
      console.error("Error saving room:", err);
      Alert.alert("Error", "Could not save room. Try again.");
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Room</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room Creation Card */}
          <View style={styles.formCard}>
            <View>
              {/* Form Header */}
              <View style={styles.formHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="home" size={32} color="white" />
                </View>
                <Text style={styles.formTitle}>New Pronunciation Room</Text>
                <Text style={styles.formSubtitle}>Create a space for students to practice</Text>
              </View>

              {/* Room Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Room Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="text-outline" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter room name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={roomName}
                    onChangeText={setRoomName}
                  />
                </View>
              </View>

              {/* Teacher Name (Auto-filled) */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Created By</Text>
                <View style={[styles.inputWrapper, styles.disabledInput]}>
                  <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={[styles.input, styles.disabledInputText]}
                    value={creatorName}
                    editable={false}
                  />
                </View>
              </View>

              {/* Room Code Section */}
              <View style={styles.codeSection}>
                <Text style={styles.inputLabel}>Room Code</Text>
                <View style={styles.codeContainer}>
                  <View style={styles.codeDisplay}>
                    <Ionicons name="key-outline" size={20} color="white" />
                    <Text style={styles.codeText}>{roomCode || "------"}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={generateCode}
                  >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={saveRoom}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.saveButtonText}>Create Room</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewRoomsButton}
                  onPress={() => navigation.navigate("Room")}
                >
                  <Ionicons name="list-outline" size={20} color="white" />
                  <Text style={styles.viewRoomsButtonText}>View All Rooms</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  formGradient: {
    padding: 24,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    paddingVertical: 16,
    paddingLeft: 12,
  },
  disabledInputText: {
    color: 'rgba(255,255,255,0.8)',
  },
  codeSection: {
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  codeText: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginLeft: 12,
    letterSpacing: 2,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'white',
  },
  buttonContainer: {
    gap: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
  viewRoomsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 8,
  },
  viewRoomsButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'white',
  },
});
