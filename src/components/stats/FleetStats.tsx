"use client";

import type { VesselData } from "@/types/vessel";
import { getVesselStatus } from "@/lib/ais-parser";

interface FleetStatsProps {
  vessels: Map<number, VesselData>;
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl font-bold tabular-nums text-text-primary">
        {value.toLocaleString()}
      </span>
      <span className="font-mono text-[0.6rem] font-semibold tracking-wider text-text-tertiary">
        {label}
      </span>
    </div>
  );
}

export function FleetStats({ vessels }: FleetStatsProps) {
  const stats = {
    total: vessels.size,
    transit: 0,
    anchored: 0,
    conflict: 0,
  };

  const flagCounts: Record<string, number> = {};

  vessels.forEach((vessel) => {
    const status = getVesselStatus(vessel);
    if (status === "transit") stats.transit++;
    else if (status === "anchored") stats.anchored++;
    if (status === "conflict") stats.conflict++;

    if (vessel.flag) {
      flagCounts[vessel.flag] = (flagCounts[vessel.flag] || 0) + 1;
    }
  });

  return (
    <div className="flex h-full flex-col">
      <div className="panel-header">
        <span className="border-l-2 border-accent-cyan pl-2">FLEET STATS</span>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-4 p-4">
        <StatItem label="TRACKED" value={stats.total} />
        <StatItem label="IN TRANSIT" value={stats.transit} />
        <StatItem label="AT ANCHOR" value={stats.anchored} />
        <StatItem label="IN CONFLICT" value={stats.conflict} />
      </div>
    </div>
  );
}
