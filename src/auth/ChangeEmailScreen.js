// ChangeEmailScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export default function ChangeEmailScreen({ onSuccess }) {
  const { user, setUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChangeEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Supabase requires re-authentication for sensitive changes
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: user.email, password });
      if (loginError) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Confirmation email sent to new address. Please confirm to complete the change.');
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      setError('Unexpected error: ' + (e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <View style={styles.changeEmailContainer}>
      <Text style={styles.changeEmailTitle}>Change Email Address</Text>
      <TextInput
        style={styles.changeEmailInput}
        placeholder="New Email"
        autoCapitalize="none"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
        placeholderTextColor="#bfae66"
      />
      <TextInput
        style={styles.changeEmailInput}
        placeholder="Current Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#bfae66"
      />
      {error ? <Text style={styles.changeEmailError}>{error}</Text> : null}
      {message ? <Text style={styles.changeEmailSuccess}>{message}</Text> : null}
      <TouchableOpacity
        style={[styles.changeEmailButton, loading && styles.changeEmailButtonDisabled]}
        onPress={handleChangeEmail}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.changeEmailButtonText}>{loading ? 'Updating...' : 'Update Email'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  changeEmailContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'transparent', // removed purple background
  },
  changeEmailTitle: {
    fontFamily: 'Cardo-Bold',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#ffe066',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: -145,
    marginBottom: 24,
  },
  changeEmailInput: {
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
  changeEmailButton: {
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
  changeEmailButtonDisabled: {
    opacity: 0.65,
  },
  changeEmailButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  changeEmailError: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  changeEmailSuccess: {
    color: '#155724',
    marginBottom: 12,
    textAlign: 'center',
  },
});
