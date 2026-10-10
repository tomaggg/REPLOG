export function formatDate(timestampMs: number): string {
  const d = new Date(timestampMs);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timestampMs: number): string {
  const d = new Date(timestampMs);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(startMs: number, endMs: number | null): string {
  const end = endMs ?? Date.now();
  const mins = Math.max(1, Math.round((end - startMs) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Elapsed time as a stopwatch: "4:07", or "1:04:07" after an hour. */
export function formatElapsed(startMs: number, nowMs: number): string {
  const totalSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
