import WebSocket from "ws";

export const dynamic = "force-dynamic";

// Server-Sent Events proxy for AIS data
// The server connects to aisstream.io via WebSocket and streams parsed vessel data to the browser
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
      function send(data: string) {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Stream closed
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

      ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

      ws.onopen = () => {
        console.log("[AIS SSE] WebSocket connected to aisstream.io");
        ws!.send(
          JSON.stringify({
            APIKey: apiKey,
            BoundingBoxes: [[[-90, -180], [90, 180]]],
            FiltersShipMMSI: [],
            FilterMessageTypes: ["PositionReport"],
          })
        );
        send(JSON.stringify({ type: "connected" }));
      };

      ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : event.data.toString();
          // Forward the raw AIS message to the client
          send(raw);
        } catch {
          // Skip
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
