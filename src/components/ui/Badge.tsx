import React from "react";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "lime" | "outline" | "danger";
}) {
  const styles = {
    default: "bg-neutral-800 text-neutral-300 border border-neutral-700",
    lime: "bg-lime-400/10 text-lime-400 border border-lime-400/20",
    outline: "border border-neutral-800 text-neutral-400",
    danger: "bg-red-400/10 text-red-400 border border-red-400/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
