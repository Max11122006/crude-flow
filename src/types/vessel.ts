export interface VesselData {
  mmsi: number;
  name: string;
  latitude: number;
  longitude: number;
  speed: number; // knots (SOG)
  course: number; // degrees (COG)
  heading: number; // true heading
  navStatus: number;
  timestamp: string;
  shipType?: number;
  destination?: string;
  flag?: string;
  imo?: string;
}

export type VesselStatus = "transit" | "anchored" | "conflict" | "distress";

export interface VesselGeoJSON {
  type: "FeatureCollection";
  features: VesselFeature[];
}

export interface VesselFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: VesselData & {
    status: VesselStatus;
  };
}
