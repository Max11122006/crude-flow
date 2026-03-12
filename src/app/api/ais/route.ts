import { NextResponse } from "next/server";

// This route provides the AIS API key configuration to the client
// The actual WebSocket connection happens client-side to wss://stream.aisstream.io/v0/stream
export async function GET() {
  const apiKey = process.env.AISSTREAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AIS API key not configured" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    apiKey,
    wsUrl: "wss://stream.aisstream.io/v0/stream",
  });
}
