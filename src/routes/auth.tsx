import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthForm } from "~/components/auth/AuthForm";
import { AppShell } from "~/components/layout/AppShell";
import { useAuth } from "~/context/AuthContext";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && user) {
      void navigate({ to: "/" });
    }
  }, [authReady, user, navigate]);

  return (
    <AppShell showNav={false}>
      <AuthForm />
    </AppShell>
  );
}
