export interface AISMessage {
  MessageType: string;
  MetaData: {
    MMSI: number;
    MMSI_String: string;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
  Message: {
    PositionReport?: PositionReport;
    ShipStaticData?: ShipStaticDataReport;
  };
  StaticData?: EnrichedStaticData; // Enriched by server-side merge
}

export interface PositionReport {
  Cog: number; // Course over ground
  CommunicationState: number;
  Latitude: number;
  Longitude: number;
  MessageID: number;
  NavigationalStatus: number;
  PositionAccuracy: boolean;
  Raim: boolean;
  RateOfTurn: number;
  RepeatIndicator: number;
  Sog: number; // Speed over ground
  Spare: number;
  SpecialManoeuvreIndicator: number;
  Timestamp: number;
  TrueHeading: number;
  UserID: number; // MMSI
  Valid: boolean;
}

export interface ShipStaticDataReport {
  AisVersion: number;
  CallSign: string;
  Destination: string;
  Dimension: { A: number; B: number; C: number; D: number };
  Dte: boolean;
  Eta: { Month: number; Day: number; Hour: number; Minute: number };
  FixType: number;
  ImoNumber: number;
  MaximumStaticDraught: number;
  MessageID: number;
  RepeatIndicator: number;
  Spare: boolean;
  Type: number;
  UserID: number;
  Valid: boolean;
}

export interface EnrichedStaticData {
  shipType: number | null;
  destination: string;
  length: number;
  beam: number;
  draught: number;
  eta: string;
  imo: number;
  callSign: string;
}

export interface AISSubscription {
  APIKey: string;
  BoundingBoxes: number[][][];
  FiltersShipMMSI?: string[];
  FilterMessageTypes?: string[];
}
