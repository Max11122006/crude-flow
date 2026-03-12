// AIS ship type codes for tankers
export const TANKER_SHIP_TYPES = [80, 81, 82, 83, 84, 85, 86, 87, 88, 89];

// Chokepoint definitions with bounding boxes
export const CHOKEPOINTS = [
  {
    id: "hormuz",
    name: "Strait of Hormuz",
    shortName: "HORMUZ",
    center: { lat: 26.25, lng: 56.5 },
    bounds: { north: 27.0, south: 25.5, east: 57.5, west: 55.5 },
    zoom: 8,
  },
  {
    id: "suez",
    name: "Suez Canal",
    shortName: "SUEZ",
    center: { lat: 30.55, lng: 32.3 },
    bounds: { north: 31.3, south: 29.8, east: 32.6, west: 32.0 },
    zoom: 9,
  },
  {
    id: "bab-el-mandeb",
    name: "Bab el-Mandeb",
    shortName: "BAB EL-MANDEB",
    center: { lat: 12.5, lng: 43.4 },
    bounds: { north: 13.0, south: 12.0, east: 43.8, west: 43.0 },
    zoom: 9,
  },
  {
    id: "malacca",
    name: "Strait of Malacca",
    shortName: "MALACCA",
    center: { lat: 2.5, lng: 101.75 },
    bounds: { north: 4.0, south: 1.0, east: 104.0, west: 99.5 },
    zoom: 7,
  },
  {
    id: "good-hope",
    name: "Cape of Good Hope",
    shortName: "GOOD HOPE",
    center: { lat: -34.25, lng: 19.0 },
    bounds: { north: -33.5, south: -35.0, east: 20.5, west: 17.5 },
    zoom: 8,
  },
  {
    id: "giuk",
    name: "GIUK Gap",
    shortName: "GIUK GAP",
    center: { lat: 61.0, lng: -15.0 },
    bounds: { north: 65.0, south: 57.0, east: -5.0, west: -25.0 },
    zoom: 5,
  },
] as const;

export type ChokepointId = (typeof CHOKEPOINTS)[number]["id"];

// Conflict zone regions for ACLED filtering
export const CONFLICT_REGIONS = [
  {
    id: "red-sea",
    name: "Red Sea / Houthi Threat Zone",
    bounds: { north: 20.0, south: 12.0, east: 45.0, west: 36.0 },
    color: "#ef4444",
  },
  {
    id: "black-sea",
    name: "Black Sea / Ukraine Corridor",
    bounds: { north: 47.0, south: 41.0, east: 42.0, west: 27.0 },
    color: "#ef4444",
  },
  {
    id: "persian-gulf",
    name: "Persian Gulf / Strait of Hormuz",
    bounds: { north: 30.0, south: 23.0, east: 58.0, west: 47.0 },
    color: "#f97316",
  },
  {
    id: "gulf-of-guinea",
    name: "Gulf of Guinea (Piracy)",
    bounds: { north: 7.0, south: -2.0, east: 10.0, west: -5.0 },
    color: "#f97316",
  },
  {
    id: "somali-basin",
    name: "Somali Basin (Piracy)",
    bounds: { north: 12.0, south: -2.0, east: 55.0, west: 42.0 },
    color: "#f97316",
  },
] as const;

// Navigation status codes
export const NAV_STATUS: Record<number, string> = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuvrability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  14: "AIS-SART",
  15: "Not defined",
};

// Risk level thresholds
export type RiskLevel = "NORMAL" | "ELEVATED" | "HIGH" | "CRITICAL";

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { color: string; bgClass: string }
> = {
  NORMAL: { color: "var(--color-accent-green)", bgClass: "bg-accent-green/20" },
  ELEVATED: { color: "var(--color-accent-amber)", bgClass: "bg-accent-amber/20" },
  HIGH: { color: "var(--color-accent-orange)", bgClass: "bg-accent-orange/20" },
  CRITICAL: { color: "var(--color-accent-red)", bgClass: "bg-accent-red/20" },
};

// Map defaults
export const MAP_DEFAULT_CENTER: [number, number] = [30, 25];
export const MAP_DEFAULT_ZOOM = 2.5;
export const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

// Refresh intervals (ms)
export const REFRESH_OIL_PRICES = 5 * 60 * 1000; // 5 min
export const REFRESH_NEWS = 10 * 60 * 1000; // 10 min
export const REFRESH_CONFLICTS = 60 * 60 * 1000; // 1 hour
export const AIS_BATCH_INTERVAL = 5000; // 5 sec
export const FLEET_STATS_INTERVAL = 30000; // 30 sec
