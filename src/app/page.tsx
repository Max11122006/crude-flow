"use client";

import dynamic from "next/dynamic";

const DashboardShell = dynamic(
  () =>
    import("@/components/layout/DashboardShell").then(
      (mod) => mod.DashboardShell
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="mb-4 text-2xl">◉</div>
          <h1 className="font-mono text-sm font-bold tracking-widest text-text-primary">
            CRUDE FLOW
          </h1>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Initializing dashboard...
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <DashboardShell />;
}
