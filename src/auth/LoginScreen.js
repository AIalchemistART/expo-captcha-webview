// Login screen UI (to be implemented)
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from '../services/supabaseClient';

import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export default function LoginScreen({ onSwitchScreen = () => {} }) {
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
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('SUPABASE LOGIN RESULT:', result);
      const { error, data } = result;
      if (error) {
        setError(error.message);
      } else if (!data?.user) {
        setError('Login failed. Please check your credentials or confirm your email.');
      } else {
        // Force session refresh and update context
        const sessionResult = await supabase.auth.getSession();
        setUser(sessionResult.data.session?.user ?? null);
        // Fetch user profile from Supabase
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profileError) {
            console.warn('Failed to fetch user profile:', profileError.message);
          } else {
            setProfile(profile); // Store profile globally for premium gating
            console.log('Fetched user profile:', profile);
          }
        } catch (e) {
          console.error('Unexpected error fetching profile:', e);
        }
      }
    } catch (e) {
      setError('Unexpected error: ' + (e.message || e.toString()));
      console.error('SUPABASE LOGIN ERROR:', e);
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
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <Button title="Forgot Password?" onPress={() => setShowForgot(true)} />
      <Button title="Don't have an account? Sign Up" onPress={() => onSwitchScreen && onSwitchScreen()} />
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
          <Button title={forgotLoading ? 'Sending...' : 'Send Reset Email'} onPress={handleForgot} disabled={forgotLoading} />
          {forgotMessage ? <Text style={styles.forgotMessage}>{forgotMessage}</Text> : null}
          <Button title="Cancel" onPress={() => { setShowForgot(false); setForgotMessage(''); }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  forgotContainer: { backgroundColor: '#ffe06622', borderRadius: 8, padding: 16, marginTop: 20 },
  forgotTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D0066', marginBottom: 8, textAlign: 'center' },
  forgotMessage: { color: '#155724', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
