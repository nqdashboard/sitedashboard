/* ── Configuration ────────────────────────────────────── */

const API_URL = '/api/feeds';
const REFRESH_INTERVAL = 2 * 60 * 1000;        // 2 minutes
const HARD_RELOAD_INTERVAL = 60 * 60 * 1000;   // 60 minutes
const FEED_SCROLL_SPEED = 0.012;               // px per ms
const GLOBAL_FEED_SCROLL_SPEED_MULTIPLIER = 0.5;
const FEED_INTERACTION_PAUSE = 12000;          // 12 seconds
const FEED_EDGE_PAUSE = 2500;                  // 2.5 seconds
const PREVIEW_TWO_SENTENCE_MAX = 240;
const CYBER_CARD_MAX_CHARS = 120;
const CYBER_CARD_MAX_LINES = 2;
let consecutiveFailures = 0;
const feedScrollers = new WeakMap();
const renderedFeedItems = new Map();

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

function summarizeCyberDescription(desc) {
  const clean = (desc || '').replace(/\r/g, '').trim();
  if (!clean) return '';

  if (clean.includes('\n')) {
    return clean
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, CYBER_CARD_MAX_LINES)
      .map(line => clipSentence(line, 58))
      .join('\n');
  }

  const compact = clean.replace(/\s+/g, ' ').trim();
  const firstSentence = compact.match(/[^.!?]+[.!?]+["')\]]*/)?.[0]?.trim();
  return clipSentence(firstSentence || compact, CYBER_CARD_MAX_CHARS);
}

/* ── Rendering ────────────────────────────────────────── */

function createItemHTML(item, defaultColorClass, highlight = false, isNew = false, dimByAge = true) {
  const escapedTitle = escapeHtml(item.title || '');
  const highlightClass = highlight ? ' feed-item--highlight' : '';
  const newClass = isNew ? ' feed-item--new' : '';
  const ageClassName = dimByAge ? ageClass(item.pubDate) : '';
  const isOsint = item.sourceType === 'osint';

  const style = getSourceStyle(item);
  const colorClass = style.colorClass || defaultColorClass;
  const badgeHTML = !isOsint && style.badge
    ? `<span class="feed-item__badge feed-item__badge--${item.sourceType}">${style.badge}</span>`
    : '';

  const text = item.title + ' ' + (item.description || '');
  const flags = detectFlags(text);
  const flagsHTML = !isOsint && flags.length
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
  const preview = (item.sourceType === 'cyber' || item.sourceType === 'osint')
    ? summarizeCyberDescription(desc)
    : summarizeDescription(desc);
  let descClass = 'feed-item__desc';
  if (item.sourceType === 'cyber') descClass += ' feed-item__desc--cyber';
  if (preview.includes('\n')) descClass += ' feed-item__desc--preformatted';
  const descHTML = preview
    ? `<p class="${descClass}">${escapeHtml(preview)}</p>`
    : '';

  return `
    <div class="feed-item${highlightClass}${newClass}${typeClass}${fatalClass}${ageClassName}">
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
  const scrollEl = container.closest('.feed__scroll');
  const previousKeys = renderedFeedItems.get(containerId);
  const isAoiFeed = containerId.startsWith('items-aoi-');
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
    return createItemHTML(item, defaultColorClass, highlight, isNew, dimByAge);
  }).join('');
  renderedFeedItems.set(containerId, nextKeys);

  if (scrollEl) requestAnimationFrame(() => setupFeedScroller(scrollEl));
}

function renderCyberFeed(containerId, items) {
  const container = document.getElementById(containerId);
  const previousKeys = renderedFeedItems.get(containerId);
  if (!items.length) {
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
}

function renderOsintFeed(containerId, items) {
  const container = document.getElementById(containerId);
  const previousKeys = renderedFeedItems.get(containerId);

  if (!items.length) {
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

  const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
  if (maxScroll <= 0) {
    scrollEl.scrollTop = 0;
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
        const currentMax = scrollEl.scrollHeight - scrollEl.clientHeight;
        if (currentMax <= 0) {
          scrollEl.scrollTop = 0;
        } else {
          const next = scrollEl.scrollTop + (delta * scrollSpeed * state.direction);

          if (next >= currentMax) {
            scrollEl.scrollTop = currentMax;
            state.direction = -1;
            state.pauseUntil = ts + FEED_EDGE_PAUSE;
          } else if (next <= 0) {
            scrollEl.scrollTop = 0;
            state.direction = 1;
            state.pauseUntil = ts + FEED_EDGE_PAUSE;
          } else {
            scrollEl.scrollTop = next;
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
    renderOsintFeed('items-osint', data.osint || []);
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
