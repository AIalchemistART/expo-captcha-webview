
// frontend-app/src/config/api.js
// Central config for API URLs

// Set your LAN IP here for local testing on Expo Go
// --- API Config: Uses EXPO_PUBLIC_BACKEND_API_URL from .env ---
const ENV_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

if (!ENV_BACKEND_URL) {
  console.warn('[apiConfig] WARNING: EXPO_PUBLIC_BACKEND_API_URL is not set in .env! API calls will fail.');
} else if (
  ENV_BACKEND_URL.includes('localhost') || ENV_BACKEND_URL.includes('127.0.0.1')
) {
  console.warn('[apiConfig] WARNING: EXPO_PUBLIC_BACKEND_API_URL uses localhost/127.0.0.1. This will NOT work on mobile devices/emulators. Use your LAN IP.');
}

const API_BASE_URL = ENV_BACKEND_URL || '';

// console.log('[INTERNAL TEST][api.js] API_BASE_URL at runtime:', API_BASE_URL);
// console.log('[INTERNAL TEST][api.js] process.env.EXPO_PUBLIC_BACKEND_API_URL:', process.env.EXPO_PUBLIC_BACKEND_API_URL);

export default {
  API_BASE_URL,
};
