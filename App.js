import * as Sentry from 'sentry-expo';

// 🟢 App bundle loaded (main entry)
console.log('🟢 [INTERNAL TEST 001][App] Bundle loaded.');

// 🔎 Log Expo runtime version for OTA update debugging
import appJson from './app.json';
console.log('🔎 [INTERNAL TEST 001][App] Runtime version:', appJson.expo?.runtimeVersion || 'unknown');
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import AppFontLoader from './AppFontLoader';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Sentry.init({
  dsn: 'https://92af02fd7b281ff6a4fd22822f445bbf@o4509155859496960.ingest.us.sentry.io/4509155862183936', // TODO: Replace with your actual Sentry DSN
  enableInExpoDevelopment: true,
  debug: true, // Set to false in production
});

import { AuthProvider } from './src/auth/AuthProvider';
import { ProfileProvider } from './src/auth/useProfile';

export default function App() {
  useEffect(() => {
    // Test Sentry error (remove after confirming integration)
    //Sentry.Native.captureException(new Error('Test Sentry error!'));

    // TEMP: Test Supabase connection
    import('./src/services/supabaseClient').then(({ supabase }) => {
      supabase
        .from('commentaries') // <-- Replace with your actual table name if different
        .select('*')
        .limit(1)
        .then(({ data, error }) => {
          console.log('🔎 [INTERNAL TEST 001][App] SUPABASE TEST:', { data, error });
        });
    });
  }, []);
  return (
    <ProfileProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <AppFontLoader>
            <AppNavigator />
          </AppFontLoader>
        </SafeAreaProvider>
      </AuthProvider>
    </ProfileProvider>
  );
}

