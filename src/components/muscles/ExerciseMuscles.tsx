import { mixToShares, musclesFor } from "~/lib/muscles";
import { BodyMap } from "./BodyMap";
import { MuscleTags } from "./MuscleTags";

/** Which muscles one exercise works: body map plus tags with each share. */
export function ExerciseMuscles({ exerciseId, group }: { exerciseId: string; group: string | undefined }) {
  const shares = mixToShares(musclesFor(exerciseId, group));
  if (shares.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Muscles worked</p>
      <BodyMap shares={shares} />
      <MuscleTags exerciseId={exerciseId} group={group} />
    </div>
  );
}
