import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  dataReplog?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  dataReplog,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "font-semibold rounded-xl inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-lime-400 text-neutral-950 hover:bg-lime-300 shadow-sm",
    secondary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700",
    ghost: "bg-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
  };

  const sizes = {
    sm: "min-h-9 px-3 text-xs",
    md: "min-h-11 px-4 text-sm w-full",
    lg: "min-h-12 px-5 text-base w-full",
  };

  return (
    <button
      type="button"
      data-replog={dataReplog}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}

export function GhostButton(props: ButtonProps) {
  return <Button variant="ghost" {...props} />;
}
