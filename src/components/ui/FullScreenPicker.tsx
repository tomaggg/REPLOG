import type React from "react";
import { useEffect } from "react";

/**
 * A full-screen overlay for picking something from a long list
 * (exercises, routines). For short forms and confirmations use <Modal> instead.
 *
 *   <FullScreenPicker header={<h2>Pick one</h2>} onClose={close}>
 *     …list…
 *   </FullScreenPicker>
 */
export function FullScreenPicker({
  header,
  onClose,
  children,
}: {
  /** Shown left of the Cancel button — a title or a search box. */
  header: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 px-4 pt-4 pb-3">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl px-3 text-sm font-medium text-neutral-300 hover:text-neutral-100"
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
