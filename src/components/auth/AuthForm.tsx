import { useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { PrimaryButton } from "~/components/ui/Button";
import { Field } from "~/components/ui/Input";
import { useStore } from "~/context/StoreContext";

export function AuthForm() {
  const { store, mode } = useStore();
  const [intent, setIntent] = useState<"login" | "create">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(next: "login" | "create") {
    if (busy || next === intent) return;
    setIntent(next);
    setPassword("");
    setError(null);
  }

  async function submit() {
    if (busy || !email || !password || !store) return;
    setBusy(true);
    setError(null);
    try {
      if (intent === "create") {
        await store.signUp(email, password);
      } else {
        await store.logIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">RepLog</h1>
        <p className="text-sm text-neutral-400">
          Log every set. Watch the numbers go up.
        </p>
      </div>

      {mode?.kind === "demo" ? (
        <Banner>
          {mode.reason === "requested"
            ? "Demo mode: accounts and workouts stay in this browser only."
            : "Firebase is not configured yet, so running on the in-browser demo store. Workouts stay on this device."}
        </Banner>
      ) : null}

      {error ? <Banner tone="error">{error}</Banner> : null}

      <div
        role="group"
        aria-label="Log in or create an account"
        className="flex gap-1 rounded-2xl border border-neutral-800 bg-neutral-900 p-1"
      >
        {(
          [
            ["login", "Log in"],
            ["create", "Sign up"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            data-replog={`auth-mode-${key}`}
            aria-pressed={intent === key}
            onClick={() => choose(key)}
            className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all ${
              intent === key ? "bg-lime-400 text-neutral-950 shadow-sm" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
          type="email"
        />
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          autoComplete={intent === "create" ? "new-password" : "current-password"}
          type="password"
        />
        <PrimaryButton
          type="submit"
          dataReplog="auth-submit"
          disabled={busy || !email || !password}
        >
          {busy ? "One moment…" : intent === "create" ? "Create account" : "Log in"}
        </PrimaryButton>
      </form>

      <p className="text-center text-xs text-neutral-500">
        {intent === "create"
          ? "New accounts start with an empty log — your workouts stay private to you."
          : "Your log is private to your account."}
      </p>
    </div>
  );
}
