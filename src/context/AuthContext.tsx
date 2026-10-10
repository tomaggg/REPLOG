import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, UserProfile } from "~/types/workout";
import { useStore } from "./StoreContext";

interface AuthContextType {
  user: AuthUser | null;
  authReady: boolean;
  profile: UserProfile | null;
  profileReady: boolean;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { store } = useStore();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!store) return;
    setAuthReady(false);
    const unsubscribe = store.onAuthChange((u) => {
      setUser(u);
      setAuthReady(true);
      setProfile(null);
      setProfileReady(false);
    });
    return () => {
      unsubscribe();
    };
  }, [store]);

  useEffect(() => {
    if (!user || !store) return;
    let cancelled = false;
    let finished = false;

    (async () => {
      try {
        const p = await store.getProfile();
        if (!cancelled) {
          setProfile(p);
          setProfileReady(true);
          finished = true;
        }
      } catch {
        if (!cancelled) {
          setProfileReady(true);
          finished = true;
        }
      }
    })();

    return () => {
      cancelled = true;
      if (!finished) {
      }
    };
  }, [store, user?.uid]);

  const logOut = async () => {
    if (store) {
      await store.logOut();
    }
  };

  const refreshProfile = async () => {
    if (!user || !store) return;
    try {
      const p = await store.getProfile();
      setProfile(p);
      setProfileReady(true);
    } catch {
      setProfileReady(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authReady, profile, profileReady, logOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
