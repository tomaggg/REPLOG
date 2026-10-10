import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import type { UserProfile } from "~/types/workout";
import { OnboardingModal } from "./OnboardingModal";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, store } = useStore();
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (status === "ready" && authReady && !user) {
      void navigate({ to: "/auth" });
    }
  }, [status, authReady, user, navigate]);

  useEffect(() => {
    if (!user || !store) return;
    let cancelled = false;

    (async () => {
      try {
        const p = await store.getProfile();
        if (!cancelled) {
          setProfile(p);
          setProfileChecked(true);
        }
      } catch {
        if (!cancelled) setProfileChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, store]);

  if (status === "booting" || !authReady || (user && !profileChecked)) {
    return (
      <AppShell showNav={false}>
        <Spinner label="Checking your session…" />
      </AppShell>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile || !profile.onboarded) {
    return (
      <AppShell showNav={false}>
        <OnboardingModal
          onComplete={() => {
            setProfile({
              unit: "kg",
              bodyWeight: 0,
              height: 0,
              onboarded: true,
              updatedAt: Date.now(),
            });
            setProfileChecked(true);
          }}
        />
      </AppShell>
    );
  }

  return <>{children}</>;
}
