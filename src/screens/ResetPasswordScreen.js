import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Supabase sends the access_token as a query param
  const token = route.params?.access_token || route.params?.token || null;

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing or invalid reset token.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password }, { accessToken: token });
    setLoading(false);
    if (error) {
      setError(error.message || 'Password reset failed.');
    } else {
      setSuccess('Password updated! You can now log in.');
      setTimeout(() => navigation.navigate('Login'), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A004B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    fontSize: 24,
    color: '#ffe066',
    fontFamily: 'serif',
    marginBottom: 22,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#3D0066',
    fontFamily: 'serif',
  },
  button: {
    backgroundColor: '#bfae66',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginTop: 10,
  },
  buttonText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
  },
  error: {
    color: '#ff4d4d',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  success: {
    color: '#4caf50',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center',
  },
});
