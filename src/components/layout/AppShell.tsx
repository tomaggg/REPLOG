import React from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function AppShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 antialiased">
      <div className="mx-auto w-full max-w-md px-4 pt-safe pb-[calc(env(safe-area-inset-bottom)+7rem)]">
        <AppHeader />
        <main>{children}</main>
      </div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
