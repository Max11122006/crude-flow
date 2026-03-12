"use client";

import type { VesselData, VesselStatus } from "@/types/vessel";
import { NAV_STATUS } from "@/lib/constants";
import { GlowDot } from "@/components/ui/GlowDot";

interface VesselPopupProps {
  vessel: VesselData & { status: VesselStatus };
}

const statusConfig: Record<VesselStatus, { label: string; color: "blue" | "cyan" | "orange" | "red" }> = {
  transit: { label: "In Transit", color: "blue" },
  anchored: { label: "Anchored", color: "cyan" },
  conflict: { label: "In Conflict Zone", color: "orange" },
  distress: { label: "Distress", color: "red" },
};

export function VesselPopup({ vessel }: VesselPopupProps) {
  const { label, color } = statusConfig[vessel.status];

  return (
    <div className="min-w-[200px] font-sans">
      <div className="mb-2 flex items-center gap-2">
        <GlowDot color={color} size="md" />
        <span className="font-mono text-sm font-bold text-text-primary">
          {vessel.name}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <Row label="STATUS" value={label} />
        <Row label="MMSI" value={vessel.mmsi.toString()} />
        <Row label="SPEED" value={`${vessel.speed.toFixed(1)} kn`} />
        <Row label="COURSE" value={`${vessel.course.toFixed(0)}°`} />
        <Row label="NAV" value={NAV_STATUS[vessel.navStatus] || "Unknown"} />
        {vessel.destination && (
          <Row label="DEST" value={vessel.destination} />
        )}
        {vessel.flag && <Row label="FLAG" value={vessel.flag} />}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-mono text-[0.6rem] tracking-wider text-text-tertiary">
        {label}
      </span>
      <span className="font-mono text-text-secondary">{value}</span>
    </div>
  );
}
