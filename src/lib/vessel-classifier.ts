import type { VesselClass, VesselData } from "@/types/vessel";

export interface VesselClassInfo {
  label: string;
  shortLabel: string;
  color: string;
  iconSize: number;
}

export const VESSEL_CLASS_CONFIG: Record<VesselClass, VesselClassInfo> = {
  vlcc: {
    label: "VLCC",
    shortLabel: "VLCC",
    color: "#f59e0b",
    iconSize: 1.4,
  },
  suezmax: {
    label: "Suezmax",
    shortLabel: "SZMX",
    color: "#f97316",
    iconSize: 1.2,
  },
  aframax: {
    label: "Aframax",
    shortLabel: "AFRX",
    color: "#3b82f6",
    iconSize: 1.1,
  },
  lng: {
    label: "LNG Carrier",
    shortLabel: "LNG",
    color: "#06b6d4",
    iconSize: 1.3,
  },
  vlgc: {
    label: "VLGC",
    shortLabel: "VLGC",
    color: "#8b5cf6",
    iconSize: 1.1,
  },
  lpg: {
    label: "LPG Carrier",
    shortLabel: "LPG",
    color: "#a855f7",
    iconSize: 0.9,
  },
  product_tanker: {
    label: "Product Tanker",
    shortLabel: "PROD",
    color: "#22c55e",
    iconSize: 1.0,
  },
  tanker_generic: {
    label: "Tanker",
    shortLabel: "TNK",
    color: "#64748b",
    iconSize: 0.9,
  },
};

const LNG_PATTERN = /\bLNG\b/i;
const VLGC_PATTERN = /\bVLGC\b/i;
const LPG_PATTERN = /\bLPG\b/i;
const VLCC_PATTERN = /\b(VLCC|ULCC)\b/i;
const SUEZMAX_PATTERN = /\bSUEZMAX\b/i;
const AFRAMAX_PATTERN = /\bAFRAMAX\b/i;
const SHUTTLE_PATTERN = /\b(SHUTTLE|FSO|FPSO)\b/i;
const CRUDE_PATTERN = /\b(CRUDE|OIL|PETRO|PETROLEUM)\b/i;

export function classifyVessel(vessel: VesselData): VesselClass {
  const name = vessel.name.toUpperCase();
  const length = vessel.length || 0;

  // 1. Name keyword matching (highest confidence)
  if (LNG_PATTERN.test(name)) return "lng";
  if (VLGC_PATTERN.test(name)) return length >= 220 ? "vlgc" : "lpg";
  if (LPG_PATTERN.test(name)) return length >= 220 ? "vlgc" : "lpg";
  if (VLCC_PATTERN.test(name)) return "vlcc";
  if (SUEZMAX_PATTERN.test(name)) return "suezmax";
  if (AFRAMAX_PATTERN.test(name)) return "aframax";

  // 2. Ship type code + dimensions
  const shipType = vessel.shipType;

  if (shipType !== undefined && shipType !== null) {
    // Type 84 = Tanker, Hazardous category D (often LNG/LPG)
    if (shipType === 84) {
      if (length >= 280) return "lng";
      if (length >= 200) return "vlgc";
      return "lpg";
    }

    // Type 81 = Tanker, Hazardous category A (crude oil)
    if (shipType === 81 || CRUDE_PATTERN.test(name) || SHUTTLE_PATTERN.test(name)) {
      if (length >= 300) return "vlcc";
      if (length >= 250) return "suezmax";
      if (length >= 220) return "aframax";
      if (length >= 100) return "product_tanker";
      return "tanker_generic";
    }

    // Type 82 = Tanker, Hazardous category B
    if (shipType === 82) {
      if (length >= 170) return "product_tanker";
      return "tanker_generic";
    }
  }

  // 3. Dimension-based fallback for any tanker type
  if (length >= 300) return "vlcc";
  if (length >= 250) return "suezmax";
  if (length >= 220) return "aframax";
  if (length >= 100) return "product_tanker";

  return "tanker_generic";
}
