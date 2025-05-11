// src/services/iapService.js
// Handles In-App Purchase logic for Android (Google Play Billing) and scaffolds for iOS.
// Uses react-native-iap. Only Android logic is implemented for now.

import * as RNIap from 'react-native-iap';

// // console.log('[IAP] RNIap import:', RNIap);
// // console.log('[IAP] RNIap.initConnection:', typeof RNIap.initConnection);
// // console.log('[IAP] RNIap.isReady:', typeof RNIap.isReady);
// // console.log('[IAP] RNIap.getProducts:', typeof RNIap.getProducts);
// // console.log('[IAP] RNIap.requestPurchase:', typeof RNIap.requestPurchase);
// // console.log('[IAP] RNIap.getAvailablePurchases:', typeof RNIap.getAvailablePurchases);
// // console.log('[IAP] RNIap.endConnection:', typeof RNIap.endConnection);

// Product IDs (update with your actual product IDs from Google Play Console)
export const productIds = ['premium_upgrade'];

export async function initIAP() {
  try {
    if (typeof RNIap.initConnection !== 'function') {
      const errMsg = '[IAP] FATAL: RNIap.initConnection is not a function';
      if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error(errMsg, RNIap.initConnection);
      throw new Error(errMsg);
    }
    const connResult = await RNIap.initConnection();
    // console.log('[IAP] initConnection result:', connResult);

  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('IAP init error:', err, err?.stack);
  }
}

import { Platform } from 'react-native';

export async function getProducts() {
  try {
    // Log platform and RN-IAP version for every call
    // console.log('[IAP-TEST] Platform:', Platform.OS);
    // console.log('[IAP-TEST] RN-IAP version:', RNIap?.version || 'unknown');
    let products;
    if (Platform.OS === 'android') {
      // Log the argument type and value
      const androidArg = { skus: ['premium_upgrade'] };
      // console.log('[IAP-TEST] getProducts arg (android):', JSON.stringify(androidArg), 'type:', typeof androidArg);
      try {
        products = await RNIap.getProducts(androidArg);
        // console.log('[IAP-TEST] products (skus):', products.length, products);
      } catch (e1) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-TEST] getProducts({ skus }) failed:', e1, e1?.stack);
        // Fallback: try array form
        const fallbackArg = ['premium_upgrade'];
        // console.log('[IAP-TEST] getProducts fallback arg (android):', JSON.stringify(fallbackArg), 'type:', typeof fallbackArg);
        try {
          products = await RNIap.getProducts(fallbackArg);
          // console.log('[IAP-TEST] products (array):', products.length, products);
        } catch (e2) {
          if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-TEST] getProducts([sku]) also failed:', e2, e2?.stack);
          throw e2;
        }
      }
    } else {
      const iosArg = ['premium_upgrade'];
      // console.log('[IAP-TEST] getProducts arg (ios):', JSON.stringify(iosArg), 'type:', typeof iosArg);
      products = await RNIap.getProducts(iosArg);
      // console.log('[IAP-TEST] products (iOS):', products.length, products);
    }
    return products;
  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-DBG-2] getProducts error:', err, err?.stack);
    return [];
  }
}




// Backend endpoint for purchase validation (uses env var for environment switching)
const VALIDATE_PURCHASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/validate-purchase`;

// Import profile context setter
import { useProfile } from '../auth/ProfileProvider';

/**
 * Validates a purchase with the backend and updates profile context if successful.
 * @param {Object} params - { userId, receipt, purchase }
 * @param {Function} setProfile - profile setter from context
 * @returns {Promise<Object>} backend response
 */
export async function validatePurchaseWithProfile(params, setProfile) {
  const res = await fetch(VALIDATE_PURCHASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data?.profile && setProfile) {
    setProfile(data.profile);
  }
  return data;
}

/**
 * Attempts to purchase premium. After purchase, POSTs the receipt to the backend for validation and profile update.
 * Expects backend to return { success: true, is_paid: true } on success.
 */
// Starts a purchase flow for the first product in productIds
// Ensure IAP is initialized before any operation
async function ensureIAPReady() {
  try {
    await initIAP();
  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP] Failed to initialize IAP connection:', err);
    throw err;
  }
}

export async function purchasePremium() {
  try {
    // console.log('[IAP] About to call requestPurchase with:', productIds[0], 'type:', typeof productIds[0]);
    // Use correct argument shape for Android (skus: [id]), and for iOS (sku: id)
let result;
if (Platform.OS === 'android') {
  result = await RNIap.requestPurchase({ skus: [productIds[0]] });
} else {
  result = await RNIap.requestPurchase({ sku: productIds[0] });
}
    // console.log('[IAP] requestPurchase result:', result);
    // Defensive: log receipt and transactionId if present
    if (result?.transactionReceipt || result?.purchaseToken) {
      // console.log('[IAP] Purchase receipt:', result.transactionReceipt);
      // console.log('[IAP] Purchase token:', result.purchaseToken);
      // console.log('[IAP] Transaction ID:', result.transactionId || result.orderId);
    }
    // Note: actual validation & profile update happens in setPurchaseListener
    return result;
  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-DBG-3] purchase error:', err, err?.stack);
    throw err;
  }
}


// Sets up listeners for purchase updates and errors. Call this once (e.g., in a useEffect or app entrypoint)
let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

// Sets up listeners for purchase updates and errors. Always validates receipt with backend and logs all steps.
// Accepts user and authReady for gating logic
export function setPurchaseListener(onSuccess, onError, getUser, getAuthReady, setProfile) {
  // console.log('[IAP-LISTENER] Setting up purchase listener.');
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
    // console.log('[IAP-LISTENER] Removed previous purchaseUpdateSubscription.');
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
    // console.log('[IAP-LISTENER] Removed previous purchaseErrorSubscription.');
  }

  purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
    const receipt = purchase.transactionReceipt;
    if (receipt) {
      // Log receipt, transactionId, and purchase object
      // console.log('[IAP-LISTENER] Receipt:', receipt);
      // console.log('[IAP-LISTENER] Purchase object:', purchase);
      // Wait for authReady and user
      const authReady = typeof getAuthReady === 'function' ? await getAuthReady() : getAuthReady;
      const user = typeof getUser === 'function' ? await getUser() : getUser;
      // console.log('[IAP-LISTENER] Purchase event. user:', user, 'authReady:', authReady, 'purchase:', purchase);
      if (!authReady) {
        const msg = '[IAP-LISTENER] Auth not ready, waiting to validate purchase.';
        // console.log(msg);
        if (onError) onError(new Error(msg));
        return;
      }
      if (!user) {
        const errMsg = '[IAP-LISTENER] No authenticated user found for purchase validation. Aborting backend validation.';
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error(errMsg);
        if (onError) onError(new Error(errMsg));
        return;
      }
      const userId = user.id;
      // Send receipt and userId to backend for validation
      try {
        const response = await fetch(VALIDATE_PURCHASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'android',
            receipt,
            purchase,
            userId,
          }),
        });
        const backendResponse = await response.json();
        // console.log('[IAP-LISTENER] Backend validation response:', backendResponse);
        if (backendResponse.success) {
          // console.log('[IAP-LISTENER] Validation success for user:', user?.id, 'product:', purchase?.productId, 'response:', backendResponse);
          if (backendResponse.profile && typeof setProfile === 'function') {
            setProfile(backendResponse.profile);
          }
          if (onSuccess) onSuccess(purchase);
        } else {
          const errMsg = backendResponse.message || 'Backend validation failed.';
          if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[IAP-LISTENER] Validation failure:', errMsg, 'user:', user, 'purchase:', purchase);
          if (onError) onError(new Error(errMsg));
        }
      } catch (err) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[IAP-LISTENER] Backend validation error:', err, 'user:', user, 'purchase:', purchase);
        if (onError) onError(err);
      }
      // Always acknowledge the purchase
      try {
        await RNIap.finishTransaction(purchase, false);
      } catch (err) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('IAP finishTransaction error:', err);
      }
    }
  });

  purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
    if (onError) onError(new Error(error.message || 'Purchase error'));
  });
}

export async function endIAP() {
  try {
    if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
    if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
    await RNIap.endConnection();
  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('IAP end error:', err);
  }
}

// Attempts to restore previous purchases (for users who reinstall or change devices)
export async function restorePurchases() {
  try {
    await ensureIAPReady();
    // console.log('[IAP] About to call getAvailablePurchases');
    const purchases = await RNIap.getAvailablePurchases();
    // console.log('[IAP] getAvailablePurchases result:', purchases);
    let restored = false;
    // Try to validate each purchase with backend
    for (const purchase of purchases) {
      try {
        // console.log('[IAP] Validating purchase with backend:', purchase);
        let userId = null;
        try {
          const { data, error } = await require('./supabaseClient').supabase.auth.getUser();
          if (error || !data?.user?.id) {
            if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[IAP-RESTORE] No authenticated user found for restore validation:', error);
            continue; // Skip backend validation if no userId
          }
          userId = data.user.id;
        } catch (e) {
          if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[IAP-RESTORE] Exception getting userId for restore validation:', e);
          continue;
        }
        const payload = {
          platform: 'android',
          receipt: purchase.transactionReceipt,
          purchase,
          userId,
        };
        // console.log('[IAP-LOG] Sending validation payload to backend:', payload);
        let response, result;
        try {
          response = await fetch(VALIDATE_PURCHASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          result = await response.json();
          // console.log('[IAP-LOG] Backend validation result:', result);
        } catch (err) {
          if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[IAP-ERR] Error during backend validation:', err, 'Payload:', payload);
          throw err;
        }
        if (result.success && result.is_paid) {
          restored = true;
          // Optionally: update profile here if needed
        }
      } catch (err) {
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-DBG-5] Backend validation error:', err, err?.stack);
        // Continue to next purchase if validation fails
        continue;
      }
    }
    // Defensive: log profile/isPaid after restore
    try {
      const supabase = require('./supabaseClient').supabase;
      const { data, error } = await supabase.auth.getUser();
      if (data && data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (!profileError && profileData) {
          // console.log('[IAP] Profile after restore:', profileData);
          // console.log('[IAP] isPaid after restore:', profileData.is_paid);
        }
      }
    } catch (profileErr) {
      if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP] Profile fetch after restore failed:', profileErr);
    }
    return restored;
  } catch (err) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[IAP-DBG-4] restorePurchases error:', err, err?.stack);
    throw err;
  }
}

// ---- iOS Scaffold ----
// When ready to implement iOS, add logic for Apple IAP here.
// The above functions are cross-platform, but you may need to handle platform-specific flows.
