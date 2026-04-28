/* ── Configuration ────────────────────────────────────── */

const API_URL = '/api/feeds';
const REFRESH_INTERVAL = 2 * 60 * 1000;        // 2 minutes
const FETCH_TIMEOUT = 30 * 1000;               // 30 seconds
const HARD_RELOAD_INTERVAL = 60 * 60 * 1000;   // 60 minutes
const MAX_REFRESH_BACKOFF = 10 * 60 * 1000;    // 10 minutes
const FEED_SCROLL_SPEED = 0.012;               // px per ms
const GLOBAL_FEED_SCROLL_SPEED_MULTIPLIER = 0.5;
const FEED_INTERACTION_PAUSE = 12000;          // 12 seconds
const FEED_EDGE_PAUSE = 2500;                  // 2.5 seconds
const PREVIEW_TWO_SENTENCE_MAX = 240;
const CYBER_CARD_MAX_CHARS = 120;
const CYBER_CARD_MAX_LINES = 2;
let consecutiveFailures = 0;
let refreshTimerId = null;
let refreshInFlight = false;
const feedScrollers = new WeakMap();
const renderedFeedItems = new Map();

const CYBER_KEYWORDS = /\b(breach|leak|infostealer|stealer|malware|ransomware|data dump|credentials|dark web|compromised)\b/i;

/* ── Country → Flag Emoji Mapping ─────────────────────── */

const COUNTRY_ALIAS_MAP = {
  AF: ['Afghanistan', 'Afghan', 'Kabul', 'Taliban'],
  AL: ['Albania', 'Albanian', 'Tirana'],
  DZ: ['Algeria', 'Algerian', 'Algiers'],
  AD: ['Andorra'],
  AO: ['Angola', 'Angolan', 'Luanda'],
  AG: ['Antigua and Barbuda', 'Antigua'],
  AR: ['Argentina', 'Argentine', 'Buenos Aires'],
  AM: ['Armenia', 'Armenian', 'Yerevan'],
  AU: ['Australia', 'Australian', 'Canberra', 'Sydney'],
  AT: ['Austria', 'Austrian', 'Vienna'],
  AZ: ['Azerbaijan', 'Azerbaijani', 'Baku'],
  BS: ['Bahamas', 'Bahamian', 'Nassau'],
  BH: ['Bahrain', 'Bahraini', 'Manama'],
  BD: ['Bangladesh', 'Bangladeshi', 'Dhaka'],
  BB: ['Barbados', 'Barbadian', 'Bridgetown'],
  BY: ['Belarus', 'Belarusian', 'Minsk'],
  BE: ['Belgium', 'Belgian', 'Brussels'],
  BZ: ['Belize', 'Belmopan'],
  BJ: ['Benin', 'Cotonou'],
  BT: ['Bhutan', 'Bhutanese', 'Thimphu'],
  BO: ['Bolivia', 'Bolivian', 'La Paz', 'Sucre'],
  BA: ['Bosnia and Herzegovina', 'Bosnia', 'Bosnian', 'Sarajevo'],
  BW: ['Botswana', 'Gaborone'],
  BR: ['Brazil', 'Brazilian', 'Brasilia', 'Brasília'],
  BN: ['Brunei', 'Bandar Seri Begawan'],
  BG: ['Bulgaria', 'Bulgarian', 'Sofia'],
  BF: ['Burkina Faso', 'Ouagadougou'],
  BI: ['Burundi', 'Bujumbura', 'Gitega'],
  CV: ['Cabo Verde', 'Cape Verde'],
  KH: ['Cambodia', 'Cambodian', 'Phnom Penh'],
  CM: ['Cameroon', 'Cameroonian', 'Yaounde', 'Yaoundé'],
  CA: ['Canada', 'Canadian', 'Ottawa', 'Toronto'],
  CF: ['Central African Republic', 'Bangui'],
  TD: ['Chad', 'Chadian', "N'Djamena"],
  CL: ['Chile', 'Chilean', 'Santiago'],
  CN: ['China', 'Chinese', 'Beijing', 'Xi Jinping'],
  CO: ['Colombia', 'Colombian', 'Bogota', 'Bogotá'],
  KM: ['Comoros', 'Moroni'],
  CG: ['Republic of the Congo', 'Congo Republic', 'Brazzaville'],
  CD: ['Democratic Republic of the Congo', 'DRC', 'DR Congo', 'Kinshasa'],
  CR: ['Costa Rica', 'Costa Rican', 'San Jose', 'San José'],
  CI: ["Cote d'Ivoire", "Côte d'Ivoire", 'Ivory Coast', 'Abidjan', 'Yamoussoukro'],
  HR: ['Croatia', 'Croatian', 'Zagreb'],
  CU: ['Cuba', 'Cuban', 'Havana'],
  CY: ['Cyprus', 'Cypriot', 'Nicosia'],
  CZ: ['Czech Republic', 'Czechia', 'Czech', 'Prague'],
  DK: ['Denmark', 'Danish', 'Copenhagen'],
  DJ: ['Djibouti'],
  DM: ['Dominica'],
  DO: ['Dominican Republic', 'Santo Domingo'],
  EC: ['Ecuador', 'Ecuadorian', 'Quito', 'Guayaquil'],
  EG: ['Egypt', 'Egyptian', 'Cairo'],
  SV: ['El Salvador', 'Salvadoran', 'San Salvador'],
  GQ: ['Equatorial Guinea', 'Malabo'],
  ER: ['Eritrea', 'Asmara'],
  EE: ['Estonia', 'Estonian', 'Tallinn'],
  SZ: ['Eswatini', 'Swaziland', 'Mbabane'],
  ET: ['Ethiopia', 'Ethiopian', 'Addis Ababa'],
  FJ: ['Fiji', 'Suva'],
  FI: ['Finland', 'Finnish', 'Helsinki'],
  FR: ['France', 'French', 'Paris', 'Macron'],
  GA: ['Gabon', 'Libreville'],
  GM: ['Gambia', 'Banjul'],
  GE: ['Georgia', 'Georgian', 'Tbilisi'],
  DE: ['Germany', 'German', 'Berlin'],
  GH: ['Ghana', 'Ghanaian', 'Accra'],
  GR: ['Greece', 'Greek', 'Athens'],
  GD: ['Grenada'],
  GT: ['Guatemala', 'Guatemalan', 'Guatemala City'],
  GN: ['Guinea', 'Conakry'],
  GW: ['Guinea-Bissau', 'Bissau'],
  GY: ['Guyana', 'Georgetown'],
  HT: ['Haiti', 'Haitian', 'Port-au-Prince'],
  HN: ['Honduras', 'Honduran', 'Tegucigalpa'],
  HU: ['Hungary', 'Hungarian', 'Budapest'],
  IS: ['Iceland', 'Icelandic', 'Reykjavik', 'Reykjavík'],
  IN: ['India', 'Indian', 'Delhi', 'Mumbai', 'Modi'],
  ID: ['Indonesia', 'Indonesian', 'Jakarta'],
  IR: ['Iran', 'Iranian', 'Tehran'],
  IQ: ['Iraq', 'Iraqi', 'Baghdad'],
  IE: ['Ireland', 'Irish', 'Dublin'],
  IL: ['Israel', 'Israeli', 'Tel Aviv', 'Jerusalem', 'Netanyahu', 'Gaza'],
  IT: ['Italy', 'Italian', 'Rome', 'Milan', 'Naples'],
  JM: ['Jamaica', 'Jamaican', 'Kingston'],
  JP: ['Japan', 'Japanese', 'Tokyo'],
  JO: ['Jordan', 'Jordanian', 'Amman'],
  KZ: ['Kazakhstan', 'Kazakh', 'Astana', 'Almaty'],
  KE: ['Kenya', 'Kenyan', 'Nairobi'],
  KI: ['Kiribati', 'Tarawa'],
  KW: ['Kuwait', 'Kuwaiti', 'Kuwait City'],
  KG: ['Kyrgyzstan', 'Kyrgyz', 'Bishkek'],
  LA: ['Laos', 'Lao', 'Vientiane'],
  LV: ['Latvia', 'Latvian', 'Riga'],
  LB: ['Lebanon', 'Lebanese', 'Beirut', 'Hezbollah'],
  LS: ['Lesotho', 'Maseru'],
  LR: ['Liberia', 'Monrovia'],
  LY: ['Libya', 'Libyan', 'Tripoli'],
  LI: ['Liechtenstein', 'Vaduz'],
  LT: ['Lithuania', 'Lithuanian', 'Vilnius'],
  LU: ['Luxembourg', 'Luxembourgish'],
  MG: ['Madagascar', 'Antananarivo'],
  MW: ['Malawi', 'Lilongwe'],
  MY: ['Malaysia', 'Malaysian', 'Kuala Lumpur'],
  MV: ['Maldives', 'Male', 'Malé'],
  ML: ['Mali', 'Bamako'],
  MT: ['Malta', 'Maltese', 'Valletta'],
  MH: ['Marshall Islands'],
  MR: ['Mauritania', 'Mauritanian', 'Nouakchott'],
  MU: ['Mauritius', 'Port Louis'],
  MX: ['Mexico', 'Mexican', 'Mexico City'],
  FM: ['Micronesia', 'Federated States of Micronesia'],
  MD: ['Moldova', 'Moldovan', 'Chisinau', 'Chișinău'],
  MC: ['Monaco'],
  MN: ['Mongolia', 'Mongolian', 'Ulaanbaatar'],
  ME: ['Montenegro', 'Podgorica'],
  MA: ['Morocco', 'Moroccan', 'Rabat'],
  MZ: ['Mozambique', 'Maputo'],
  MM: ['Myanmar', 'Burma', 'Yangon', 'Naypyidaw'],
  NA: ['Namibia', 'Windhoek'],
  NR: ['Nauru'],
  NP: ['Nepal', 'Nepalese', 'Kathmandu'],
  NL: ['Netherlands', 'Dutch', 'Amsterdam', 'The Hague'],
  NZ: ['New Zealand', 'New Zealander', 'Wellington'],
  NI: ['Nicaragua', 'Nicaraguan', 'Managua'],
  NE: ['Niger', 'Niamey'],
  NG: ['Nigeria', 'Nigerian', 'Lagos', 'Abuja'],
  KP: ['North Korea', 'Pyongyang', 'Kim Jong'],
  MK: ['North Macedonia', 'Skopje'],
  NO: ['Norway', 'Norwegian', 'Oslo'],
  OM: ['Oman', 'Muscat'],
  PK: ['Pakistan', 'Pakistani', 'Islamabad'],
  PW: ['Palau'],
  PS: ['Palestine', 'Palestinian', 'West Bank', 'Hamas'],
  PA: ['Panama', 'Panamanian', 'Panama City', 'Panama Canal'],
  PG: ['Papua New Guinea', 'Port Moresby'],
  PY: ['Paraguay', 'Paraguayan', 'Asuncion', 'Asunción'],
  PE: ['Peru', 'Peruvian', 'Lima'],
  PH: ['Philippines', 'Filipino', 'Manila'],
  PL: ['Poland', 'Polish', 'Warsaw'],
  PT: ['Portugal', 'Portuguese', 'Lisbon'],
  QA: ['Qatar', 'Qatari', 'Doha'],
  RO: ['Romania', 'Romanian', 'Bucharest'],
  RU: ['Russia', 'Russian', 'Moscow', 'Putin', 'Kremlin'],
  RW: ['Rwanda', 'Kigali'],
  KN: ['Saint Kitts and Nevis'],
  LC: ['Saint Lucia'],
  VC: ['Saint Vincent and the Grenadines'],
  WS: ['Samoa', 'Apia'],
  SM: ['San Marino'],
  ST: ['Sao Tome and Principe', 'São Tomé and Príncipe'],
  SA: ['Saudi', 'Saudi Arabia', 'Riyadh'],
  SN: ['Senegal', 'Dakar'],
  RS: ['Serbia', 'Serbian', 'Belgrade'],
  SC: ['Seychelles'],
  SL: ['Sierra Leone', 'Freetown'],
  SG: ['Singapore'],
  SK: ['Slovakia', 'Slovak', 'Bratislava'],
  SI: ['Slovenia', 'Slovenian', 'Ljubljana'],
  SB: ['Solomon Islands'],
  SO: ['Somalia', 'Somali', 'Mogadishu'],
  ZA: ['South Africa', 'Johannesburg', 'Cape Town', 'Pretoria'],
  KR: ['South Korea', 'Korean', 'Seoul'],
  SS: ['South Sudan', 'Juba'],
  ES: ['Spain', 'Spanish', 'Madrid'],
  LK: ['Sri Lanka', 'Colombo'],
  SD: ['Sudan', 'Sudanese', 'Khartoum'],
  SR: ['Suriname', 'Paramaribo'],
  SE: ['Sweden', 'Swedish', 'Stockholm'],
  CH: ['Switzerland', 'Swiss', 'Bern', 'Geneva'],
  SY: ['Syria', 'Syrian', 'Damascus'],
  TW: ['Taiwan', 'Taiwanese', 'Taipei'],
  TJ: ['Tajikistan', 'Dushanbe'],
  TZ: ['Tanzania', 'Dodoma', 'Dar es Salaam'],
  TH: ['Thailand', 'Thai', 'Bangkok'],
  TL: ['Timor-Leste', 'East Timor', 'Dili'],
  TG: ['Togo', 'Togolese', 'Lome', 'Lomé'],
  TO: ['Tonga'],
  TT: ['Trinidad and Tobago'],
  TN: ['Tunisia', 'Tunis'],
  TR: ['Turkey', 'Türkiye', 'Turkiye', 'Turkish', 'Ankara', 'Istanbul', 'Erdogan', 'Erdoğan'],
  TM: ['Turkmenistan', 'Ashgabat'],
  TV: ['Tuvalu'],
  UG: ['Uganda', 'Kampala'],
  UA: ['Ukraine', 'Ukrainian', 'Kyiv', 'Kiev', 'Zelensky', 'Zelenskyy'],
  AE: ['United Arab Emirates', 'UAE', 'Abu Dhabi', 'Dubai'],
  GB: ['UK', 'Britain', 'British', 'United Kingdom', 'England', 'English', 'Scotland', 'Scottish', 'Wales', 'Welsh', 'London', 'Manchester', 'Birmingham', 'Liverpool', 'Belfast', 'Edinburgh'],
  US: ['United States', 'US', 'USA', 'U.S.', 'American', 'Washington', 'Pentagon', 'White House', 'New York'],
  UY: ['Uruguay', 'Montevideo'],
  UZ: ['Uzbekistan', 'Tashkent'],
  VU: ['Vanuatu'],
  VA: ['Vatican', 'Holy See'],
  VE: ['Venezuela', 'Venezuelan', 'Caracas', 'Maduro'],
  VN: ['Vietnam', 'Vietnamese', 'Hanoi', 'Ho Chi Minh City'],
  YE: ['Yemen', 'Yemeni', 'Houthi'],
  ZM: ['Zambia', 'Zambian', 'Lusaka', 'Copperbelt', 'Kitwe', 'Ndola'],
  ZW: ['Zimbabwe', 'Zimbabwean', 'Harare'],
  EU: ['European Union', 'EU', 'Brussels'],
  UN: ['United Nations', 'UN'],
};

function flagFromCode(code) {
  if (code === 'EU') return '\u{1F1EA}\u{1F1FA}';
  if (code === 'UN') return '\u{1F1FA}\u{1F1F3}';
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...code.split('').map(char => 127397 + char.charCodeAt(0)));
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const COUNTRY_FLAGS = Object.entries(COUNTRY_ALIAS_MAP).map(([code, aliases]) => ({
  pattern: new RegExp(`\\b(${aliases.map(escapeRegex).join('|')})\\b`, 'i'),
  flag: flagFromCode(code),
}));

function detectFlags(text) {
  const seen = new Set();
  const flags = [];
  for (const { pattern, flag } of COUNTRY_FLAGS) {
    if (pattern.test(text) && !seen.has(flag)) {
      seen.add(flag);
      flags.push(flag);
    }
    if (flags.length >= 3) break;
  }
  return flags;
}

/* ── Source Type Styling ──────────────────────────────── */

const SOURCE_STYLES = {
  conflict:      { colorClass: 'feed-item__source--conflict',      badge: 'CONFLICT' },
  analysis:      { colorClass: 'feed-item__source--analysis',      badge: 'ANALYSIS' },
  disaster:      { colorClass: 'feed-item__source--disaster',      badge: 'DISASTER' },
  seismic:       { colorClass: 'feed-item__source--seismic',       badge: 'QUAKE' },
  acled:         { colorClass: 'feed-item__source--conflict',      badge: 'ACLED' },
  humanitarian:  { colorClass: 'feed-item__source--humanitarian',  badge: 'ALERT' },
  kev:           { colorClass: 'feed-item__source--red',           badge: 'KEV' },
  ioc:           { colorClass: 'feed-item__source--conflict',      badge: 'IOC' },
  c2:            { colorClass: 'feed-item__source--red',           badge: 'C2' },
  ncsc:          { colorClass: 'feed-item__source--blue',          badge: null },
  breach:        { colorClass: 'feed-item__source--analysis',      badge: 'BREACH' },
  ransom:        { colorClass: 'feed-item__source--red',           badge: null },
  osint:         { colorClass: 'feed-item__source--osint',         badge: 'OSINT' },
};

function getSourceStyle(item) {
  return SOURCE_STYLES[item.sourceType] || { colorClass: null, badge: null };
}

/* ── Clocks ───────────────────────────────────────────── */

function updateClocks() {
  document.querySelectorAll('.clock').forEach(el => {
    const tz = el.dataset.tz;
    const now = new Date();
    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const dateFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
    el.querySelector('.clock__time').textContent = timeFmt.format(now);
    el.querySelector('.clock__date').textContent = dateFmt.format(now);
  });
}

setInterval(updateClocks, 1000);
updateClocks();
initializeFeedScrollInteractions();

/* ── Relative Time ────────────────────────────────────── */

function relativeTime(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'unknown';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return 'scheduled';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

/* ── Age Classification ───────────────────────────────── */

function ageClass(dateStr) {
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours > 12) return ' feed-item--stale';
  if (hours > 4) return ' feed-item--aging';
  return '';
}

function itemKey(item) {
  return [
    item.source || '',
    item.title || '',
    item.link || '',
    item.pubDate || '',
  ].join('||');
}

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(text) {
  return escapeHtml(text)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeClassToken(value) {
  return /^[a-z0-9_-]+$/i.test(value || '') ? value : '';
}

function safeItemLink(link) {
  const raw = (link || '').trim();
  if (!raw) return '#';

  try {
    const url = new URL(raw, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '#';
  } catch {
    return '#';
  }
}

function summarizeDescription(desc) {
  const clean = (desc || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*/g)?.map(s => s.trim()).filter(Boolean) || [];
  if (!sentences.length) return clean;

  const firstSentence = sentences[0] || '';
  const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();

  if (firstTwoSentences && firstTwoSentences.length <= PREVIEW_TWO_SENTENCE_MAX) {
    return firstTwoSentences;
  }
  if (firstSentence) return firstSentence;
  return clean;
}

function clipSentence(text, maxChars) {
  if (text.length <= maxChars) return text;
  const clipped = text.slice(0, maxChars);
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped).trim() + '...';
}

function findSentenceBoundary(text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '!' || ch === '?') return i + 1;
    if (ch !== '.') continue;

    const prev = text[i - 1] || '';
    const next = text[i + 1] || '';
    if (/\d/.test(prev) && /\d/.test(next)) continue;

    const rest = text.slice(i + 1);
    if (/^\s*["')\]]*\s*$/.test(rest)) return i + 1;
    if (/^\s*["')\]]*\s+[A-Z]/.test(rest)) return i + 1;
  }
  return -1;
}

function summarizeCyberDescription(desc, maxLines = CYBER_CARD_MAX_LINES, maxChars = CYBER_CARD_MAX_CHARS) {
  const clean = (desc || '').replace(/\r/g, '').trim();
  if (!clean) return '';

  if (clean.includes('\n')) {
    return clean
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, maxLines)
      .map(line => clipSentence(line, 58))
      .join('\n');
  }

  const compact = clean.replace(/\s+/g, ' ').trim();
  const boundary = findSentenceBoundary(compact);
  const firstSentence = boundary > 0 ? compact.slice(0, boundary).trim() : '';
  return clipSentence(firstSentence || compact, maxChars);
}

/* ── Rendering ────────────────────────────────────────── */

function createItemHTML(item, defaultColorClass, highlight = false, isNew = false, dimByAge = true, suppressBadges = false, calmMeta = false) {
  const escapedTitle = escapeHtml(item.title || '');
  const escapedSource = escapeHtml(item.source || 'Unknown');
  const escapedLink = escapeAttribute(safeItemLink(item.link));
  const sourceType = safeClassToken(item.sourceType);
  const highlightClass = highlight ? ' feed-item--highlight' : '';
  const newClass = isNew ? ' feed-item--new' : '';
  const ageClassName = dimByAge ? ageClass(item.pubDate) : '';
  const isOsint = sourceType === 'osint';

  const style = SOURCE_STYLES[sourceType] || { colorClass: null, badge: null };
  const colorClass = calmMeta ? defaultColorClass : (style.colorClass || defaultColorClass);
  const badgeHTML = !isOsint && !suppressBadges && style.badge
    ? `<span class="feed-item__badge feed-item__badge--${sourceType}">${style.badge}</span>`
    : '';

  const text = item.title + ' ' + (item.description || '');
  const flags = detectFlags(text);
  const flagsHTML = !isOsint && flags.length
    ? `<span class="feed-item__flags">${flags.join('')}</span>`
    : '';

  const typeClass = sourceType && sourceType !== 'news'
    ? ` feed-item--${sourceType}`
    : '';

  const fatalClass = sourceType === 'acled' && /\[\d+ killed\]/.test(item.title)
    ? ' feed-item--fatal' : '';

  const desc = item.description
    ? item.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    : '';
  const preview = (sourceType === 'cyber' || sourceType === 'osint' || sourceType === 'ransom')
    ? summarizeCyberDescription(
      desc,
      sourceType === 'ransom' ? 4 : CYBER_CARD_MAX_LINES,
      sourceType === 'ransom' ? 180 : CYBER_CARD_MAX_CHARS,
    )
    : summarizeDescription(desc);
  let descClass = 'feed-item__desc';
  if (sourceType === 'cyber' || sourceType === 'ransom') descClass += ' feed-item__desc--cyber';
  if (sourceType === 'ransom') descClass += ' feed-item__desc--ransom';
  if (preview.includes('\n')) descClass += ' feed-item__desc--preformatted';
  const descHTML = preview
    ? `<p class="${descClass}">${escapeHtml(preview)}</p>`
    : '';

  return `
    <div class="feed-item${highlightClass}${newClass}${typeClass}${fatalClass}${ageClassName}">
      <div class="feed-item__meta">
        ${badgeHTML}
        <span class="feed-item__source ${colorClass}">${escapedSource}</span>
        ${flagsHTML}
        <span>${relativeTime(item.pubDate)}</span>
      </div>
      <a class="feed-item__headline" href="${escapedLink}" target="_blank" rel="noopener">${escapedTitle}</a>
      ${descHTML}
    </div>`;
}

function renderFeed(containerId, items, defaultColorClass, highlightRegex) {
  const container = document.getElementById(containerId);
  const scrollEl = container.closest('.feed__scroll');
  const previousKeys = renderedFeedItems.get(containerId);
  const isAoiFeed = containerId.startsWith('items-aoi-');
  const isGeoFeed = isAoiFeed || containerId === 'items-global';
  const dimByAge = !isAoiFeed || items.length > 4;

  if (!items.length) {
    if (scrollEl) destroyFeedScroller(scrollEl);
    renderedFeedItems.set(containerId, new Set());
    container.innerHTML = '<div class="feed-item"><span class="feed-item__meta" style="color:var(--text-muted)">No active alerts</span></div>';
    return;
  }

  const nextKeys = new Set(items.map(itemKey));
  container.innerHTML = items.map(item => {
    const highlight = highlightRegex ? highlightRegex.test(item.title + ' ' + (item.description || '')) : false;
    const isNew = Boolean(previousKeys && !previousKeys.has(itemKey(item)));
    return createItemHTML(item, defaultColorClass, highlight, isNew, dimByAge, isGeoFeed, isGeoFeed);
  }).join('');
  renderedFeedItems.set(containerId, nextKeys);

  if (scrollEl) requestAnimationFrame(() => setupFeedScroller(scrollEl));
}

function renderCyberFeed(containerId, items) {
  const container = document.getElementById(containerId);
  const scrollEl = container.closest('.feed__scroll');
  const previousKeys = renderedFeedItems.get(containerId);
  if (!items.length) {
    if (scrollEl) destroyFeedScroller(scrollEl);
    renderedFeedItems.set(containerId, new Set());
    container.innerHTML = '<div class="feed-item"><span class="feed-item__meta" style="color:var(--text-muted)">No active alerts</span></div>';
    return;
  }
  const orderedItems = items.slice()
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const nextKeys = new Set(orderedItems.map(itemKey));
  const html = orderedItems.map(item => {
    const highlight = CYBER_KEYWORDS.test(item.title + ' ' + (item.description || ''));
    const isNew = Boolean(previousKeys && !previousKeys.has(itemKey(item)));
    return createItemHTML(item, 'feed-item__source--red', highlight, isNew, false);
  }).join('');
  renderedFeedItems.set(containerId, nextKeys);
  container.innerHTML = html;

  if (scrollEl) requestAnimationFrame(() => setupFeedScroller(scrollEl));
}

function renderOsintFeed(containerId, items) {
  const container = document.getElementById(containerId);
  const scrollEl = container.closest('.feed__scroll');
  const previousKeys = renderedFeedItems.get(containerId);

  if (!items.length) {
    if (scrollEl) destroyFeedScroller(scrollEl);
    renderedFeedItems.set(containerId, new Set());
    container.innerHTML = '<div class="feed-item"><span class="feed-item__meta" style="color:var(--text-muted)">No recent OSINT updates</span></div>';
    return;
  }

  const orderedItems = items.slice()
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const nextKeys = new Set(orderedItems.map(itemKey));
  container.innerHTML = orderedItems.map(item => {
    const isNew = Boolean(previousKeys && !previousKeys.has(itemKey(item)));
    return createItemHTML(item, 'feed-item__source--osint', false, isNew, false);
  }).join('');
  renderedFeedItems.set(containerId, nextKeys);

  if (scrollEl) requestAnimationFrame(() => setupFeedScroller(scrollEl));
}

function destroyFeedScroller(scrollEl) {
  const state = feedScrollers.get(scrollEl);
  if (!state) return;
  state.abort.abort();
  cancelAnimationFrame(state.rafId);
  feedScrollers.delete(scrollEl);
}

function setupFeedScroller(scrollEl) {
  if (!scrollEl) return;

  destroyFeedScroller(scrollEl);

  const isHorizontal = scrollEl.classList.contains('feed__scroll--horizontal');
  const getScrollMax = () => isHorizontal
    ? scrollEl.scrollWidth - scrollEl.clientWidth
    : scrollEl.scrollHeight - scrollEl.clientHeight;
  const getScrollPosition = () => isHorizontal ? scrollEl.scrollLeft : scrollEl.scrollTop;
  const setScrollPosition = value => {
    if (isHorizontal) scrollEl.scrollLeft = value;
    else scrollEl.scrollTop = value;
  };

  const maxScroll = getScrollMax();
  if (maxScroll <= 0) {
    setScrollPosition(0);
    return;
  }

  const abort = new AbortController();
  const scrollSpeed = scrollEl.id === 'scroll-global'
    ? FEED_SCROLL_SPEED * GLOBAL_FEED_SCROLL_SPEED_MULTIPLIER
    : FEED_SCROLL_SPEED;
  const state = {
    abort,
    direction: 1,
    hovering: false,
    lastTs: null,
    pauseUntil: performance.now() + FEED_EDGE_PAUSE,
    rafId: 0,
  };
  feedScrollers.set(scrollEl, state);

  function pauseAutoScroll(ms = FEED_INTERACTION_PAUSE) {
    state.pauseUntil = performance.now() + ms;
  }

  function tick(ts) {
    if (feedScrollers.get(scrollEl) !== state) return;

    if (state.lastTs == null) {
      state.lastTs = ts;
    } else {
      const delta = ts - state.lastTs;
      state.lastTs = ts;

      if (!document.hidden && !state.hovering && ts >= state.pauseUntil) {
        const currentMax = getScrollMax();
        if (currentMax <= 0) {
          setScrollPosition(0);
        } else {
          const next = getScrollPosition() + (delta * scrollSpeed * state.direction);

          if (next >= currentMax) {
            setScrollPosition(currentMax);
            state.direction = -1;
            state.pauseUntil = ts + FEED_EDGE_PAUSE;
          } else if (next <= 0) {
            setScrollPosition(0);
            state.direction = 1;
            state.pauseUntil = ts + FEED_EDGE_PAUSE;
          } else {
            setScrollPosition(next);
          }
        }
      }
    }

    state.rafId = requestAnimationFrame(tick);
  }

  scrollEl.addEventListener('mouseenter', () => {
    state.hovering = true;
  }, { signal: abort.signal });

  scrollEl.addEventListener('mouseleave', () => {
    state.hovering = false;
    pauseAutoScroll(1500);
  }, { signal: abort.signal });

  scrollEl.addEventListener('touchstart', () => pauseAutoScroll(), { passive: true, signal: abort.signal });
  scrollEl.addEventListener('wheel', () => pauseAutoScroll(), { passive: true, signal: abort.signal });

  state.rafId = requestAnimationFrame(tick);
}

function initializeFeedScrollInteractions() {
  document.querySelectorAll('.feed__scroll').forEach(scrollEl => {
    if (scrollEl.dataset.scrollBound === 'true') return;
    scrollEl.dataset.scrollBound = 'true';

    const isHorizontal = scrollEl.classList.contains('feed__scroll--horizontal');
    scrollEl.addEventListener('wheel', event => {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;

      if (isHorizontal) {
        const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
        if (maxScroll <= 0) return;
        event.preventDefault();
        scrollEl.scrollLeft = Math.max(0, Math.min(maxScroll, scrollEl.scrollLeft + delta));
        return;
      }

      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;

      event.preventDefault();
      const next = Math.max(0, Math.min(maxScroll, scrollEl.scrollTop + delta));
      scrollEl.scrollTop = next;
    }, { passive: false });
  });
}

/* ── Connection Status ────────────────────────────────── */

function updateStatus(ok, cachedAt) {
  const dot = document.getElementById('status-dot');
  const updated = document.getElementById('last-updated');

  if (ok) {
    dot.classList.remove('status-dot--error');
    dot.style.background = '';
    dot.title = 'Connected';
    if (cachedAt) {
      const d = new Date(cachedAt);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      updated.textContent = `Updated: ${hh}:${mm}`;
    }
  } else {
    dot.classList.add('status-dot--error');
    dot.title = 'Feed error';
  }
}

/* ── Data Fetching ────────────────────────────────────── */

function updateCyberStats(stats) {
  const el = document.getElementById('cyber-stats');
  if (!el || !stats) return;
  const parts = [];
  if (stats.kev) parts.push(`<span class="cyber-stats__item"><span class="cyber-stats__count">${stats.kev}</span> KEV</span>`);
  if (stats.ncsc) parts.push(`<span class="cyber-stats__item"><span class="cyber-stats__count">${stats.ncsc}</span> NCSC</span>`);
  if (stats.breach) parts.push(`<span class="cyber-stats__item"><span class="cyber-stats__count">${stats.breach}</span> BREACH</span>`);
  if (stats.ioc) parts.push(`<span class="cyber-stats__item"><span class="cyber-stats__count">${stats.ioc}</span> IOC</span>`);
  if (stats.c2) parts.push(`<span class="cyber-stats__item"><span class="cyber-stats__count">${stats.c2}</span> C2</span>`);
  el.innerHTML = parts.join('');
}

function updateInfocon(level) {
  const dot = document.getElementById('infocon-dot');
  const label = document.getElementById('infocon-label');
  if (!dot || !label) return;

  const lvl = (level || 'green').toLowerCase();
  dot.className = 'infocon__dot infocon__dot--' + lvl;
  label.textContent = 'INFOCON: ' + lvl.toUpperCase();
}

async function fetchDashboardData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Feed returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function refreshDashboard() {
  if (refreshInFlight) return;
  refreshInFlight = true;

  try {
    const data = await fetchDashboardData();

    const aoi = data.aoi || {};
    renderFeed('items-aoi-uk', aoi.uk || [], 'feed-item__source--blue');
    renderFeed('items-aoi-zambia', aoi.zambia || [], 'feed-item__source--blue');
    renderFeed('items-aoi-panama', aoi.panama || [], 'feed-item__source--blue');
    renderFeed('items-global', data.global || [], 'feed-item__source--blue');
    renderOsintFeed('items-osint', data.osint || []);
    renderCyberFeed('items-cyber', data.cyber || []);

    updateInfocon(data.threatLevel);
    updateCyberStats(data.cyberStats);
    updateStatus(true, data.cachedAt);
    consecutiveFailures = 0;
  } catch (err) {
    updateStatus(false);
    consecutiveFailures++;
    console.error('Dashboard refresh failed:', err.message || err);
  } finally {
    refreshInFlight = false;
  }
}

function nextRefreshDelay() {
  if (consecutiveFailures < 3) return REFRESH_INTERVAL;
  return Math.min(
    REFRESH_INTERVAL * Math.pow(2, consecutiveFailures - 2),
    MAX_REFRESH_BACKOFF,
  );
}

function scheduleNextRefresh(delay = nextRefreshDelay()) {
  if (refreshTimerId) clearTimeout(refreshTimerId);
  refreshTimerId = setTimeout(async () => {
    await refreshDashboard();
    scheduleNextRefresh();
  }, delay);
}

/* ── Init & Timers ────────────────────────────────────── */

refreshDashboard().finally(() => scheduleNextRefresh());

setTimeout(() => {
  if (!document.hidden) location.reload();
  else document.addEventListener('visibilitychange', () => {
    if (!document.hidden) location.reload();
  }, { once: true });
}, HARD_RELOAD_INTERVAL);
