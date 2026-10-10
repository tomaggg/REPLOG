import { GROUPS } from "~/services/exercises";

export function GroupFilter({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (group: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {GROUPS.map((grp) => {
        const isSelected = selected.toLowerCase() === grp.toLowerCase();
        return (
          <button
            key={grp}
            type="button"
            onClick={() => onSelect(grp)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              isSelected
                ? "bg-lime-400 text-neutral-950 font-bold"
                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            }`}
          >
            {grp}
          </button>
        );
      })}
    </div>
  );
}
