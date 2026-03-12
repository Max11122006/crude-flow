"use client";

import type { Severity } from "@/types/news";
import type { ThreatLevel } from "@/types/conflict";

type BadgeType = Severity | ThreatLevel;

const badgeConfig: Record<string, { bg: string; text: string }> = {
  // Severity badges
  INFO: { bg: "bg-accent-blue/20", text: "text-accent-blue" },
  WARNING: { bg: "bg-accent-amber/20", text: "text-accent-amber" },
  ALERT: { bg: "bg-accent-orange/20", text: "text-accent-orange" },
  CRITICAL: { bg: "bg-accent-red/20", text: "text-accent-red" },
  // Threat level badges
  LOW: { bg: "bg-accent-green/20", text: "text-accent-green" },
  ELEVATED: { bg: "bg-accent-amber/20", text: "text-accent-amber" },
  HIGH: { bg: "bg-accent-orange/20", text: "text-accent-orange" },
  // NORMAL reuses green
  NORMAL: { bg: "bg-accent-green/20", text: "text-accent-green" },
};

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
}

export function StatusBadge({ type, label }: StatusBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.INFO;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider ${config.bg} ${config.text}`}
    >
      {label || type}
    </span>
  );
}
