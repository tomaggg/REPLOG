import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseConfig } from "~/services/config";
import { createDemoStore } from "~/services/demo-store";
import { createFirebaseStore } from "~/services/firebase-store";
import type { DataStore, Unit } from "~/types/workout";

export interface ModeInfo {
  kind: "firebase" | "demo";
  reason?: "unconfigured" | "requested" | "invalid_key";
  missing?: string[];
  error?: string;
}

interface StoreContextType {
  store: DataStore | null;
  mode: ModeInfo | null;
  status: "booting" | "ready" | "failed";
  fatalError: string | null;
  unit: Unit;
  setUnit: (unit: Unit) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"booting" | "ready" | "failed">("booting");
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [store, setStore] = useState<DataStore | null>(null);
  const [mode, setMode] = useState<ModeInfo | null>(null);
  const [unit, setUnitState] = useState<Unit>("kg");

  const setUnit = (nextUnit: Unit) => {
    setUnitState(nextUnit);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const wantsDemo = ["1", "true", "yes"].includes((params.get("demo") ?? "").toLowerCase());
      let config = null;
      let missing: string[] = [];

      if (!wantsDemo) {
        try {
          const res = await getFirebaseConfig();
          config = res.config;
          missing = res.missing;
        } catch {
          missing = ["apiKey", "authDomain", "projectId", "appId"];
        }
      }

      if (cancelled) return;

      if (wantsDemo || !config) {
        setStore(createDemoStore());
        setMode({ kind: "demo", reason: wantsDemo ? "requested" : "unconfigured", missing });
        setStatus("ready");
        return;
      }

      try {
        const realStore = await createFirebaseStore(config);
        if (cancelled) return;
        setStore(realStore);
        setMode({ kind: "firebase" });
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.warn("Firebase initialization error, falling back to Demo Store:", err);
        setStore(createDemoStore());
        setMode({
          kind: "demo",
          reason: "invalid_key",
          error: err instanceof Error ? err.message : String(err),
        });
        setStatus("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoreContext.Provider value={{ store, mode, status, fatalError, unit, setUnit }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
