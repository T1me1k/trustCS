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

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function optionalNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function formatDuration(value) {
    const number = optionalNumber(value);
    if (number == null) return DASH;
    const total = Math.max(0, Math.floor(number));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function formatDate(value, lang = 'ru') {
    if (!value) return DASH;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return DASH;
    return date.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatEloChange(value) {
    const number = optionalNumber(value);
    if (number == null) return DASH;
    if (number > 0) return `+${number}`;
    if (number < 0) return String(number);
    return '0';
  }

  function calculateKd(kills, deaths) {
    const k = safeNumber(kills, 0);
    const d = safeNumber(deaths, 0);
    if (d <= 0) return k.toFixed(2);
    return (k / d).toFixed(2);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeout = global.setTimeout(() => controller.abort(), Number(options.timeoutMs || DEFAULT_TIMEOUT_MS));
    const externalSignal = options.signal;
    const abortFromExternal = () => controller.abort();
    if (externalSignal) externalSignal.addEventListener('abort', abortFromExternal, { once: true });
    try {
      const response = await fetch(`${backendBaseUrl()}${path}`, {
        credentials: 'include',
        cache: 'no-store',
        ...options,
        headers: { ...(options.headers || {}) },
        signal: controller.signal
      });
      let data;
      try { data = await response.json(); } catch (error) { throw new Error('invalid_json'); }
      if (!response.ok || data?.ok === false) {
        const err = new Error(data?.error || `request_failed_${response.status}`);
        err.status = response.status;
        throw err;
      }
      return data;
    } finally {
      global.clearTimeout(timeout);
      if (externalSignal) externalSignal.removeEventListener('abort', abortFromExternal);
    }
  }

  function getMatchDetails(matchId, options) {
    return apiRequest(`/api/matches/${encodeURIComponent(matchId)}`, options);
  }

  function getPlayerStats(steamId, options) {
    return apiRequest(`/api/players/${encodeURIComponent(steamId)}/stats`, options);
  }

  const api = { backendBaseUrl, apiRequest, getMatchDetails, getPlayerStats, safeNumber, optionalNumber, formatDuration, formatDate, formatEloChange, calculateKd, escapeHtml, langKey: LANG_KEY, dash: DASH };
  global.TrustApi = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
