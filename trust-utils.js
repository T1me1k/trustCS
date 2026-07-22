(function (global) {
  const DEFAULT_TIMEOUT_MS = 15000;
  const LANG_KEY = 'trust_lang';
  const DASH = '—';

  function backendBaseUrl() {
    const fromWindow = global.TRUST_BACKEND_BASE_URL;
    const fromMeta = global.document?.querySelector('meta[name="trust-backend-url"]')?.content;
    const fromStorage = global.localStorage?.getItem('trust_backend_base_url');
    return String(fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
  }

  function safeNumber(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function optionalNumber(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
  function titleCase(value) { return String(value || '').replace(/[_-]+/g, ' ').trim().replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || DASH; }
  function formatMapName(map) { const raw = String(map || '').trim(); if (!raw) return DASH; return titleCase(raw.replace(/^de[_-]/i, '')); }
  function formatDuration(value) { const n = optionalNumber(value); if (n == null) return DASH; const total = Math.max(0, Math.floor(n)); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60; return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; }
  function formatDate(value, lang = 'ru') { if (!value) return DASH; const d = new Date(value); if (Number.isNaN(d.getTime())) return DASH; return d.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function formatEloChange(value) { const n = optionalNumber(value); if (n == null) return DASH; return n > 0 ? `+${n}` : n < 0 ? String(n) : '0'; }
  function formatPercent(value) { const n = optionalNumber(value); if (n == null) return DASH; const rounded = Math.round(n * 10) / 10; return `${rounded}%`; }
  function formatKd(kills, deaths) { const k = safeNumber(kills, 0); const d = safeNumber(deaths, 0); return (d <= 0 ? k : k / d).toFixed(2).replace(/\.00$/, '.00'); }
  const calculateKd = formatKd;
  function formatMatchResult(result, lang = 'ru') { const key = String(result || '').toLowerCase(); const dict = lang === 'en' ? { win: 'Win', loss: 'Loss', draw: 'Draw', pending: 'Pending' } : { win: 'Победа', loss: 'Поражение', draw: 'Ничья', pending: 'Ожидание' }; return dict[key] || dict.pending; }
  function formatRoundReason(reason, reasonLabel, lang = 'ru') { if (typeof reasonLabel === 'string' && reasonLabel.trim() && reasonLabel !== 'undefined') return reasonLabel; const key = String(reason ?? '').toLowerCase(); const ru = { elimination: 'Устранение', bomb: 'Взрыв бомбы', defuse: 'Обезвреживание', timeout: 'Время вышло', completed: 'Раунд завершён' }; const en = { elimination: 'Elimination', bomb: 'Bomb exploded', defuse: 'Bomb defused', timeout: 'Time expired', completed: 'Round completed' }; const dict = lang === 'en' ? en : ru; if (/^\d+$/.test(key) || !key || key === 'undefined') return dict.completed; return dict[key] || titleCase(key); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

  async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeout = global.setTimeout(() => controller.abort(), Number(options.timeoutMs || DEFAULT_TIMEOUT_MS));
    const externalSignal = options.signal;
    const abortFromExternal = () => controller.abort();
    if (externalSignal) externalSignal.addEventListener('abort', abortFromExternal, { once: true });
    try {
      const { timeoutMs, signal, ...fetchOptions } = options;
      const response = await fetch(`${backendBaseUrl()}${path}`, { credentials: 'include', cache: 'no-store', ...fetchOptions, headers: { ...(fetchOptions.headers || {}) }, signal: controller.signal });
      const text = await response.text().catch(() => '');
      let data = null;
      if (text) { try { data = JSON.parse(text); } catch (_) { const err = new Error('Invalid JSON response'); err.status = response.status; throw err; } }
      if (!response.ok || data?.ok === false) { const err = new Error(data?.error || data?.message || `Request failed with status ${response.status}`); err.status = response.status; err.data = data; throw err; }
      return data ?? {};
    } finally { global.clearTimeout(timeout); if (externalSignal) externalSignal.removeEventListener('abort', abortFromExternal); }
  }
  function getMatchDetails(matchId, options) { return apiRequest(`/api/matches/${encodeURIComponent(matchId)}`, options); }
  function getPlayerMatches(steamId, page = 1, limit = 20, options) { return apiRequest(`/api/players/${encodeURIComponent(steamId)}/matches?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`, options); }
  function getPlayerStats(steamId, options) { return apiRequest(`/api/players/${encodeURIComponent(steamId)}/stats`, options); }

  const api = { backendBaseUrl, apiRequest, getMatchDetails, getPlayerMatches, getPlayerStats, safeNumber, optionalNumber, formatDuration, formatDate, formatEloChange, formatPercent, formatKd, calculateKd, formatMapName, formatMatchResult, formatRoundReason, escapeHtml, langKey: LANG_KEY, dash: DASH };
  global.TrustApi = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
