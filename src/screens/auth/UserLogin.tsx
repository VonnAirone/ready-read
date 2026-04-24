import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { getFontFamily } from "../../../styles/fonts";
import { COLORS, GRADIENTS } from "../../constants/theme";

const getAuthErrorMessage = (message: string): string => {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('user not found')) {
    return 'No account found with this email or password.';
  }
  if (msg.includes('invalid email')) return 'Please enter a valid email address.';
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your connection and try again.';
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Too many attempts. Please wait a moment before trying again.';
  return 'Something went wrong. Please try again.';
};

type Role = 'student' | 'teacher';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('student');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId && role === 'teacher') {
        const { data: teacherRow } = await supabase
          .from('teacher_accounts')
          .select('id')
          .eq('id', userId)
          .single();
        if (!teacherRow) {
          await supabase.auth.signOut();
          Alert.alert("Wrong Role", "This account is registered as a student. Please switch to the Student tab and log in.");
          return;
        }
      } else if (userId && role === 'student') {
        const { data: teacherRow } = await supabase
          .from('teacher_accounts')
          .select('id')
          .eq('id', userId)
          .single();
        if (teacherRow) {
          await supabase.auth.signOut();
          Alert.alert("Wrong Role", "This account is registered as a teacher. Please switch to the Teacher tab and log in.");
          return;
        }
      }
    } catch (err: any) {
      console.error('[Login] error:', err);
      Alert.alert("Login Error", getAuthErrorMessage(err.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={styles.branding}>
            {/* <View style={styles.logoCircle}>
              <Ionicons name="mic" size={36} color={COLORS.primary} />
            </View> */}
            <Text style={styles.appName}>ReadyRead!</Text>
            <Text style={styles.appTagline}>Practice. Improve. Excel.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Role Toggle */}
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'student' && styles.roleTabActive]}
                onPress={() => setRole('student')}
                disabled={loading}
              >
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={role === 'student' ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.roleTabText, role === 'student' && styles.roleTabTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleTab, role === 'teacher' && styles.roleTabActive]}
                onPress={() => setRole('teacher')}
                disabled={loading}
              >
                <Ionicons
                  name="school-outline"
                  size={16}
                  color={role === 'teacher' ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.roleTabText, role === 'teacher' && styles.roleTabTextActive]}>
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>
                {role === 'student' ? 'Sign in to your student account' : 'Sign in to your teacher account'}
              </Text>
            </View>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray[400]}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray[400]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New here?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => navigation.navigate(role === 'teacher' ? 'TeacherSignup' : 'Signup')}
              disabled={loading}
            >
              <Text style={styles.signupText}>
                {role === 'student' ? 'Create a student account' : 'Create a teacher account'}
              </Text>
            </TouchableOpacity>

            {/* Cross-role hint */}
            <TouchableOpacity
              style={styles.switchRoleBtn}
              onPress={() => {
                const other = role === 'student' ? 'teacher' : 'student';
                setRole(other);
              }}
              disabled={loading}
            >
              <Text style={styles.switchRoleText}>
                {role === 'student' ? 'Are you a teacher?' : 'Are you a student?'}
                {'  '}
                <Text style={styles.switchRoleHighlight}>Switch</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  appName: {
    fontSize: 28,
    fontFamily: getFontFamily('bold'),
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
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
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTabText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: COLORS.primary,
  },
  roleTabTextActive: {
    color: COLORS.white,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[500],
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
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
    shadowColor: COLORS.primary,
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
  signupBtn: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  signupText: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: COLORS.primary,
  },
  switchRoleBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchRoleText: {
    fontSize: 13,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[500],
  },
  switchRoleHighlight: {
    color: COLORS.primary,
    fontFamily: getFontFamily('semibold'),
  },
});
