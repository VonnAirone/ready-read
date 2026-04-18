import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { getFontFamily } from "../../../styles/fonts";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";

const getAuthErrorMessage = (message: string): string => {
  const msg = message.toLowerCase();
  if (msg.includes('already registered') || msg.includes('already in use')) return 'An account with this email already exists.';
  if (msg.includes('password') && msg.includes('6')) return 'Password must be at least 6 characters.';
  if (msg.includes('invalid email')) return 'Please enter a valid email address.';
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
};

export default function TeacherSignup({ navigation }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignup = async () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase.from('teacher_accounts').insert({
          id: user.id,
          name,
          email,
          role: 'teacher',
        });
        if (insertError) throw insertError;
      }

      Alert.alert("Success", "Teacher account created! Please log in.");
      await supabase.auth.signOut();
      setForm({ name: "", email: "", password: "", confirmPassword: "" });

      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err: any) {
      Alert.alert("Signup Error", getAuthErrorMessage(err.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
        <View style={styles.content}>
          <View style={styles.box}>
            <View style={styles.header}>
              <Text style={styles.title}>Teacher Registration</Text>
              <Text style={styles.description}>Create your teacher account</Text>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email address"
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Enter password (min. 6 chars)"
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!showConfirm}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? "eye" : "eye-off"} size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
    gap: 10,
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
    minHeight: 48,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 50, // Make space for eye icon
    marginBottom: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 14,
    zIndex: 1,
  },
  signupBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    minHeight: 48,
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
  loginBtn: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: getFontFamily('regular'),
  },
  loginHighlight: {
    color: COLORS.primary,
    fontFamily: getFontFamily('semibold'),
  },
});
