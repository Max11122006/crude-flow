"use client";

import type { VesselData, VesselClass } from "@/types/vessel";
import { getVesselStatus } from "@/lib/ais-parser";
import { VESSEL_CLASS_CONFIG } from "@/lib/vessel-classifier";

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

  const classCounts: Partial<Record<VesselClass, number>> = {};

  vessels.forEach((vessel) => {
    const status = getVesselStatus(vessel);
    if (status === "transit") stats.transit++;
    else if (status === "anchored") stats.anchored++;
    if (status === "conflict") stats.conflict++;

    const cls = vessel.vesselClass || "tanker_generic";
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  });

  // Sort classes by count descending
  const sortedClasses = (Object.entries(classCounts) as [VesselClass, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex h-full flex-col">
      <div className="panel-header">
        <span className="border-l-2 border-accent-cyan pl-2">FLEET STATS</span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <StatItem label="TRACKED" value={stats.total} />
        <StatItem label="IN TRANSIT" value={stats.transit} />
        <StatItem label="AT ANCHOR" value={stats.anchored} />
        <StatItem label="IN CONFLICT" value={stats.conflict} />
      </div>
      {sortedClasses.length > 0 && (
        <div className="border-t border-white/5 px-4 py-3">
          <div className="mb-2 font-mono text-[0.6rem] font-semibold tracking-wider text-text-tertiary">
            BY CLASS
          </div>
          <div className="space-y-1.5">
            {sortedClasses.map(([cls, count]) => {
              const config = VESSEL_CLASS_CONFIG[cls];
              return (
                <div key={cls} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="font-mono text-[0.65rem] text-text-secondary">
                      {config.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-text-primary">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
