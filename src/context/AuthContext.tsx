import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "~/types/workout";
import { useStore } from "./StoreContext";

interface AuthContextType {
  user: AuthUser | null;
  authReady: boolean;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { store } = useStore();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!store) return;
    setAuthReady(false);
    const unsubscribe = store.onAuthChange((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => {
      unsubscribe();
    };
  }, [store]);

  const logOut = async () => {
    if (store) {
      await store.logOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, authReady, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
