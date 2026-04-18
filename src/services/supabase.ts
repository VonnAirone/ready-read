import { createClient, type User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Cached user for synchronous access (populated by onAuthStateChange below)
let _currentUser: User | null = null;

// Prime the cache from the stored session so auth.currentUser is available
// synchronously on the first render after the app restarts.
supabase.auth.getSession().then(({ data }) => {
  _currentUser = data.session?.user ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  _currentUser = session?.user ?? null;
});

// Firebase-compatible auth shim so existing screens can use auth.currentUser
// and auth.signOut() without rewriting every file.
export const auth = {
  get currentUser(): User | null {
    return _currentUser;
  },
  signOut: () => supabase.auth.signOut(),
};
