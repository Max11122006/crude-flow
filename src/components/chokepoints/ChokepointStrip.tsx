"use client";

import type { ChokepointStat } from "@/hooks/useChokepointStats";
import type { ConflictZone } from "@/types/conflict";
import type { ThreatLevel } from "@/types/conflict";
import { ChokepointCard } from "./ChokepointCard";
import { isInBounds } from "@/lib/conflict-zones";

interface ChokepointStripProps {
  stats: ChokepointStat[];
  conflictZones: ConflictZone[];
  onNavigate: (center: { lat: number; lng: number }, zoom: number) => void;
}

export function ChokepointStrip({
  stats,
  conflictZones,
  onNavigate,
}: ChokepointStripProps) {
  function getThreatForChokepoint(stat: ChokepointStat): ThreatLevel {
    // Find conflict zones overlapping this chokepoint
    for (const zone of conflictZones) {
      if (
        isInBounds(stat.center.lat, stat.center.lng, zone.bounds)
      ) {
        return zone.threatLevel;
      }
    }
    return "LOW";
  }

  return (
    <div className="flex h-full items-center gap-3 overflow-x-auto px-4">
      <span className="font-mono text-[0.6rem] font-semibold tracking-widest text-text-tertiary">
        CHOKEPOINTS
      </span>
      {stats.map((stat) => (
        <ChokepointCard
          key={stat.id}
          stat={stat}
          threatLevel={getThreatForChokepoint(stat)}
          onClick={onNavigate}
        />
      ))}
    </div>
  );
}
