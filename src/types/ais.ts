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
  // Enriched by server-side merge
  StaticData?: EnrichedStaticData;
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
  Dimension: {
    A: number; // bow to reference point
    B: number; // reference point to stern
    C: number; // port side
    D: number; // starboard side
  };
  Dte: boolean;
  Eta: {
    Month: number;
    Day: number;
    Hour: number;
    Minute: number;
  };
  FixType: number;
  ImoNumber: number;
  MaximumStaticDraught: number;
  MessageID: number;
  RepeatIndicator: number;
  Spare: boolean;
  Type: number; // AIS ship type code
  UserID: number; // MMSI
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
