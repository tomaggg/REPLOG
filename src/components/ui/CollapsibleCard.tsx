import { type ReactNode, useId, useState } from "react";
import { ChevronDownIcon } from "./icons";

/** A card that starts collapsed: the header (title + one-line summary) toggles the body. */
export function CollapsibleCard({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  /** Shown under the title, so the key info is visible while collapsed */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</p>
          {summary ? <p className="mt-1 truncate text-sm font-semibold text-neutral-200">{summary}</p> : null}
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div id={bodyId} className="border-t border-neutral-800/80 p-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
