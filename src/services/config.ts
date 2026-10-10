import type { FirebaseConfig } from "~/types/workout";
import { PUBLIC_FIREBASE_CONFIG } from "./firebase-public-config";

export interface FirebaseConfigResult {
  config: FirebaseConfig | null;
  missing: string[];
}

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key.includes("Dummy") || key.includes("YOUR_") || key.includes("placeholder")) {
    return false;
  }
  return key.length > 20;
}

export async function getFirebaseConfig(): Promise<FirebaseConfigResult> {
  const env = (import.meta as any).env || {};
  const envConfig: FirebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || (typeof process !== "undefined" ? process.env?.FIREBASE_API_KEY : "") || "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== "undefined" ? process.env?.FIREBASE_AUTH_DOMAIN : "") || "",
    projectId: env.VITE_FIREBASE_PROJECT_ID || (typeof process !== "undefined" ? process.env?.FIREBASE_PROJECT_ID : "") || "",
    appId: env.VITE_FIREBASE_APP_ID || (typeof process !== "undefined" ? process.env?.FIREBASE_APP_ID : "") || "",
  };

  if (isValidApiKey(envConfig.apiKey)) {
    return { config: envConfig, missing: [] };
  }

  if (PUBLIC_FIREBASE_CONFIG && isValidApiKey(PUBLIC_FIREBASE_CONFIG.apiKey)) {
    return { config: PUBLIC_FIREBASE_CONFIG, missing: [] };
  }

  return {
    config: null,
    missing: ["apiKey", "authDomain", "projectId", "appId"],
  };
}
