import { SearchIcon } from "~/components/ui/icons";

export function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 focus-within:border-lime-400">
      <SearchIcon className="h-4 w-4 shrink-0 text-neutral-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search exercises…"
        className="min-h-10 w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-600 outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 text-xs text-neutral-500 hover:text-neutral-300"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
