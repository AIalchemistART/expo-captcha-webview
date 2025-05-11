import * as Sentry from 'sentry-expo';
// PremiumScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import AboutOverlay from '../components/AboutOverlay';
import EmailChangeInfoOverlay from '../components/EmailChangeInfoOverlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import { useAuth } from '../auth/useAuth';
import { useProfile } from '../auth/ProfileProvider';
import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import LogoutButton from '../auth/LogoutButton';
import ChangeEmailScreen from '../auth/ChangeEmailScreen';

export default function PremiumScreen({ navigation }) {
  const { profile, setProfile, user, authReady } = useProfile();
  const [latestEmail, setLatestEmail] = React.useState(user?.email || '');

  React.useEffect(() => {
    let isMounted = true;
    async function fetchLatestEmail() {
      if (user?.id) {
        try {
          const supabase = require('../services/supabaseClient').supabase;
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user?.email && isMounted) {
            setLatestEmail(data.user.email);
          }
        } catch (err) {
          if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            Sentry.captureException(err);
          }
        }
      }
    }
    fetchLatestEmail();
    return () => { isMounted = false; };
  }, [user?.id, showChangeEmail]);
  // Context/state debug logs
  console.log('[PremiumScreen] MOUNT user:', user, 'profile:', profile, 'authReady:', authReady, new Error().stack);
  // ...rest of component
  const [showAbout, setShowAbout] = useState(false);
  // ...existing hooks...
  const [restoring, setRestoring] = useState(false);
  // REMOVE any local profile/setProfile state! Only use context version.

  // Change Email modal state
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showEmailChangeInfoOverlay, setShowEmailChangeInfoOverlay] = useState(false);

  // Log every state change
  React.useEffect(() => {
    console.log('[PremiumScreen] showChangeEmail state changed:', showChangeEmail, new Error().stack);
  }, [showChangeEmail]);

  // Log ChangeEmailScreen modal open/close
  const openChangeEmail = () => {
    setShowChangeEmail(true);
    console.log('[PremiumScreen] Opening ChangeEmailScreen modal', new Error().stack);
  };
  const closeChangeEmail = () => {
    setShowChangeEmail(false);
    setTimeout(() => {
      console.log('[PremiumScreen] Showing EmailChangeInfoOverlay after cancel');
      setShowEmailChangeInfoOverlay(true);
    }, 300);
    console.log('[PremiumScreen] Closing ChangeEmailScreen modal', new Error().stack);
  };

  React.useEffect(() => {
    if (showChangeEmail) {
      console.log('[PremiumScreen] ChangeEmailScreen modal is open');
    }
  }, [showChangeEmail]);

  // Log ChangeEmailScreen render
  console.log('[PremiumScreen] Rendering ChangeEmailScreen');

  // Elegant loading spinner for restore
  const renderRestoreLoader = () => (
    restoring ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(44,0,75,0.35)', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ backgroundColor: '#fffbe6', padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#ffe066', shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 }}>
          <Text style={{ color: '#bfae66', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Restoring your purchase...</Text>
          <View style={{ marginTop: 12 }}>
            <View style={{ width: 44, height: 44, borderWidth: 4, borderColor: '#ffe066', borderRadius: 22, borderTopColor: '#bfae66', borderRightColor: '#bfae66', borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }], marginBottom: 8 }} />
          </View>
        </View>
      </View>
    ) : null
  );


  // Restore purchase handler
  async function handleRestore() {
    if (!user) {
      setShowLogin(true);
      setError('You must be signed in to restore purchases.');
      return;
    }
    setRestoring(true);
    setError(null);
    try {
      const restored = await iapService.restorePurchases?.();
      // Always fetch the latest profile from Supabase after restore
      try {
        const supabase = require('../services/supabaseClient').supabase;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        } else if (profileError) {
          console.warn('[Restore] Profile fetch error after restore:', profileError);
          if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            Sentry.captureException(profileError);
          }
        }
      } catch (fetchErr) {
        console.warn('[Restore] Exception fetching profile after restore:', fetchErr);
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
          Sentry.captureException(fetchErr);
        }
      }

      // If the restore result contains a profile, update global context for instant UI update
      if (restored && restored.profile) {
        setProfile(restored.profile);
      }

      // If restorePurchases is not implemented, fallback to re-initialize IAP
      if (!restored) {
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
      // Wait for profile to update before hiding loader
      setTimeout(() => {
        setRestoring(false);
      }, 700);
    } catch (err) {
      setRestoring(false);
      if (err?.message && /invalid hook call/i.test(err.message)) {
        console.error('[PremiumScreen] Suppressed error:', err);
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
          Sentry.captureException(err);
        }
      } else {
        setError(err?.message || 'Restore failed. Please try again.');
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
          Sentry.captureException(err);
        }
      }
    }
  }
  const { logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissedUpgradeModal, setDismissedUpgradeModal] = useState(false);
  // Use profile context to determine premium status
  const isPaid = !!profile?.is_paid;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Import IAP service
  const iapService = require('../services/iapService');
  const [products, setProducts] = useState([]);

  // Setup IAP connection, product fetch, and purchase listener
  React.useEffect(() => {
    let isMounted = true;
    // Show upgrade modal automatically for non-premium users, but only if not dismissed
    if (user && !isPaid && !showUpgradeModal && !showSuccess && !dismissedUpgradeModal) {
      setShowUpgradeModal(true);
    }
    // Only setup IAP when auth is ready
    if (!authReady) {
      console.log('[PremiumScreen] Auth not ready, waiting to setup IAP...');
      return;
    }
    async function setupIAP() {
      setLoading(true);
      setError(null);
      try {
        if (!Array.isArray(iapService.productIds) || iapService.productIds.length === 0) {
          const errMsg = `[PremiumScreen] FATAL: iapService.productIds is not a non-empty array: ${JSON.stringify(iapService.productIds)} (type: ${typeof iapService.productIds})`;
          if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            Sentry.captureException(new Error(errMsg));
          }
          throw new Error(errMsg);
        }
        await iapService.initIAP();
        const prods = await iapService.getProducts();
        if (isMounted) setProducts(prods);
        // Use a ref to always get latest user in getter
        const userRef = React.useRef(user);
        React.useEffect(() => {
          userRef.current = user;
        }, [user]);
        console.log('[PremiumScreen] Setting up IAP listener with user:', user, 'authReady:', authReady);
        iapService.setPurchaseListener(
          async (purchase) => {
            setLoading(false);
            // Refresh the profile from Supabase so UI updates
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
                      setProfile(profileData); // Updates global profile context
                    }
                  });
              }
            });
          },
          (err) => {
            setLoading(false);
            if (err?.message && /invalid hook call/i.test(err.message)) {
              console.error('[PremiumScreen] Suppressed error:', err);
              if (typeof Sentry !== 'undefined' && Sentry.captureException) {
                Sentry.captureException(err);
              }
            } else {
              setError(err?.message || 'Purchase failed');
              if (typeof Sentry !== 'undefined' && Sentry.captureException) {
                Sentry.captureException(err);
              }
            }
          },
          () => {
            const userVal = userRef.current;
            // console.log('[PremiumScreen] Getter called for user. userRef.current:', userVal);
            return userVal;
          },
          () => {
            // console.log('[PremiumScreen] Getter called for authReady. authReady:', authReady);
            return authReady;
          }
        );
      } catch (err) {
        setLoading(false);
        if (err?.message && /invalid hook call/i.test(err.message)) {
          console.error('[PremiumScreen] Suppressed error:', err);
          if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            Sentry.captureException(err);
          }
        } else {
          setError(err?.message || 'IAP setup error');
          if (typeof Sentry !== 'undefined' && Sentry.captureException) {
            Sentry.captureException(err);
          }
        }
      }
      setLoading(false);
    }
    setupIAP();
    return () => {
      isMounted = false;
      iapService.endIAP();
    };
  }, [authReady, user, isPaid, showUpgradeModal, showSuccess]);

  async function handlePurchase() {
    if (!user) {
      setShowLogin(true);
      setError('You must be signed in to make a purchase.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Start purchase flow
      const purchaseResult = await iapService.purchasePremium();
      // Validate with backend and update profile context
      if (purchaseResult) {
        const receipt = purchaseResult.transactionReceipt || purchaseResult.receipt || purchaseResult;
        const purchaseToken = purchaseResult.purchaseToken;
        const productId = purchaseResult.productId || purchaseResult.productIds?.[0];
        await iapService.validatePurchaseWithProfile(
          {
            userId: user.id,
            receipt,
            purchase: purchaseResult,
            productId,
            purchaseToken,
          },
          setProfile
        );
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err?.message && /invalid hook call/i.test(err.message)) {
        console.error('[PremiumScreen] Suppressed error:', err);
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
          Sentry.captureException(err);
        }
      } else {
        setError(err?.message || 'Purchase error');
        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
          Sentry.captureException(err);
        }
      }
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setShowUpgradeModal(false); setDismissedUpgradeModal(true); }} accessibilityRole="button" accessibilityLabel="Close Upgrade Modal">
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
            {!loading && error && !error.includes('E_IAP_NOT_AVAILABLE') && !/invalid hook call/i.test(error) && (
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
          <Text style={styles.mysticalWelcomeText}>Welcome{latestEmail ? `, ${latestEmail}` : ''}! You are now logged in.</Text>
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
                      {prod.localizedPrice ? `Upgrade for ${prod.localizedPrice}` : prod.price ? `Upgrade for ${prod.price}` : 'Upgrade for'}
                    </Text>
                    <Text style={[styles.mysticalButtonText, { position: 'absolute', left: -1000, top: -1000 }]} accessibilityRole="text">Upgrade for</Text>
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
              {console.log('[PremiumScreen] Rendering ChangeEmailScreen', {
                 onSuccess: () => {
                   setShowChangeEmail(false);
                   setTimeout(() => {
                     console.log('[PremiumScreen] Setting showEmailChangeInfoOverlay to true after email change');
                     setShowEmailChangeInfoOverlay(true);
                   }, 500);
                 },
                 showChangeEmail,
                 parentUser: user,
                 parentProfile: profile,
                 authReady,
                 stack: new Error().stack
               })}
              <ChangeEmailScreen
                onSuccess={() => {
                   setShowChangeEmail(false);
                 }}
              />
              <TouchableOpacity
                style={styles.mysticalButtonCancelChangeEmail}
                onPress={closeChangeEmail}
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
              {/* Logout button only when ChangeEmailScreen is NOT open */}
              <TouchableOpacity
                style={[styles.mysticalButton, { marginTop: 8, marginBottom: 8 }]}
                onPress={async () => {
                    console.log('[PremiumScreen] Logout button pressed');
                    try {
                      const { error } = await require('../services/supabaseClient').supabase.auth.signOut();
                      console.log('[PremiumScreen] supabase.auth.signOut() called, error:', error);
                      if (error) {
                        if (typeof Sentry !== 'undefined' && Sentry.captureException) {
                          Sentry.captureException(error);
                        }
                      }
                      if (typeof require('../auth/useAuth').useAuth === 'function') {
                        const { setUser } = require('../auth/useAuth').useAuth();
                        setUser(null);
                        console.log('[PremiumScreen] setUser(null) called');
                      } else {
                        console.log('[PremiumScreen] useAuth is not a function');
                      }
                      if (navigation && typeof navigation.navigate === 'function') {
                        navigation.navigate('Login');
                        console.log('[PremiumScreen] navigation.navigate("Login") called');
                      } else {
                        console.log('[PremiumScreen] navigation.navigate is not a function');
                      }
                      // Force state update to trigger re-render
                      setDummyState && setDummyState(Date.now());
                    } catch (e) {
                      console.log('[PremiumScreen] Logout error:', e);
                      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
                        Sentry.captureException(e);
                      }
                    }
                }}
                accessibilityRole="button"
              >
                <Text style={styles.mysticalButtonText}>Logout</Text>
              </TouchableOpacity>
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
        </>
      )}

      {/* EmailChangeInfoOverlay Modal - always available for all users */}
      {showEmailChangeInfoOverlay && (
        (console.log('[PremiumScreen] Rendering EmailChangeInfoOverlay'), null)
        || <EmailChangeInfoOverlay
          visible={showEmailChangeInfoOverlay}
          onDismiss={() => setShowEmailChangeInfoOverlay(false)}
        />
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
