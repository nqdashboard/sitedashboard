import { XMLParser } from 'fast-xml-parser';

/* ── Disaster & Seismic ────────────────────────────────── */

const GDACS_URL = 'https://www.gdacs.org/xml/rss.xml';
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

/* ── Conflict & Humanitarian ───────────────────────────── */

const ACLED_BASE = 'https://api.acleddata.com/acled/read';
const RELIEFWEB_BASE = 'https://api.reliefweb.int/v2/reports';

/* ── AOI: Country-specific RSS feeds ──────────────────── */

const AOI_RSS_FEEDS = [
  { name: 'BBC UK', url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', country: 'uk', sourceType: 'conflict', includePattern: /\b(protest|protests|demonstration|demonstrations|riot|riots|disorder|disturbance|security|terror|terrorism|counterterror|counter-terror|knife|stabbing|shooting|fatal|emergency|police|sanction|sanctions|migration|border|asylum|public order)\b/i },
  { name: 'BBC Politics', url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', country: 'uk', sourceType: 'conflict', includePattern: /\b(sanction|sanctions|security|defence|defense|protest|protests|migration|border|asylum|emergency|police|terror|terrorism|iran|ukraine|russia|china|public order)\b/i },
  { name: 'Home Office', url: 'https://www.govwire.co.uk/rss/home-office', country: 'uk', sourceType: 'conflict', includePattern: /\b(security|terror|terrorism|extremism|protest|public order|police|arrest|crime|border|migration|asylum|sanction|illegal working|smuggling)\b/i },
  { name: 'NCA', url: 'https://www.govwire.co.uk/rss/national-crime-agency', country: 'uk', sourceType: 'conflict', includePattern: /\b(arrest|charged|crime|smuggling|trafficking|fraud|sanction|security|operation|police|counter[- ]terror|terror)\b/i },
  { name: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/feed/', country: 'zambia', sourceType: 'conflict', includePattern: /\b(protest|protests|demonstration|demonstrations|riot|riots|unrest|security|police|arrest|court|constitutional|constitution|amendment|opposition|corruption|strike|emergency|disturbance)\b/i, requireCountryMatch: true },
  { name: 'Panama Canal Authority', url: 'https://pancanal.com/en/news/feed/', country: 'panama', sourceType: 'conflict', includePattern: /\b(canal|transit|restriction|security|closure|delay|emergency|incident)\b/i },
  { name: 'La Estrella Panamá', url: 'https://news.google.com/rss/search?q=site%3Alaestrella.com.pa%20(Panam%C3%A1%20OR%20Panama)%20(protesta%20OR%20protestas%20OR%20bloqueo%20OR%20bloqueos%20OR%20huelga%20OR%20violencia%20OR%20disturbios%20OR%20enfrentamientos%20OR%20seguridad%20OR%20crisis%20OR%20emergencia%20OR%20canal%20OR%20Dari%C3%A9n%20OR%20frontera%20OR%20migraci%C3%B3n%20OR%20Asamblea%20OR%20gobierno%20OR%20presidente%20OR%20ley%20OR%20CSS%20OR%20mina%20OR%20miner%C3%ADa%20OR%20Estados%20Unidos%20OR%20China)&hl=es-419&gl=PA&ceid=PA%3Aes-419', country: 'panama', sourceType: 'conflict', includePattern: /\b(protesta|protestas|manifestaci[oó]n|manifestaciones|bloqueo|bloqueos|huelga|disturbios|enfrentamientos|violencia|crisis|emergencia|estado de emergencia|canal|dari[eé]n|frontera|migraci[oó]n|migrantes|asamblea|gobierno|presidente|ley|css|mina|miner[ií]a|seguridad|detenid|captur|operativo|estados unidos|ee\.?\s?uu\.?|china)\b/i, excludePattern: /\b(clima|tiempo|pron[oó]stico|deporte|f[uú]tbol|beisbol|b[eé]isbol|m[uú]sica|concierto|cultura|farándula|espect[aá]culo|loter[ií]a|jubilados|pensionados|docente|escuela|universidad|feria|turismo|gastronom[ií]a|moda|tecnolog[ií]a|salud|famoso|famosa)\b/i, forceTranslate: true, sourceLang: 'es', requireCountryMatch: true },
  { name: 'La Prensa Panamá', url: 'https://news.google.com/rss/search?q=site%3Aprensa.com%20(Panam%C3%A1%20OR%20Panama)%20(protesta%20OR%20protestas%20OR%20bloqueo%20OR%20bloqueos%20OR%20huelga%20OR%20violencia%20OR%20disturbios%20OR%20enfrentamientos%20OR%20seguridad%20OR%20crisis%20OR%20emergencia%20OR%20canal%20OR%20Dari%C3%A9n%20OR%20frontera%20OR%20migraci%C3%B3n%20OR%20Asamblea%20OR%20gobierno%20OR%20presidente%20OR%20ley%20OR%20CSS%20OR%20mina%20OR%20miner%C3%ADa%20OR%20Estados%20Unidos%20OR%20China)&hl=es-419&gl=PA&ceid=PA%3Aes-419', country: 'panama', sourceType: 'conflict', includePattern: /\b(protesta|protestas|manifestaci[oó]n|manifestaciones|bloqueo|bloqueos|huelga|disturbios|enfrentamientos|violencia|crisis|emergencia|estado de emergencia|canal|dari[eé]n|frontera|migraci[oó]n|migrantes|asamblea|gobierno|presidente|ley|css|mina|miner[ií]a|seguridad|detenid|captur|operativo|estados unidos|ee\.?\s?uu\.?|china)\b/i, excludePattern: /\b(clima|tiempo|pron[oó]stico|deporte|f[uú]tbol|beisbol|b[eé]isbol|m[uú]sica|concierto|cultura|farándula|espect[aá]culo|loter[ií]a|jubilados|pensionados|docente|escuela|universidad|feria|turismo|gastronom[ií]a|moda|tecnolog[ií]a|salud|famoso|famosa)\b/i, forceTranslate: true, sourceLang: 'es', requireCountryMatch: true },
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
  { name: 'OSINTech', url: 'https://osintech.substack.com/feed', sourceType: 'osint' },
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
const RANSOMWARE_LIVE_URL = 'https://api.ransomware.live/v2/recentvictims';

const COUNTRY_CODE_NAMES = {
  FR: 'France',
  IT: 'Italy',
  MX: 'Mexico',
  TH: 'Thailand',
  US: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  DE: 'Germany',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CA: 'Canada',
  AU: 'Australia',
  BR: 'Brazil',
  IN: 'India',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
};

/* ── AOI Country Filters (for ACLED/ReliefWeb routing) ── */

const AOI_UK = /\b(UK|Britain|British|United Kingdom|England|English|Scotland|Scottish|Wales|Welsh|London|Manchester|Birmingham|Liverpool|Belfast|Edinburgh|Westminster|Northern Ireland)\b/i;
const AOI_ZAMBIA = /\b(Zambia|Zambian|Lusaka|Copperbelt|Livingstone|Kitwe|Ndola)\b/i;
const AOI_PANAMA = /\b(Panama|Panamá|Panamanian|Panameño|Panama City|Panama Canal|Canal de Panama|Canal de Panamá|Colon|Colón|Darien|Darién)\b/i;

/* ── Content Filters ───────────────────────────────────── */

const NON_GEOPOLITICAL = /\b(football|soccer|cricket|rugby|tennis|boxing|UFC|MMA|Formula 1|F1|Grand Prix|Premier League|Champions League|World Cup|NBA|NFL|MLB|Olympics|Olympic|medal|goalkeeper|striker|midfielder|knockout|bout|fight card|undercard|rematch|title bout|heavyweight|middleweight|lightweight|featherweight|celebrity|movie|film|album|concert|tour|Grammy|Oscar|Emmy|Beyonc[eé]|Taylor Swift|Hollywood|Bollywood|Netflix|Disney|streaming|recipe|cooking|chef|restaurant|fashion|runway|beauty|skincare|makeup|fitness|workout|gym|diet|weight loss|horoscope|zodiac|astrology|wedding|engagement ring|royal baby|reality TV|soap opera|game show|quiz|crossword|sudoku|weather forecast|pollen count|hip[- ]?hop|rapper|rap artist|singer|musician|dies aged|died aged|obituary|passed away|pays tribute|farewell|funeral|music legend|rock star|pop star|entertainer|comedian|actress|actor|Man City|Man Utd|Liverpool FC|Arsenal|Chelsea|Tottenham|Everton|Anfield|Old Trafford|Wembley|Stamford Bridge|BJK Cup|Masters golf|PGA|ATP|WTA|Serie A|La Liga|Bundesliga|Ligue 1|transfer fee|loan deal|penalty kick|red card|yellow card|offside|VAR|hat-trick|clean sheet)\b/i;

/* ── Helpers ────────────────────────────────────────────── */

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const OSINT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const UPSTREAM_FETCH_TIMEOUT = 15 * 1000;
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const TRANSLATE_API_BASE = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=';

async function fetchWithTimeout(resource, options = {}, timeoutMs = UPSTREAM_FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRecent(dateStr, maxAgeMs = MAX_AGE_MS) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const ageMs = Date.now() - d.getTime();
  if (ageMs < -(5 * 60 * 1000)) return false;
  return ageMs < maxAgeMs;
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

function truncateText(text, maxLength = 180) {
  const value = (text || '').trim();
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function expandCountryCode(value) {
  const text = stripHtml(value || '').trim();
  if (!text) return '';
  const upper = text.toUpperCase();
  return COUNTRY_CODE_NAMES[upper] || text;
}

function summarizeExposure(exposure) {
  if (!exposure || typeof exposure !== 'object') return '';
  const parts = [];

  for (const [key, rawValue] of Object.entries(exposure)) {
    if (!rawValue) continue;
    if (typeof rawValue === 'number') {
      parts.push(`${key.replace(/_/g, ' ')}: ${rawValue}`);
      continue;
    }
    if (typeof rawValue === 'string' && /\d/.test(rawValue)) {
      parts.push(`${key.replace(/_/g, ' ')}: ${rawValue}`);
    }
  }

  return parts.slice(0, 2).join(' • ');
}

function summarizeImpactedPeople(entry) {
  const candidates = [
    ['people', entry.people],
    ['employees', entry.employees],
    ['customers', entry.customers],
    ['records', entry.records],
    ['users', entry.users],
    ['clients', entry.clients],
    ['victims', entry.victims_count],
    ['impact', entry.nb_files],
  ];

  const parts = candidates
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .slice(0, 2)
    .map(([label, value]) => `${label}: ${value}`);

  return parts.join(' • ');
}

function isLowSignalHumanitarianItem(item) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  return /\b(survey|country brief|weekly market report|thematic brief|assessment|factsheet|fact sheet|dashboard|snapshot|round \d+|octubre|febrero)\b/i.test(text);
}

function needsEnglishTranslation(text) {
  if (!text) return false;

  const sample = text.trim();
  if (!sample) return false;
  if (/[áéíóúñü¿¡àèìòùç]/i.test(sample)) return true;

  const lower = sample.toLowerCase();
  const romanceMatches = (lower.match(/\b(el|la|los|las|de|del|para|por|con|sin|que|una|uno|canal|autoridad|actualizaci[oó]n|comunicado|tr[aá]nsito|buques?|puerto|cierre|cortes|frontera|seguridad)\b/g) || []).length;
  const englishMatches = (lower.match(/\b(the|and|for|with|from|this|that|alert|update|report|security|conflict|earthquake)\b/g) || []).length;

  return romanceMatches >= 3 && romanceMatches > englishMatches;
}

async function translateToEnglish(text) {
  if (!text || !needsEnglishTranslation(text)) return text;

  try {
    const res = await fetchWithTimeout(`${TRANSLATE_API_BASE}${encodeURIComponent(text)}`, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) return text;

    const data = await res.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map(part => Array.isArray(part) ? part[0] : '').join('').trim()
      : '';

    return translated || text;
  } catch (err) {
    console.error('Translation error:', err.message || err);
    return text;
  }
}

async function translateItemsToEnglish(items, force = false, sourceLang = 'auto') {
  return Promise.all(items.map(async item => {
    const [title, description] = await Promise.all([
      force ? translateToEnglishForced(item.title, sourceLang) : translateToEnglish(item.title),
      force ? translateToEnglishForced(item.description, sourceLang) : translateToEnglish(item.description),
    ]);

    return {
      ...item,
      title,
      description,
    };
  }));
}

async function translateToEnglishForced(text, sourceLang = 'auto') {
  if (!text) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=en&dt=t&dj=1&q=${encodeURIComponent(text)}`;
    const res = await fetchWithTimeout(url, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) return text;

    const data = await res.json();
    const translated = Array.isArray(data?.sentences)
      ? data.sentences.map(part => part?.trans || '').join('').trim()
      : '';

    if (translated && translated.toLowerCase() !== text.toLowerCase() && !needsEnglishTranslation(translated)) return translated;
    return sourceLang === 'es' ? translateSpanishFallback(text) : text;
  } catch (err) {
    console.error('Forced translation error:', err.message || err);
    return sourceLang === 'es' ? translateSpanishFallback(text) : text;
  }
}

function translateSpanishFallback(text) {
    let translated = ` ${text} `;

    const phraseMap = [
      [/motorizados de pedidosya reclaman m[aá]s ingresos/gi, 'PedidosYa riders demand higher pay'],
      [/mitradel cuestiona protest/gi, 'Labour ministry questions protest'],
      [/qu[ií]en es john barrett\??/gi, 'Who is John Barrett?'],
      [/su papel en panam[aá], guatemala y su llegada como encargado de negocios de estados unidos en venezuela/gi, 'his role in Panama and Guatemala, and his arrival as the US chargé d’affaires in Venezuela'],
      [/aumento a jubilados y pensionados/gi, 'increase for retirees and pensioners'],
      [/padres de familia/gi, 'parents'],
      [/intento de robo/gi, 'attempted robbery'],
      [/escuela/gi, 'school'],
      [/denuncian inseguridad/gi, 'report insecurity'],
      [/proyecto de ley/gi, 'bill'],
      [/avanza positivamente/gi, 'is advancing'],
      [/en la asamblea nacional/gi, 'in the National Assembly'],
      [/genera alarma/gi, 'is causing alarm'],
      [/exigen mayor seguridad/gi, 'are demanding greater security'],
      [/docente/gi, 'teacher'],
      [/\s+-\s+la prensa panam[aá]\s*$/gi, ''],
      [/\s+-\s+la estrella de panam[aá]\s*$/gi, ''],
      [/\s+-\s+la estrella panam[aá]\s*$/gi, ''],
    ];

  for (const [pattern, replacement] of phraseMap) {
    translated = translated.replace(pattern, replacement);
  }

  const wordMap = {
    protesta: 'protest',
    protestas: 'protests',
    manifestacion: 'demonstration',
    manifestación: 'demonstration',
    manifestaciones: 'demonstrations',
    bloqueo: 'blockade',
    bloqueos: 'blockades',
    huelga: 'strike',
    disturbios: 'disturbances',
    enfrentamientos: 'clashes',
    policia: 'police',
    policía: 'police',
    seguridad: 'security',
    detenidos: 'detainees',
    detenido: 'detained',
    capturan: 'capture',
    operativo: 'operation',
    cierre: 'closure',
    cerrada: 'closed',
    migracion: 'migration',
    migración: 'migration',
    frontera: 'border',
    emergencia: 'emergency',
    asamblea: 'assembly',
    nacional: 'national',
    panama: 'Panama',
    panamá: 'Panama',
    jubilados: 'retirees',
    pensionados: 'pensioners',
    padres: 'parents',
    familia: 'family',
    denuncian: 'report',
    inseguridad: 'insecurity',
    intento: 'attempt',
    robo: 'robbery',
    escuela: 'school',
    docente: 'teacher',
      pedregal: 'Pedregal',
      reclaman: 'demand',
      ingresos: 'pay',
      cuestiona: 'questions',
      papel: 'role',
      llegada: 'arrival',
      encargado: 'chargé',
      negocios: 'affairs',
      estados: 'States',
      unidos: 'United',
      venezuela: 'Venezuela',
      guatemala: 'Guatemala',
      quien: 'who',
      más: 'more',
      mas: 'more',
    };

  translated = translated.replace(/\b[\p{L}ñÑáéíóúÁÉÍÓÚüÜ]+\b/gu, word => {
    const lower = word.toLowerCase();
    return wordMap[lower] || word;
  });

  return translated.replace(/\s+/g, ' ').trim();
}

function filterAoiFeedItems(items, feed) {
    return items.filter(item => {
      const text = `${item.title || ''} ${item.description || ''}`;
      if (NON_GEOPOLITICAL.test(text)) return false;
      if (feed.includePattern && !feed.includePattern.test(text)) return false;
      if (feed.excludePattern && feed.excludePattern.test(text)) return false;
      if (feed.requireCountryMatch) {
        const matcher = feed.country === 'zambia' ? AOI_ZAMBIA
          : feed.country === 'panama' ? AOI_PANAMA
          : feed.country === 'uk' ? AOI_UK
          : null;
        if (matcher && !matcher.test(text)) return false;
      }
      return true;
    });
  }

async function fetchAoiFeed(feed) {
  try {
    const items = await fetchRssFeed(feed.url, feed.name, feed.sourceType);
    const filtered = filterAoiFeedItems(items, feed);
    const translated = feed.forceTranslate
      ? await translateItemsToEnglish(filtered, true, feed.sourceLang || 'auto')
      : filtered;
    return translated.map(item => ({ ...item, _country: feed.country }));
  } catch (err) {
    console.error(`${feed.name} AOI feed error:`, err.message || err);
    return [];
  }
}

async function settleArray(promise) {
  try {
    const result = await promise;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Feed group error:', err.message || err);
    return [];
  }
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
    const res = await fetchWithTimeout(url, { cf: { cacheTtl, cacheEverything: true } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = parseRss(xml, feedName, sourceType, maxAgeMs);
    return await translateItemsToEnglish(items);
  } catch (err) {
    console.error(`${feedName} fetch error:`, err.message || err);
    return [];
  }
}

/* ── USGS Earthquakes ──────────────────────────────────── */

async function fetchUSGS() {
  try {
    const res = await fetchWithTimeout(USGS_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
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

    const res = await fetchWithTimeout(url, { cf: { cacheTtl: 1800, cacheEverything: true } });
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

    const res = await fetchWithTimeout(url, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.data?.length) return [];

    const items = data.data.map(report => {
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
    }).filter(i => i.title && isRecent(i.pubDate) && !isLowSignalHumanitarianItem(i));

    return await translateItemsToEnglish(items);
  } catch (err) {
    console.error('ReliefWeb fetch error:', err.message || err);
    return [];
  }
}

/* ── Mastodon infosec.exchange — practitioner chatter ──── */



/* ── CISA KEV — actively exploited vulnerabilities ─────── */

async function fetchCisaKev() {
  try {
    const res = await fetchWithTimeout(CISA_KEV_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
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
    const res = await fetchWithTimeout(THREATFOX_URL, { headers, cf: { cacheTtl: 900, cacheEverything: true } });
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
    const res = await fetchWithTimeout(FEODO_URL, { headers, cf: { cacheTtl: 1800, cacheEverything: true } });
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

async function fetchRansomwareLive() {
  try {
    const res = await fetchWithTimeout(RANSOMWARE_LIVE_URL, { cf: { cacheTtl: 900, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .map(entry => {
        const pubDate = parseDateValue(
          entry.discovered || entry.discovered_at || entry.attackdate || entry.date || entry.updated_at || entry.last_seen,
        );
        const victim = stripHtml(entry.victim || entry.name || entry.company || '');
        const group = stripHtml(entry.group || entry.ransomware || 'Unknown group');
        const country = expandCountryCode(entry.country || entry.country_name || '');
        const details = Array.isArray(entry.description)
          ? entry.description.join(' ')
          : stripHtml(entry.description || entry.summary || '');
        const companyInfo = stripHtml(entry.description_company || entry.company_description || '');
        const severityBits = [];
        if (typeof entry.nb_files === 'number' && entry.nb_files > 0) severityBits.push(`${entry.nb_files} files listed`);
        if (typeof entry.views === 'number' && entry.views > 0) severityBits.push(`${entry.views} views`);
        if (Array.isArray(entry.press) && entry.press.length > 0) severityBits.push(`${entry.press.length} linked reports`);
        if (Array.isArray(entry.updates) && entry.updates.length > 0) severityBits.push(`${entry.updates.length} update(s)`);
        if (entry.infostealer) severityBits.push('Infostealer data present');
        const exposureSummary = summarizeExposure(entry.infostealer || entry.exposed || entry.impact);
        const peopleSummary = summarizeImpactedPeople(entry);
        const impactSummary = [peopleSummary, severityBits.join(' • '), exposureSummary].filter(Boolean).join(' • ');
        const oneLiner = truncateText(companyInfo || details, 105);
        const descriptionLines = [
          country ? `Country: ${country}` : '',
          impactSummary ? `Impact: ${impactSummary}` : '',
          oneLiner ? `Note: ${oneLiner}` : '',
        ].filter(Boolean);

        return {
          source: 'Ransomware.live',
          sourceType: 'ransom',
          title: victim ? `${victim} — ${group}` : `${group} victim listing`,
          link: entry.post_url || entry.url || entry.link || 'https://www.ransomware.live/',
          description: descriptionLines.join('\n'),
          pubDate,
        };
      })
      .filter(item => item.title && item.pubDate && isRecent(item.pubDate));
  } catch (err) {
    console.error('Ransomware.live error:', err.message || err);
    return [];
  }
}

/* ── SANS ISC InfoCon — threat level indicator ─────────── */

async function fetchSansInfocon() {
  try {
    const res = await fetchWithTimeout(SANS_INFOCON_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
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
    ransomwareLiveItems,
    threatLevel,
  ] = await Promise.all([
    settleArray(fetchGdacs()),
    settleArray(fetchUSGS()),
    settleArray(fetchAcled(env)),
    settleArray(fetchReliefWeb(env)),
    settleArray(Promise.all(AOI_RSS_FEEDS.map(fetchAoiFeed)).then(r => r.flat())),
    settleArray(fetchRssFeed(UN_PEACE_URL, 'UN News', 'conflict', 900)),
    settleArray(fetchRssFeed(UN_AFRICA_URL, 'UN Africa', 'conflict', 900)),
    settleArray(fetchRssFeed(ICRC_URL, 'ICRC', 'conflict', 1800)),
    settleArray(Promise.all(OSINT_RSS_FEEDS.map(f => fetchRssFeed(f.url, f.name, f.sourceType, 1800, OSINT_MAX_AGE_MS))).then(r => r.flat())),
    settleArray(Promise.all(CYBER_RSS_FEEDS.map(f => fetchRssFeed(f.url, f.name, 'cyber'))).then(r => r.flat())),
    settleArray(fetchRssFeed(NCSC_URL, 'NCSC UK', 'ncsc')),
    settleArray(fetchRssFeed(HIBP_URL, 'HIBP', 'breach')),
    settleArray(fetchCisaKev()),
    settleArray(fetchThreatFox(abusechKey)),
    settleArray(fetchFeodoTracker(abusechKey)),
    settleArray(fetchRansomwareLive()),
    fetchSansInfocon().catch(err => {
      console.error('SANS InfoCon error:', err.message || err);
      return 'unknown';
    }),
  ]);

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

  // AOI: country-specific ACLED + ReliefWeb + RSS feeds
  const aoiUk = deduplicate([...acledUk, ...rwUk, ...aoiRssUk])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  const aoiZambia = deduplicate([...acledZambia, ...rwZambia, ...aoiRssZambia, ...unAfricaZambia])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  const aoiPanama = deduplicate([...acledPanama, ...rwPanama, ...aoiRssPanama])
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 15);

  // Global: structured event data + UN/ICRC conflict alerts
  const global = deduplicate([
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
    ...ransomwareLiveItems,
    ...cyberRssItems,
  ])
    .filter(i => isRecent(i.pubDate))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Cyber stats for OpenCTI-style summary
  const cyberStats = {
    kev: cyber.filter(i => i.sourceType === 'kev').length,
    breach: cyber.filter(i => i.sourceType === 'breach' || i.sourceType === 'ransom').length,
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
