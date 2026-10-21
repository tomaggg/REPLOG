import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { UserIcon } from "~/components/ui/icons";
import { Modal } from "~/components/ui/Modal";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import { patchProfile } from "~/services/profile";

export function AppHeader() {
  const { user, logOut } = useAuth();
  const { unit, setUnit, store } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

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
            </div>

            <Link
              to="/weight"
              onClick={() => setProfileOpen(false)}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm font-semibold text-neutral-200 hover:border-neutral-700"
            >
              <span>Body profile, weight & BMI</span>
              <span className="text-lime-400">›</span>
            </Link>

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
                      setUnit(u);
                      if (store) void patchProfile(store, { unit: u });
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
