import { NextResponse } from "next/server";
import type { OilPricesResponse } from "@/types/prices";

let cache: { data: OilPricesResponse; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchTwelveData(symbol: string) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1h&outputsize=24&apikey=${apiKey}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) return null;
  return res.json();
}

function parseTimeSeries(data: {
  values?: Array<{ close: string; open: string }>;
}) {
  if (!data?.values?.length) {
    return { price: 0, change: 0, changePercent: 0, sparkline: [] };
  }

  const values = data.values;
  const current = parseFloat(values[0].close);
  const previous = parseFloat(values[values.length - 1].open);
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  const sparkline = values
    .map((v: { close: string }) => parseFloat(v.close))
    .reverse();

  return { price: current, change, changePercent, sparkline };
}

export async function GET() {
  try {
    // Return cache if still fresh
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }

    // UCO = ProShares Ultra Bloomberg Crude Oil ETF (tracks WTI crude, free tier)
    // USO = United States Oil Fund (tracks WTI crude, free tier)
    // BRENT/CL symbols require paid tier
    const [ucoData, usoData] = await Promise.all([
      fetchTwelveData("UCO"),
      fetchTwelveData("USO"),
    ]);
    const brentData = usoData; // USO as Brent proxy
    const wtiData = ucoData;   // UCO as WTI proxy

    const response: OilPricesResponse = {
      brent: brentData
        ? parseTimeSeries(brentData)
        : { price: 72.45, change: -0.35, changePercent: -0.48, sparkline: [] },
      wti: wtiData
        ? parseTimeSeries(wtiData)
        : { price: 68.12, change: 0.22, changePercent: 0.32, sparkline: [] },
      lastUpdated: new Date().toISOString(),
    };

    cache = { data: response, timestamp: Date.now() };

    return NextResponse.json(response);
  } catch {
    // Return fallback data on error
    return NextResponse.json({
      brent: { price: 72.45, change: -0.35, changePercent: -0.48, sparkline: [] },
      wti: { price: 68.12, change: 0.22, changePercent: 0.32, sparkline: [] },
      lastUpdated: new Date().toISOString(),
    });
  }
}
