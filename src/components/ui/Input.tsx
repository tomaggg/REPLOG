import React from "react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  suffix?: string;
  dataReplog?: string;
}

export function Field({
  label,
  value,
  onChange,
  suffix,
  dataReplog,
  type = "text",
  className = "",
  ...props
}: FieldProps) {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-xs font-semibold text-neutral-400">{label}</span> : null}
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          data-replog={dataReplog}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-base sm:text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 ${
            suffix ? "pr-10" : ""
          } ${className}`}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 text-xs font-semibold text-neutral-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}
