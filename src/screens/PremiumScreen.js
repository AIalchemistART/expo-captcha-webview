// PremiumScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useAuth } from '../auth/useAuth';
import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import LogoutButton from '../auth/LogoutButton';
import ChangeEmailScreen from '../auth/ChangeEmailScreen';

export default function PremiumScreen({ navigation }) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  // Use profile context to determine premium status
  const { profile, setProfile } = require('../auth/useProfile').useProfile();
  const isPaid = !!profile?.is_paid;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Import IAP service
  const iapService = require('../services/iapService');
  const [products, setProducts] = useState([]);

  // Setup IAP connection, product fetch, and purchase listener
  React.useEffect(() => {
    let isMounted = true;
    async function setupIAP() {
      setLoading(true);
      setError(null);
      try {
        await iapService.initIAP();
        const prods = await iapService.getProducts();
        if (isMounted) setProducts(prods);
        iapService.setPurchaseListener(
          async (purchase) => {
            setLoading(false);
            // Refresh the profile from Supabase so UI updates
            if (setProfile) {
              const supabase = require('../services/supabaseClient').supabase;
              supabase.auth.getUser().then(({ data, error }) => {
                if (data && data.user) {
                  supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single()
                    .then(({ data: profileData, error: profileError }) => {
                      if (!profileError && profileData) {
                        setProfile(profileData);
                      }
                    });
                }
              });
            }
          },
          (err) => {
            setLoading(false);
            setError(err?.message || 'Purchase failed');
          }
        );
      } catch (err) {
        setLoading(false);
        setError(err?.message || 'IAP setup error');
      }
      setLoading(false);
    }
    setupIAP();
    return () => {
      isMounted = false;
      iapService.endIAP();
    };
  }, []);

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    try {
      await iapService.purchasePremium();
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Purchase error');
    }
  }

  // Show login success message briefly when user logs in
  React.useEffect(() => {
    if (user) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.debugBanner}>
        <Text style={styles.debugText}>
          Debug: {user ? `Logged in as ${user.email}` : 'No user'}
        </Text>
      </View>
      <Text style={styles.heading}>🌟 Premium Features</Text>
      {user && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>Welcome{user?.email ? `, ${user.email}` : ''}! You are now logged in.</Text>
        </View>
      )}
      {!user && !showSuccess && (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, showLogin && styles.tabButtonActive]}
              onPress={() => setShowLogin(true)}
            >
              <Text style={[styles.tabButtonText, showLogin && styles.tabButtonTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !showLogin && styles.tabButtonActive]}
              onPress={() => setShowLogin(false)}
            >
              <Text style={[styles.tabButtonText, !showLogin && styles.tabButtonTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          {showLogin ? (
            <LoginScreen onSwitchScreen={() => setShowLogin(false)} />
          ) : (
            <SignupScreen onSwitchScreen={() => setShowLogin(true)} />
          )}
        </>
      )}
      {user && !isPaid && (
        <>
          <Text style={styles.info}>Upgrade to unlock unlimited mystical commentary, bookmarking, and more!</Text>
          {loading ? (
            <Text style={styles.comingSoon}>Processing purchase...</Text>
          ) : products.length > 0 ? (
            products.map((prod) => (
              <Button
                key={prod.productId}
                title={`Upgrade to Premium (${prod.price})`}
                onPress={handlePurchase}
              />
            ))
          ) : (
            <Text style={styles.comingSoon}>Loading premium options...</Text>
          )}
          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
          {showChangeEmail ? (
            <>
              <ChangeEmailScreen onSuccess={() => setShowChangeEmail(false)} />
              <Button title="Cancel" onPress={() => setShowChangeEmail(false)} />
            </>
          ) : (
            <Button title="Change Email" onPress={() => setShowChangeEmail(true)} />
          )}
          <LogoutButton />
        </>
      )}
      {user && isPaid && (
        <>
          <Text style={styles.info}>Thank you for being a Premium member! All features are unlocked.</Text>
          <LogoutButton />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  debugBanner: {
    backgroundColor: '#444',
    paddingVertical: 4,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  debugText: {
    color: '#ffe066',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  successText: {
    color: '#155724',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    alignSelf: 'center',
    backgroundColor: '#3D0066',
    borderRadius: 18,
    overflow: 'hidden',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#ffe066',
  },
  tabButtonText: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
  },
  tabButtonTextActive: {
    color: '#3D0066',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A004B',
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'gold',
    marginBottom: 18,
    fontFamily: 'serif',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  info: {
    color: '#ffe066',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'serif',
  },
  comingSoon: {
    color: '#bfae66',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 18,
    textAlign: 'center',
  },
});
