"use client";

import { useMemo } from "react";
import type { VesselData } from "@/types/vessel";
import { CHOKEPOINTS } from "@/lib/constants";
import { isInBounds } from "@/lib/conflict-zones";

export interface ChokepointStat {
  id: string;
  name: string;
  shortName: string;
  vesselCount: number;
  center: { lat: number; lng: number };
  zoom: number;
}

export function useChokepointStats(vessels: Map<number, VesselData>) {
  return useMemo(() => {
    return CHOKEPOINTS.map((cp) => {
      let count = 0;
      vessels.forEach((vessel) => {
        if (isInBounds(vessel.latitude, vessel.longitude, cp.bounds)) {
          count++;
        }
      });

      return {
        id: cp.id,
        name: cp.name,
        shortName: cp.shortName,
        vesselCount: count,
        center: cp.center,
        zoom: cp.zoom,
      };
    });
  }, [vessels]);
}
