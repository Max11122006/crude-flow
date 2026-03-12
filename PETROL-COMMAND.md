# PETROL COMMAND — Global Oil Shipping Intelligence Dashboard

## Project Overview

A real-time global oil shipping intelligence dashboard that visualises live tanker positions, conflict zones, oil prices, chokepoint traffic, and breaking maritime news. The aesthetic is a clean, dark command-center dashboard — modern and minimal, not over-the-top military, but with that unmistakable operations-room feel. Think Bloomberg Terminal meets NATO situation room.

**Live site:** Hosted on Vercel  
**Target:** Desktop-priority, basic mobile support

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | API routes for proxying external APIs, keeping keys server-side |
| Styling | **Tailwind CSS** | Dark theme, utility-first, CSS variables for theming |
| Map | **Mapbox GL JS** | Dark base style, custom layers, GeoJSON overlays, animated markers |
| Language | **TypeScript** | Strict mode throughout |
| Deployment | **Vercel** | Free via GitHub Student Pack (Pro tier) |
| State | **React Query (TanStack Query)** | For API caching, refetching intervals, stale-while-revalidate |
| Charts | **Recharts** or **Lightweight Charts (TradingView)** | For oil price sparklines and mini-charts |

---

## Data Sources & API Keys

All free tier. API keys stored in `.env.local` and accessed only via Next.js API routes (never exposed client-side).

| Data | Provider | Auth | Free Tier | Endpoint Pattern |
|---|---|---|---|---|
| **Live ship positions** | [aisstream.io](https://aisstream.io) | API key (free signup) | Unlimited WebSocket streaming | WebSocket `wss://stream.aisstream.io/v0/stream` |
| **Map tiles** | [Mapbox](https://mapbox.com) | Access token (free, .edu email) | 50,000 web loads/month | `mapboxgl.Map` init |
| **Conflict events** | [ACLED](https://acleddata.com) | OAuth token (free, .edu email) | Free public access tier | REST `https://api.acleddata.com/acled/read` |
| **Oil prices** | [Twelve Data](https://twelvedata.com) | API key (free signup) | 800 req/day | REST `https://api.twelvedata.com/time_series` |
| **News/Intel** | [GNews](https://gnews.io) | API key (free signup) | 100 req/day | REST `https://gnews.io/api/v4/search` |
| **News (supplement)** | RSS feeds (Reuters, BBC, Maritime Executive) | None | Unlimited | Parsed server-side via `rss-parser` |

### API Key Environment Variables

```env
# .env.local
AISSTREAM_API_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
ACLED_EMAIL=
ACLED_ACCESS_KEY=
TWELVEDATA_API_KEY=
GNEWS_API_KEY=
```

---

## Design System

### Aesthetic Direction

**Clean dark command center.** Not Call of Duty with scan lines and glitch effects — more like a high-end Bloomberg/Reuters operations dashboard. Dark backgrounds, subtle grid lines, glowing accent colours for status indicators.

### Colour Palette

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e17;       /* Deep navy-black */
  --bg-secondary: #111827;     /* Panel backgrounds */
  --bg-tertiary: #1a2235;      /* Card/module backgrounds */
  --bg-hover: #1f2a3f;         /* Hover states */

  /* Borders */
  --border-default: #1e293b;   /* Subtle panel borders */
  --border-active: #334155;    /* Active/focused borders */

  /* Text */
  --text-primary: #e2e8f0;     /* Primary text */
  --text-secondary: #94a3b8;   /* Secondary/muted text */
  --text-tertiary: #64748b;    /* Timestamps, labels */

  /* Status / Accents */
  --accent-amber: #f59e0b;     /* Oil/commodity colour, warnings */
  --accent-red: #ef4444;       /* Conflict zones, critical alerts */
  --accent-green: #22c55e;     /* Safe/normal status, positive change */
  --accent-blue: #3b82f6;      /* Ship markers, info, links */
  --accent-cyan: #06b6d4;      /* Chokepoints, secondary info */
  --accent-orange: #f97316;    /* Elevated threat level */

  /* Glow effects (used sparingly) */
  --glow-amber: 0 0 12px rgba(245, 158, 11, 0.3);
  --glow-red: 0 0 12px rgba(239, 68, 68, 0.3);
  --glow-blue: 0 0 12px rgba(59, 130, 246, 0.2);
}
```

### Typography

- **Headings / HUD labels:** `JetBrains Mono` or `IBM Plex Mono` — monospaced, techy, readable
- **Body text / News feed:** `IBM Plex Sans` — clean, professional, pairs well with mono
- **Numbers / Data:** `Tabular figures` from the mono font — so digits align in columns

### Visual Language

- Panels have subtle `border: 1px solid var(--border-default)` with slight `border-radius: 8px`
- Module headers use uppercase monospaced labels with a coloured left-border accent
- Status indicators are small glowing dots (CSS `box-shadow` glow)
- Numbers that change should have a brief colour flash animation (green for up, red for down)
- The map should feel like the hero — everything else frames it
- Subtle grid/dot pattern on the main background for depth

---

## Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR: Logo | Global Risk Level | Oil Prices Ticker | Clock  │
├────────────────────────────────────────┬────────────────────────┤
│                                        │                        │
│                                        │   INTEL FEED           │
│          GLOBAL MAP                    │   (scrolling news/     │
│          (Mapbox GL JS)                │    alerts panel)       │
│          ~65% width                    │   ~35% width           │
│                                        │                        │
│                                        │                        │
│                                        ├────────────────────────┤
│                                        │                        │
│                                        │   FLEET STATS          │
│                                        │   (summary numbers)    │
├────────────────────────────────────────┴────────────────────────┤
│  BOTTOM BAR: Chokepoint Status Strip                            │
│  [Hormuz ✓] [Suez ⚠] [Malacca ✓] [Bab el-Mandeb ⚠] [GOOD HOPE]│
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (simplified)

On mobile (<768px), stack vertically:
1. Oil price ticker (horizontal scroll)
2. Map (full width, reduced height)
3. Chokepoint status (horizontal scroll cards)
4. Intel feed (full width)
5. Fleet stats (grid)

---

## Module Specifications

### 1. Top Bar

**Height:** ~56px, fixed to top  
**Contains:**

- **Logo/Title:** "PETROL COMMAND" in monospace, with a small oil-drop or radar icon
- **Global Risk Level:** A single badge showing overall threat to oil shipping. Values: `NORMAL` (green) / `ELEVATED` (amber) / `HIGH` (orange) / `CRITICAL` (red). Derived from conflict data — if active conflicts exist in 2+ chokepoint regions, escalate the level
- **Oil Price Ticker:** Scrolling or static display of:
  - Brent Crude (USD/barrel) with % change and mini sparkline
  - WTI Crude (USD/barrel) with % change and mini sparkline
  - Natural Gas if space permits
- **UTC Clock:** Current UTC time, updating every second. Format: `12 MAR 2026 — 14:32:07 UTC`

**Data refresh:** Oil prices every 5 minutes (to stay within Twelve Data limits). Clock is client-side.

### 2. Global Map (Hero Module)

**Size:** ~65% of viewport width, full remaining height  
**Map provider:** Mapbox GL JS with `dark-v11` style

#### Ship Layer
- Connect to aisstream.io via WebSocket through a Next.js API route (or direct client-side WSS connection)
- Filter for oil tankers only (ship type codes: 80-89 in AIS data = tankers)
- Render ships as small directional arrows/chevrons coloured by status:
  - `var(--accent-blue)` — In transit (speed > 1 knot)
  - `var(--accent-cyan)` — Anchored/stationary
  - `var(--accent-orange)` — In a conflict zone
  - `var(--accent-red)` — Distress or abnormal navigation status
- On hover: tooltip with vessel name, flag, speed, destination
- On click: expanded panel with full vessel details (name, IMO, flag state, cargo type, origin, destination, ETA)
- Use Mapbox `GeoJSON` source updated in real-time as AIS messages arrive
- Cluster markers when zoomed out (Mapbox built-in clustering)

#### Shipping Lanes Layer (toggle-able)
- Overlay major oil shipping routes as subtle dashed/glowing lines:
  - Persian Gulf → Strait of Hormuz → Indian Ocean → Suez Canal → Mediterranean
  - Persian Gulf → Strait of Hormuz → Cape of Good Hope → Atlantic
  - West Africa → Atlantic → US Gulf / Europe
  - Russia → Baltic → Europe
  - Southeast Asia → Malacca Strait → East Asia
- Use GeoJSON LineStrings, styled with a subtle animated dash effect

#### Conflict Zones Layer (toggle-able)
- Pulsing semi-transparent red polygons over active conflict/threat areas
- Data from ACLED API, filtered to maritime-relevant regions
- Hardcoded bounding regions for key areas, enriched with ACLED event counts:
  - Red Sea / Houthi threat zone
  - Black Sea / Ukraine corridor
  - Persian Gulf / Strait of Hormuz
  - Gulf of Guinea (piracy)
  - Somali Basin (piracy)
- Each zone shows a threat level badge on the map
- Click a zone → side panel shows recent ACLED events in that area

#### Map Controls
- Zoom +/- 
- Layer toggle buttons (top-right): Ships | Lanes | Conflicts | Weather (stretch)
- Fullscreen toggle
- Reset view button (zooms back to global view)

### 3. Intel Feed (Right Panel)

**Width:** ~35% of viewport  
**Style:** Terminal/feed aesthetic — dark background, entries stacked vertically with timestamps

Each entry contains:
- **Timestamp** in muted monospace: `14:23 UTC`
- **Severity tag** as a small coloured badge:
  - `INFO` (blue) — routine news
  - `WARNING` (amber) — disruptions, sanctions, weather
  - `ALERT` (orange) — military incidents, piracy
  - `CRITICAL` (red) — attacks on vessels, major escalations
- **Headline** — bold, 1-2 lines
- **Source** — muted text (Reuters, BBC, Maritime Executive, etc.)
- Click to expand → shows summary paragraph and link to source

**Data sources:**
- GNews API: search queries like `"oil shipping"`, `"tanker attack"`, `"Strait of Hormuz"`, `"Suez Canal"`, `"oil pipeline"`, `"OPEC"`
- RSS feeds parsed server-side for supplementary coverage
- Severity tagging: keyword-based classification on the server (e.g., "attack", "missile", "explosion" → CRITICAL; "sanctions", "delay", "storm" → WARNING)

**Refresh:** Every 10 minutes (GNews limit-aware). New entries animate in from the top with a subtle slide-down.

**Max displayed:** 50 most recent entries, with infinite scroll loading older ones.

### 4. Chokepoint Status Strip (Bottom Bar)

**Height:** ~80px, fixed to bottom  
**Layout:** Horizontal strip with 5-6 cards, one per chokepoint

Each chokepoint card shows:
- **Name:** e.g., "STRAIT OF HORMUZ"
- **Status icon:** ✓ (green) / ⚠ (amber) / ✕ (red)
- **Vessel count:** number of tankers currently in the bounding box (derived from AIS data)
- **Threat indicator:** based on ACLED conflict events in the area

**Chokepoints to track:**

| Chokepoint | Approximate Bounding Box (lat/lng) |
|---|---|
| Strait of Hormuz | 25.5-27.0°N, 55.5-57.5°E |
| Suez Canal | 29.8-31.3°N, 32.0-32.6°E |
| Bab el-Mandeb | 12.0-13.0°N, 43.0-43.8°E |
| Strait of Malacca | 1.0-4.0°N, 99.5-104.0°E |
| Cape of Good Hope | -35.0 to -33.5°S, 17.5-20.5°E |
| GIUK Gap | 57.0-65.0°N, -25.0 to -5.0°W |

**Interaction:** Click a chokepoint → map flies to that location and zooms in.

### 5. Fleet Stats Panel

**Location:** Below the Intel Feed on the right side  
**Style:** Grid of big glowing numbers

Stats to display:
- **Tankers Tracked:** total count of tanker vessels currently being received via AIS
- **In Transit:** count where speed > 1 knot
- **At Anchor:** count where speed ≤ 1 knot
- **In Conflict Zones:** count of vessels inside defined conflict zone bounding boxes
- **Top Flag States:** mini bar chart or ranked list of top 3-5 flag states by vessel count

**Refresh:** Real-time, derived from the AIS WebSocket stream. Recalculate every 30 seconds.

---

## Project Structure

```
petrol-command/
├── .env.local                    # API keys (gitignored)
├── .env.example                  # Template for required keys
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── fonts/                    # Self-hosted JetBrains Mono, IBM Plex Sans
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, font loading, metadata
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── globals.css           # CSS variables, Tailwind base, custom utilities
│   │   └── api/
│   │       ├── ais/
│   │       │   └── route.ts      # WebSocket proxy or REST endpoint for AIS data
│   │       ├── oil-prices/
│   │       │   └── route.ts      # Twelve Data proxy
│   │       ├── news/
│   │       │   └── route.ts      # GNews + RSS aggregation
│   │       ├── conflicts/
│   │       │   └── route.ts      # ACLED data proxy
│   │       └── health/
│   │           └── route.ts      # Health check endpoint
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomBar.tsx
│   │   │   └── DashboardShell.tsx
│   │   ├── map/
│   │   │   ├── GlobalMap.tsx       # Main Mapbox component
│   │   │   ├── ShipLayer.tsx       # AIS vessel rendering
│   │   │   ├── ConflictLayer.tsx   # Conflict zone polygons
│   │   │   ├── ShippingLanes.tsx   # Route overlays
│   │   │   ├── MapControls.tsx     # Zoom, layer toggles
│   │   │   └── VesselPopup.tsx     # Click/hover vessel detail
│   │   ├── intel/
│   │   │   ├── IntelFeed.tsx       # News/alert feed
│   │   │   └── IntelEntry.tsx      # Individual feed item
│   │   ├── prices/
│   │   │   ├── OilTicker.tsx       # Price display in top bar
│   │   │   └── Sparkline.tsx       # Mini price chart
│   │   ├── chokepoints/
│   │   │   ├── ChokepointStrip.tsx # Bottom bar container
│   │   │   └── ChokepointCard.tsx  # Individual chokepoint
│   │   ├── stats/
│   │   │   └── FleetStats.tsx      # Fleet summary numbers
│   │   └── ui/
│   │       ├── StatusBadge.tsx     # Reusable status indicator
│   │       ├── GlowDot.tsx        # Animated status dot
│   │       ├── Clock.tsx          # UTC clock
│   │       └── RiskLevel.tsx      # Global risk badge
│   ├── hooks/
│   │   ├── useAISStream.ts        # WebSocket connection to aisstream.io
│   │   ├── useOilPrices.ts        # TanStack Query hook for prices
│   │   ├── useNewsFeed.ts         # TanStack Query hook for news
│   │   ├── useConflicts.ts        # TanStack Query hook for ACLED data
│   │   └── useChokepointStats.ts  # Derived stats from AIS data
│   ├── lib/
│   │   ├── ais-parser.ts          # Parse AIS messages, filter tankers
│   │   ├── conflict-zones.ts      # Bounding box definitions, threat calc
│   │   ├── news-classifier.ts     # Keyword-based severity tagging
│   │   ├── shipping-lanes.ts      # GeoJSON for major routes
│   │   └── constants.ts           # Ship type codes, chokepoint coords
│   └── types/
│       ├── ais.ts                 # AIS message types
│       ├── vessel.ts              # Vessel data model
│       ├── news.ts                # News entry types
│       ├── conflict.ts            # ACLED event types
│       └── prices.ts              # Oil price types
└── README.md
```

---

## API Route Specifications

### `GET /api/oil-prices`

Proxies Twelve Data API. Returns current Brent + WTI prices with historical data for sparklines.

```typescript
// Response shape
{
  brent: { price: number; change: number; changePercent: number; sparkline: number[] },
  wti: { price: number; change: number; changePercent: number; sparkline: number[] },
  lastUpdated: string // ISO timestamp
}
```

Cache on server for 5 minutes to respect rate limits. Use Next.js `revalidate` or in-memory cache.

### `GET /api/news`

Aggregates GNews API results + RSS feeds. Classifies severity. Returns sorted entries.

```typescript
// Response shape
{
  entries: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
    severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  }>
}
```

Cache for 10 minutes. Keyword queries rotate to spread across rate limits.

### `GET /api/conflicts`

Fetches recent ACLED events filtered to maritime-relevant regions. Returns geo-located events.

```typescript
// Response shape
{
  zones: Array<{
    name: string;
    threatLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    eventCount: number;
    recentEvents: Array<{
      date: string;
      type: string;
      description: string;
      latitude: number;
      longitude: number;
      fatalities: number;
    }>;
    bounds: { north: number; south: number; east: number; west: number };
  }>
}
```

Cache for 1 hour (ACLED updates weekly).

### AIS WebSocket Connection

Client-side WebSocket to `wss://stream.aisstream.io/v0/stream`. On connection, send subscription message:

```json
{
  "APIKey": "<key>",
  "BoundingBoxes": [[[-90, -180], [90, 180]]],
  "FiltersShipMMSI": [],
  "FilterMessageTypes": ["PositionReport"]
}
```

Filter client-side for ship types 80-89 (tankers). Store vessels in a `Map<mmsi, VesselData>` and update Mapbox source every 5 seconds (batch updates for performance).

---

## Performance Considerations

- **AIS Data Volume:** aisstream.io sends a LOT of messages. Filter aggressively:
  - Only process ship types 80-89 (tankers)
  - Throttle Mapbox source updates to every 5 seconds (batch incoming positions)
  - Cap at ~5,000 displayed vessels; beyond that, cluster
- **Map Rendering:** Use Mapbox's built-in clustering for zoomed-out views. Switch from clusters to individual markers at zoom level ~6
- **API Rate Limits:** All external calls go through server-side API routes with in-memory caching. Use `Cache-Control` headers and TanStack Query's `staleTime`
- **Bundle Size:** Mapbox GL JS is heavy (~200kb gzipped). Lazy-load the map component with `next/dynamic`

---

## Environment Setup Instructions

1. Clone the repo
2. Copy `.env.example` to `.env.local`
3. Sign up for free accounts and fill in keys:
   - **aisstream.io** → Create account → API key in dashboard
   - **Mapbox** → Sign up with .edu email → Access token in account settings
   - **ACLED** → Register with .edu email → Generate access key in portal
   - **Twelve Data** → Sign up → API key in dashboard
   - **GNews** → Sign up → API key in dashboard
4. `npm install`
5. `npm run dev`
6. Open `http://localhost:3000`

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add all `.env.local` variables to Vercel Environment Variables (Settings → Environment Variables)
4. Deploy — Vercel auto-detects Next.js
5. (Optional) Add custom domain from Namecheap via GitHub Student Pack

---

## Build Order (Recommended Implementation Sequence)

### Phase 1: Foundation
1. Scaffold Next.js project with TypeScript + Tailwind
2. Set up design system (CSS variables, fonts, base styles)
3. Build `DashboardShell` layout with placeholder panels
4. Get Mapbox rendering with dark style

### Phase 2: Live Ship Data
5. Connect to aisstream.io WebSocket
6. Filter for tankers, parse AIS messages
7. Render vessels on Mapbox as GeoJSON layer
8. Add vessel hover tooltips and click popups
9. Implement marker clustering

### Phase 3: Context Layers
10. Add conflict zone polygons from ACLED data
11. Add shipping lane overlays
12. Build map layer toggle controls
13. Implement chokepoint bounding boxes and vessel counting

### Phase 4: Data Panels
14. Build Oil Price Ticker with Twelve Data
15. Build Intel Feed with GNews + RSS
16. Build Fleet Stats panel (derived from AIS data)
17. Build Chokepoint Status Strip

### Phase 5: Polish
18. Add animations (number transitions, feed entries sliding in, vessel movement interpolation)
19. Global Risk Level calculation logic
20. Responsive mobile layout
21. Error states and loading skeletons
22. Performance optimisation (memo, throttle, lazy loading)

---

## Stretch Goals (Post-V1)

- [ ] Weather overlay (OpenWeatherMap) showing storms that could impact routes
- [ ] Historical incident markers (past attacks, groundings, spills)
- [ ] "Briefing mode" — auto-generated daily summary of global oil shipping status
- [ ] Audio alert sounds for CRITICAL intel feed entries
- [ ] Vessel search (by name, IMO, MMSI)
- [ ] Time-lapse playback of ship movements over past 24h
- [ ] OPEC+ production status indicator
- [ ] Dark/light theme toggle (though dark is primary)
