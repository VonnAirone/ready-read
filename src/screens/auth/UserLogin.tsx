// src/Auth/Login.tsx
import React, { useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getFontFamily } from "../../../styles/fonts";
import { COLORS, GRADIENTS } from "../../constants/theme";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please enter both email and password.");
    return;
  }

  // 🔹 Admin shortcut (bypass Firebase)
  if (email === "ADMIN" && password === "ADMIN12345") {
    navigation.navigate("TeacherSignup"); // 👈 match the name in App.tsx
    return;
  }

  setLoading(true);
  try {
    // ✅ Just sign in → App.tsx will check Firestore & route correctly
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    Alert.alert("Login Error", err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.box}>
            <View style={styles.header}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.description}>Welcome back!</Text>
            </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate("Signup")}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text style={styles.signupHighlight}>Sign Up</Text>
          </Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
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
    fontSize: 18,
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
  loginBtn: {
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
