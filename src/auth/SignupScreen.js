// Signup screen UI (to be implemented)
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// TODO: Integrate CAPTCHA here before public launch to prevent bot signups and abuse.
// import CaptchaWebView from '../components/CaptchaWebView';
import { supabase } from '../services/supabaseClient';

export default function SignupScreen({ onSwitchScreen = () => {} }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const handleSignup = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else if (data && data.user) {
      // Create profile row in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id }]);
      if (profileError) {
        setError('Signup succeeded, but failed to create profile: ' + profileError.message);
      } else {
        setSuccess(true);
      }
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
        // Supabase JS v2 does not have a direct resend method, so we re-call signUp
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
        <Text style={styles.successMessage}>
          Please check your email for a confirmation link to activate your account.
        </Text>
        <Button title={resendLoading ? 'Resending...' : 'Resend Confirmation Email'} onPress={handleResend} disabled={resendLoading} />
        {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
        <Button title="Back to Login" onPress={() => { setSuccess(false); onSwitchScreen && onSwitchScreen(); }} />
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
      <Button
        title={loading ? 'Signing Up...' : 'Sign Up'}
        onPress={handleSignup}
        disabled={loading}
      />
      {/* TODO: Insert CAPTCHA WebView here when ready to enable anti-bot verification. */}
      <Button title="Already have an account? Login" onPress={() => onSwitchScreen && onSwitchScreen()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#3D0066', marginBottom: 16, textAlign: 'center' },
  successMessage: { color: '#155724', fontSize: 16, marginBottom: 16, textAlign: 'center' },
  resendMessage: { color: '#155724', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
