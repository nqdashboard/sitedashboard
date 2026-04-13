# Operations Room Dashboard

A real-time operations room dashboard for North Quay Holdings, designed to display full-screen on a wall-mounted TV via Google Meet Series One. Hosted on Cloudflare Pages with a server-side feed aggregator.

## Architecture

```
Cloudflare Pages
├── Static site (index.html, app.js, style.css)
└── functions/api/feeds.js → GET /api/feeds
```

The Pages Function aggregates 15+ structured alert sources server-side, caches the result at the edge for 3 minutes, and returns a single JSON response. The dashboard fetches this every 2 minutes. Items older than 7 days are automatically filtered out.

## Features

- **World clocks** — Panama City, London, Rome, Lusaka (west to east)
- **Areas of Interest** — Three country-specific alert panels (UK, Zambia, Panama) powered by GDELT event detection, ACLED conflict data, and ReliefWeb humanitarian alerts
- **Global Geopolitical & Conflict Feed** — structured event data only (no news articles, no analysis):
  - GDELT DOC API (global conflict event detection)
  - GDACS (disaster alerts, Orange/Red severity only)
  - USGS (earthquakes M4.5+)
  - ACLED (armed conflict events — requires API key)
  - ReliefWeb API v2 (humanitarian alerts — requires appname)
- **Cyber Threat Feed** — GSOC-grade threat intelligence:
  - CISA KEV (actively exploited vulnerabilities)
  - NCSC UK/GCHQ (nation-state threat alerts)
  - ThreatFox (live IOCs with malware attribution)
  - Feodo Tracker (botnet C2 servers)
  - BleepingComputer & The Hacker News (incident reporting)
  - SANS ISC InfoCon (global threat level indicator)
  - OpenCTI-inspired stats bar (KEV/NCSC/IOC/C2 counts)
- **Country flags** — auto-detected from article text (40+ countries)
- **2-minute refresh** — newest items at top, static display, no scrolling

## Local Development

```bash
npm install
npm run dev
```

This runs `wrangler pages dev` which serves the static site and the Pages Function locally.

## Deployment (Cloudflare Pages)

1. Push this repo to GitHub.
2. In Cloudflare dashboard: **Pages > Create project > Connect to Git**.
3. Select the repository.
4. Build settings:
   - **Build command:** `npm install`
   - **Build output directory:** `.`
5. Deploy.

The `functions/` directory is automatically detected as Pages Functions.

## Environment Variables

Set these in Cloudflare Pages > Settings > Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ACLED_API_KEY` | Optional | ACLED API key from [acleddata.com/register](https://acleddata.com/register/) |
| `ACLED_EMAIL` | Optional | Email used to register for ACLED |
| `RELIEFWEB_APPNAME` | Optional | Approved appname from [apidoc.reliefweb.int](https://apidoc.reliefweb.int/parameters#appname) |

## Data Sources

### AOI Panels (country-specific event alerts)
| Source | Type | Countries | Auth |
|--------|------|-----------|------|
| GDELT DOC API | Event detection (per-country queries) | UK, Zambia, Panama | No |
| ACLED | Armed conflict events (filtered by country) | All | Yes (free) |
| ReliefWeb API v2 | Humanitarian alerts (filtered by country) | All | Yes (free) |

### Global Panel (structured event data)
| Source | Type | Auth |
|--------|------|------|
| GDELT DOC API | Conflict event detection | No |
| GDACS | Disaster alerts (Orange/Red only) | No |
| USGS | Earthquakes M4.5+ | No |
| ACLED | Armed conflict events | Yes (free) |
| ReliefWeb API v2 | Humanitarian alerts | Yes (free) |

### Cyber Panel (threat intelligence)
| Source | Type | Auth |
|--------|------|------|
| CISA KEV | Actively exploited CVEs | No |
| NCSC UK (GCHQ) | Nation-state threat alerts | No |
| ThreatFox (abuse.ch) | Live IOCs with malware attribution | No |
| Feodo Tracker (abuse.ch) | Botnet C2 servers | No |
| BleepingComputer | Security incident reporting | No |
| The Hacker News | Security incident reporting | No |
| SANS ISC InfoCon | Global threat level indicator | No |

## Future Enhancements

With the Cloudflare Worker backend in place, these sources could be added:
- **ACLED + ReliefWeb** — enable by setting environment variables
- **AlienVault OTX** — free TAXII/STIX threat intelligence feed (requires API key)
- **MeteoAlarm** — EU/EEA severe weather warnings (free API)
- **NASA FIRMS** — satellite fire/thermal anomaly detection
- **UCDP** — academic conflict data (requires auth token header)

## Tech Stack

- HTML + vanilla JS + CSS (no framework)
- Cloudflare Pages Functions (server-side feed aggregation)
- fast-xml-parser (RSS/Atom parsing in Worker)
- Fonts: Inter (Google Fonts)
