import { Card } from "~/components/ui/Card";
import { RoutineAddIcon } from "~/components/ui/icons";

/** Shown on the Routines page when the user has no routines yet. */
export function EmptyRoutines({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-lime-400">
        <RoutineAddIcon className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-neutral-200">No workout routines yet</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
        Build your favorite Push, Pull, Leg, or Full-body split routine templates and jump straight into training.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-lime-400 hover:bg-neutral-700"
      >
        Create your first routine
      </button>
    </Card>
  );
}
