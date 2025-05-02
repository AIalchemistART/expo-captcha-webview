// PremiumScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import AboutOverlay from '../components/AboutOverlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import { useAuth } from '../auth/useAuth';
import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import LogoutButton from '../auth/LogoutButton';
import ChangeEmailScreen from '../auth/ChangeEmailScreen';

export default function PremiumScreen({ navigation }) {
  const [showAbout, setShowAbout] = useState(false);
  // ...existing hooks...
  const [restoring, setRestoring] = useState(false);

  // Restore purchase handler
  async function handleRestore() {
    setRestoring(true);
    setError(null);
    try {
      // Try to restore purchases via iapService
      const restored = await iapService.restorePurchases?.();
      // If restorePurchases is not implemented, fallback to re-initialize IAP
      if (!restored) {
        // Optionally, re-fetch profile from Supabase
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
      }
      setRestoring(false);
    } catch (err) {
      setRestoring(false);
      setError(err?.message || 'Restore failed. Please try again.');
    }
  }
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
    // Show upgrade modal automatically for non-premium users
    if (user && !isPaid && !showUpgradeModal && !showSuccess) {
      setShowUpgradeModal(true);
    }
    async function setupIAP() {
      setLoading(true);
      setError(null);
      try {
        console.log('[PremiumScreen] iapService:', iapService);
        console.log('[PremiumScreen] iapService.productIds:', iapService.productIds, 'type:', typeof iapService.productIds, 'length:', iapService.productIds?.length);
        if (!Array.isArray(iapService.productIds) || iapService.productIds.length === 0) {
          const errMsg = `[PremiumScreen] FATAL: iapService.productIds is not a non-empty array: ${JSON.stringify(iapService.productIds)} (type: ${typeof iapService.productIds})`;
          console.error(errMsg);
          throw new Error(errMsg);
        }
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

  // Debug logging for gating and UI state (hidden for production)
//   React.useEffect(() => {
//     console.log('[PremiumScreen] user:', user);
//     console.log('[PremiumScreen] isPaid:', isPaid);
//     console.log('[PremiumScreen] showSuccess:', showSuccess);
//     console.log('[PremiumScreen] products:', products);
//     console.log('[PremiumScreen] error:', error);
//   }, [user, isPaid, showSuccess, products, error]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#2A004B', flex: 1 }]} edges={['top', 'bottom']}>
      <MysticalHomeBackground />
      {/* Debug banner for development */}
      {/* Debug banner removed for production */}

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      {/* Upgrade Modal for non-premium users */}
      {user && !isPaid && !showSuccess && showUpgradeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} accessibilityRole="alert" accessibilityLabel="Upgrade Account Modal">
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowUpgradeModal(false)} accessibilityRole="button" accessibilityLabel="Close Upgrade Modal">
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.upgradePromptText}>
              Unlock unlimited mystical commentary and bookmarks—upgrade to <Text style={{fontWeight: 'bold'}}>Premium</Text>!
            </Text>
            <View style={styles.upgradeInfoBox}>
              <Text style={styles.upgradeInfoTitle}>Premium Benefits:</Text>
              <Text style={styles.upgradeInfoItem}>• Unlimited mystical commentary</Text>
              <Text style={styles.upgradeInfoItem}>• Unlimited bookmarks</Text>
              <Text style={styles.upgradeInfoItem}>• Priority feature access</Text>
              <Text style={styles.upgradeInfoItem}>• Support ongoing development</Text>
              <Text style={styles.upgradeInfoOneTime}>One-time fee • No subscription • Yours forever!</Text>
            </View>
            {loading && (
              <Text style={styles.upgradeLoadingText} accessibilityLiveRegion="polite">
                Processing... Please wait
              </Text>
            )}
            {!loading && (!products || products.length === 0) && (
              <Text style={styles.upgradeErrorText} accessibilityLiveRegion="polite">
                Unable to load purchase options. Please check your connection or try again later.
              </Text>
            )}
            {!loading && error && error.includes('E_IAP_NOT_AVAILABLE') && (
              <Text style={styles.upgradeErrorText} accessibilityLiveRegion="polite">
                In-App Purchases are not available on this device or environment.
              </Text>
            )}
            {!loading && error && !error.includes('E_IAP_NOT_AVAILABLE') && (
              <Text style={styles.upgradeErrorText} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            {showSuccess && (
              <Text style={styles.upgradeSuccessText} accessibilityLiveRegion="polite">
                🎉 Thank you for upgrading! Enjoy your premium features.
              </Text>
            )}
            {isPaid && !showSuccess && (
              <Text style={styles.upgradeSuccessText} accessibilityLiveRegion="polite">
                You are a premium user. Thank you!
              </Text>
            )}
            <TouchableOpacity
              style={[styles.mysticalButton, { marginTop: 8, marginBottom: 8 }]}
              onPress={handlePurchase}
              accessibilityRole="button"
              accessibilityLabel="Upgrade for $4.99"
              disabled={loading || !products || products.length === 0}
            >
              <Text style={[styles.mysticalButtonText, { textAlign: 'center' }]}> 
                {products && products[0] && products[0].localizedPrice
                  ? `Upgrade\n$${products[0].localizedPrice.replace(/[^\d.]/g, '')}`
                  : 'Upgrade\n$4.99'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {user && (
        <View style={styles.mysticalWelcomeBanner}>
          <Text style={styles.mysticalWelcomeText}>Welcome{user?.email ? `, ${user.email}` : ''}! You are now logged in.</Text>
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
            <LoginScreen onSwitchScreen={() => setShowLogin(false)} navigation={navigation} />
          ) : (
            <SignupScreen onSwitchScreen={() => setShowLogin(true)} />
          )}
        </>
      )}
      {user && !isPaid && (
        <>
          {!showChangeEmail && (
            <>
              <Text style={styles.info}>Upgrade to unlock unlimited mystical commentary, bookmarking, and more!</Text>
               {loading ? (
                <Text style={styles.comingSoon}>Processing purchase...</Text>
              ) : (
                products.length > 0 && products.map((prod) => (
                  <TouchableOpacity
                    key={prod.productId}
                    style={[styles.mysticalButton, { marginVertical: 8 }]}
                    onPress={handlePurchase}
                    accessibilityRole="button"
                    disabled={loading}
                  >
                    <Text style={styles.mysticalButtonText} accessible accessibilityRole="text">
                      {prod.localizedPrice ? `Upgrade to Premium – ${prod.localizedPrice}` : prod.price ? `Upgrade to Premium – ${prod.price}` : 'Upgrade to Premium'}
                    </Text>
                    <Text style={[styles.mysticalButtonText, { position: 'absolute', left: -1000, top: -1000 }]} accessibilityRole="text">Upgrade to Premium</Text>
                  </TouchableOpacity>
                ))
              )}
              {/* Restore Purchase Button for non-premium users */}
              <TouchableOpacity
                style={[styles.mysticalButton, { marginTop: 8, marginBottom: 8 }]}
                onPress={handleRestore}
                disabled={restoring}
                accessibilityRole="button"
                accessibilityLabel="Restore previous purchases"
              >
                <Text style={styles.mysticalButtonText}>{restoring ? 'Restoring...' : 'Restore Purchase'}</Text>
              </TouchableOpacity>
            </>
          )}
          {error && <Text style={{ color: 'red', marginBottom: 10 }} accessibilityRole="alert">{error}</Text>}
          {showChangeEmail ? (
            <>
              <ChangeEmailScreen onSuccess={() => setShowChangeEmail(false)} />
              <TouchableOpacity
                style={styles.mysticalButtonCancelChangeEmail}
                onPress={() => setShowChangeEmail(false)}
                accessibilityRole="button"
              >
                <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.mysticalButtonChangeEmail}
                onPress={() => setShowChangeEmail(true)}
                accessibilityRole="button"
              >
                <Text style={[styles.mysticalButtonAltText, { textAlign: 'center' }]}>Change Email</Text>
              </TouchableOpacity>
              {!showChangeEmail && (
                <TouchableOpacity
                  style={[styles.mysticalButton, styles.mysticalButtonLogout]}
                  onPress={logout}
                  accessibilityRole="button"
                >
                  <Text style={styles.mysticalButtonText}>Logout</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}
      {user && isPaid && (
        <>
          <Text style={styles.info}>Thank you for being a Premium member! All features are unlocked.</Text>
          {/* About Page Button */}
          <TouchableOpacity
            style={[styles.mysticalButtonAlt, { marginVertical: 12 }]}
            onPress={() => setShowAbout(true)}
            accessibilityRole="button"
          >
            <Text style={styles.mysticalButtonAltText}>SEE ABOUT PAGE</Text>
          </TouchableOpacity>
          {/* AboutOverlay Modal */}
          <AboutOverlay visible={showAbout} onDismiss={() => setShowAbout(false)} showDontShowToggle={false} />
          <TouchableOpacity
            style={[styles.mysticalButton, styles.mysticalButtonLogout]}
            onPress={logout}
            accessibilityRole="button"
          >
            <Text style={styles.mysticalButtonText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  upgradeLoadingText: {
    color: '#3D0066',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  upgradeErrorText: {
    color: '#b30000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  upgradeSuccessText: {
    color: '#20781e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
    fontWeight: 'bold',
  },

  upgradePromptBanner: {
    backgroundColor: '#ffe066',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginTop: -80,
    marginBottom: 18,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#bfae66',
    shadowColor: '#bfae66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    maxWidth: 340,
  },
  upgradePromptText: {
    color: '#3D0066',
    fontFamily: 'Cardo-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  upgradeInfoBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe066',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 14,
    marginTop: 2,
    alignSelf: 'stretch',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 1,
  },
  upgradeInfoTitle: {
    color: '#bfae66',
    fontFamily: 'Cardo-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  upgradeInfoItem: {
    color: '#3D0066',
    fontFamily: 'serif',
    fontSize: 15,
    marginBottom: 1,
    textAlign: 'center',
    marginLeft: 0,
  },
  upgradeInfoOneTime: {
    color: '#20781e',
    fontFamily: 'Cardo-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#2A004B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bfae66',
    marginTop: 2,
  },
  upgradeButtonText: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 18,
    letterSpacing: 1.1,
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mysticalButton: {
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
  mysticalButtonDisabled: {
    opacity: 0.65,
  },
  mysticalButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mysticalButtonAlt: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  mysticalButtonChangeEmail: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    // You can now customize this independently for the Change Email button
  },
  mysticalButtonCancelChangeEmail: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 115,
    marginVertical: 140,
    marginTop: -200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    // You can now customize this independently for the Cancel button
  },
  mysticalButtonAltText: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    fontSize: 18,
    letterSpacing: 1.15,
    textTransform: 'uppercase',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mysticalButtonLogout: {
    // Optionally, customize logout button further if needed
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44,0,75,0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fffbe6',
    borderRadius: 24,
    paddingVertical: 32,
    paddingTop: 52, // Added extra top padding to avoid close button overlap
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
    minWidth: 300,
    maxWidth: 340,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 26,
    color: '#bfae66',
    fontWeight: 'bold',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mysticalWelcomeBanner: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginBottom: 18,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  mysticalWelcomeText: {
    color: '#bfae66',
    fontFamily: 'Cardo-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.1,
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 7,
  },
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
    marginTop: 40,
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
