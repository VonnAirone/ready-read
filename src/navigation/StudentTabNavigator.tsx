import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { getFontFamily } from "../../styles/fonts";

import StudentDashboard from "../screens/student/StudentDashboard";
import JoinGameRoom from "../screens/student/JoinGameRoom";
import PersonalProgress from "../screens/student/PersonalProgress";
import RegularRoom from "../screens/student/RegularRoom";
import Confirm from "../screens/student/Confirm";
import Leaderboard from "../screens/Leaderboard";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const RoomStack = createNativeStackNavigator();
const PracticeStack = createNativeStackNavigator();

function HomeTabNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="DashboardScreen" component={StudentDashboard} />
      <HomeStack.Screen name="Leaderboard" component={Leaderboard} />
    </HomeStack.Navigator>
  );
}

function RoomTabNavigator() {
  return (
    <RoomStack.Navigator screenOptions={{ headerShown: false }}>
      <RoomStack.Screen name="JoinRoom" component={JoinGameRoom} />
      <RoomStack.Screen name="PronunciationRoom" component={RegularRoom} />
      <RoomStack.Screen name="Confirm" component={Confirm} />
      <RoomStack.Screen name="Leaderboard" component={Leaderboard} />
    </RoomStack.Navigator>
  );
}

function PracticeTabNavigator() {
  return (
    <PracticeStack.Navigator screenOptions={{ headerShown: false }}>
      <PracticeStack.Screen name="PersonalPractice" component={PersonalProgress} />
      <PracticeStack.Screen name="PronunciationRoom" component={RegularRoom} />
      <PracticeStack.Screen name="Confirm" component={Confirm} />
    </PracticeStack.Navigator>
  );
}

export function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          backgroundColor: "#FFFFFF",
          paddingBottom: 8,
          paddingTop: 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: getFontFamily("semibold"),
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any = "home-outline";

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "RoomTab") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "PracticeTab") {
            iconName = focused ? "mic" : "mic-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabNavigator}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="RoomTab"
        component={RoomTabNavigator}
        options={{ tabBarLabel: "Room" }}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeTabNavigator}
        options={{ tabBarLabel: "Practice" }}
      />
    </Tab.Navigator>
  );
}
