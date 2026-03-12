import type { AISMessage } from "@/types/ais";
import type { VesselData, VesselStatus } from "@/types/vessel";
import { TANKER_SHIP_TYPES } from "./constants";
import { getConflictZoneForPosition } from "./conflict-zones";
import { classifyVessel } from "./vessel-classifier";

export function isTanker(shipType: number | undefined): boolean {
  if (!shipType) return false;
  return TANKER_SHIP_TYPES.includes(shipType);
}

export function parseAISMessage(msg: AISMessage): VesselData | null {
  const report = msg.Message.PositionReport;
  if (!report) return null;

  const vessel: VesselData = {
    mmsi: msg.MetaData.MMSI,
    name: msg.MetaData.ShipName?.trim() || `MMSI ${msg.MetaData.MMSI}`,
    latitude: report.Latitude,
    longitude: report.Longitude,
    speed: report.Sog,
    course: report.Cog,
    heading: report.TrueHeading,
    navStatus: report.NavigationalStatus,
    timestamp: msg.MetaData.time_utc,
  };

  // Merge enriched static data from server
  if (msg.StaticData) {
    const sd = msg.StaticData;
    if (sd.shipType) vessel.shipType = sd.shipType;
    if (sd.destination) vessel.destination = sd.destination;
    if (sd.length) vessel.length = sd.length;
    if (sd.beam) vessel.beam = sd.beam;
    if (sd.draught) vessel.draught = sd.draught;
    if (sd.eta) vessel.eta = sd.eta;
    if (sd.callSign) vessel.callSign = sd.callSign;
    if (sd.imo) vessel.imoNumber = sd.imo;
  }

  // Classify vessel
  vessel.vesselClass = classifyVessel(vessel);

  return vessel;
}

export function getVesselStatus(vessel: VesselData): VesselStatus {
  // Check for distress (nav status 14 = AIS-SART / distress)
  if (vessel.navStatus === 14 || vessel.navStatus === 2) {
    return "distress";
  }

  // Check if in conflict zone
  const conflictZone = getConflictZoneForPosition(
    vessel.latitude,
    vessel.longitude
  );
  if (conflictZone) {
    return "conflict";
  }

  // Speed-based status
  if (vessel.speed > 1) {
    return "transit";
  }

  return "anchored";
}

export function vesselToGeoJSON(vessels: Map<number, VesselData>) {
  const features = Array.from(vessels.values()).map((vessel) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [vessel.longitude, vessel.latitude] as [number, number],
    },
    properties: {
      ...vessel,
      status: getVesselStatus(vessel),
    },
  }));

  return {
    type: "FeatureCollection" as const,
    features,
  };
}
