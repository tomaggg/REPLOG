import { useCallback, useEffect, useState } from "react";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { newestFirst, parseWeight } from "~/lib/weight";
import type { Unit, UserProfile, WeightEntry } from "~/types/workout";

/**
 * The user's profile and body-weight logs (newest first).
 */
export function useWeightLogs() {
  const { store } = useStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      setLoading(true);
      const [prof, list] = await Promise.all([store.getProfile(), store.listWeightLogs()]);
      setProfile(prof);
      setLogs(newestFirst(list));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, "Could not load weight logs."));
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logWeight(text: string, unit: Unit, onSaved: () => void) {
    if (!store || saving) return;
    const val = parseWeight(text);
    if (val === null) {
      setError("Please enter a valid weight value.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      await store.logBodyWeight(val, unit);
      // Keep the profile's body weight in sync with the latest log
      if (profile) {
        const updatedProfile = { ...profile, bodyWeight: val, unit, updatedAt: Date.now() };
        await store.saveProfile(updatedProfile);
        setProfile(updatedProfile);
      }
      onSaved();
      setSuccessMsg(`Logged ${val} ${unit} successfully.`);
      setLogs(newestFirst(await store.listWeightLogs()));
    } catch (err) {
      setError(errorMessage(err, "Failed to save weight."));
    } finally {
      setSaving(false);
    }
  }

  return { profile, logs, loading, saving, error, successMsg, logWeight };
}
