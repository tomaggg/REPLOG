import { type ReactNode, useEffect, useRef, useState } from "react";
import { formatElapsed } from "~/components/ui/formatters";
import { alertRestOver } from "~/lib/alert";

/** How long "Rest over" stays on screen before the bar goes away. */
const OVER_MESSAGE_MS = 4000;
/** Don't beep for a rest that ended this long ago (e.g. the phone was locked). */
const LATE_ALERT_MS = 3000;

/**
 * The countdown shown above the bottom bar after a set is ticked off.
 * It works from the end time, so it stays right after a reload or the
 * phone being locked.
 */
export function RestTimerBar({
  endsAt,
  onAdjust,
  onDismiss,
}: {
  endsAt: number;
  /** Add or remove seconds, e.g. +15 / -15 */
  onAdjust: (seconds: number) => void;
  /** Skip the rest, or clear the bar once rest is over */
  onDismiss: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const alerted = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // A new or changed rest can alert again
  useEffect(() => {
    alerted.current = false;
  }, [endsAt]);

  const over = now >= endsAt;

  useEffect(() => {
    if (!over) return;
    if (!alerted.current && Date.now() - endsAt < LATE_ALERT_MS) alertRestOver();
    alerted.current = true;
    const id = setTimeout(onDismiss, Math.max(0, endsAt + OVER_MESSAGE_MS - Date.now()));
    return () => clearTimeout(id);
  }, [over, endsAt, onDismiss]);

  const secondsLeft = Math.ceil((endsAt - now) / 1000);

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] z-30 px-4">
      <div
        className={`mx-auto flex max-w-md items-center gap-2 rounded-2xl border px-4 py-2 shadow-xl backdrop-blur-lg ${
          over ? "border-lime-400/60 bg-lime-400/15" : "border-neutral-700 bg-neutral-900/95"
        }`}
      >
        {over ? (
          <p className="min-h-11 flex-1 content-center text-sm font-bold text-lime-400">
            Rest over - next set!
          </p>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Rest
              </p>
              <p className="text-2xl leading-none font-bold tabular-nums text-neutral-100">
                {formatElapsed(0, secondsLeft * 1000)}
              </p>
            </div>
            <RestButton onClick={() => onAdjust(-15)}>−15s</RestButton>
            <RestButton onClick={() => onAdjust(15)}>+15s</RestButton>
            <RestButton onClick={onDismiss} highlight>
              Skip
            </RestButton>
          </>
        )}
      </div>
    </div>
  );
}

function RestButton({
  onClick,
  highlight = false,
  children,
}: {
  onClick: () => void;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-xl px-3 text-xs font-bold active:scale-95 ${
        highlight
          ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
          : "border border-neutral-700 text-neutral-300 hover:text-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}
