import * as Sentry from 'sentry-expo';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import { supabase } from '../services/supabaseClient';
import PasswordResetSentOverlay from '../components/PasswordResetSentOverlay';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSentOverlay, setShowSentOverlay] = useState(false);

  const handleForgot = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    // Pass the deep link for password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mysticalbiblecompanion.com/reset-redirect.html',
    });
    if (error) {
      setError(error.message);
    } else {
      setShowSentOverlay(true);
      setMessage(''); // Clear old message
    }
    setLoading(false);
  };

  // Wrap unexpected errors in Sentry
  const handleForgotWithSentry = async () => {
    try {
      await handleForgot();
    } catch (e) {
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(e);
      }
      setError('Unexpected error: ' + (e.message || e.toString()));
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <MysticalHomeBackground />
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {/* Password Reset Sent Overlay */}
      <PasswordResetSentOverlay visible={showSentOverlay} onClose={() => setShowSentOverlay(false)} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.mysticalButton, loading && styles.mysticalButtonDisabled]}
        onPress={handleForgot}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.mysticalButtonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.mysticalButtonAlt}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#2A004B' },
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
});
