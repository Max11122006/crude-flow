"use client";

import type { ChokepointStat } from "@/hooks/useChokepointStats";
import type { ConflictZone } from "@/types/conflict";
import { ChokepointStrip } from "@/components/chokepoints/ChokepointStrip";

interface BottomBarProps {
  chokepointStats: ChokepointStat[];
  conflictZones: ConflictZone[];
  onNavigate: (center: { lat: number; lng: number }, zoom: number) => void;
}

export function BottomBar({
  chokepointStats,
  conflictZones,
  onNavigate,
}: BottomBarProps) {
  return (
    <footer className="h-20 border-t border-border-default bg-bg-secondary">
      <ChokepointStrip
        stats={chokepointStats}
        conflictZones={conflictZones}
        onNavigate={onNavigate}
      />
    </footer>
  );
}
