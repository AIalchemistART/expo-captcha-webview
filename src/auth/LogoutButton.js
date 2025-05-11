import * as Sentry from 'sentry-expo';
// Button to log out the current user
import React from 'react';
import { Button } from 'react-native';
import { supabase } from '../services/supabaseClient';

import { useAuth } from './useAuth';

export default function LogoutButton({ navigation }) {
  const { setUser } = useAuth();
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(error);
      }
      // console.error('Logout error:', error.message);
        // Optionally, show a UI error message here
      }
      setUser(null); // Clear user context
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Login');
      }
    } catch (e) {
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
      Sentry.captureException(e);
    }
    // console.error('Unexpected logout error:', e);
    }
  };
  return <Button title="Logout" onPress={handleLogout} />;
}
