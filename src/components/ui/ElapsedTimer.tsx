import { useEffect, useState } from "react";
import { formatElapsed } from "./formatters";

/** A live stopwatch counting up from `startedAt`, updated every second. */
export function ElapsedTimer({
  startedAt,
  className = "",
}: {
  startedAt: number;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // tabular-nums keeps every digit the same width so the text doesn't jiggle
  return (
    <span className={`tabular-nums ${className}`}>{formatElapsed(startedAt, now)}</span>
  );
}
