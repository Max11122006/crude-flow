import { CONFLICT_REGIONS } from "./constants";
import type { ConflictZone } from "@/types/conflict";
import type { ThreatLevel } from "@/types/conflict";
import type { RiskLevel } from "./constants";

export function isInBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export function getConflictZoneForPosition(
  lat: number,
  lng: number
): (typeof CONFLICT_REGIONS)[number] | null {
  for (const region of CONFLICT_REGIONS) {
    if (isInBounds(lat, lng, region.bounds)) {
      return region;
    }
  }
  return null;
}

export function calculateThreatLevel(eventCount: number): ThreatLevel {
  if (eventCount >= 20) return "CRITICAL";
  if (eventCount >= 10) return "HIGH";
  if (eventCount >= 3) return "ELEVATED";
  return "LOW";
}

export function calculateGlobalRiskLevel(zones: ConflictZone[]): RiskLevel {
  const highThreatZones = zones.filter(
    (z) => z.threatLevel === "HIGH" || z.threatLevel === "CRITICAL"
  ).length;

  if (highThreatZones >= 3) return "CRITICAL";
  if (highThreatZones >= 2) return "HIGH";
  if (highThreatZones >= 1) return "ELEVATED";
  return "NORMAL";
}
