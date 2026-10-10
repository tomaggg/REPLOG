import { useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import { OnboardingModal } from "./OnboardingModal";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useStore();
  const { user, authReady, profile, profileReady, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "ready" && authReady && !user) {
      void navigate({ to: "/auth" });
    }
  }, [status, authReady, user, navigate]);

  if (status === "booting" || !authReady || (user && !profileReady)) {
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
          onComplete={async () => {
            await refreshProfile();
          }}
        />
      </AppShell>
    );
  }

  return <>{children}</>;
}
