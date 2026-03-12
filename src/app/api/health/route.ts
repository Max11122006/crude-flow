import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      aisstream: !!process.env.AISSTREAM_API_KEY,
      mapbox: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      acled: !!process.env.ACLED_PASSWORD,
      twelvedata: !!process.env.TWELVEDATA_API_KEY,
      gnews: !!process.env.GNEWS_API_KEY,
    },
  });
}
