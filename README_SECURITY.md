# Security & Privacy Checklist for Mystical Bible Companion

## .env and Secrets
- `.env`, `.env.example`, and all `.env*.local` files are listed in `.gitignore` and **will not be committed to version control**.
- All sensitive keys (Supabase URL, anon key, backend API URL) are loaded from environment variables and **never hardcoded** in the codebase.

## Hardcoded Secrets Audit
- No hardcoded API keys, secrets, tokens, or credentials are present in any source file.
- All configuration values are loaded securely from environment variables.

## Dev Tools Gating
- The `DevCommentarySync` tool is now gated and will only render in development mode (`__DEV__`). It is hidden in production builds.

## Error Logging & Sentry
- Only non-sensitive errors are logged to the console (`console.error`), and no secrets or user data are exposed in logs.
- Sentry can be used with a free account for React Native. You can set up Sentry for error tracking and routing logs. See below for quick setup.

---

## Sentry Setup (Free Tier)

1. **Sign up at [sentry.io](https://sentry.io/)** and create a free account (includes a generous quota for small apps).
2. **Install the SDK:**
   ```sh
   npx expo install @sentry/react-native
   ```
3. **Initialize Sentry in your entry file (e.g., `App.js`):**
   ```js
   import * as Sentry from '@sentry/react-native';
   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN', // Get this from your Sentry project settings
     enableInExpoDevelopment: true, // Optional: track errors in dev
     debug: false
   });
   ```
4. **Replace critical `console.error`/`console.warn` calls with Sentry capture:**
   ```js
   Sentry.captureException(error);
   ```
   Or, for manual messages:
   ```js
   Sentry.captureMessage('Something went wrong', 'error');
   ```
5. **Test Sentry:**
   Trigger an error in your app and confirm it appears in your Sentry dashboard.

*You can keep Sentry on the free tier until your error volume grows or you need advanced features.*

---

**You are ready for a secure, privacy-first production launch!**

If you need help wiring up Sentry or want an automated script to check for secrets before each deploy, just ask.
