// Re-exports AsyncStorage for convenience. Firebase persistence is configured
// directly in firebase.ts using getReactNativePersistence — no global mutation needed.
import AsyncStorage from '@react-native-async-storage/async-storage';

export default AsyncStorage;