import { useEffect } from "react";

const SHOW_FOR_MS = 3500;

/** A short "🏆 New PR" celebration at the top of the screen. */
export function PRToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, SHOW_FOR_MS);
    return () => clearTimeout(id);
  }, [message, onDone]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-safe"
    >
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-400/50 bg-neutral-900/95 px-4 py-3 shadow-xl backdrop-blur-lg">
        <span className="text-2xl">🏆</span>
        <p className="min-w-0 text-sm font-bold text-amber-400">{message}</p>
      </div>
    </div>
  );
}
