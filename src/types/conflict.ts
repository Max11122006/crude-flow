export type ThreatLevel = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface ConflictEvent {
  date: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  fatalities: number;
}

export interface ConflictZone {
  name: string;
  threatLevel: ThreatLevel;
  eventCount: number;
  recentEvents: ConflictEvent[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface ConflictsResponse {
  zones: ConflictZone[];
}
