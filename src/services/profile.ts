import type { UserProfile } from "~/types/workout";
import type { DataStore } from "./data-store";

/**
 * Change some profile fields and save. Reads the latest profile first, so
 * changes made elsewhere (another page, another device) aren't overwritten,
 * and creates the profile if this user doesn't have one yet.
 */
export async function patchProfile(
  store: DataStore,
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  const latest = await store.getProfile();
  const next: UserProfile = { unit: "kg", ...latest, ...patch, updatedAt: Date.now() };
  await store.saveProfile(next);
  return next;
}
