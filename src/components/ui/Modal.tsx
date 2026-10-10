import React, { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 pt-safe backdrop-blur-sm sm:items-center sm:p-4">
      {/* Never taller than the screen below the status bar; scrolls if the content is longer */}
      <div className="max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl border border-neutral-800 bg-neutral-900 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
