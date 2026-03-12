<p align="center">
  <img src="docs/banner.png" alt="crude-flow banner" width="100%" />
</p>

<h1 align="center">crude-flow</h1>

<p align="center">
  <strong>Real-time global oil shipping intelligence dashboard</strong>
</p>

<p align="center">
  Track live oil tanker movements, monitor conflict zones, watch commodity prices, and stay informed on maritime disruptions — all from a single command-center interface.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#data-sources">Data Sources</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Mapbox_GL-3-blue?logo=mapbox" alt="Mapbox" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" alt="Vercel" />
</p>

---

## What is crude-flow?

crude-flow is a real-time intelligence dashboard that visualises the global oil shipping network. It combines live AIS vessel tracking, commodity market data, conflict zone monitoring, and maritime news into a single dark-themed interface — designed to give you an instant overview of what's moving, what's disrupted, and what's driving oil logistics worldwide.

Built as a student project to explore real-time data visualisation, WebSocket streaming, and geospatial rendering at scale.

---

## Features

### 🗺️ Live Global Map
Interactive dark-themed Mapbox map showing real-time oil tanker positions worldwide. Ships are colour-coded by status, clustered at low zoom levels, and clickable for detailed vessel information including name, flag, speed, destination, and ETA.

### ⚠️ Conflict Zone Overlay
Pulsing threat zones highlighting regions that impact global oil shipping — Red Sea, Black Sea, Persian Gulf, Gulf of Guinea, and South China Sea. Threat levels are derived from ACLED conflict data and updated automatically.

### 📊 Oil Price Ticker
Live Brent Crude, WTI, and Natural Gas prices with percentage changes and 24-hour sparkline charts. Prices flash on significant market moves.

### 📡 Intel Feed
Terminal-styled scrolling news feed aggregating maritime security alerts, oil market updates, and shipping disruption reports. Each item is tagged by severity and filterable by category.

### 🚢 Chokepoint Monitor
Real-time status cards for the world's critical oil transit points — Strait of Hormuz, Suez Canal, Bab el-Mandeb, Strait of Malacca, Cape of Good Hope, Panama Canal, and the Turkish Straits. Shows live vessel counts and congestion status.

### 📈 Fleet Statistics
Glanceable metrics including total tankers tracked, estimated barrels in transit, average fleet speed, and top flag states — all updated in real-time from the AIS data stream.

---

## Screenshots

> _Screenshots will be added after initial build._

<!-- 
<p align="center">
  <img src="docs/screenshot-desktop.png" alt="Desktop view" width="90%" />
</p>
-->

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys (all free tier — see [Data Sources](#data-sources))

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/crude-flow.git
cd crude-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and add your API keys:

```bash
cp .env.example .env.local
```

```env
# Mapbox (client-side, required)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# aisstream.io (server-side)
AISSTREAM_API_KEY=your_aisstream_key

# Alpha Vantage (server-side)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# ACLED (server-side)
ACLED_EMAIL=your_email
ACLED_KEY=your_acled_key

# GNews (server-side)
GNEWS_API_KEY=your_gnews_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## Architecture

```
crude-flow/
├── app/
│   ├── layout.tsx              # Root layout, dark theme
│   ├── page.tsx                # Main dashboard
│   └── api/
│       ├── ships/route.ts      # AIS vessel data proxy
│       ├── oil-prices/route.ts # Commodity price proxy
│       ├── conflicts/route.ts  # ACLED conflict data proxy
│       └── news/route.ts       # News aggregation (GNews + RSS)
├── components/
│   ├── layout/                 # Dashboard, TopBar, Sidebar
│   ├── map/                    # GlobalMap, ShipMarker, ConflictZone, Chokepoints
│   ├── panels/                 # OilTicker, IntelFeed, FleetStats, ChokepointPanel
│   └── ui/                     # StatusBadge, Sparkline, TerminalText
├── hooks/                      # useShipData, useOilPrices, useConflicts, useNewsFeed
├── lib/                        # AIS client, Mapbox config, constants, types
└── public/                     # Ship icons, fonts
```

**Key architectural decisions:**

- **Server-side API proxies** — all external API calls route through Next.js API routes to protect keys and enable caching
- **Single WebSocket connection** — one server-side aisstream.io connection serves all clients, avoiding per-user socket overhead
- **Mapbox GL layers** — ships render as a GeoJSON layer (GPU-accelerated), not individual DOM markers, enabling thousands of simultaneous vessels
- **Aggressive caching** — oil prices (5 min), news (10 min), conflict data (6 hrs) to stay within free tier API limits

---

## Data Sources

All data sources are free for student/personal use:

| Data | Provider | Free Tier | Sign Up |
|------|----------|-----------|---------|
| Ship tracking (AIS) | [aisstream.io](https://aisstream.io) | Unlimited WebSocket streaming | Free account |
| Map tiles | [Mapbox](https://mapbox.com) | 50,000 map loads/month | Free with .edu email |
| Oil prices | [Alpha Vantage](https://alphavantage.co) | 25 requests/day | Free API key |
| Conflict events | [ACLED](https://acleddata.com) | Full access for researchers | Free with .edu email |
| News | [GNews](https://gnews.io) | 100 requests/day | Free API key |
| News (RSS) | Reuters, BBC, Maritime Executive | Unlimited | No key needed |

> **Tip:** Sign up for the [GitHub Student Developer Pack](https://education.github.com/pack) to get free Vercel Pro, DigitalOcean credits, a free domain, and more.

---

## Deployment

crude-flow is built for Vercel:

```bash
npm install -g vercel
vercel
```

1. Push your repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel's project settings
4. Deploy

Vercel will automatically build and deploy on every push to `main`.

---

## Tech Stack

- **[Next.js](https://nextjs.org)** — React framework with API routes and SSR
- **[TypeScript](https://typescriptlang.org)** — Type safety throughout
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first styling
- **[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)** — High-performance interactive maps
- **[Zustand](https://github.com/pmndrs/zustand)** — Lightweight state management
- **[Framer Motion](https://www.framer.com/motion)** — Smooth animations
- **[rss-parser](https://github.com/rbren/rss-parser)** — RSS feed parsing
- **[date-fns](https://date-fns.org)** — Date formatting

---

## Roadmap

- [ ] Core dashboard layout and dark theme
- [ ] Mapbox integration with dark style
- [ ] Live ship tracking via aisstream.io
- [ ] Conflict zone overlays with ACLED data
- [ ] Chokepoint monitoring with vessel counts
- [ ] Oil price ticker with sparklines
- [ ] Intel news feed with severity tagging
- [ ] Fleet statistics panel
- [ ] Responsive tablet/mobile layout
- [ ] Daily briefing auto-summary mode
- [ ] Historical vessel route playback
- [ ] Weather overlay for storm disruptions

---

## Contributing

This is a student project, but contributions are welcome. Feel free to open an issue or submit a PR.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/something-cool`)
3. Commit your changes (`git commit -m 'Add something cool'`)
4. Push to the branch (`git push origin feature/something-cool`)
5. Open a Pull Request

---

## Licence

MIT

---

<p align="center">
  Built with ☕ and live AIS data
</p>
