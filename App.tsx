import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import * as SplashScreen from 'expo-splash-screen';
import useCustomFonts from './hooks/useFonts';

import { OnboardingProvider, useOnboarding } from "./src/contexts/OnboardingContext";
import CustomSplashScreen from "./src/screens/onboarding/AppSplashScreen";

import UserLogin from "./src/screens/auth/UserLogin";
import UserRegistration from "./src/screens/auth/UserRegistration";
import TeacherRegistration from "./src/screens/teacher/TeacherRegistration";
import AppIntroduction from "./src/screens/onboarding/AppIntroduction";

import CreateGameRoom from "./src/screens/teacher/CreateGameRoom";
import ManageGameRoom from "./src/screens/teacher/ManageGameRoom";
import AddPronunciationWords from "./src/screens/teacher/AddPronunciationWords";
import PronunciationWordsList from "./src/screens/teacher/PronunciationWordsList";

import StudentDashboard from "./src/screens/student/StudentDashboard";
import SetupPlayerProfile from "./src/screens/student/SetupPlayerProfile";
import JoinGameRoom from "./src/screens/student/JoinGameRoom";
import PronunciationGame from "./src/screens/student/PronunciationGame";
import Leaderboard from "./src/screens/Leaderboard";
import Confirm from "./src/screens/student/Confirm";
import PersonalProgress from "./src/screens/student/PersonalProgress";

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          console.log("🔍 [App.tsx] Authenticated user:", currentUser.uid, currentUser.email);
          
          // Check both collections properly
          const teacherDoc = await getDoc(doc(db, "teacherAccounts", currentUser.uid));
          const studentDoc = await getDoc(doc(db, "studentAccounts", currentUser.uid));

          console.log("📋 [App.tsx] Teacher doc exists:", teacherDoc.exists());
          console.log("📋 [App.tsx] Student doc exists:", studentDoc.exists());

          if (teacherDoc.exists()) {
            setRole("teacher");
            setHasPlayerName(true); // Teachers don't need player name check
          } else if (studentDoc.exists()) {
            setRole("student");
            
            // Check if student has a player name
            console.log("🔍 [App.tsx] Checking player name for user:", currentUser.uid);
            const playerDoc = await getDoc(doc(db, "Playername", currentUser.uid));
            console.log("📋 [App.tsx] Player document exists:", playerDoc.exists());
            if (playerDoc.exists() && playerDoc.data()?.playerName) {
              console.log("✅ [App.tsx] Found player name:", playerDoc.data()?.playerName);
              setHasPlayerName(true);
            } else {
              console.log("❌ [App.tsx] No player name found");
              setHasPlayerName(false);
            }
          } else {
            // User is authenticated but has no role document - assume student and check for player name
            console.log("⚠️ [App.tsx] No role document found, checking for player name directly");
            const playerDoc = await getDoc(doc(db, "Playername", currentUser.uid));
            if (playerDoc.exists() && playerDoc.data()?.playerName) {
              console.log("✅ [App.tsx] Found player name, assuming student role");
              setRole("student");
              setHasPlayerName(true);
            } else {
              console.log("❌ [App.tsx] No player name, assuming new student");
              setRole("student");
              setHasPlayerName(false);
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
          setHasPlayerName(false);
        }
      } else {
        setRole(null);
        setHasPlayerName(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Show splash screen while loading fonts or checking onboarding
  if (!fontsLoaded || isLoading || showSplash) {
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

  // Show loading while checking auth state
  if (loading) {
    return null;
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
            <Stack.Screen name="Room" component={ManageGameRoom} />
            <Stack.Screen name="RoomGenerator" component={CreateGameRoom} />
            <Stack.Screen name="GameMenu" component={StudentDashboard} />
            <Stack.Screen name="AddPronunciation" component={AddPronunciationWords} />
            <Stack.Screen name="Modify" component={PronunciationWordsList} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
          </>
        ) : role === "student" ? (
          // Student Stack
          <>
            {hasPlayerName ? (
              // Student with existing player name - go directly to Dashboard
              <>
                <Stack.Screen name="GameMenu" component={StudentDashboard} />
                <Stack.Screen name="CreatePlayerName" component={SetupPlayerProfile} />
                <Stack.Screen name="Join" component={JoinGameRoom} />
                <Stack.Screen name="PronunciationRoom" component={PronunciationGame} />
                <Stack.Screen name="Confirm" component={Confirm} />
                <Stack.Screen name="PersonalProgress" component={PersonalProgress} />
              </>
            ) : (
              // Student without player name - must create one first
              <>
                <Stack.Screen name="CreatePlayerName" component={SetupPlayerProfile} />
                <Stack.Screen name="GameMenu" component={StudentDashboard} />
                <Stack.Screen name="Join" component={JoinGameRoom} />
                <Stack.Screen name="PronunciationRoom" component={PronunciationGame} />
                <Stack.Screen name="Confirm" component={Confirm} />
                <Stack.Screen name="PersonalProgress" component={PersonalProgress} />
              </>
            )}
            <Stack.Screen name="Room" component={ManageGameRoom} />
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
