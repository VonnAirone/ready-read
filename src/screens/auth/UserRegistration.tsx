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
import { getFontFamily } from "../../../styles/fonts";
import { COLORS } from "../../constants/theme";

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
      <View style={styles.box}>
        <View style={styles.header}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.description}>Sign in to get started</Text>
        </View>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter a valid email address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter a strong password"
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

        <Text style={styles.label}>Confirm Password</Text>
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
            <Text style={styles.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Already have an account?{" "}
            <Text style={styles.signupHighlight}>Login here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: '90%',
  },
  header: {
    marginBottom: 20,
    gap: 10
  },
  title: {
    fontSize: 26,
    fontFamily: getFontFamily('medium'),
    textAlign: "left",
    color: COLORS.primary,
  },
  description: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 20,
    fontFamily: getFontFamily('regular'),
  },
  label: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: getFontFamily('regular'),
    marginBottom: 10,
  }, 
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    fontFamily: getFontFamily('regular'),
    minHeight: 48, // Ensure consistent height
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    minHeight: 48, // Match input height
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  btnText: {
    color: "#fff",
    fontFamily: getFontFamily('semibold'),
    fontSize: 16,
  },
    signupBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: getFontFamily('regular'),
  },
  signupHighlight: {
    color: COLORS.primary,
    fontFamily: getFontFamily('semibold'),
  },
});
