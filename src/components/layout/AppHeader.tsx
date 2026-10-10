import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Field } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import type { Unit, UserProfile, WeightEntry } from "~/types/workout";

function UserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function AppHeader() {
  const { user, logOut } = useAuth();
  const { unit, setUnit, mode, store } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileOpen || !store) return;
    let cancelled = false;

    (async () => {
      try {
        const [p, logs] = await Promise.all([
          store.getProfile(),
          store.listWeightLogs(),
        ]);
        if (!cancelled) {
          setProfile(p);
          setWeightLogs(logs);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileOpen, store]);

  async function handleLogNewWeight() {
    if (!store || savingWeight) return;
    const w = Number(newWeight.replace(",", "."));
    if (!w || w <= 0) {
      setWeightError("Please enter a valid weight number.");
      return;
    }

    setSavingWeight(true);
    setWeightError(null);

    try {
      await store.logBodyWeight(w, unit);
      if (profile) {
        const updated = { ...profile, bodyWeight: w, updatedAt: Date.now() };
        await store.saveProfile(updated);
        setProfile(updated);
      }
      const updatedLogs = await store.listWeightLogs();
      setWeightLogs(updatedLogs);
      setNewWeight("");
    } catch (err) {
      setWeightError(err instanceof Error ? err.message : "Could not log weight.");
    } finally {
      setSavingWeight(false);
    }
  }

  return (
    <>
      <header className="mb-4 flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold tracking-tight text-neutral-100 hover:opacity-90">
            RepLog
          </Link>
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="User Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-100 active:scale-95"
          >
            <UserIcon className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      {/* Profile & Settings Modal */}
      {profileOpen && user ? (
        <Modal title="Account & Profile" onClose={() => setProfileOpen(false)}>
          <div className="space-y-5 py-2">
            {/* User Info */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Account</p>
              <p className="mt-0.5 truncate text-sm font-medium text-neutral-200">{user.email}</p>
              <p className="mt-1 text-xs text-neutral-500">
                Mode: {mode?.kind === "demo" ? "In-browser Demo" : "Firebase Cloud"}
              </p>
            </div>

            {/* Baseline Profile Stats */}
            {profile ? (
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-500">Current Body Weight</p>
                  <p className="mt-0.5 text-base font-bold text-neutral-100">
                    {profile.bodyWeight ? `${profile.bodyWeight} ${profile.unit}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500">Height</p>
                  <p className="mt-0.5 text-base font-bold text-neutral-100">
                    {profile.height ? `${profile.height} ${profile.unit === "kg" ? "cm" : "in"}` : "—"}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Weight Unit Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400">Weight Unit Preference</label>
              <div
                role="group"
                aria-label="Weight unit selection"
                className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-950 p-1"
              >
                {(["kg", "lb"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      setUnit(u as Unit);
                      if (profile && store) {
                        const updated = { ...profile, unit: u as Unit };
                        setProfile(updated);
                        void store.saveProfile(updated);
                      }
                    }}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      unit === u
                        ? "bg-lime-400 text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {u.toUpperCase()} ({u === "kg" ? "Kilograms" : "Pounds"})
                  </button>
                ))}
              </div>
            </div>

            {/* Log New Body Weight */}
            <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <label className="text-xs font-semibold text-neutral-300">Track New Body Weight</label>
              {weightError ? <Banner tone="error">{weightError}</Banner> : null}
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Field
                    label=""
                    value={newWeight}
                    onChange={setNewWeight}
                    placeholder={`Weight in ${unit}`}
                    inputMode="decimal"
                    suffix={unit}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogNewWeight()}
                  disabled={savingWeight || !newWeight}
                  className="min-h-10 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300 disabled:opacity-50"
                >
                  {savingWeight ? "Saving…" : "Log"}
                </button>
              </div>

              {/* Recent Weight Logs list */}
              {weightLogs.length > 0 ? (
                <div className="mt-3 pt-2 border-t border-neutral-800">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Recent Logs
                  </p>
                  <ul className="max-h-32 overflow-y-auto divide-y divide-neutral-900 text-xs text-neutral-400">
                    {weightLogs.slice(0, 5).map((log) => (
                      <li key={log.id} className="flex justify-between py-1">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="font-semibold text-neutral-200">
                          {log.weight} {log.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Sign Out Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  void logOut();
                }}
                className="flex w-full min-h-11 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 text-sm font-semibold text-red-400 hover:bg-red-950/60 active:scale-[0.99]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
