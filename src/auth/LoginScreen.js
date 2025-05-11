import * as Sentry from 'sentry-expo';
// Login screen UI (to be implemented)
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';

import { useAuth } from './useAuth';
import { useProfile } from './ProfileProvider';

export default function LoginScreen({ onSwitchScreen = () => {}, navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { setProfile } = useProfile();
  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // console.log('[LoginScreen] Attempting login for:', email);
      const result = await supabase.auth.signInWithPassword({ email, password });
      // console.log('[LoginScreen] Login result:', result);
      const { error, data } = result;
      if (error) {
        setError(error.message);
      } else if (!data?.user) {
        setError('Login failed. Please check your credentials or confirm your email.');
      } else {
        // Force session refresh and update context
        const sessionResult = await supabase.auth.getSession();
        const sessionUser = sessionResult?.data?.session?.user;
        setUser(sessionUser);
        // Fetch profile from Supabase (no insert, only select)
        if (sessionUser) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionUser.id)
              .single();
            if (profileError) {
              setError('Failed to fetch profile: ' + profileError.message);
            } else {
              setProfile(profile); // Store profile globally for premium gating
            }
          } catch (e) {
            if (typeof Sentry !== 'undefined' && Sentry.captureException) {
              Sentry.captureException(e);
            }
            if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[LoginScreen] Unexpected error fetching profile:', e);
          }
        }
      }
    } catch (e) {
      let errMsg = 'Unexpected error';
      if (e && typeof e === 'object') {
        errMsg += ': ' + (e.message || e.toString());
      } else if (typeof e !== 'undefined') {
        errMsg += ': ' + String(e);
      }
      setError(errMsg);
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(e);
      }
      if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[LoginScreen] SUPABASE LOGIN ERROR:', e);
    }
    setLoading(false);
  };

  // Forgot password handler
  const handleForgot = async () => {
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (error) {
        setForgotMessage(error.message);
      } else {
        setForgotMessage('Password reset email sent! Check your inbox.');
      }
    } catch (e) {
      setForgotMessage('Unexpected error: ' + (e.message || e.toString()));
    }
    setForgotLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.mysticalButton, loading && styles.mysticalButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.mysticalButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.mysticalButtonAlt}
        onPress={() => navigation.navigate('ForgotPassword')}
        accessibilityRole="button"
      >
        <Text style={styles.mysticalButtonAltText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.mysticalButtonAlt}
        onPress={() => onSwitchScreen && onSwitchScreen()}
        accessibilityRole="button"
      >
        <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      {showForgot && (
        <View style={styles.forgotContainer}>
          <Text style={styles.forgotTitle}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            autoCapitalize="none"
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={[styles.mysticalButton, forgotLoading && styles.mysticalButtonDisabled]}
            onPress={handleForgot}
            disabled={forgotLoading}
            accessibilityRole="button"
          >
            <Text style={styles.mysticalButtonText}>{forgotLoading ? 'Sending...' : 'Send Reset Email'}</Text>
          </TouchableOpacity>
          {forgotMessage ? <Text style={styles.forgotMessage}>{forgotMessage}</Text> : null}
          <TouchableOpacity
            style={styles.mysticalButtonAlt}
            onPress={() => { setShowForgot(false); setForgotMessage(''); }}
            accessibilityRole="button"
          >
            <Text style={styles.mysticalButtonAltText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontFamily: 'Cardo-Bold',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#ffe066',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fffbe6',
    borderWidth: 2,
    borderColor: '#ffe066',
    borderRadius: 12,
    color: '#3D0066',
    fontFamily: 'serif',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: '#bfae66',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  mysticalButton: {
    backgroundColor: '#ffe066',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginVertical: 10,
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fffbe6',
  },
  mysticalButtonDisabled: {
    opacity: 0.65,
  },
  mysticalButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mysticalButtonAlt: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  mysticalButtonAltText: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 18,
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  forgotContainer: { backgroundColor: '#ffe06622', borderRadius: 8, padding: 16, marginTop: 20 },
  forgotTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D0066', marginBottom: 8, textAlign: 'center' },
  forgotMessage: { color: '#155724', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
