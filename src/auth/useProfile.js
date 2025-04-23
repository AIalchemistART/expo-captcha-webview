import React, { createContext, useContext, useState } from 'react';

// Profile context to store user profile (including is_paid)
const ProfileContext = createContext();

import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    console.log('[ProfileProvider] Mounting...');
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('[ProfileProvider] getUser:', data, error);
      if (data && data.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            console.log('[ProfileProvider] profile fetch:', profileData, profileError);
            if (!profileError && profileData) {
              setProfile(profileData);
            }
          });
      }
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
