/* ── Configuration ────────────────────────────────────── */

const API_URL = '/api/feeds';
const REFRESH_INTERVAL = 2 * 60 * 1000;        // 2 minutes
const HARD_RELOAD_INTERVAL = 60 * 60 * 1000;   // 60 minutes
const CYBER_TICKER_SPEED = 0.026;              // px per ms
const CYBER_INTERACTION_PAUSE = 12000;         // 12 seconds
let consecutiveFailures = 0;
let cyberTicker = null;

const CYBER_KEYWORDS = /\b(breach|leak|infostealer|stealer|malware|ransomware|data dump|credentials|dark web|compromised)\b/i;

/* ── Country → Flag Emoji Mapping ─────────────────────── */

const COUNTRY_FLAGS = [
  { pattern: /\b(UK|Britain|British|England|English|Scotland|Scottish|Wales|Welsh|London|Manchester|Birmingham|Liverpool|Belfast|Edinburgh)\b/i, flag: '\u{1F1EC}\u{1F1E7}' },
  { pattern: /\b(Zambia|Lusaka|Zambian)\b/i, flag: '\u{1F1FF}\u{1F1F2}' },
  { pattern: /\b(Panama|Panamanian)\b/i, flag: '\u{1F1F5}\u{1F1E6}' },
  { pattern: /\b(Italy|Italian|Rome|Milan|Naples)\b/i, flag: '\u{1F1EE}\u{1F1F9}' },
  { pattern: /\b(United States|USA|U\.S\.|American|Washington|Biden|Trump|Pentagon|White House)\b/i, flag: '\u{1F1FA}\u{1F1F8}' },
  { pattern: /\b(China|Chinese|Beijing|Xi Jinping)\b/i, flag: '\u{1F1E8}\u{1F1F3}' },
  { pattern: /\b(Russia|Russian|Moscow|Putin|Kremlin)\b/i, flag: '\u{1F1F7}\u{1F1FA}' },
  { pattern: /\b(Ukraine|Ukrainian|Kyiv|Zelensky)\b/i, flag: '\u{1F1FA}\u{1F1E6}' },
  { pattern: /\b(France|French|Paris|Macron)\b/i, flag: '\u{1F1EB}\u{1F1F7}' },
  { pattern: /\b(Germany|German|Berlin)\b/i, flag: '\u{1F1E9}\u{1F1EA}' },
  { pattern: /\b(Israel|Israeli|Tel Aviv|Jerusalem|Netanyahu|Gaza)\b/i, flag: '\u{1F1EE}\u{1F1F1}' },
  { pattern: /\b(Palestine|Palestinian|West Bank|Hamas)\b/i, flag: '\u{1F1F5}\u{1F1F8}' },
  { pattern: /\b(Iran|Iranian|Tehran)\b/i, flag: '\u{1F1EE}\u{1F1F7}' },
  { pattern: /\b(Iraq|Iraqi|Baghdad)\b/i, flag: '\u{1F1EE}\u{1F1F6}' },
  { pattern: /\b(Syria|Syrian|Damascus)\b/i, flag: '\u{1F1F8}\u{1F1FE}' },
  { pattern: /\b(India|Indian|Delhi|Mumbai|Modi)\b/i, flag: '\u{1F1EE}\u{1F1F3}' },
  { pattern: /\b(Pakistan|Pakistani|Islamabad)\b/i, flag: '\u{1F1F5}\u{1F1F0}' },
  { pattern: /\b(Japan|Japanese|Tokyo)\b/i, flag: '\u{1F1EF}\u{1F1F5}' },
  { pattern: /\b(South Korea|Korean|Seoul)\b/i, flag: '\u{1F1F0}\u{1F1F7}' },
  { pattern: /\b(North Korea|Pyongyang|Kim Jong)\b/i, flag: '\u{1F1F0}\u{1F1F5}' },
  { pattern: /\b(Turkey|Turkish|Ankara|Istanbul|Erdogan)\b/i, flag: '\u{1F1F9}\u{1F1F7}' },
  { pattern: /\b(Saudi|Riyadh)\b/i, flag: '\u{1F1F8}\u{1F1E6}' },
  { pattern: /\b(Australia|Australian|Canberra|Sydney)\b/i, flag: '\u{1F1E6}\u{1F1FA}' },
  { pattern: /\b(Canada|Canadian|Ottawa|Toronto)\b/i, flag: '\u{1F1E8}\u{1F1E6}' },
  { pattern: /\b(Brazil|Brazilian|Brasilia)\b/i, flag: '\u{1F1E7}\u{1F1F7}' },
  { pattern: /\b(Mexico|Mexican|Mexico City)\b/i, flag: '\u{1F1F2}\u{1F1FD}' },
  { pattern: /\b(Egypt|Egyptian|Cairo)\b/i, flag: '\u{1F1EA}\u{1F1EC}' },
  { pattern: /\b(South Africa|Johannesburg|Cape Town|Pretoria)\b/i, flag: '\u{1F1FF}\u{1F1E6}' },
  { pattern: /\b(Nigeria|Nigerian|Lagos|Abuja)\b/i, flag: '\u{1F1F3}\u{1F1EC}' },
  { pattern: /\b(Spain|Spanish|Madrid)\b/i, flag: '\u{1F1EA}\u{1F1F8}' },
  { pattern: /\b(Poland|Polish|Warsaw)\b/i, flag: '\u{1F1F5}\u{1F1F1}' },
  { pattern: /\b(Netherlands|Dutch|Amsterdam|The Hague)\b/i, flag: '\u{1F1F3}\u{1F1F1}' },
  { pattern: /\b(Taiwan|Taiwanese|Taipei)\b/i, flag: '\u{1F1F9}\u{1F1FC}' },
  { pattern: /\b(Philippines|Filipino|Manila)\b/i, flag: '\u{1F1F5}\u{1F1ED}' },
  { pattern: /\b(Indonesia|Indonesian|Jakarta)\b/i, flag: '\u{1F1EE}\u{1F1E9}' },
  { pattern: /\b(Colombia|Colombian|Bogota)\b/i, flag: '\u{1F1E8}\u{1F1F4}' },
  { pattern: /\b(Argentina|Argentine|Buenos Aires)\b/i, flag: '\u{1F1E6}\u{1F1F7}' },
  { pattern: /\b(Ethiopia|Ethiopian|Addis Ababa)\b/i, flag: '\u{1F1EA}\u{1F1F9}' },
  { pattern: /\b(Kenya|Kenyan|Nairobi)\b/i, flag: '\u{1F1F0}\u{1F1EA}' },
  { pattern: /\b(Sudan|Sudanese|Khartoum)\b/i, flag: '\u{1F1F8}\u{1F1E9}' },
  { pattern: /\b(Libya|Libyan|Tripoli)\b/i, flag: '\u{1F1F1}\u{1F1FE}' },
  { pattern: /\b(Lebanon|Lebanese|Beirut|Hezbollah)\b/i, flag: '\u{1F1F1}\u{1F1E7}' },
  { pattern: /\b(Yemen|Yemeni|Houthi)\b/i, flag: '\u{1F1FE}\u{1F1EA}' },
  { pattern: /\b(Afghanistan|Afghan|Kabul|Taliban)\b/i, flag: '\u{1F1E6}\u{1F1EB}' },
  { pattern: /\b(Venezuela|Venezuelan|Caracas|Maduro)\b/i, flag: '\u{1F1FB}\u{1F1EA}' },
  { pattern: /\b(Cuba|Cuban|Havana)\b/i, flag: '\u{1F1E8}\u{1F1FA}' },
  { pattern: /\b(EU|European Union|Brussels)\b/i, flag: '\u{1F1EA}\u{1F1FA}' },
  { pattern: /\b(UN|United Nations)\b/i, flag: '\u{1F1FA}\u{1F1F3}' },
];

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
  ncsc:          { colorClass: 'feed-item__source--blue',          badge: 'NCSC' },
  breach:        { colorClass: 'feed-item__source--analysis',      badge: 'BREACH' },
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
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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

/* ── Rendering ────────────────────────────────────────── */

function createItemHTML(item, defaultColorClass, highlight = false) {
  const escapedTitle = item.title
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlightClass = highlight ? ' feed-item--highlight' : '';

  const style = getSourceStyle(item);
  const colorClass = style.colorClass || defaultColorClass;
  const badgeHTML = style.badge
    ? `<span class="feed-item__badge feed-item__badge--${item.sourceType}">${style.badge}</span>`
    : '';

  const text = item.title + ' ' + (item.description || '');
  const flags = detectFlags(text);
  const flagsHTML = flags.length
    ? `<span class="feed-item__flags">${flags.join('')}</span>`
    : '';

  const typeClass = item.sourceType && item.sourceType !== 'news'
    ? ` feed-item--${item.sourceType}`
    : '';

  const fatalClass = item.sourceType === 'acled' && /\[\d+ killed\]/.test(item.title)
    ? ' feed-item--fatal' : '';

  const desc = item.description
    ? item.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    : '';
  const descHTML = desc
    ? `<p class="feed-item__desc">${desc.length > 120 ? desc.slice(0, 120) + '...' : desc}</p>`
    : '';

  return `
    <div class="feed-item${highlightClass}${typeClass}${fatalClass}${ageClass(item.pubDate)}">
      <div class="feed-item__meta">
        ${badgeHTML}
        <span class="feed-item__source ${colorClass}">${item.source}</span>
        ${flagsHTML}
        <span>${relativeTime(item.pubDate)}</span>
      </div>
      <a class="feed-item__headline" href="${item.link}" target="_blank" rel="noopener">${escapedTitle}</a>
      ${descHTML}
    </div>`;
}

function renderFeed(containerId, items, defaultColorClass, highlightRegex) {
  const container = document.getElementById(containerId);

  if (!items.length) {
    container.innerHTML = '<div class="feed-item"><span class="feed-item__meta" style="color:var(--text-muted)">No active alerts</span></div>';
    return;
  }

  container.innerHTML = items.map(item => {
    const highlight = highlightRegex ? highlightRegex.test(item.title + ' ' + (item.description || '')) : false;
    return createItemHTML(item, defaultColorClass, highlight);
  }).join('');
}

function renderCyberFeed(containerId, items) {
  const container = document.getElementById(containerId);
  if (!items.length) {
    destroyCyberTicker();
    container.innerHTML = '<div class="feed-item"><span class="feed-item__meta" style="color:var(--text-muted)">No active alerts</span></div>';
    return;
  }
  const html = items.map(item => {
    const highlight = CYBER_KEYWORDS.test(item.title + ' ' + (item.description || ''));
    return createItemHTML(item, 'feed-item__source--red', highlight);
  }).join('');
  container.dataset.baseHtml = html;
  container.innerHTML = html;
  requestAnimationFrame(setupCyberTicker);
}

function destroyCyberTicker() {
  if (!cyberTicker) return;
  cyberTicker.abort.abort();
  cancelAnimationFrame(cyberTicker.rafId);
  cyberTicker = null;
}

function setupCyberTicker() {
  const scrollEl = document.getElementById('scroll-cyber');
  const track = document.getElementById('items-cyber');
  if (!scrollEl || !track) return;

  destroyCyberTicker();
  track.innerHTML = track.dataset.baseHtml || track.innerHTML;

  const baseItems = Array.from(track.children);
  if (!baseItems.length) return;

  let safety = 0;
  while (track.scrollWidth < scrollEl.clientWidth * 1.5 && safety < 4) {
    baseItems.forEach(item => track.appendChild(item.cloneNode(true)));
    safety++;
  }

  const cycleItems = Array.from(track.children).map(item => item.cloneNode(true));
  cycleItems.forEach(item => track.appendChild(item));

  const loopWidth = track.scrollWidth / 2;
  const abort = new AbortController();
  const state = {
    abort,
    hovering: false,
    lastTs: null,
    pauseUntil: performance.now() + 1500,
    loopWidth,
    rafId: 0,
  };
  cyberTicker = state;

  function pauseAutoScroll(ms = CYBER_INTERACTION_PAUSE) {
    state.pauseUntil = performance.now() + ms;
  }

  function normalizeScroll() {
    if (!state.loopWidth) return;
    if (scrollEl.scrollLeft >= state.loopWidth) {
      scrollEl.scrollLeft -= state.loopWidth;
    }
  }

  scrollEl.scrollLeft = 0;

  scrollEl.addEventListener('wheel', event => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    pauseAutoScroll();
    scrollEl.scrollLeft += delta;
    normalizeScroll();
  }, { passive: false, signal: abort.signal });

  scrollEl.addEventListener('mouseenter', () => {
    state.hovering = true;
  }, { signal: abort.signal });

  scrollEl.addEventListener('mouseleave', () => {
    state.hovering = false;
    pauseAutoScroll(1500);
  }, { signal: abort.signal });

  scrollEl.addEventListener('touchstart', () => pauseAutoScroll(), { passive: true, signal: abort.signal });
  scrollEl.addEventListener('scroll', normalizeScroll, { signal: abort.signal });

  window.addEventListener('resize', () => {
    if (cyberTicker === state) requestAnimationFrame(setupCyberTicker);
  }, { signal: abort.signal });

  function tick(ts) {
    if (cyberTicker !== state) return;
    if (state.lastTs == null) {
      state.lastTs = ts;
    } else {
      const delta = ts - state.lastTs;
      state.lastTs = ts;
      if (!document.hidden && !state.hovering && ts >= state.pauseUntil) {
        scrollEl.scrollLeft += delta * CYBER_TICKER_SPEED;
        normalizeScroll();
      }
    }
    state.rafId = requestAnimationFrame(tick);
  }

  state.rafId = requestAnimationFrame(tick);
}

function initializeFeedScrollInteractions() {
  document.querySelectorAll('.feed__scroll').forEach(scrollEl => {
    if (scrollEl.dataset.scrollBound === 'true') return;
    scrollEl.dataset.scrollBound = 'true';

    const isHorizontal = scrollEl.classList.contains('feed__scroll--horizontal');
    scrollEl.addEventListener('wheel', event => {
      if (isHorizontal) return;

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (!delta || maxScroll <= 0) return;

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

async function refreshDashboard() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) { updateStatus(false); return; }
    const data = await res.json();

    const aoi = data.aoi || {};
    renderFeed('items-aoi-uk', aoi.uk || [], 'feed-item__source--amber');
    renderFeed('items-aoi-zambia', aoi.zambia || [], 'feed-item__source--amber');
    renderFeed('items-aoi-panama', aoi.panama || [], 'feed-item__source--amber');
    renderFeed('items-global', data.global || [], 'feed-item__source--blue');
    renderCyberFeed('items-cyber', data.cyber || []);

    updateInfocon(data.threatLevel);
    updateCyberStats(data.cyberStats);
    updateGdeltStatus(data.gdeltRateLimited);
    updateStatus(true, data.cachedAt);
    consecutiveFailures = 0;
  } catch {
    updateStatus(false);
    consecutiveFailures++;
  }
}

function updateGdeltStatus(rateLimited) {
  document.querySelectorAll('.gdelt-warning').forEach(el => el.remove());
  if (!rateLimited) return;
  document.querySelectorAll('#feed-aoi .feed__heading--country, #feed-global .feed__heading--blue').forEach(heading => {
    const pill = document.createElement('span');
    pill.className = 'gdelt-warning';
    pill.textContent = 'GDELT unavailable';
    heading.appendChild(pill);
  });
}

/* ── Init & Timers ────────────────────────────────────── */

refreshDashboard();

setInterval(() => {
  if (consecutiveFailures >= 3) {
    const backoff = Math.min(REFRESH_INTERVAL * Math.pow(2, consecutiveFailures - 2), 10 * 60 * 1000);
    setTimeout(refreshDashboard, backoff - REFRESH_INTERVAL);
    return;
  }
  refreshDashboard();
}, REFRESH_INTERVAL);

setTimeout(() => {
  if (!document.hidden) location.reload();
  else document.addEventListener('visibilitychange', () => {
    if (!document.hidden) location.reload();
  }, { once: true });
}, HARD_RELOAD_INTERVAL);
