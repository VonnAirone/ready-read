import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RoleScreen({ navigation }: any) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Assuming user data is saved in "studentAccounts" or "teacherAccounts"
        const userDoc = await getDoc(doc(db, "studentAccounts", user.uid));
        if (userDoc.exists()) {
          setRole("student");
          return;
        }

        const teacherDoc = await getDoc(doc(db, "teacherAccounts", user.uid));
        if (teacherDoc.exists()) {
          setRole("teacher");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []);

  const handleTeacherPress = () => {
    if (role === "teacher") {
      navigation.navigate("RoomGenerator");
    } else {
      Alert.alert("Access Denied", "Only teachers can access the Room Generator.");
    }
  };

  const handleStudentPress = () => {
    navigation.navigate("CreatePlayerName");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity style={styles.roleButton} onPress={handleTeacherPress}>
        <Text style={styles.roleText}>👩‍🏫 Teacher</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleButton} onPress={handleStudentPress}>
        <Text style={styles.roleText}>🎓 Student</Text>
      </TouchableOpacity>

      <View style={styles.backContainer}>
        <Button title="← Back to Login" onPress={() => navigation.navigate("Login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 40,
  },
  roleButton: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  roleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backContainer: {
    position: "absolute",
    bottom: 40,
    width: "80%",
  },
});
