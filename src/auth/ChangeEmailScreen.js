// ChangeEmailScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import EmailChangeInfoOverlay from '../components/EmailChangeInfoOverlay';

console.log('[ChangeEmailScreen] File loaded. React version:', React.version, 'React import:', React, 'React Native import:', View ? 'ok' : 'fail');
console.log('[ChangeEmailScreen] supabase import:', typeof supabase, 'useAuth import:', typeof useAuth);

export default function ChangeEmailScreen({ onSuccess }) {
  console.log('[ChangeEmailScreen] MOUNT - is default export, props:', { onSuccess });
  // Check if React in this scope matches global React
  if (typeof global !== 'undefined' && global.React) {
    console.log('[ChangeEmailScreen] React identity match:', React === global.React);
  }

  console.log('[ChangeEmailScreen] Before useAuth');
  const { user, setUser } = useAuth();
  console.log('[ChangeEmailScreen] After useAuth', { user, setUser });
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const overlayKeyRef = useRef(0);
  console.log('[ChangeEmailScreen] RENDER overlayKeyRef:', overlayKeyRef.current, 'showInfoOverlay:', showInfoOverlay);
  console.log('[ChangeEmailScreen] RENDER loading:', loading, 'button disabled:', loading);

  console.log('[ChangeEmailScreen] After useState hooks');

  const handleChangeEmail = async () => {
    console.log('[ChangeEmailScreen] handleChangeEmail CALLED');
    console.log('[ChangeEmailScreen] handleChangeEmail START', { user, newEmail, passwordPresent: !!password });
    console.log('[ChangeEmailScreen] handleChangeEmail called', { user, newEmail, passwordPresent: !!password });
    setLoading(true);
    setError('');
    setMessage('');
    // Early return if no user
    if (!user) {
      console.log('[ChangeEmailScreen] EARLY RETURN: No user');
      setError('You must be logged in to change your email.');
      setLoading(false);
      return;
    }
    // Early return if no new email
    if (!newEmail) {
      console.log('[ChangeEmailScreen] EARLY RETURN: No new email');
      setError('Please enter a new email address.');
      setLoading(false);
      return;
    }
    // Early return if no password
    if (!password) {
      console.log('[ChangeEmailScreen] EARLY RETURN: No password');
      setError('Please enter your password to confirm.');
      setLoading(false);
      return;
    }
    try {
      // Supabase requires re-authentication for sensitive changes
      console.log('[ChangeEmailScreen] Attempting signInWithPassword', { email: user?.email });
      const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({ email: user.email, password });
      console.log('[ChangeEmailScreen] signInWithPassword result', { loginError, loginData });
      if (loginError) {
        setError('Incorrect password.');
        setLoading(false);
        console.log('[ChangeEmailScreen] Incorrect password error:', loginError);
        console.log('[ChangeEmailScreen] EARLY RETURN after incorrect password');
        return;
      }
      console.log('[ChangeEmailScreen] Attempting updateUser', { newEmail });
      const { error: updateError, data: updateData } = await supabase.auth.updateUser({ email: newEmail });
      console.log('[ChangeEmailScreen] updateUser result', { updateError, updateData });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        console.log('[ChangeEmailScreen] updateUser error:', updateError);
        console.log('[ChangeEmailScreen] EARLY RETURN after updateUser error');
      } else {
        console.log('[ChangeEmailScreen] updateUser SUCCESS branch entered');
        setMessage('Check your inboxes!\n\nFor security, Supabase sends confirmation links to BOTH your old and new email addresses. You must confirm BOTH emails to complete the change.\n\nOpen the links in both emails to finish updating your email address.');
        console.log('[ChangeEmailScreen] About to trigger overlay. overlayKeyRef before:', overlayKeyRef.current, 'showInfoOverlay before:', showInfoOverlay);
        overlayKeyRef.current += 1;
        setShowInfoOverlay(true);
        console.log('[ChangeEmailScreen] setShowInfoOverlay(true) called. overlayKeyRef after:', overlayKeyRef.current, 'showInfoOverlay after:', true);
        setLoading(false);
        // Do not reset state or call onSuccess here; wait until overlay is dismissed
        console.log('[ChangeEmailScreen] Email update initiated successfully, waiting for overlay dismissal.');
      }
    } catch (e) {
      setError('Unexpected error: ' + (e.message || e.toString()));
      setLoading(false);
      console.log('[ChangeEmailScreen] Unexpected error:', e);
      console.log('[ChangeEmailScreen] EARLY RETURN after catch block');
    }
    console.log('[ChangeEmailScreen] handleChangeEmail finished');
  };

  React.useEffect(() => {
    console.log('[ChangeEmailScreen] useEffect (mount/reset)');
    setNewEmail('');
    setPassword('');
    setError('');
    setMessage('');
    setLoading(false);
    setShowInfoOverlay(false);
    overlayKeyRef.current = 0;
    console.log('[ChangeEmailScreen] STATE RESET on mount or open');
    return () => {
      console.log('[ChangeEmailScreen] useEffect (unmount)');
    };
  }, [onSuccess]);

  return (
    <>
      {/* Only render the overlay when visible to avoid blocking touch events */}
      {showInfoOverlay && (
        <EmailChangeInfoOverlay
          key={overlayKeyRef.current}
          visible={showInfoOverlay}
          onDismiss={() => {
            console.log('[ChangeEmailScreen] Overlay dismissed, overlayKeyRef:', overlayKeyRef.current);
            setShowInfoOverlay(false);
            // After overlay is dismissed, trigger onSuccess and reset state
            if (onSuccess) onSuccess();
            setNewEmail('');
            setPassword('');
            setError('');
            setMessage('');
            setLoading(false);
          }}
        />
      )}
      <View style={styles.changeEmailContainer}>
        <Text style={styles.changeEmailTitle}>Change Email Address</Text>
      <TextInput
        style={styles.changeEmailInput}
        placeholder="New Email"
        autoCapitalize="none"
        value={newEmail}
        onChangeText={val => {
          setNewEmail(val);
          console.log('[ChangeEmailScreen] New email input changed:', val);
        }}
        keyboardType="email-address"
        placeholderTextColor="#bfae66"
      />
      <TextInput
        style={styles.changeEmailInput}
        placeholder="Current Password"
        secureTextEntry
        value={password}
        onChangeText={val => {
          setPassword(val);
          console.log('[ChangeEmailScreen] Password input changed:', val ? '[REDACTED]' : '');
        }}
        placeholderTextColor="#bfae66"
      />
      {error ? (() => { console.log('[ChangeEmailScreen] Error displayed:', error); return <Text style={styles.changeEmailError}>{error}</Text>; })() : null}
      {message ? (() => { console.log('[ChangeEmailScreen] Success message displayed:', message); return <Text style={styles.changeEmailSuccess}>{message}</Text>; })() : null}
      <TouchableOpacity
        style={[styles.changeEmailButton, loading && styles.changeEmailButtonDisabled]}
        onPress={() => {
          console.log('[ChangeEmailScreen] BUTTON onPress fired', { newEmail, passwordPresent: !!password });
          console.log('[ChangeEmailScreen] BUTTON onPress fired', { newEmail, passwordPresent: !!password });
          handleChangeEmail();
        }}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.changeEmailButtonText}>{loading ? 'Updating...' : 'Update Email'}</Text>
      </TouchableOpacity>
      </View>
    </>
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
