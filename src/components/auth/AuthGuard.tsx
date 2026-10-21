import { useLocation, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useStore();
  const { user, authReady, profileReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status === "ready" && authReady && !user) {
      // Remember where they were going (e.g. a shared routine link) for after login
      void navigate({ to: "/auth", search: { redirect: location.href } });
    }
  }, [status, authReady, user, navigate, location.href]);

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

  return <>{children}</>;
}
