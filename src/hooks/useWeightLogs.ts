import { useCallback, useEffect, useState } from "react";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { convertWeight, newestFirst, parseWeight } from "~/lib/weight";
import { patchProfile } from "~/services/profile";
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
      // Keep the profile's body weight in sync with the latest log.
      // Not `unit`: that's the app-wide kg/lb choice from the account menu.
      setProfile(
        await patchProfile(store, {
          bodyWeight: val,
          initialWeightUnit: profile?.initialWeightUnit ?? unit,
        }),
      );
      onSaved();
      setSuccessMsg(`Logged ${val} ${unit} successfully.`);
      setLogs(newestFirst(await store.listWeightLogs()));
    } catch (err) {
      setError(errorMessage(err, "Failed to save weight."));
    } finally {
      setSaving(false);
    }
  }

  /** Save sex, height or birth year. Returns true on success. */
  async function saveBody(patch: Pick<UserProfile, "sex" | "heightCm" | "birthYear">) {
    if (!store) return false;
    try {
      // `height` is the old unit-less field; heightCm replaces it
      setProfile(await patchProfile(store, { ...patch, height: undefined }));
      return true;
    } catch (err) {
      setError(errorMessage(err, "Could not save your body profile."));
      return false;
    }
  }

  /** First-time setup: body details and current weight, saved together. Returns true on success. */
  async function setUpBody(
    patch: Pick<UserProfile, "sex" | "heightCm" | "birthYear">,
    weight: number,
    unit: Unit,
  ) {
    if (!store) return false;
    try {
      setSaving(true);
      setError(null);
      // Don't log a duplicate when they kept the weight already on record
      const latest = logs[0];
      const unchanged = latest && Math.abs(convertWeight(latest.weight, latest.unit, unit) - weight) < 0.05;
      if (!unchanged) await store.logBodyWeight(weight, unit);
      setProfile(
        await patchProfile(store, {
          ...patch,
          height: undefined,
          bodyWeight: weight,
          initialWeightUnit: profile?.initialWeightUnit ?? unit,
        }),
      );
      setLogs(newestFirst(await store.listWeightLogs()));
      return true;
    } catch (err) {
      setError(errorMessage(err, "Could not save your details."));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { profile, logs, loading, saving, error, successMsg, logWeight, saveBody, setUpBody };
}
