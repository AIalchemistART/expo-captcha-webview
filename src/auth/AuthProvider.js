// React context provider for authentication state and logic will go here.
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log('[AuthProvider] useEffect running...');
    // Debug: Check SecureStore for Supabase token
    // Debugging for persistent login (commented out after confirmation):
    // SecureStore.getItemAsync('supabase.auth.token').then(token => {
    //   console.log('[AuthProvider] SecureStore supabase.auth.token:', token);
    // });
    // SecureStore.getItemAsync('sb-wweuiqbrnzjrassbztob-auth-token').then(token => {
    //   console.log('[AuthProvider] SecureStore sb-wweuiqbrnzjrassbztob-auth-token:', token);
    // });
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session ?? null;
      // [PRODUCTION] Do not log session/user info. Commented for production safety.
      // console.log('[AuthProvider] getSession result:', session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // [PRODUCTION] Do not log session/event info. Commented for production safety.
      // console.log('[AuthProvider] onAuthStateChange event:', event, 'session:', session);
      setUser(session?.user ?? null);
      // Debug: Check SecureStore for Supabase token after auth event
      // SecureStore.getItemAsync('supabase.auth.token').then(token => {
//   console.log('[AuthProvider] SecureStore supabase.auth.token (onAuthStateChange):', token);
// });
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Add logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
