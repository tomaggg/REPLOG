import { Link, useLocation } from "@tanstack/react-router";
import {
  DumbbellIcon,
  ExerciseIcon,
  HistoryIcon,
  RoutineIcon,
  ScaleIcon,
} from "~/components/ui/icons";

export function BottomNav() {
  const location = useLocation();

  const tabs = [
    {
      to: "/",
      label: "Today",
      icon: DumbbellIcon,
    },
    {
      to: "/history",
      label: "History",
      icon: HistoryIcon,
    },
    {
      to: "/routines",
      label: "Routines",
      icon: RoutineIcon,
    },
    {
      to: "/exercises",
      label: "Exercises",
      icon: ExerciseIcon,
    },
    {
      to: "/weight",
      label: "BMI",
      icon: ScaleIcon,
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800/90 bg-neutral-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive =
            tab.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.to);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 text-[11px] font-semibold transition-all ${
                isActive
                  ? "bg-neutral-900/80 text-lime-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-lime-400" : "text-neutral-400"}`} />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
