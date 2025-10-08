import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import * as SplashScreen from 'expo-splash-screen';
import useCustomFonts from './hooks/useFonts';

import LoginScreen from "./src/screens/auth/Login";
import SignupScreen from "./src/screens/auth/Signup";
import TeacherSignup from "./src/screens/teacher/TeacherSignup";

import RoomGenerator from "./src/screens/teacher/RoomGenerator";
import Room from "./src/screens/teacher/Room";
import AddPronunciation from "./src/screens/teacher/AddPronounciation";
import ModifyPronunciation from "./src/screens/teacher/Pronounciation";

import GameMenuScreen from "./src/screens/student/MenuScreen";
import CreatePlayername from "./src/screens/student/CreatePlayerName";
import Join from "./src/screens/student/Join";
import Read from "./src/screens/student/Read";
import Leaderboard from "./src/screens/Leaderboard";
import Confirm from "./src/screens/student/Confirm";
import Progress from "./src/screens/student/Progress";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // ✅ Check both collections properly
        const teacherDoc = await getDoc(doc(db, "teacherAccounts", currentUser.uid));
        const studentDoc = await getDoc(doc(db, "studentAccounts", currentUser.uid));

        if (teacherDoc.exists()) {
          setRole("teacher");
        } else if (studentDoc.exists()) {
          setRole("student");
        } else {
          setRole(null); // no role assigned
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  if (!fontsLoaded || loading) {
    return null; // Keep splash screen visible while loading
  }

  SplashScreen.hideAsync(); // Hide splash screen when ready

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 🔹 Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="TeacherSignup" component={TeacherSignup} />
          </>
        ) : role === "teacher" ? (
          // 🔹 Teacher Stack
          <>
            <Stack.Screen name="Room" component={Room} />
            <Stack.Screen name="RoomGenerator" component={RoomGenerator} />
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="AddPronunciation" component={AddPronunciation} />
            <Stack.Screen name="Modify" component={ModifyPronunciation} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
          </>
        ) : role === "student" ? (
          // 🔹 Student Stack
          <>
            <Stack.Screen name="CreatePlayerName" component={CreatePlayername} />
            <Stack.Screen name="Room" component={Room} />
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="Join" component={Join} />
            <Stack.Screen name="Read" component={Read} />
            <Stack.Screen name="Confirm" component={Confirm} />
            <Stack.Screen name="Progress" component={Progress} />
          </>
        ) : (
          // ❌ Fallback if no role found
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
