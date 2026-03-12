"use client";

import { Clock } from "@/components/ui/Clock";
import { RiskLevelBadge } from "@/components/ui/RiskLevel";
import { OilTicker } from "@/components/prices/OilTicker";
import { GlowDot } from "@/components/ui/GlowDot";
import type { RiskLevel } from "@/lib/constants";

interface TopBarProps {
  riskLevel: RiskLevel;
  aisConnected: boolean;
}

export function TopBar({ riskLevel, aisConnected }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-default bg-bg-secondary px-4">
      {/* Left: Logo + Risk */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">◉</span>
          <h1 className="font-mono text-sm font-bold tracking-widest text-text-primary">
            PETROL COMMAND
          </h1>
        </div>
        <div className="hidden sm:block">
          <RiskLevelBadge level={riskLevel} />
        </div>
      </div>

      {/* Center: Oil Prices */}
      <div className="hidden lg:block">
        <OilTicker />
      </div>

      {/* Right: AIS status + Clock */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <GlowDot color={aisConnected ? "green" : "red"} />
          <span className="font-mono text-[0.6rem] tracking-wider text-text-tertiary">
            AIS
          </span>
        </div>
        <Clock />
      </div>
    </header>
  );
}
