import React, { useEffect, useState, Component, type ReactNode } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase, auth } from "./src/services/supabase";
import type { User } from "@supabase/supabase-js";
import useCustomFonts from './hooks/useFonts';

import { OnboardingProvider, useOnboarding } from "./src/contexts/OnboardingContext";
import CustomSplashScreen from "./src/screens/onboarding/AppSplashScreen";

import UserLogin from "./src/screens/auth/UserLogin";
import UserRegistration from "./src/screens/auth/UserRegistration";
import TeacherRegistration from "./src/screens/teacher/TeacherRegistration";
import AppIntroduction from "./src/screens/onboarding/AppIntroduction";

import CreateGameRoom from "./src/screens/teacher/CreateGameRoom";
import ManageRooms from "./src/screens/teacher/ManageRooms";
import RoomStudents from "./src/screens/teacher/RoomStudents";
import TeacherDashboard from "./src/screens/teacher/TeacherDashboard";
import StudentList from "./src/screens/teacher/StudentList";
import PronunciationWordsList from "./src/screens/teacher/PronunciationWordsList";
import AssessmentResults from "./src/screens/teacher/AssessmentResults";

import SetupPlayerProfile from "./src/screens/student/SetupPlayerProfile";
import StudentDashboard from "./src/screens/student/StudentDashboard";
import Leaderboard from "./src/screens/Leaderboard";
import { StudentTabNavigator } from "./src/navigation/StudentTabNavigator";
import { initializeAzureSpeech } from "./src/services/azureSpeech";
import { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, AZURE_PROXY_URL } from "@env";

// On web the Azure key must never ship in the browser bundle — use the backend proxy.
// On native (iOS/Android) we call Azure directly with the key from the build env.
if (Platform.OS === 'web') {
  // AZURE_PROXY_URL is '' on Vercel (same-domain) or 'http://localhost:5000' locally.
  // Pass it as proxyUrl so the key never reaches the browser bundle.
  const result = initializeAzureSpeech('', '', AZURE_PROXY_URL ?? '');
  if (!result) {
    console.warn('Azure Speech proxy initialization failed - speech features will be unavailable');
  }
} else {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    console.error('Azure Speech env vars missing — check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env');
  } else {
    const result = initializeAzureSpeech(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    if (!result) {
      console.warn('Azure Speech initialization failed - speech features will be unavailable');
    }
  }
}

// ── Error boundary — catches JS crashes and shows a readable screen ──────────
interface ErrorBoundaryState { error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>{this.state.error.message}</Text>
          <Text style={errorStyles.hint}>
            If this is a build issue, check that all EAS environment variables are set:
            {'\n'}SUPABASE_URL, SUPABASE_ANON_KEY, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 },
  message: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 16, fontFamily: 'monospace' },
  hint: { fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
// ─────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasPlayerName, setHasPlayerName] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { isFirstTime, isLoading, setFirstTimeComplete } = useOnboarding();
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data: teacherRow } = await supabase
            .from('teacher_accounts')
            .select('id')
            .eq('id', currentUser.id)
            .single();

          if (teacherRow) {
            setRole("teacher");
            setHasPlayerName(true);
          } else {
            setRole("student");
            const { data: playerRow } = await supabase
              .from('player_names')
              .select('player_name')
              .eq('id', currentUser.id)
              .single();
            setHasPlayerName(!!playerRow?.player_name);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
          setHasPlayerName(false);
          Alert.alert("Session Error", "Could not verify your account. Please log in again.");
        }
      } else {
        setRole(null);
        setHasPlayerName(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show splash screen while loading fonts, checking onboarding, or checking auth state
  if (!fontsLoaded || isLoading || showSplash || loading) {
    return (
      <CustomSplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // Show onboarding for first-time users who aren't logged in
  if (isFirstTime && !user) {
    const mockNavigation = {
      navigate: (screen: string) => {
        if (screen === 'Login') {
          setFirstTimeComplete();
        }
      }
    };

    return (
      <AppIntroduction
        navigation={mockNavigation}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={UserLogin} />
            <Stack.Screen name="Signup" component={UserRegistration} />
            <Stack.Screen name="TeacherSignup" component={TeacherRegistration} />
          </>
        ) : role === "teacher" ? (
          // Teacher Stack
          <>
            <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            <Stack.Screen name="StudentList" component={StudentList} />
            <Stack.Screen name="AssessmentResults" component={AssessmentResults} />
            <Stack.Screen name="Room" component={ManageRooms} />
            <Stack.Screen name="RoomStudents" component={RoomStudents} />
            <Stack.Screen name="RoomGenerator" component={CreateGameRoom} />
            <Stack.Screen name="GameMenu" component={StudentDashboard} />
            <Stack.Screen name="Modify" component={PronunciationWordsList} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
          </>
        ) : role === "student" ? (
          // Student Stack with Tab Navigator
          <>
            {hasPlayerName ? (
              <Stack.Screen
                name="StudentTabs"
                component={StudentTabNavigator}
              />
            ) : (
              <>
                <Stack.Screen
                  name="CreatePlayerName"
                  component={SetupPlayerProfile}
                />
                <Stack.Screen
                  name="StudentTabs"
                  component={StudentTabNavigator}
                />
              </>
            )}
          </>
        ) : (
          // Fallback if no role found
          <Stack.Screen name="Login" component={UserLogin} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <AppNavigation />
      </OnboardingProvider>
    </ErrorBoundary>
  );
}
