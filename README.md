# RepLog

A workout-tracking PWA: log sets, follow routines, browse an exercise library and track body weight.

Built with React 19, TanStack Start (routing and SSR), Tailwind CSS v4 and Firebase (Auth + Firestore). Deployed on Vercel.

## Running it

```bash
npm install
npm run dev         # start the dev server
npm run typecheck   # check types — run this before committing
npm run build       # production build
```

Without Firebase settings the app runs in **demo mode**: everything is kept in memory and is gone when you reload. You can also force demo mode with `?demo=1` in the URL.

To use Firebase locally, copy `.env.example` to `.env.local` and fill in the four `VITE_FIREBASE_*` values. On Vercel, set the same variables in the project's environment settings.

## Folder layout

```
src/
  routes/        One file per page. The file name is the URL (index.tsx = "/",
                 routines.index.tsx = "/routines"). Pages stay thin: they load data
                 with hooks and arrange components.
  components/
    ui/          Generic building blocks: Button, Card, Modal, FullScreenPicker,
                 Field, Banner, Spinner, icons.tsx.
    layout/      App frame: header, bottom navigation.
    auth/        Login form, onboarding, AuthGuard (redirects if logged out).
    workout/     Logging a workout (home page) and the exercise/routine pickers.
    routines/    Routines page pieces.
    exercises/   Exercise library pieces.
    weight/      Body-weight page pieces.
    history/     Workout history pieces.
  hooks/         React hooks that load and save data (useWorkouts, useRoutines,
                 useActiveWorkout…). Components get data from these.
  lib/           Plain functions with no React and no database: calculations and
                 helpers (lib/workout.ts, lib/weight.ts…). Easy to read and test.
  services/      Talking to the outside world:
                   data-store.ts     the DataStore interface (every data operation)
                   firebase-store.ts the real implementation (Firestore)
                   demo-store.ts     the in-memory implementation (demo mode)
                   exercises.ts      the built-in exercise list
  context/       App-wide state: the current user (AuthContext) and the data
                 store and unit setting (StoreContext).
  types/         Data shapes only (Workout, SetEntry, Routine…). No logic.
```

## How data flows

```
page (routes/)  →  hook (hooks/)  →  useStore().store  →  firebase-store / demo-store
     ↓
components (components/) get data and callbacks as props
```

- Pages and components **never** call Firestore directly. They go through the `DataStore` interface, so demo mode and Firebase behave the same.
- Data is **not** stored in the browser (`localStorage` / `sessionStorage`). Anything that must survive a reload goes through the `DataStore`.
- The workout you're logging is a normal workout with `finishedAt: null`. `useActiveWorkout` loads it, saves changes automatically (about a second after each edit, and immediately when the app goes to the background), and marks it finished.

Firestore layout (all under the signed-in user):

```
users/{uid}/workouts/{workoutId}
users/{uid}/profile/main
users/{uid}/weightLogs/{entryId}
users/{uid}/routines/{routineId}
users/{uid}/customExercises/{exerciseId}
```

## Common tasks

**Add a page**
1. Create `src/routes/my-page.index.tsx` (copy `history.index.tsx` as a starting point). The router picks it up automatically.
2. Wrap the content in `<AuthGuard><AppShell>…</AppShell></AuthGuard>` like the other pages.
3. To show it in the bottom bar, add a tab in `components/layout/BottomNav.tsx`.

**Load a list from the database**
Use the generic hook:
```ts
const { data, loading, error, refresh } = useStoreData((store) => store.listRoutines(), []);
```
If several components need the same data, give it a named hook like `hooks/useRoutines.ts`.

**Store a new kind of data**
1. Add the type to `types/workout.ts`.
2. Add methods to the `DataStore` interface in `services/data-store.ts`.
3. Implement them in **both** `firebase-store.ts` and `demo-store.ts` (TypeScript will tell you if one is missing).
4. Add a hook in `hooks/` for components to use.

**Add an icon**
Add a function to `components/ui/icons.tsx` (copy an existing one and paste the SVG paths), then use it as `<MyIcon className="h-4 w-4" />`.

**Show an error to the user**
Use `errorMessage(err, "Fallback text")` from `lib/errors.ts` and show the result in a `<Banner tone="error">`.

## Conventions

- One component per file, named the same as the file. Keep files short. Past ~200 lines, split it.
- Calculations go in `lib/` as plain functions, not inside components.
- Use the `components/ui/` pieces (Button, Modal, Card, icons) before writing new markup.
- Run `npm run typecheck` before committing.
