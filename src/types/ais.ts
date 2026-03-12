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
  };
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

export interface AISSubscription {
  APIKey: string;
  BoundingBoxes: number[][][];
  FiltersShipMMSI?: string[];
  FilterMessageTypes?: string[];
}
