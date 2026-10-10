import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
