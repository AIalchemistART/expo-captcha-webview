// // console.log('[OTA] ProfileProvider loaded: 2025-05-06T20:59');
// // console.log('[ProfileProvider] File loaded');
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Enhanced logging for all state changes
  const logUser = (u) => {};
  const logProfile = (p) => {};
  const logAuthReady = (ar, u) => {};

  useEffect(() => {
    // [PRODUCTION] Do not log session or auth info. Commented for production safety.
    // console.log('[ProfileProvider] Mounting and restoring Supabase session...');

    // Listen for Supabase auth state changes (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // [PRODUCTION] Do not log session/event info. Commented for production safety.
      // console.log('[ProfileProvider] onAuthStateChange:', event, session);
      if (session && session.user) {
        setUser(session.user);
        logUser(session.user);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (!profileError && profileData) {
            setProfile(profileData);
            logProfile(profileData);
          } else {
            setProfile(null);
            if (profileError) console.error('[ProfileProvider] ERROR fetching profile (onAuthStateChange):', profileError);
          }
        } catch (err) {
          setProfile(null);
          console.error('[ProfileProvider] CATCH profile fetch error (onAuthStateChange):', err);
        }
        setAuthReady(true);
        logAuthReady(true, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setAuthReady(true);
        logAuthReady(true, null);
      }
    });

    // Initial session restore
    supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      // console.log('[ProfileProvider] getSession:', { sessionData, sessionError });
      if (sessionError) {
        console.error('[ProfileProvider] ERROR in getSession:', sessionError);
      }
      if (sessionData && sessionData.session && sessionData.session.user) {
        setUser(sessionData.session.user);
        logUser(sessionData.session.user);
        // console.log('[ProfileProvider] Fetching profile for user:', sessionData.session.user.id);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            // console.log('[ProfileProvider] Profile fetch result:', { profileData, profileError });
            if (profileError) {
              console.error('[ProfileProvider] ERROR fetching profile:', profileError);
            }
            if (!profileError && profileData) {
              setProfile(profileData);
              logProfile(profileData);
            } else if (!profileData) {
              // console.warn('[ProfileProvider] WARNING: No profile data returned for user:', sessionData.session.user.id);
            }
            setAuthReady(true);
            logAuthReady(true, sessionData.session.user);
          })
          .catch((profileFetchErr) => {
            console.error('[ProfileProvider] CATCH profile fetch error:', profileFetchErr);
            setAuthReady(true);
            logAuthReady(true, sessionData.session.user);
          });
      } else {
        if (!sessionData?.session) {
          // console.warn('[ProfileProvider] No session found in getSession result.');
        } else if (!sessionData.session.user) {
          // console.warn('[ProfileProvider] Session found but no user in session.');
        }
        setAuthReady(true);
        logAuthReady(true, null);
      }
    }).catch((err) => {
      console.error('[ProfileProvider] CATCH getSession error:', err);
      setAuthReady(true);
      logAuthReady(true, null);
    });
    return () => {
      // Unsubscribe from auth state changes on unmount
      if (authListener && typeof authListener.subscription?.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, user, authReady }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  // Defensive: treat any truthy profile?.is_paid as premium
  const isPremium = !!ctx?.profile?.is_paid;
  return { ...ctx, isPremium };
}
