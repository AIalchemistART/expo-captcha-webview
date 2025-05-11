import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// --- Robust logging for Supabase config ---
// console.log('[Supabase Config] URL:', supabaseUrl);
// [PRODUCTION] Do not log anon key presence. (Debug only)
// console.log('[Supabase Config] Anon Key present:', !!supabaseAnonKey);


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be set in environment variables.');
}

// Use AsyncStorage instead of SecureStore for Supabase session persistence
// Tradeoff: No 2KB limit, but less secure than SecureStore. Only use if your session is too large for SecureStore.
const ExpoAsyncStorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoAsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// --- DEBUG: Print full session and decoded JWT for audit ---
// [PRODUCTION] Do not log session payloads. Commented for production safety.
(async () => {
  try {
    // Find the correct key for your Supabase instance
    const keyPrefix = 'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token';
    const sessionData = await AsyncStorage.getItem(keyPrefix);
    if (sessionData) {
      // [PRODUCTION] Do not log session payloads. Commented for production safety.
      // console.log('[AUDIT] Full Supabase session payload:', sessionData);
      let accessToken;
      try {
        const sessionObj = JSON.parse(sessionData);
        accessToken = sessionObj.access_token;
        if (accessToken) {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decodedPayload = JSON.parse(atob(base64));
          console.log('[AUDIT] Decoded JWT payload:', decodedPayload);
        }
      } catch (e) {
        console.log('[AUDIT] Could not decode access_token:', e);
      }
    } else {
      // [PRODUCTION] Do not log missing session info in production.
      // console.log('[AUDIT] No Supabase session found in AsyncStorage.');
    }
  } catch (e) {
    // [PRODUCTION] Route session storage errors to Sentry, not console.
    if (typeof Sentry !== 'undefined' && Sentry.captureException) {
      Sentry.captureException(e);
    }
    // console.log('[AUDIT] Error reading Supabase session from AsyncStorage:', e);
  }
})();
