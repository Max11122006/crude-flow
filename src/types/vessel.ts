export type VesselClass =
  | "vlcc"
  | "suezmax"
  | "aframax"
  | "lng"
  | "vlgc"
  | "lpg"
  | "product_tanker"
  | "tanker_generic";

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
  vesselClass?: VesselClass;
  destination?: string;
  flag?: string;
  imo?: string;
  length?: number; // metres (Dimension A + B)
  beam?: number; // metres (Dimension C + D)
  draught?: number;
  eta?: string;
  callSign?: string;
  imoNumber?: number;
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
