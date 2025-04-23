// src/services/iapService.js
// Handles In-App Purchase logic for Android (Google Play Billing) and scaffolds for iOS.
// Uses react-native-iap. Only Android logic is implemented for now.

import * as RNIap from 'react-native-iap';

// Product IDs (update with your actual product IDs from Google Play Console)
export const productIds = ['premium_upgrade'];

export async function initIAP() {
  try {
    await RNIap.initConnection();
  } catch (err) {
    console.warn('IAP init error:', err);
  }
}

export async function getProducts() {
  try {
    const products = await RNIap.getProducts(productIds);
    return products;
  } catch (err) {
    console.warn('IAP getProducts error:', err);
    return [];
  }
}

// Backend endpoint for purchase validation (uses env var for environment switching)
const VALIDATE_PURCHASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/validate-purchase`;

/**
 * Attempts to purchase premium. After purchase, POSTs the receipt to the backend for validation and profile update.
 * Expects backend to return { success: true, is_paid: true } on success.
 */
// Starts a purchase flow for the first product in productIds
export async function purchasePremium() {
  try {
    await RNIap.requestPurchase({sku: productIds[0]});
  } catch (err) {
    console.warn('IAP purchase error:', err);
    throw err;
  }
}

// Sets up listeners for purchase updates and errors. Call this once (e.g., in a useEffect or app entrypoint)
let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

export function setPurchaseListener(onSuccess, onError) {
  if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
  if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

  purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
    const receipt = purchase.transactionReceipt;
    if (receipt) {
      // Validate with backend
      try {
        const response = await fetch(VALIDATE_PURCHASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'android',
            purchaseToken: purchase.purchaseToken || purchase.transactionId,
            productId: purchase.productId,
            userId: purchase.userId || null,
          }),
        });
        const result = await response.json();
        if (result.success && result.is_paid) {
          if (onSuccess) onSuccess(purchase);
        } else {
          const errMsg = result.error || 'Purchase validation failed';
          if (onError) onError(new Error(errMsg));
        }
      } catch (err) {
        if (onError) onError(err);
        else console.warn('IAP backend validation error:', err);
      }
      // Always acknowledge the purchase
      try {
        await RNIap.finishTransaction(purchase, false);
      } catch (err) {
        console.warn('IAP finishTransaction error:', err);
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
    console.warn('IAP end error:', err);
  }
}

// ---- iOS Scaffold ----
// When ready to implement iOS, add logic for Apple IAP here.
// The above functions are cross-platform, but you may need to handle platform-specific flows.
