import { Banner } from "~/components/ui/Banner";
import { Field } from "~/components/ui/Input";
import type { Unit } from "~/types/workout";

export function LogWeightForm({
  value,
  onChange,
  onSubmit,
  unit,
  saving,
  error,
  successMsg,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  unit: Unit;
  saving: boolean;
  error: string | null;
  successMsg: string | null;
}) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-200">Log Body Weight</h2>
        <span className="text-xs font-semibold text-neutral-400">
          Logging in: <span className="text-lime-400 font-bold uppercase">{unit}</span>
        </span>
      </div>

      {error ? (
        <div className="mb-3">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}
      {successMsg ? (
        <div className="mb-3">
          <Banner tone="success">{successMsg}</Banner>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Field
            label=""
            value={value}
            onChange={onChange}
            placeholder={`Enter weight in ${unit} (e.g. ${unit === "kg" ? "75.5" : "166.4"})`}
            inputMode="decimal"
            suffix={unit}
          />
        </div>
        <button
          type="submit"
          disabled={saving || !value}
          className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-lime-400 px-5 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save Log"}
        </button>
      </form>
    </div>
  );
}
