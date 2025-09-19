import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";


//Auth
import LoginScreen from "./Auth/Login";
import SignupScreen from "./Auth/Signup";
import TeacherSignup from "./src/teacher/TeacherSignup";

// Teacher Screens
import RoomGenerator from "./src/teacher/RoomGenerator";
import Room from "./src/teacher/Room";
import AddPronunciation from "./src/teacher/AddPronounciation";
import ModifyPronunciation from "./src/teacher/Pronounciation";

//Student
import GameMenuScreen from "./src/screens/student/MenuScreen";
import CreatePlayername from "./src/screens/student/CreatePlayerName";
import Join from "./src/screens/student/Join";
import Read from "./src/screens/student/Read";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

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

  if (loading) return null; // ⏳ show splash/loading screen if needed

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
            <Stack.Screen name="RoomGenerator" component={RoomGenerator} />
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="AddPronunciation" component={AddPronunciation} />
            <Stack.Screen name="Modify" component={ModifyPronunciation} />
            <Stack.Screen name="Room" component={Room} />
          </>
        ) : role === "student" ? (
          // 🔹 Student Stack
          <>
            <Stack.Screen name="CreatePlayerName" component={CreatePlayername} />
            <Stack.Screen name="Room" component={Room} />
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="Join" component={Join} />
            <Stack.Screen name="Read" component={Read} />
          </>
        ) : (
          // ❌ Fallback if no role found
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
