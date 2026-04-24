import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { getFontFamily } from "../../../styles/fonts";
import { COLORS, GRADIENTS } from "../../constants/theme";

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
    let authUserCreated = false;
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data.user;
      if (user) {
        authUserCreated = true;
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
      if (authUserCreated) {
        await supabase.auth.signOut().catch(() => {});
      }
      console.error('[TeacherSignup] error:', err);
      const msg = err.message ?? '';
      if ((msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already in use')) && authUserCreated) {
        Alert.alert(
          "Signup Incomplete",
          "Your account was partially created but could not be completed. Please contact support or try a different email."
        );
      } else {
        Alert.alert("Signup Error", getAuthErrorMessage(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#543199', '#8C52FF']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.pageHeader}>
            {/* <View style={styles.roleIconCircle}>
              <Ionicons name="school-outline" size={32} color={COLORS.secondary} />
            </View> */}
            <Text style={styles.pageTitle}>Teacher Sign Up</Text>
            <Text style={styles.pageSubtitle}>Create your teacher account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.gray[400]}
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                style={styles.input}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.gray[400]}
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Minimum 6 characters"
                placeholderTextColor={COLORS.gray[400]}
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Re-enter your password"
                placeholderTextColor={COLORS.gray[400]}
                value={form.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!showConfirm}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? "eye" : "eye-off"} size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.createBtn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Create Teacher Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Student Signup Link */}
            <TouchableOpacity
              style={styles.studentBtn}
              onPress={() => navigation.navigate("Signup")}
              disabled={loading}
            >
              <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              <Text style={styles.studentBtnText}>Register as a Student instead</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{'  '}
                <Text style={styles.loginLinkHighlight}>Login here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.white,
    fontFamily: getFontFamily('medium'),
    fontSize: 14,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: getFontFamily('bold'),
    color: COLORS.white,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: 16,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[900],
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 4,
  },
  createBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: COLORS.white,
    fontFamily: getFontFamily('semibold'),
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  dividerText: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[400],
  },
  studentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  studentBtnText: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: COLORS.primary,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[500],
  },
  loginLinkHighlight: {
    color: COLORS.secondary,
    fontFamily: getFontFamily('semibold'),
  },
});
