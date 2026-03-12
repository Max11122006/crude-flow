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

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.size === 0) return;
    const buffered = bufferRef.current.size;
    const entries = Array.from(bufferRef.current.entries());
    bufferRef.current.clear();
    setVessels((prev) => {
      const next = new Map(prev);
      for (const [mmsi, vessel] of entries) {
        next.set(mmsi, vessel);
      }
      console.log(`[AIS] Flushed ${buffered} vessels, total: ${next.size}`);
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
