"use client";

import type { ChokepointStat } from "@/hooks/useChokepointStats";
import type { ThreatLevel } from "@/types/conflict";
import { GlowDot } from "@/components/ui/GlowDot";

interface ChokepointCardProps {
  stat: ChokepointStat;
  threatLevel?: ThreatLevel;
  onClick: (center: { lat: number; lng: number }, zoom: number) => void;
}

const threatToColor: Record<ThreatLevel, "green" | "amber" | "orange" | "red"> = {
  LOW: "green",
  ELEVATED: "amber",
  HIGH: "orange",
  CRITICAL: "red",
};

const threatToIcon: Record<ThreatLevel, string> = {
  LOW: "✓",
  ELEVATED: "⚠",
  HIGH: "⚠",
  CRITICAL: "✕",
};

export function ChokepointCard({ stat, threatLevel = "LOW", onClick }: ChokepointCardProps) {
  const color = threatToColor[threatLevel];
  const icon = threatToIcon[threatLevel];

  return (
    <button
      onClick={() => onClick(stat.center, stat.zoom)}
      className="flex min-w-[160px] flex-shrink-0 flex-col gap-1 rounded-lg border border-border-default bg-bg-tertiary p-3 transition-all hover:border-border-active hover:bg-bg-hover"
    >
      <div className="flex items-center gap-2">
        <GlowDot color={color} />
        <span className="font-mono text-[0.65rem] font-semibold tracking-wider text-text-secondary">
          {stat.shortName}
        </span>
        <span className={`text-xs text-accent-${color}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg font-bold tabular-nums text-text-primary">
          {stat.vesselCount}
        </span>
        <span className="font-mono text-[0.6rem] text-text-tertiary">
          vessels
        </span>
      </div>
    </button>
  );
}
