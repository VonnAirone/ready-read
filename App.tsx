import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase, auth } from "./src/services/supabase";
import type { User } from "@supabase/supabase-js";
import * as SplashScreen from 'expo-splash-screen';
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
import { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } from "@env";

// Initialize Azure Speech once at app startup so all screens can use it.
if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
  console.error('Azure Speech env vars missing — check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env');
} else {
  const result = initializeAzureSpeech(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
  if (!result) {
    console.warn('Azure Speech initialization failed - speech features will be unavailable');
  }
}

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
          try { await supabase.auth.signOut(); } catch (_) {}
          setRole(null);
          setHasPlayerName(false);
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
              // Student with existing player name - go directly to tab navigator
              <Stack.Screen
                name="StudentTabs"
                component={StudentTabNavigator}
              />
            ) : (
              // Student without player name - must create one first
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
    <OnboardingProvider>
      <AppNavigation />
    </OnboardingProvider>
  );
}
