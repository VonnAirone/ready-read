// Type definitions for the app
export interface User {
  uid: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Room {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  createdAt: Date;
  words?: string[];
  word?: string;
}

export interface Student {
  uid: string;
  playerName: string;
  email: string;
  createdAt: Date;
}

export interface Teacher {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface PronunciationResult {
  word: string;
  spokenText: string;
  score: number;
  timestamp: Date;
  studentId: string;
  roomId: string;
}

export interface LeaderboardEntry {
  studentId: string;
  playerName: string;
  totalScore: number;
  averageScore: number;
  completedWords: number;
}

export type AuthScreens = 'Login' | 'Signup' | 'TeacherSignup';
export type TeacherScreens = 'RoomGenerator' | 'Room' | 'AddPronunciation' | 'Modify' | 'GameMenu' | 'Leaderboard';
export type StudentScreens = 'CreatePlayerName' | 'Join' | 'Read' | 'GameMenu' | 'Room' | 'Start';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Signup: undefined;
  TeacherSignup: undefined;
  
  // Teacher
  RoomGenerator: undefined;
  Room: { roomData: Room };
  AddPronunciation: { roomId?: string; roomCode?: string; roomName?: string };
  Modify: { roomId: string };
  GameMenu: undefined;
  Leaderboard: { roomId: string; roomCode: string; roomName: string };
  
  // Student
  CreatePlayerName: undefined;
  Join: undefined;
  Read: { roomData: Room };
  Start: { roomData: Room };
};