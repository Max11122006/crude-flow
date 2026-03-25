"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { AISMessage } from "@/types/ais";
import type { VesselData } from "@/types/vessel";
import { parseAISMessage } from "@/lib/ais-parser";
import { AIS_BATCH_INTERVAL } from "@/lib/constants";

interface UseAISStreamReturn {
  vessels: Map<number, VesselData>;
  connected: boolean;
  vesselCount: number;
}

export function useAISStream(): UseAISStreamReturn {
  const [vessels, setVessels] = useState<Map<number, VesselData>>(new Map());
  const [connected, setConnected] = useState(false);
  const bufferRef = useRef<Map<number, VesselData>>(new Map());
  const removalsRef = useRef<Set<number>>(new Set());

  const flushBuffer = useCallback(() => {
    const hasUpdates = bufferRef.current.size > 0;
    const hasRemovals = removalsRef.current.size > 0;
    if (!hasUpdates && !hasRemovals) return;

    const entries = Array.from(bufferRef.current.entries());
    const removals = new Set(removalsRef.current);
    bufferRef.current.clear();
    removalsRef.current.clear();

    setVessels((prev) => {
      const next = new Map(prev);

      // Remove confirmed non-tankers
      for (const mmsi of removals) {
        next.delete(mmsi);
      }

      // Add/update vessels, preserving static data from previous entries
      for (const [mmsi, vessel] of entries) {
        const existing = next.get(mmsi);
        if (existing) {
          // Preserve static fields if new report lacks them
          if (!vessel.shipType && existing.shipType) vessel.shipType = existing.shipType;
          if (!vessel.vesselClass && existing.vesselClass) vessel.vesselClass = existing.vesselClass;
          if (!vessel.destination && existing.destination) vessel.destination = existing.destination;
          if (!vessel.length && existing.length) vessel.length = existing.length;
          if (!vessel.beam && existing.beam) vessel.beam = existing.beam;
          if (!vessel.draught && existing.draught) vessel.draught = existing.draught;
          if (!vessel.eta && existing.eta) vessel.eta = existing.eta;
          if (!vessel.callSign && existing.callSign) vessel.callSign = existing.callSign;
          if (!vessel.imoNumber && existing.imoNumber) vessel.imoNumber = existing.imoNumber;
        }
        next.set(mmsi, vessel);
      }

      console.log(`[AIS] Flushed ${entries.length} updates, ${removals.size} removals, total: ${next.size}`);
      return next;
    });
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let flushInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;

    function connect() {
      if (!alive) return;

      console.log("[AIS] Connecting to SSE stream...");
      eventSource = new EventSource("/api/ais");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle control messages
          if (data.type === "connected") {
            console.log("[AIS] Stream connected");
            setConnected(true);
            return;
          }
          if (data.type === "disconnected") {
            console.log("[AIS] Stream disconnected");
            setConnected(false);
            return;
          }
          if (data.type === "remove") {
            removalsRef.current.add(data.mmsi);
            return;
          }

          // Parse AIS vessel message
          const msg = data as AISMessage;
          const vessel = parseAISMessage(msg);
          if (vessel) {
            bufferRef.current.set(vessel.mmsi, vessel);
          }
        } catch {
          // Skip malformed messages
        }
      };

      eventSource.onerror = () => {
        console.log("[AIS] SSE error, reconnecting...");
        setConnected(false);
        eventSource?.close();
        eventSource = null;
        if (alive) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    }

    connect();
    flushInterval = setInterval(flushBuffer, AIS_BATCH_INTERVAL);

    return () => {
      alive = false;
      eventSource?.close();
      if (flushInterval) clearInterval(flushInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [flushBuffer]);

  return { vessels, connected, vesselCount: vessels.size };
}
