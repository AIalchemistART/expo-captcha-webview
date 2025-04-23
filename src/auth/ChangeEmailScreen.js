// ChangeEmailScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Change Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="New Email"
        autoCapitalize="none"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <Button title={loading ? 'Updating...' : 'Update Email'} onPress={handleChangeEmail} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#3D0066' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  success: { color: '#155724', marginBottom: 12, textAlign: 'center' },
});
