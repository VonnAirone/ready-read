import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";

export default function Signup({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const handleSignup = async () => {
  if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match.");
    return;
  }

  setLoading(true);
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(
      doc(db, "studentAccounts", user.uid),
      {
        uid: user.uid,
        role: "student",
        name,        // or keep as playerName if you prefer
        email,
        createdAt: new Date(),
      },
      { merge: false }
    );

    // ✅ Immediately log them out
    await signOut(auth);

    Alert.alert("Success", "Account created successfully!", [
      {
        text: "OK",
        onPress: () => navigation.replace("Login"),
      },
    ]);
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      Alert.alert(
        "Account Exists",
        "This email is already registered. Please log in instead.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } else {
      Alert.alert("Signup Error", err.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password with eye toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password with eye toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* ✅ Signup button with spinner */}
      <TouchableOpacity
        style={[styles.signupButton, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signupText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonWrapper}>
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate("Login")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonWrapper: {
    marginVertical: 8,
  },
});
