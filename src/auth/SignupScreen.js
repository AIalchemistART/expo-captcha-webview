// Signup screen UI (to be implemented)
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
// TODO: Integrate CAPTCHA here before public launch to prevent bot signups and abuse.
// import CaptchaWebView from '../components/CaptchaWebView';
import { supabase } from '../services/supabaseClient';

export default function SignupScreen({ onSwitchScreen = () => {} }) {
  // All profile creation should be backend only as of 2025-05-03
  // (If you see a profile insert log here, something is wrong)
  // Double-check: No frontend profile insert logic should exist.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const handleSignup = async () => {
    setLoading(true);
    setError('');
    // console.log('[SignupScreen] Starting signup for:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    // console.log('[SignupScreen] Signup result:', { data, error });
    if (error) {
      setError(error.message);
    } else if (data && data.user) {
      // Profile creation is now handled by a backend trigger. No frontend insert should occur.
      // console.log('[SignupScreen] Signup success, user:', data.user.id);
      setSuccess(true);
    }
    setLoading(false);
  };


  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  if (success) {
    const handleResend = async () => {
      setResendLoading(true);
      setResendMessage('');
      try {
        // Supabase JS v2 does not have a direct resend method, so we re-call signUp. No profile insert should occur here.
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setResendMessage(error.message);
        } else {
          setResendMessage('Confirmation email resent! Please check your inbox.');
        }
      } catch (e) {
        setResendMessage('Unexpected error: ' + (e.message || e.toString()));
      }
      setResendLoading(false);
    };
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Account Created!</Text>
        <View style={styles.mysticalSuccessBanner}>
          <Text style={styles.mysticalSuccessText}>
            Please check your email for a confirmation link to activate your account.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.mysticalButtonAlt}
          onPress={handleResend}
          disabled={resendLoading}
          accessibilityRole="button"
        >
          <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>{resendLoading ? 'Resending...' : 'Resend Confirmation Email'}</Text>
        </TouchableOpacity>
        {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
        <TouchableOpacity
          style={[styles.mysticalButton, resendLoading && styles.mysticalButtonDisabled]}
          onPress={() => { setSuccess(false); onSwitchScreen && onSwitchScreen(); }}
          accessibilityRole="button"
        >
          <Text style={styles.mysticalButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
        onPress={handleSignup}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.mysticalButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      {/* TODO: Insert CAPTCHA WebView here when ready to enable anti-bot verification. */}
      <TouchableOpacity
        style={styles.mysticalButtonAlt}
        onPress={() => onSwitchScreen && onSwitchScreen()}
        accessibilityRole="button"
      >
        <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>Already have an account? Login</Text>
      </TouchableOpacity>
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

  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  successTitle: {
    fontFamily: 'Cardo-Bold',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#ffe066',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 16,
  },
  mysticalSuccessBanner: {
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 18,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  mysticalSuccessText: {
    color: '#3D0066',
    fontFamily: 'Cardo-Bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1.05,
    fontWeight: 'bold',
  },
  resendMessage: { color: '#155724', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
