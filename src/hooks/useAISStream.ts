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
  const wsRef = useRef<WebSocket | null>(null);
  const bufferRef = useRef<Map<number, VesselData>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.size === 0) return;
    setVessels((prev) => {
      const next = new Map(prev);
      bufferRef.current.forEach((vessel, mmsi) => {
        next.set(mmsi, vessel);
      });
      bufferRef.current.clear();
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const res = await fetch("/api/ais");
        if (!res.ok) return;
        const { apiKey, wsUrl } = await res.json();

        if (cancelled) return;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          ws.send(
            JSON.stringify({
              APIKey: apiKey,
              BoundingBoxes: [[[-90, -180], [90, 180]]],
              FiltersShipMMSI: [],
              FilterMessageTypes: ["PositionReport"],
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg: AISMessage = JSON.parse(event.data);
            const vessel = parseAISMessage(msg);
            if (vessel) {
              // Filter for tankers (ship type 80-89) or accept all if no ship type info
              bufferRef.current.set(vessel.mmsi, vessel);
            }
          } catch {
            // Skip malformed messages
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // Reconnect after 5 seconds
          if (!cancelled) {
            setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!cancelled) {
          setTimeout(connect, 5000);
        }
      }
    }

    connect();

    // Batch update interval
    intervalRef.current = setInterval(flushBuffer, AIS_BATCH_INTERVAL);

    return () => {
      cancelled = true;
      wsRef.current?.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flushBuffer]);

  return { vessels, connected, vesselCount: vessels.size };
}
