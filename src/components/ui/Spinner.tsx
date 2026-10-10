export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-lime-400" />
      {label ? <p className="text-xs font-semibold text-neutral-400">{label}</p> : null}
    </div>
  );
}
