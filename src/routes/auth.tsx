import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthForm } from "~/components/auth/AuthForm";
import { AppShell } from "~/components/layout/AppShell";
import { useAuth } from "~/context/AuthContext";

export const Route = createFileRoute("/auth")({
  // ?redirect=/some/page — where to go after logging in
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

/** Only follow redirects within this app, never to another site. */
function isSafeRedirect(path: string | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/auth");
}

function AuthPage() {
  const { user, authReady } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!authReady || !user) return;
    if (isSafeRedirect(redirect)) {
      router.history.push(redirect);
    } else {
      void navigate({ to: "/" });
    }
  }, [authReady, user, redirect, navigate, router]);

  return (
    <AppShell showNav={false}>
      <AuthForm />
    </AppShell>
  );
}
