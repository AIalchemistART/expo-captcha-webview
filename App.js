import * as Sentry from 'sentry-expo';

// 🟢 App bundle loaded (main entry)
console.log('🟢 [INTERNAL TEST 001][App] Bundle loaded.');

// 🔎 Log Expo runtime version for OTA update debugging
import appJson from './app.json';
console.log('🔎 [INTERNAL TEST 001][App] Runtime version:', appJson.expo?.runtimeVersion || 'unknown');
import React, { useEffect, useState } from 'react';
import AboutOverlay, { shouldShowAboutOverlay } from './src/components/AboutOverlay';
import AppNavigator from './src/navigation/AppNavigator';
import AppFontLoader from './AppFontLoader';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: typeof __DEV__ !== 'undefined' && __DEV__, // Only debug in dev
});

if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
  console.warn('[Sentry] WARNING: SENTRY_DSN is not set in your environment variables. Errors will not be reported to Sentry.');
}

import { AuthProvider } from './src/auth/AuthProvider';
import { ProfileProvider } from './src/auth/useProfile';

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  useEffect(() => {
    // Show About overlay on first launch unless opted out
    (async () => {
      const shouldShow = await shouldShowAboutOverlay();
      setShowAbout(shouldShow);
    })();

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AboutOverlay visible={showAbout} onDismiss={() => setShowAbout(false)} />
      <ProfileProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <AppFontLoader>
              <AppNavigator />
            </AppFontLoader>
          </SafeAreaProvider>
        </AuthProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}

