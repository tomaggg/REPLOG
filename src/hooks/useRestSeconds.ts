import { useEffect, useRef, useState } from "react";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import { patchProfile } from "~/services/profile";

const DEFAULT_REST_SECONDS = 120;
const MIN_REST_SECONDS = 15;
const MAX_REST_SECONDS = 600;
/** Wait for the taps to stop before saving, so −15s −15s −15s is one write. */
const SAVE_DELAY_MS = 1500;

/** The rest timer length, remembered on the user's profile. */
export function useRestSeconds() {
  const { store } = useStore();
  const { profile } = useAuth();
  const [restSeconds, setRestSecondsState] = useState(
    profile?.restSeconds ?? DEFAULT_REST_SECONDS,
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  function setRestSeconds(seconds: number) {
    const next = Math.min(MAX_REST_SECONDS, Math.max(MIN_REST_SECONDS, seconds));
    setRestSecondsState(next);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!store) return;
      try {
        await patchProfile(store, { restSeconds: next });
      } catch {
        // Not worth interrupting a workout over; it just won't be remembered
      }
    }, SAVE_DELAY_MS);
  }

  return [restSeconds, setRestSeconds] as const;
}
