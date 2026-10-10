import React from "react";

export function Banner({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error" | "success";
}) {
  const tones = {
    info: "border-neutral-800 bg-neutral-900 text-neutral-300",
    error: "border-red-900/50 bg-red-950/40 text-red-300",
    success: "border-lime-900/50 bg-lime-950/40 text-lime-300",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs font-medium leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
}
