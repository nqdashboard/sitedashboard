import { XMLParser } from 'fast-xml-parser';

/* ── GDELT — event detection queries ───────────────────── */

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_OPTS = '&mode=artlist&format=json&sourcelang=english';

const GDELT_EVENTS = '(attack OR explosion OR protest OR troops OR military OR police OR terror OR flood OR fire OR shooting OR crisis OR disaster OR earthquake OR conflict OR emergency OR killed OR bombing OR clashes OR riot OR collapse)';

const GDELT_GLOBAL_QUERY = '(airstrike OR ceasefire OR shelling OR troops OR invasion OR coup OR uprising OR clashes OR missile OR drone strike OR military operation OR sanctions OR blockade)';
const GDELT_GLOBAL_URL = `${GDELT_BASE}?query=${encodeURIComponent(GDELT_GLOBAL_QUERY)}${GDELT_OPTS}&maxrecords=25`;

const GDELT_UK_QUERY = '(Britain OR "United Kingdom" OR London OR England OR Scotland OR Wales OR Belfast OR Manchester OR Birmingham) ' + GDELT_EVENTS;
const GDELT_UK_URL = `${GDELT_BASE}?query=${encodeURIComponent(GDELT_UK_QUERY)}${GDELT_OPTS}&maxrecords=15`;

const GDELT_ZAMBIA_QUERY = '(Zambia OR Lusaka OR Copperbelt OR Livingstone OR Kitwe OR Ndola) ' + GDELT_EVENTS;
const GDELT_ZAMBIA_URL = `${GDELT_BASE}?query=${encodeURIComponent(GDELT_ZAMBIA_QUERY)}${GDELT_OPTS}&maxrecords=15`;

const GDELT_PANAMA_QUERY = '(Panama OR "Panama Canal" OR "Panama City" OR Colon OR Darien) ' + GDELT_EVENTS;
const GDELT_PANAMA_URL = `${GDELT_BASE}?query=${encodeURIComponent(GDELT_PANAMA_QUERY)}${GDELT_OPTS}&maxrecords=15`;

/* ── Disaster & Seismic ────────────────────────────────── */

const GDACS_URL = 'https://www.gdacs.org/xml/rss.xml';
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

/* ── Conflict & Humanitarian ───────────────────────────── */

const ACLED_BASE = 'https://api.acleddata.com/acled/read';
const RELIEFWEB_BASE = 'https://api.reliefweb.int/v2/reports';

/* ── AOI: Country-specific RSS feeds ──────────────────── */

const AOI_RSS_FEEDS = [
  { name: 'Panama Canal Authority', url: 'https://pancanal.com/en/news/feed/', country: 'panama', sourceType: 'conflict' },
  { name: 'FCDO Zambia', url: 'https://www.gov.uk/foreign-travel-advice/zambia.atom', country: 'zambia', sourceType: 'humanitarian' },
  { name: 'FCDO Panama', url: 'https://www.gov.uk/foreign-travel-advice/panama.atom', country: 'panama', sourceType: 'humanitarian' },
];

/* ── AOI/Global: Conflict & alert RSS feeds ──────────── */

const UN_PEACE_URL = 'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml';
const UN_AFRICA_URL = 'https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml';
const ICRC_URL = 'https://www.icrc.org/en/rss/news';

/* ── OSINT: blogs & research feeds ─────────────────────── */

const OSINT_RSS_FEEDS = [
  { name: 'OSINT Industries', url: 'https://www.osint.industries/blog/feed/', sourceType: 'osint' },
  { name: 'Knowmad OSINT', url: 'https://knowmad-osint.com/blog/feed/', sourceType: 'osint' },
  { name: 'Bellingcat Resources', url: 'https://www.bellingcat.com/category/resources/feed/', sourceType: 'osint' },
  { name: 'Bellingcat News', url: 'https://www.bellingcat.com/category/news/feed/', sourceType: 'osint' },
  { name: 'Bendobrown', url: 'https://www.youtube.com/feeds/videos.xml?user=Bendobrown', sourceType: 'osint' },
  { name: 'Benjamin Strick', url: 'https://benjaminstrick.com/feed', sourceType: 'osint' },
  { name: 'OSINT Newsletter', url: 'https://osintnewsletter.com/feed', sourceType: 'osint' },
  { name: 'Offensive OSINT', url: 'https://www.offensiveosint.io/rss/', sourceType: 'osint' },
  { name: 'Nixintel', url: 'https://nixintel.info/feed/', sourceType: 'osint' },
  { name: 'IntelTechniques', url: 'https://inteltechniques.com/blog/feed/', sourceType: 'osint' },
  { name: 'Authentic8', url: 'https://www.authentic8.com/blog/rss.xml', sourceType: 'osint' },
  { name: 'SecJuice', url: 'https://www.secjuice.com/feed/', sourceType: 'osint' },
];

/* ── Cyber: RSS feeds ──────────────────────────────────── */

const CYBER_RSS_FEEDS = [
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
  { name: 'CERT-EU', url: 'https://cert.europa.eu/publications/security-advisories-rss' },
  { name: 'DataBreaches.net', url: 'https://databreaches.net/feed/' },
];
const NCSC_URL = 'https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml';
const HIBP_URL = 'https://feeds.feedburner.com/HaveIBeenPwnedLatestBreaches';

/* ── Cyber: Mastodon infosec.exchange ────────────────── */


/* ── Cyber: Structured threat intel endpoints ──────────── */

const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const THREATFOX_URL = 'https://threatfox.abuse.ch/export/json/recent/';
const FEODO_URL = 'https://feodotracker.abuse.ch/downloads/ipblocklist.json';
const SANS_INFOCON_URL = 'https://isc.sans.edu/api/infocon?json';

/* ── AOI Country Filters (for ACLED/ReliefWeb routing) ── */

const AOI_UK = /\b(UK|Britain|British|United Kingdom|England|English|Scotland|Scottish|Wales|Welsh|London|Manchester|Birmingham|Liverpool|Belfast|Edinburgh|Westminster|Northern Ireland)\b/i;
const AOI_ZAMBIA = /\b(Zambia|Zambian|Lusaka|Copperbelt|Livingstone|Kitwe|Ndola)\b/i;
const AOI_PANAMA = /\b(Panama|Panamanian|Panama City|Panama Canal|Colon|Darien)\b/i;

/* ── Content Filters ───────────────────────────────────── */

const NON_GEOPOLITICAL = /\b(football|soccer|cricket|rugby|tennis|boxing|UFC|MMA|Formula 1|F1|Grand Prix|Premier League|Champions League|World Cup|NBA|NFL|MLB|Olympics|Olympic|medal|goalkeeper|striker|midfielder|knockout|bout|fight card|undercard|rematch|title bout|heavyweight|middleweight|lightweight|featherweight|celebrity|movie|film|album|concert|tour|Grammy|Oscar|Emmy|Beyonc[eé]|Taylor Swift|Hollywood|Bollywood|Netflix|Disney|streaming|recipe|cooking|chef|restaurant|fashion|runway|beauty|skincare|makeup|fitness|workout|gym|diet|weight loss|horoscope|zodiac|astrology|wedding|engagement ring|royal baby|reality TV|soap opera|game show|quiz|crossword|sudoku|weather forecast|pollen count|hip[- ]?hop|rapper|rap artist|singer|musician|dies aged|died aged|obituary|passed away|pays tribute|farewell|funeral|music legend|rock star|pop star|entertainer|comedian|actress|actor|Man City|Man Utd|Liverpool FC|Arsenal|Chelsea|Tottenham|Everton|Anfield|Old Trafford|Wembley|Stamford Bridge|BJK Cup|Masters golf|PGA|ATP|WTA|Serie A|La Liga|Bundesliga|Ligue 1|transfer fee|loan deal|penalty kick|red card|yellow card|offside|VAR|hat-trick|clean sheet)\b/i;

/* ── Helpers ────────────────────────────────────────────── */

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const OSINT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function isRecent(dateStr, maxAgeMs = MAX_AGE_MS) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return (Date.now() - d.getTime()) < maxAgeMs;
}

function stripHtml(html) {
  if (!html) return '';
  const s = typeof html === 'string' ? html : String(html);
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&#8217;|&#39;|&rsquo;/gi, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, '-')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8220;|&#8221;/gi, '"')
    .replace(/&[^;]+;/g, ' ')
    .trim()
    .slice(0, 300);
}

function stripUrls(text) {
  return (text || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+\b/gi, '')
    .replace(/\b[a-z0-9.-]+\.[a-z]{2,}\S*[/?=]\S*/gi, '')
    .replace(/\butm_[a-z0-9_]+=\S*/gi, '')
    .replace(/\b[a-z0-9_]+=%[0-9a-f]{2}\S*/gi, '')
    .replace(/\S*%[0-9a-f]{2}\S*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(extractText).find(Boolean) || '';
  if (typeof value === 'object') {
    return value['#text'] || value['@_term'] || value['@_label'] || value['@_value'] || '';
  }
  return '';
}

function parseDateValue(value) {
  const text = extractText(value).trim();
  if (!text) return null;

  const ordinalMatch = text.match(/^(\d{4})-(\d{3})$/);
  if (ordinalMatch) {
    const year = Number(ordinalMatch[1]);
    const dayOfYear = Number(ordinalMatch[2]);
    const parsed = new Date(Date.UTC(year, 0, dayOfYear));
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeTitle(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/* ── RSS Parsing ───────────────────────────────────────── */

function parseRss(xml, feedName, sourceType, maxAgeMs = MAX_AGE_MS) {
  try {
    const doc = parser.parse(xml);
    const channel = doc.rss?.channel || doc.feed;
    if (!channel) return [];

    let items = channel.item || channel.entry || [];
    if (!Array.isArray(items)) items = [items];

    return items.map(item => {
      const rawTitle = item.title || '';
      const link = item.link?.['@_href'] || item.link || '';
      const pubDate = item.pubDate || item.published || item.updated || item['dc:date'] || item['atom:updated'] || item['atom:published'] || null;
      const normalizedTitle = stripHtml(extractText(rawTitle));
      const description = sourceType === 'cyber'
        ? stripUrls(stripHtml(item.description || item.summary || item.content || ''))
        : stripHtml(item.description || item.summary || item.content || '');
      const validDate = parseDateValue(pubDate);

      return {
        source: feedName,
        sourceType,
        title: sourceType === 'cyber'
          ? stripUrls(stripHtml(rawTitle))
          : normalizedTitle,
        link: typeof link === 'string' ? link.trim() : '',
        description,
        pubDate: validDate,
      };
    }).filter(i => i.title && i.pubDate && isRecent(i.pubDate, maxAgeMs));
  } catch (err) {
    console.error('RSS parse error:', err.message || err);
    return [];
  }
}

async function fetchRssFeed(url, feedName, sourceType, cacheTtl = 900, maxAgeMs = MAX_AGE_MS) {
  try {
    const res = await fetch(url, { cf: { cacheTtl, cacheEverything: true } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, feedName, sourceType, maxAgeMs);
  } catch (err) {
    console.error(`${feedName} fetch error:`, err.message || err);
    return [];
  }
}

/* ── GDELT DOC API ─────────────────────────────────────── */

function parseGdeltDate(s) {
  if (!s || s.length < 14) return null;
  const iso = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8)
    + 'T' + s.slice(8, 10) + ':' + s.slice(10, 12) + ':' + s.slice(12, 14) + 'Z';
  return iso;
}

function parseGdeltResponse(data, sourceType = 'conflict') {
  if (!data?.articles) return [];
  return data.articles
    .map(art => ({
      source: art.domain ? art.domain.replace(/^www\./, '') : 'GDELT',
      sourceType,
      title: (art.title || '').trim(),
      link: art.url || '#',
      description: '',
      pubDate: parseGdeltDate(art.seendate) || new Date().toISOString(),
    }))
    .filter(i => i.title && isRecent(i.pubDate) && !NON_GEOPOLITICAL.test(i.title));
}

async function fetchGdelt(url) {
  try {
    const res = await fetch(url, { cf: { cacheTtl: 900, cacheEverything: true } });
    if (!res.ok) return [];
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) return [];
    const data = await res.json();
    return parseGdeltResponse(data);
  } catch (err) {
    console.error('GDELT fetch error:', err.message || err);
    return [];
  }
}

/* ── USGS Earthquakes ──────────────────────────────────── */

async function fetchUSGS() {
  try {
    const res = await fetch(USGS_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map(f => {
      const p = f.properties;
      const magnitude = typeof p.mag === 'number' ? p.mag : null;
      const mag = magnitude != null ? magnitude.toFixed(1) : '?';
      const place = p.place || 'Unknown location';
      const tsunami = p.tsunami ? ' [TSUNAMI WARNING]' : '';
      return {
        source: 'USGS',
        sourceType: 'seismic',
        title: `M${mag} — ${place}${tsunami}`,
        link: p.url || '#',
        description: `Magnitude ${mag} earthquake at ${Math.round(f.geometry.coordinates[2])}km depth.`,
        pubDate: new Date(p.time).toISOString(),
        _magnitude: magnitude,
        _place: place,
      };
    }).filter(i => {
      if (!isRecent(i.pubDate) || i._magnitude == null) return false;
      if (i._magnitude >= 5.5) return true;
      return AOI_UK.test(i._place) || AOI_PANAMA.test(i._place) || AOI_ZAMBIA.test(i._place);
    });
  } catch (err) {
    console.error('USGS fetch error:', err.message || err);
    return [];
  }
}

/* ── GDACS — Orange/Red severity only ──────────────────── */

async function fetchGdacs() {
  const items = await fetchRssFeed(GDACS_URL, 'GDACS', 'disaster', 600);
  return items.filter(i => /^(Red|Orange)\b/i.test(i.title)).map(i => {
    const severity = /^Red\b/i.test(i.title) ? 'RED' : 'ORANGE';
    return { ...i, title: `[${severity}] ${i.title}` };
  });
}

/* ── ACLED — requires env vars ─────────────────────────── */

async function fetchAcled(env) {
  const key = env.ACLED_API_KEY;
  const email = env.ACLED_EMAIL;
  if (!key || !email) return [];

  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const url = `${ACLED_BASE}?key=${encodeURIComponent(key)}`
      + `&email=${encodeURIComponent(email)}`
      + `&event_date=${weekAgo}|${today}`
      + `&event_date_where=BETWEEN&limit=50`
      + `&fields=event_date|event_type|sub_event_type|country|admin1|notes|fatalities|source_url`;

    const res = await fetch(url, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.data?.length) return [];

    return data.data.map(evt => {
      const fatalities = evt.fatalities > 0 ? ` [${evt.fatalities} killed]` : '';
      const location = [evt.admin1, evt.country].filter(Boolean).join(', ');
      return {
        source: 'ACLED',
        sourceType: 'acled',
        title: `${evt.event_type}: ${location}${fatalities}`,
        link: evt.source_url || 'https://acleddata.com',
        description: (evt.notes || '').slice(0, 200),
        pubDate: new Date(evt.event_date).toISOString(),
        _country: evt.country || '',
      };
    }).filter(i => isRecent(i.pubDate));
  } catch (err) {
    console.error('ACLED fetch error:', err.message || err);
    return [];
  }
}

/* ── ReliefWeb API v2 — requires env var ───────────────── */

async function fetchReliefWeb(env) {
  const appname = env.RELIEFWEB_APPNAME;
  if (!appname) return [];

  try {
    const url = `${RELIEFWEB_BASE}?appname=${encodeURIComponent(appname)}`
      + '&preset=latest&limit=25'
      + '&filter[operator]=OR'
      + '&filter[conditions][0][field]=format.name&filter[conditions][0][value]=Situation Report'
      + '&filter[conditions][1][field]=format.name&filter[conditions][1][value]=Flash Update'
      + '&fields[include][]=title&fields[include][]=url&fields[include][]=date.created'
      + '&fields[include][]=primary_country&fields[include][]=disaster_type&fields[include][]=source'
      + '&fields[include][]=body-html';

    const res = await fetch(url, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.data?.length) return [];

    return data.data.map(report => {
      const fields = report.fields;
      const country = fields.primary_country?.name || '';
      const disasterType = fields.disaster_type?.map(d => d.name).join(', ') || '';
      const src = fields.source?.map(s => s.shortname || s.name).join(', ') || 'ReliefWeb';
      const bodySummary = stripHtml(fields['body-html'] || '');
      const fallback = [country, disasterType].filter(Boolean).join(' — ');
      return {
        source: src.length > 25 ? src.slice(0, 22) + '...' : src,
        sourceType: 'humanitarian',
        title: fields.title || '',
        link: fields.url || `https://reliefweb.int/node/${report.id}`,
        description: bodySummary || fallback,
        pubDate: fields.date?.created ? new Date(fields.date.created).toISOString() : new Date().toISOString(),
        _country: country,
      };
    }).filter(i => i.title && isRecent(i.pubDate));
  } catch (err) {
    console.error('ReliefWeb fetch error:', err.message || err);
    return [];
  }
}

/* ── Mastodon infosec.exchange — practitioner chatter ──── */



/* ── CISA KEV — actively exploited vulnerabilities ─────── */

async function fetchCisaKev() {
  try {
    const res = await fetch(CISA_KEV_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.vulnerabilities) return [];

    return data.vulnerabilities
      .filter(v => isRecent(v.dateAdded))
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 15)
      .map(v => {
        const ransomware = v.knownRansomwareCampaignUse === 'Known' ? ' [RANSOMWARE]' : '';
        return {
          source: 'CISA KEV',
          sourceType: 'kev',
          title: `${v.cveID}: ${v.vendorProject} ${v.product}${ransomware}`,
          link: `https://nvd.nist.gov/vuln/detail/${v.cveID}`,
          description: (v.shortDescription || '').slice(0, 200),
          pubDate: new Date(v.dateAdded).toISOString(),
        };
      });
  } catch (err) {
    console.error('CISA KEV error:', err.message || err);
    return [];
  }
}

/* ── ThreatFox — recent IOCs ───────────────────────────── */

async function fetchThreatFox(authKey) {
  try {
    const headers = authKey ? { 'Auth-Key': authKey } : {};
    const res = await fetch(THREATFOX_URL, { headers, cf: { cacheTtl: 900, cacheEverything: true } });
    if (!res.ok) return [];
    const text = await res.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') return [];

    const items = [];
    for (const [dateKey, iocs] of Object.entries(data)) {
      if (!Array.isArray(iocs)) continue;
      for (const ioc of iocs) {
        if (items.length >= 20) break;
        const malware = ioc.malware_printable || ioc.malware || 'Unknown';
        const iocValue = ioc.ioc_value || '';
        const iocType = ioc.ioc_type || '';
        const confidence = ioc.confidence_level ? ` (${ioc.confidence_level}%)` : '';
        const firstSeen = ioc.first_seen_utc || null;

        if (!iocValue || !isRecent(firstSeen)) continue;

        items.push({
          source: 'ThreatFox',
          sourceType: 'ioc',
          title: `${malware}: ${iocType} — ${iocValue}${confidence}`,
          link: ioc.malware_malpedia ? `https://malpedia.caad.fkie.fraunhofer.de/details/${ioc.malware_malpedia}` : `https://threatfox.abuse.ch/ioc/${dateKey}/`,
          description: Array.isArray(ioc.tags) ? ioc.tags.join(', ') : (ioc.tags || ''),
          pubDate: firstSeen ? new Date(firstSeen).toISOString() : new Date().toISOString(),
        });
      }
      if (items.length >= 20) break;
    }
    return items;
  } catch (err) {
    console.error('ThreatFox error:', err.message || err);
    return [];
  }
}

/* ── Feodo Tracker — botnet C2 servers ─────────────────── */

async function fetchFeodoTracker(authKey) {
  try {
    const headers = authKey ? { 'Auth-Key': authKey } : {};
    const res = await fetch(FEODO_URL, { headers, cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter(e => e.status === 'online' && isRecent(e.first_seen))
      .sort((a, b) => new Date(b.first_seen) - new Date(a.first_seen))
      .slice(0, 10)
      .map(e => ({
        source: 'Feodo',
        sourceType: 'c2',
        title: `C2: ${e.ip_address}:${e.port} (${e.malware || 'unknown'})`,
        link: `https://feodotracker.abuse.ch/browse/host/${e.ip_address}/`,
        description: [e.as_name, e.country].filter(Boolean).join(' — '),
        pubDate: new Date(e.first_seen).toISOString(),
      }));
  } catch (err) {
    console.error('Feodo error:', err.message || err);
    return [];
  }
}

/* ── SANS ISC InfoCon — threat level indicator ─────────── */

async function fetchSansInfocon() {
  try {
    const res = await fetch(SANS_INFOCON_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return 'unknown';
    const data = await res.json();
    return data.status || 'unknown';
  } catch (err) {
    console.error('SANS InfoCon error:', err.message || err);
    return 'unknown';
  }
}

/* ── Deduplication ─────────────────────────────────────── */

function deduplicate(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = normalizeTitle(item.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ── Country routing helpers ───────────────────────────── */

function matchesCountry(item, regex) {
  const text = (item.title || '') + ' ' + (item.description || '') + ' ' + (item._country || '');
  return regex.test(text);
}

/* ── Main Handler ──────────────────────────────────────── */

export async function onRequestGet(context) {
  const { env, waitUntil } = context;

  // Check edge cache first
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/feeds', context.request.url));
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const abusechKey = env.ABUSECH_AUTH_KEY || '';

  // Fetch all sources in parallel
  const [
    gdeltGlobal,
    gdeltUk,
    gdeltZambia,
    gdeltPanama,
    gdacsItems,
    usgsItems,
    acledItems,
    reliefWebItems,
    aoiRssItems,
    unPeaceItems,
    unAfricaItems,
    icrcItems,
    osintItems,
    cyberRssItems,
    ncscItems,
    hibpItems,
    kevItems,
    threatFoxItems,
    feodoItems,
    threatLevel,
  ] = await Promise.all([
    fetchGdelt(GDELT_GLOBAL_URL),
    fetchGdelt(GDELT_UK_URL),
    fetchGdelt(GDELT_ZAMBIA_URL),
    fetchGdelt(GDELT_PANAMA_URL),
    fetchGdacs(),
    fetchUSGS(),
    fetchAcled(env),
    fetchReliefWeb(env),
    Promise.all(AOI_RSS_FEEDS.map(f => fetchRssFeed(f.url, f.name, f.sourceType).then(items => items.map(i => ({ ...i, _country: f.country }))))).then(r => r.flat()),
    fetchRssFeed(UN_PEACE_URL, 'UN News', 'conflict', 900),
    fetchRssFeed(UN_AFRICA_URL, 'UN Africa', 'conflict', 900),
    fetchRssFeed(ICRC_URL, 'ICRC', 'conflict', 1800),
    Promise.all(OSINT_RSS_FEEDS.map(f => fetchRssFeed(f.url, f.name, f.sourceType, 1800, OSINT_MAX_AGE_MS))).then(r => r.flat()),
    Promise.all(CYBER_RSS_FEEDS.map(f => fetchRssFeed(f.url, f.name, 'cyber'))).then(r => r.flat()),
    fetchRssFeed(NCSC_URL, 'NCSC UK', 'ncsc'),
    fetchRssFeed(HIBP_URL, 'HIBP', 'breach'),
    fetchCisaKev(),
    fetchThreatFox(abusechKey),
    fetchFeodoTracker(abusechKey),
    fetchSansInfocon(),
  ]);

  // Detect GDELT rate limiting (all 4 queries returning 0 simultaneously)
  const gdeltRateLimited = gdeltGlobal.length === 0 && gdeltUk.length === 0
    && gdeltZambia.length === 0 && gdeltPanama.length === 0;

  // Route ACLED and ReliefWeb items to AOI countries where they match
  const acledUk = acledItems.filter(i => matchesCountry(i, AOI_UK));
  const acledZambia = acledItems.filter(i => matchesCountry(i, AOI_ZAMBIA));
  const acledPanama = acledItems.filter(i => matchesCountry(i, AOI_PANAMA));

  const rwUk = reliefWebItems.filter(i => matchesCountry(i, AOI_UK));
  const rwZambia = reliefWebItems.filter(i => matchesCountry(i, AOI_ZAMBIA));
  const rwPanama = reliefWebItems.filter(i => matchesCountry(i, AOI_PANAMA));

  // Route AOI RSS feeds by their tagged country
  const aoiRssUk = aoiRssItems.filter(i => i._country === 'uk');
  const aoiRssZambia = aoiRssItems.filter(i => i._country === 'zambia');
  const aoiRssPanama = aoiRssItems.filter(i => i._country === 'panama');

  // UN Africa — only Zambia-relevant items
  const unAfricaZambia = unAfricaItems.filter(i => matchesCountry(i, AOI_ZAMBIA));

  // AOI: country-specific GDELT + ACLED + ReliefWeb + RSS feeds
  const aoiUk = deduplicate([...gdeltUk, ...acledUk, ...rwUk, ...aoiRssUk])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  const aoiZambia = deduplicate([...gdeltZambia, ...acledZambia, ...rwZambia, ...aoiRssZambia, ...unAfricaZambia])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  const aoiPanama = deduplicate([...gdeltPanama, ...acledPanama, ...rwPanama, ...aoiRssPanama])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  // Global: structured event data + UN/ICRC conflict alerts
  const global = deduplicate([
    ...gdeltGlobal.slice(0, 12),
    ...gdacsItems.slice(0, 5),
    ...usgsItems.slice(0, 8),
    ...acledItems.slice(0, 10),
    ...reliefWebItems.slice(0, 5),
    ...unPeaceItems.slice(0, 8),
    ...icrcItems.slice(0, 5),
  ]).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 30);

  const osint = deduplicate(osintItems)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 24);

  // Cyber: show all deduplicated alerts that are still inside the retention window.
  // Previously this lane used fixed category quotas, which caused valid sub-24h alerts
  // to disappear whenever other categories filled the 30 available slots.
  const cyber = deduplicate([
    ...kevItems,
    ...ncscItems,
    ...hibpItems,
    ...threatFoxItems,
    ...feodoItems,
    ...cyberRssItems,
  ])
    .filter(i => isRecent(i.pubDate))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Cyber stats for OpenCTI-style summary
  const cyberStats = {
    kev: cyber.filter(i => i.sourceType === 'kev').length,
    breach: cyber.filter(i => i.sourceType === 'breach').length,
    ioc: cyber.filter(i => i.sourceType === 'ioc').length,
    c2: cyber.filter(i => i.sourceType === 'c2').length,
    ncsc: cyber.filter(i => i.sourceType === 'ncsc').length,
  };

  const body = JSON.stringify({
    aoi: { uk: aoiUk, zambia: aoiZambia, panama: aoiPanama },
    global,
    osint,
    cyber,
    cyberStats,
    threatLevel,
    gdeltRateLimited,
    cachedAt: new Date().toISOString(),
  });

  const response = new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=180, max-age=60',
      'Access-Control-Allow-Origin': '*',
    },
  });

  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
