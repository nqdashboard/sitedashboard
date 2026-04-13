# North Quay Operations Room

A real-time operations dashboard for North Quay Holdings, designed for full-screen display on a wall-mounted TV via Google Meet Series One. Hosted on Cloudflare Pages.

## Architecture

```
Cloudflare Pages
├── Static site (index.html, app.js, style.css)
└── functions/api/feeds.js → GET /api/feeds
```

The Pages Function aggregates 20+ data sources server-side, caches the result at the edge for 3 minutes (`s-maxage=180`), and returns a single JSON response. The frontend fetches this every 2 minutes with exponential backoff on failure. A hard page reload occurs every 60 minutes (deferred until the screen is active).

## Dashboard Panels

- **Areas of Interest** — Three country panels (United Kingdom, Zambia, Panama) showing conflict, humanitarian, and security alerts specific to each country
- **Global Geopolitical & Conflict Feed** — Worldwide conflict events, disaster alerts, earthquakes, humanitarian reports
- **Cyber Threat Feed** — Actively exploited vulnerabilities, IOCs, botnet C2 servers, data breach notifications, security advisories. Horizontal auto-scroll with priority-based slot allocation (KEV/NCSC > Breaches > IOC/C2 > News)
- **World Clocks** — Panama City, London, Rome, Lusaka
- **SANS InfoCon** — Global cyber threat level indicator (green/yellow/orange/red)
- **Cyber Stats Bar** — OpenCTI-inspired entity counts (KEV, NCSC, BREACH, IOC, C2)

## Visual Features

- Age-based dimming: items >4h at 70% opacity, >12h at 50% (geopolitical panels only; cyber stays full opacity)
- ACLED fatality highlight: items with `[X killed]` get a bright red accent
- GDELT rate-limit detection: amber pill warns when GDELT is unavailable
- Country flags auto-detected from article text (40+ countries)
- Source type badges with colour-coded left borders (KEV, NCSC, IOC, C2, BREACH, CONFLICT, DISASTER, QUAKE, ACLED, ALERT)

## Data Sources

### Areas of Interest — UK Panel

| Source | Type | Endpoint | Auth |
|--------|------|----------|------|
| GDELT DOC API | Event detection | `api.gdeltproject.org/api/v2/doc/doc` | No |
| ACLED | Armed conflict events | `api.acleddata.com/acled/read` | Yes (free) |
| ReliefWeb API v2 | Humanitarian alerts | `api.reliefweb.int/v2/reports` | Yes (free) |

### Areas of Interest — Zambia Panel

| Source | Type | Endpoint | Auth |
|--------|------|----------|------|
| GDELT DOC API | Event detection | `api.gdeltproject.org/api/v2/doc/doc` | No |
| ACLED | Armed conflict events | `api.acleddata.com/acled/read` | Yes (free) |
| ReliefWeb API v2 | Humanitarian alerts | `api.reliefweb.int/v2/reports` | Yes (free) |
| FCDO Travel Advice | UK gov travel advisory | `gov.uk/foreign-travel-advice/zambia.atom` | No |
| UN News Africa | Regional conflict/humanitarian | `news.un.org/.../region/africa/feed/rss.xml` | No |

### Areas of Interest — Panama Panel

| Source | Type | Endpoint | Auth |
|--------|------|----------|------|
| GDELT DOC API | Event detection | `api.gdeltproject.org/api/v2/doc/doc` | No |
| ACLED | Armed conflict events | `api.acleddata.com/acled/read` | Yes (free) |
| ReliefWeb API v2 | Humanitarian alerts | `api.reliefweb.int/v2/reports` | Yes (free) |
| FCDO Travel Advice | UK gov travel advisory | `gov.uk/foreign-travel-advice/panama.atom` | No |
| Panama Canal Authority | Operational alerts | `pancanal.com/en/news/feed/` | No |

### Global Geopolitical & Conflict Feed

| Source | Type | Endpoint | Auth |
|--------|------|----------|------|
| GDELT DOC API | Global conflict event detection | `api.gdeltproject.org/api/v2/doc/doc` | No |
| GDACS | Disaster alerts (Orange/Red only) | `gdacs.org/xml/rss.xml` | No |
| USGS | Earthquakes M4.5+ | `earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson` | No |
| ACLED | Armed conflict events | `api.acleddata.com/acled/read` | Yes (free) |
| ReliefWeb API v2 | Humanitarian situation reports | `api.reliefweb.int/v2/reports` | Yes (free) |
| UN News Peace & Security | Conflict/ceasefire/military updates | `news.un.org/.../topic/peace-and-security/feed/rss.xml` | No |
| ICRC | Red Cross conflict zone updates | `icrc.org/en/rss/news` | No |

### Cyber Threat Feed

| Source | Type | Endpoint | Auth |
|--------|------|----------|------|
| CISA KEV | Actively exploited CVEs | `cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json` | No |
| NCSC UK (GCHQ) | Nation-state threat alerts | `ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml` | No |
| SANS ISC InfoCon | Global threat level | `isc.sans.edu/api/infocon?json` | No |
| ThreatFox (abuse.ch) | IOCs with malware attribution | `threatfox.abuse.ch/export/json/recent/` | Yes (free) |
| Feodo Tracker (abuse.ch) | Botnet C2 servers | `feodotracker.abuse.ch/downloads/ipblocklist.json` | Yes (free) |
| URLhaus (abuse.ch) | Malicious URLs | `urlhaus-api.abuse.ch/v1/urls/recent/` | Yes (free) |
| HIBP | Data breach notifications | `feeds.feedburner.com/HaveIBeenPwnedLatestBreaches` | No |
| DataBreaches.net | Breach incident reports | `databreaches.net/feed/` | No |
| CERT-EU | EU vulnerability advisories | `cert.europa.eu/publications/security-advisories-rss` | No |
| BleepingComputer | Security incident reporting | `bleepingcomputer.com/feed/` | No |
| The Hacker News | Security incident reporting | `feeds.feedburner.com/TheHackersNews` | No |
| Mastodon infosec.exchange | Practitioner threat intel | `infosec.exchange/api/v1/timelines/public?local=true` | No |

### Cyber Priority Tiers

Items are allocated to the cyber panel in priority order:
1. **Tier 1** (up to 10 slots): CISA KEV + NCSC UK
2. **Tier 2** (up to 8 slots): HIBP breach notifications
3. **Tier 3** (up to 12 slots): ThreatFox IOCs + Feodo C2 + URLhaus
4. **Tier 4** (remaining slots): BleepingComputer, Hacker News, CERT-EU, DataBreaches.net, Mastodon

## Content Filtering

- **NON_GEOPOLITICAL blocklist** — regex filter (~150 terms) removes sports, entertainment, celebrity, and lifestyle content from GDELT results
- **Mastodon keyword filter** — only posts matching security terms (CVE, exploit, malware, ransomware, breach, APT, etc.) are included
- **UN Africa filter** — only items mentioning Zambia are routed to the Zambia AOI panel
- **GDACS severity filter** — only Orange and Red alerts are displayed
- **Deduplication** — normalised title matching prevents duplicate items across sources

## Local Development

```bash
npm install
npm run dev
```

Runs `wrangler pages dev` on port 3000. Create a `.dev.vars` file for API keys:

```
RELIEFWEB_APPNAME=your-approved-appname
ABUSECH_AUTH_KEY=your-key
ACLED_API_KEY=your-key
ACLED_EMAIL=your-email
```

## Deployment (Cloudflare Pages)

1. Push to a private GitHub repo
2. Cloudflare dashboard: **Pages > Create project > Connect to Git**
3. Build settings:
   - **Framework preset:** None
   - **Build command:** `npm install`
   - **Build output directory:** `/`
4. Add environment variables (see below)
5. Deploy

Cloudflare auto-detects the `functions/` directory as Pages Functions.

## Environment Variables

Set in Cloudflare Pages > Settings > Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `RELIEFWEB_APPNAME` | Recommended | Approved appname from [apidoc.reliefweb.int](https://apidoc.reliefweb.int) |
| `ABUSECH_AUTH_KEY` | Recommended | Free key from [auth.abuse.ch](https://auth.abuse.ch) (ThreatFox, Feodo, URLhaus) |
| `ACLED_API_KEY` | Optional | Free key from [acleddata.com](https://acleddata.com/register/) |
| `ACLED_EMAIL` | Optional | Email used to register for ACLED |

## Tech Stack

- HTML + vanilla JS + CSS (no framework, no build step for frontend)
- Cloudflare Pages Functions (server-side feed aggregation)
- `fast-xml-parser` (RSS/Atom parsing in Workers runtime)
- Fonts: Inter (Google Fonts)
- Edge caching: `s-maxage=180, max-age=60` on API response; per-upstream `cf.cacheTtl` on fetch calls
