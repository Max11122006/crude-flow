import WebSocket from "ws";

export const dynamic = "force-dynamic";

const TANKER_TYPES = new Set([80, 81, 82, 83, 84, 85, 86, 87, 88, 89]);
const MAX_STATIC_CACHE = 10000;

interface StaticCache {
  shipType: number;
  destination: string;
  length: number;
  beam: number;
  draught: number;
  eta: string;
  imo: number;
  callSign: string;
  updatedAt: number;
}

function formatEta(eta: { Month: number; Day: number; Hour: number; Minute: number }): string {
  if (!eta || (eta.Month === 0 && eta.Day === 0)) return "";
  const month = String(eta.Month).padStart(2, "0");
  const day = String(eta.Day).padStart(2, "0");
  const hour = String(eta.Hour).padStart(2, "0");
  const minute = String(eta.Minute).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

export async function GET() {
  const apiKey = process.env.AISSTREAM_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AIS API key not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let ws: WebSocket | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Server-side static data cache
      const staticCache = new Map<number, StaticCache>();
      // Track which MMSIs we've confirmed as non-tanker
      const nonTankerMMSIs = new Set<number>();

      function send(data: string) {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          cleanup();
        }
      }

      function cleanup() {
        if (ws) {
          ws.onclose = null;
          ws.close();
          ws = null;
        }
      }

      function evictOldEntries() {
        if (staticCache.size <= MAX_STATIC_CACHE) return;
        // Remove oldest entries
        const entries = Array.from(staticCache.entries());
        entries.sort((a, b) => a[1].updatedAt - b[1].updatedAt);
        const toRemove = entries.slice(0, entries.length - MAX_STATIC_CACHE);
        for (const [mmsi] of toRemove) {
          staticCache.delete(mmsi);
        }
      }

      ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

      ws.onopen = () => {
        console.log("[AIS SSE] WebSocket connected to aisstream.io");
        ws!.send(
          JSON.stringify({
            APIKey: apiKey,
            BoundingBoxes: [[[-90, -180], [90, 180]]],
            FiltersShipMMSI: [],
            FilterMessageTypes: ["PositionReport", "ShipStaticData"],
          })
        );
        send(JSON.stringify({ type: "connected" }));
      };

      ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : event.data.toString();
          const msg = JSON.parse(raw);
          const mmsi = msg.MetaData?.MMSI;
          if (!mmsi) return;

          if (msg.MessageType === "ShipStaticData" && msg.Message?.ShipStaticData) {
            const sd = msg.Message.ShipStaticData;
            const shipType = sd.Type;

            // If confirmed non-tanker, skip
            if (shipType && !TANKER_TYPES.has(shipType)) {
              nonTankerMMSIs.add(mmsi);
              // Tell client to remove this vessel if they had it
              send(JSON.stringify({ type: "remove", mmsi }));
              return;
            }

            // Cache static data
            const dim = sd.Dimension || { A: 0, B: 0, C: 0, D: 0 };
            staticCache.set(mmsi, {
              shipType: shipType || 0,
              destination: sd.Destination?.trim() || "",
              length: (dim.A || 0) + (dim.B || 0),
              beam: (dim.C || 0) + (dim.D || 0),
              draught: sd.MaximumStaticDraught || 0,
              eta: formatEta(sd.Eta),
              imo: sd.ImoNumber || 0,
              callSign: sd.CallSign?.trim() || "",
              updatedAt: Date.now(),
            });

            evictOldEntries();
            return;
          }

          if (msg.MessageType === "PositionReport") {
            // Skip known non-tankers
            if (nonTankerMMSIs.has(mmsi)) return;

            // Look up static data and enrich
            const cached = staticCache.get(mmsi);
            if (cached) {
              msg.StaticData = {
                shipType: cached.shipType,
                destination: cached.destination,
                length: cached.length,
                beam: cached.beam,
                draught: cached.draught,
                eta: cached.eta,
                imo: cached.imo,
                callSign: cached.callSign,
              };
            }

            // Forward enriched message to client
            send(JSON.stringify(msg));
          }
        } catch {
          // Skip malformed
        }
      };

      ws.onclose = () => {
        console.log("[AIS SSE] WebSocket closed");
        send(JSON.stringify({ type: "disconnected" }));
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      ws.onerror = (err) => {
        console.error("[AIS SSE] WebSocket error:", err.message);
      };
    },
    cancel() {
      if (ws) {
        ws.onclose = null;
        ws.close();
        ws = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
