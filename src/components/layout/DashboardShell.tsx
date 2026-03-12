"use client";

import { useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useAISStream } from "@/hooks/useAISStream";
import { useConflicts } from "@/hooks/useConflicts";
import { useChokepointStats } from "@/hooks/useChokepointStats";
import { calculateGlobalRiskLevel } from "@/lib/conflict-zones";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { GlobalMap } from "@/components/map/GlobalMap";
import { IntelFeed } from "@/components/intel/IntelFeed";
import { FleetStats } from "@/components/stats/FleetStats";

export function DashboardShell() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { vessels, connected } = useAISStream();
  const { data: conflictData } = useConflicts();

  const conflictZones = conflictData?.zones || [];
  const chokepointStats = useChokepointStats(vessels);
  const riskLevel = calculateGlobalRiskLevel(conflictZones);

  const handleNavigate = useCallback(
    (center: { lat: number; lng: number }, zoom: number) => {
      mapRef.current?.flyTo({
        center: [center.lng, center.lat],
        zoom,
        duration: 1500,
      });
    },
    []
  );

  return (
    <div className="flex h-screen flex-col bg-bg-primary bg-dot-pattern">
      {/* Top Bar */}
      <TopBar riskLevel={riskLevel} aisConnected={connected} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map - Hero */}
        <div className="flex-[65] min-w-0">
          <GlobalMap
            vessels={vessels}
            conflictZones={conflictZones}
            mapRef={mapRef}
          />
        </div>

        {/* Right Panel */}
        <div className="flex w-[35%] min-w-[320px] max-w-[500px] flex-col border-l border-border-default">
          {/* Intel Feed */}
          <div className="flex-[3] overflow-hidden panel">
            <IntelFeed />
          </div>

          {/* Fleet Stats */}
          <div className="flex-[1] border-t border-border-default panel">
            <FleetStats vessels={vessels} />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <BottomBar
        chokepointStats={chokepointStats}
        conflictZones={conflictZones}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
