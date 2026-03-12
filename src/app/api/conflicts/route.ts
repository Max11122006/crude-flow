import { NextResponse } from "next/server";
import { CONFLICT_REGIONS } from "@/lib/constants";
import { calculateThreatLevel } from "@/lib/conflict-zones";
import { getACLEDToken } from "@/lib/acled";
import type { ConflictZone, ConflictEvent } from "@/types/conflict";

let cache: { data: { zones: ConflictZone[] }; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchACLED(
  region: (typeof CONFLICT_REGIONS)[number],
  token: string
): Promise<ConflictEvent[]> {
  try {
    const params = new URLSearchParams({
      event_date: `${getDateDaysAgo(30)}|${getTodayDate()}`,
      event_date_where: "BETWEEN",
      latitude: `${region.bounds.south}|${region.bounds.north}`,
      latitude_where: "BETWEEN",
      longitude: `${region.bounds.west}|${region.bounds.east}`,
      longitude_where: "BETWEEN",
      limit: "50",
    });

    const res = await fetch(
      `https://acleddata.com/api/acled/read?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.data || []).map(
      (event: {
        event_date: string;
        event_type: string;
        notes: string;
        latitude: string;
        longitude: string;
        fatalities: string;
      }) => ({
        date: event.event_date,
        type: event.event_type,
        description: event.notes?.slice(0, 200) || "",
        latitude: parseFloat(event.latitude),
        longitude: parseFloat(event.longitude),
        fatalities: parseInt(event.fatalities) || 0,
      })
    );
  } catch {
    return [];
  }
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }

    const token = await getACLEDToken();
    if (!token) {
      return NextResponse.json({ zones: [] });
    }

    const zones: ConflictZone[] = await Promise.all(
      CONFLICT_REGIONS.map(async (region) => {
        const events = await fetchACLED(region, token);
        return {
          name: region.name,
          threatLevel: calculateThreatLevel(events.length),
          eventCount: events.length,
          recentEvents: events.slice(0, 10),
          bounds: region.bounds,
        };
      })
    );

    const response = { zones };
    cache = { data: response, timestamp: Date.now() };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ zones: [] });
  }
}
