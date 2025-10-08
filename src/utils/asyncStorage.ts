// Firebase AsyncStorage setup
// This file ensures AsyncStorage is properly linked for Firebase Auth
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set AsyncStorage as global for Firebase to detect
if (typeof global !== 'undefined') {
  global.AsyncStorage = AsyncStorage;
}

export default AsyncStorage;