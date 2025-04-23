// validate-purchase.js
// Secure backend endpoint for validating Android IAP receipts and updating Supabase profile
require('dotenv').config({ path: '../backend/.env' });
console.log('SUPABASE_URL loaded:', process.env.SUPABASE_URL);

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

// Load from environment variables or a secure config file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// For security, keep the Google service account key in the backend directory only
const GOOGLE_SERVICE_ACCOUNT = require('../backend/google-service-account.json'); // Download from Google Cloud Console
const PACKAGE_NAME = 'com.yourcompany.yourapp'; // TODO: Replace with your app's package name

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});
const androidPublisher = google.androidpublisher({ version: 'v3', auth });

app.post('/validate-purchase', async (req, res) => {
  const { purchaseToken, productId, userId } = req.body;
  if (!purchaseToken || !productId || !userId) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    // Validate purchase with Google Play
    const purchase = await androidPublisher.purchases.products.get({
      packageName: PACKAGE_NAME,
      productId,
      token: purchaseToken,
    });

    // Check purchase state
    if (purchase.data.purchaseState === 0 && purchase.data.consumptionState === 0) {
      // Mark user as paid in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', userId);

      if (error) throw error;
      return res.json({ success: true, is_paid: true });
    } else {
      return res.status(400).json({ success: false, error: 'Purchase not valid or already consumed' });
    }
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ success: false, error: 'Validation failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`IAP backend running on port ${PORT}`));
