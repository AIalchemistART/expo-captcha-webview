import * as Sentry from 'sentry-expo';
console.log('[OTA] Mystical Bible Companion OTA applied: 2025-05-06T20:59');

// Global JS error handler for enhanced logcat visibility
global.ErrorUtils && global.ErrorUtils.setGlobalHandler && global.ErrorUtils.setGlobalHandler((error, isFatal) => {
  try {
    console.error('[GLOBAL JS ERROR]', error, { isFatal });
  } catch (e) {}
  // Optionally, call the default handler if it exists
  if (global.ErrorUtils.getGlobalHandler) {
    const defaultHandler = global.ErrorUtils.getGlobalHandler();
    if (defaultHandler && defaultHandler !== global.ErrorUtils.setGlobalHandler) {
      defaultHandler(error, isFatal);
    }
  }
});


// 🟢 App bundle loaded (main entry)
console.log('[ENV] SENTRY_DSN:', process.env.EXPO_PUBLIC_SENTRY_DSN);
console.log('[ENV] SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('[ENV] SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log('🟢 [INTERNAL TEST 001][App] Bundle loaded.');

// 🔎 Log Expo runtime version for OTA update debugging
import appJson from './app.json';
console.log('🔎 [INTERNAL TEST 001][App] Runtime version:', appJson.expo?.runtimeVersion || 'unknown');
import React, { useEffect, useState } from 'react';
import AboutOverlay, { shouldShowAboutOverlay } from './src/components/AboutOverlay';
import AppNavigator from './src/navigation/AppNavigator';
import AppFontLoader from './AppFontLoader';
import * as Notifications from 'expo-notifications';
import { scheduleDailyInspirationNotification, useNotificationForegroundLogger } from './src/notifications';
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
import { ProfileProvider } from './src/auth/ProfileProvider';

export default function App() {
  useNotificationForegroundLogger();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ProfileProvider>
            <AppNavigator />
            {(() => {
              // Schedule notification on startup
              // Log all scheduled notifications at app startup for debugging
              (async () => {
                try {
                  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
                  console.log('[OTA][App.js] Currently scheduled notifications:', scheduled);
                  console.log('[OTA][App.js] Scheduling daily inspiration notification...');
                  await scheduleDailyInspirationNotification();
                  console.log('[OTA][App.js] Notification scheduled!');
                } catch (e) {
                  console.error('[OTA][App.js] Failed to schedule notification:', e);
                }
              })();
              return null;
            })()}
          </ProfileProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

