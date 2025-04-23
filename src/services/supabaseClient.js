import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// --- Robust logging for Supabase config ---
console.log('[Supabase Config] URL:', supabaseUrl);
console.log('[Supabase Config] Anon Key present:', !!supabaseAnonKey);


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be set in environment variables.');
}

// Custom SecureStore adapter for Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
