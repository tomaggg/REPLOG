import type { FirebaseConfig } from "~/types/workout";

/**
 * Firebase settings from the VITE_FIREBASE_* environment variables
 * (see .env.example). Returns null when they're missing or still placeholders,
 * in which case the app runs in demo mode.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  const env = import.meta.env;
  const config: FirebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
    appId: env.VITE_FIREBASE_APP_ID ?? "",
  };
  return isValidApiKey(config.apiKey) ? config : null;
}

function isValidApiKey(key: string): boolean {
  if (key.includes("Dummy") || key.includes("YOUR_") || key.includes("placeholder")) {
    return false;
  }
  return key.length > 20;
}
