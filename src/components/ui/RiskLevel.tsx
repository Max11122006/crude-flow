"use client";

import type { RiskLevel } from "@/lib/constants";
import { GlowDot } from "./GlowDot";

const riskColorMap: Record<RiskLevel, "green" | "amber" | "orange" | "red"> = {
  NORMAL: "green",
  ELEVATED: "amber",
  HIGH: "orange",
  CRITICAL: "red",
};

interface RiskLevelBadgeProps {
  level: RiskLevel;
}

export function RiskLevelBadge({ level }: RiskLevelBadgeProps) {
  const color = riskColorMap[level];
  return (
    <div className="flex items-center gap-2">
      <GlowDot color={color} size="md" />
      <span className="font-mono text-xs font-semibold tracking-wider text-text-secondary">
        RISK:
      </span>
      <span
        className={`font-mono text-xs font-bold tracking-wider text-accent-${color}`}
      >
        {level}
      </span>
    </div>
  );
}
