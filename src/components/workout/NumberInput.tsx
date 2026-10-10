import { useEffect, useRef, useState } from "react";

/** Parse a typed number ("12,5" works too). Anything invalid or negative becomes 0. */
function parseNum(v: string): number {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function NumberInput({
  value,
  onCommit,
  inputMode,
  ariaLabel,
  className = "",
}: {
  value: number;
  onCommit: (n: number) => void;
  inputMode: "decimal" | "numeric";
  ariaLabel: string;
  className?: string;
}) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  const lastValue = useRef(value);

  // Only overwrite the text when the value changed from outside this input.
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setText(value === 0 ? "" : String(value));
    }
  }, [value]);

  return (
    <input
      aria-label={ariaLabel}
      value={text}
      inputMode={inputMode}
      enterKeyHint="done"
      placeholder="0"
      onChange={(e) => {
        const next = e.target.value.replace(/[^0-9.,]/g, "");
        setText(next);
        lastValue.current = parseNum(next);
        onCommit(parseNum(next));
      }}
      onBlur={() => {
        const n = parseNum(text);
        setText(n === 0 ? "" : String(n));
      }}
      className={`min-h-12 w-full min-w-0 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-center text-lg font-semibold text-neutral-100 outline-none focus:border-lime-400 ${className}`}
    />
  );
}
