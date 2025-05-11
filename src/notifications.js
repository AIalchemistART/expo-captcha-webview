// notifications.js
// Handles daily notification logic for "Get Your Daily Divine Inspiration"

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Schedules a daily notification at 10am local time
export async function scheduleDailyInspirationNotification() {
  try {
    // console.log('================= [Notifications] =================');
    // console.log('[Notifications] Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    // console.log('[Notifications] Permission status:', status);
    if (status !== 'granted') {
      if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[Notifications] Permission not granted. Notification will NOT be scheduled.');
      return;
    }
    // Cancel any existing scheduled notifications to avoid duplicates
    // console.log('[Notifications] Cancelling all existing scheduled notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    // console.log('[Notifications] Scheduling notification...');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Get Your Daily Divine Inspiration',
        body: 'Tap to receive today\'s mystical message.',
        data: { openDivineInspiration: true },
      },
      // Schedule notification for 10:00 AM local time every day
      trigger: {
        hour: 10,
        minute: 0,
        repeats: true,
      },
    });
    // console.log('[Notifications] Notification scheduled! Notification ID:', id);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    // console.log('[Notifications] All scheduled notifications after scheduling:', scheduled);
    // console.log('===================================================');
  } catch (e) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[Notifications] Error scheduling notification:', e);
  }
}

// (useEffect already imported above)
export function useNotificationForegroundLogger() {
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(notification => {
      // console.log('[Notifications] Notification received in foreground:', notification);
    });
    return () => sub.remove();
  }, []);
}



// Hook to set up notification permissions and listeners
export function useDailyInspirationNotification(navigation) {
  useEffect(() => {
    // Request notification permissions and schedule notification
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[Notifications] Permission not granted.');
        return;
      }
      await scheduleDailyInspirationNotification();
    })();

    // Handle notification tap
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data.openDivineInspiration) {
        navigation.navigate('DivineInspiration', { autoInspire: true });
        // Automatically triggers getInspired via param in DivineInspirationScreen
      }
    });

    return () => subscription.remove();
  }, [navigation]);
}
