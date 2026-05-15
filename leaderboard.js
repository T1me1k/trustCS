const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();

const AUTH_RETURN_STORAGE_KEY = 'trust_post_auth_return';
function getSteamAuthUrl() {
  const returnTo = encodeURIComponent(window.location.href);
  return `${BACKEND_BASE_URL}/auth/steam?returnTo=${returnTo}`;
}
function rememberAuthReturn() {
  try {
    sessionStorage.setItem(AUTH_RETURN_STORAGE_KEY, window.location.href);
  } catch (_) {}
}

const LB_I18N = {
  ru: {
    login: 'Войти через Steam', brandSub: '2x2 leaderboard', navHome: 'Главная', navPlay: 'Играть', navLeaderboard: 'Лидерборд',
    title: 'Лидерборд TRUST 2x2', subtitle: 'Топ игроков по Elo. Рейтинг считается на backend и одинаков для сайта и launcher.',
    headPlayer: 'Игрок', headRank: 'Звание', loading: 'Загрузка...', empty: 'Лидерборд пока пустой.', loadError: 'Не удалось загрузить лидерборд.'
  },
  en: {
    login: 'Sign in with Steam', brandSub: '2x2 leaderboard', navHome: 'Home', navPlay: 'Play', navLeaderboard: 'Leaderboard',
    title: 'TRUST 2v2 Leaderboard', subtitle: 'Top players by Elo. Rating is calculated on the backend and shared between the site and launcher.',
    headPlayer: 'Player', headRank: 'Rank', loading: 'Loading...', empty: 'The leaderboard is empty for now.', loadError: 'Failed to load leaderboard.'
  }
};
const LB_LANG_KEY = 'trust_lang';
let lbLang = localStorage.getItem(LB_LANG_KEY) === 'en' ? 'en' : 'ru';
const lbT = (k) => (LB_I18N[lbLang] && LB_I18N[lbLang][k]) || LB_I18N.ru[k] || k;

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}

function applyLbLang() {
  document.documentElement.lang = lbLang;
  const map = {
    lbLoginBtn: 'login', lbBrandSub: 'brandSub', lbNavHome: 'navHome', lbNavPlay: 'navPlay', lbNavLeaderboard: 'navLeaderboard', lbMobileNavHome: 'navHome', lbMobileNavPlay: 'navPlay', lbMobileNavLeaderboard: 'navLeaderboard',
    lbTitle: 'title', lbSubtitle: 'subtitle', lbHeadPlayer: 'headPlayer', lbHeadRank: 'headRank'
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = lbT(key);
  });
  document.getElementById('lbLangRu')?.classList.toggle('active', lbLang === 'ru');
  document.getElementById('lbLangEn')?.classList.toggle('active', lbLang === 'en');
}

const RANK_TABLE = [
  {
    "key": "recruit_iii",
    "name": "Recruit III",
    "tierName": "Recruit",
    "division": "III",
    "minElo": 0,
    "color": "recruit"
  },
  {
    "key": "recruit_ii",
    "name": "Recruit II",
    "tierName": "Recruit",
    "division": "II",
    "minElo": 100,
    "color": "recruit"
  },
  {
    "key": "recruit_i",
    "name": "Recruit I",
    "tierName": "Recruit",
    "division": "I",
    "minElo": 200,
    "color": "recruit"
  },
  {
    "key": "operative_iii",
    "name": "Operative III",
    "tierName": "Operative",
    "division": "III",
    "minElo": 300,
    "color": "operative"
  },
  {
    "key": "operative_ii",
    "name": "Operative II",
    "tierName": "Operative",
    "division": "II",
    "minElo": 400,
    "color": "operative"
  },
  {
    "key": "operative_i",
    "name": "Operative I",
    "tierName": "Operative",
    "division": "I",
    "minElo": 500,
    "color": "operative"
  },
  {
    "key": "vanguard_iii",
    "name": "Vanguard III",
    "tierName": "Vanguard",
    "division": "III",
    "minElo": 600,
    "color": "vanguard"
  },
  {
    "key": "vanguard_ii",
    "name": "Vanguard II",
    "tierName": "Vanguard",
    "division": "II",
    "minElo": 700,
    "color": "vanguard"
  },
  {
    "key": "vanguard_i",
    "name": "Vanguard I",
    "tierName": "Vanguard",
    "division": "I",
    "minElo": 800,
    "color": "vanguard"
  },
  {
    "key": "sentinel_iii",
    "name": "Sentinel III",
    "tierName": "Sentinel",
    "division": "III",
    "minElo": 900,
    "color": "sentinel"
  },
  {
    "key": "sentinel_ii",
    "name": "Sentinel II",
    "tierName": "Sentinel",
    "division": "II",
    "minElo": 1000,
    "color": "sentinel"
  },
  {
    "key": "sentinel_i",
    "name": "Sentinel I",
    "tierName": "Sentinel",
    "division": "I",
    "minElo": 1100,
    "color": "sentinel"
  },
  {
    "key": "phantom_iii",
    "name": "Phantom III",
    "tierName": "Phantom",
    "division": "III",
    "minElo": 1200,
    "color": "phantom"
  },
  {
    "key": "phantom_ii",
    "name": "Phantom II",
    "tierName": "Phantom",
    "division": "II",
    "minElo": 1300,
    "color": "phantom"
  },
  {
    "key": "phantom_i",
    "name": "Phantom I",
    "tierName": "Phantom",
    "division": "I",
    "minElo": 1400,
    "color": "phantom"
  },
  {
    "key": "ascendant_iii",
    "name": "Ascendant III",
    "tierName": "Ascendant",
    "division": "III",
    "minElo": 1500,
    "color": "ascendant"
  },
  {
    "key": "ascendant_ii",
    "name": "Ascendant II",
    "tierName": "Ascendant",
    "division": "II",
    "minElo": 1600,
    "color": "ascendant"
  },
  {
    "key": "ascendant_i",
    "name": "Ascendant I",
    "tierName": "Ascendant",
    "division": "I",
    "minElo": 1700,
    "color": "ascendant"
  },
  {
    "key": "dominion_iii",
    "name": "Dominion III",
    "tierName": "Dominion",
    "division": "III",
    "minElo": 1800,
    "color": "dominion"
  },
  {
    "key": "dominion_ii",
    "name": "Dominion II",
    "tierName": "Dominion",
    "division": "II",
    "minElo": 1900,
    "color": "dominion"
  },
  {
    "key": "dominion_i",
    "name": "Dominion I",
    "tierName": "Dominion",
    "division": "I",
    "minElo": 2000,
    "color": "dominion"
  },
  {
    "key": "sovereign_iii",
    "name": "Sovereign III",
    "tierName": "Sovereign",
    "division": "III",
    "minElo": 2100,
    "color": "sovereign"
  },
  {
    "key": "sovereign_ii",
    "name": "Sovereign II",
    "tierName": "Sovereign",
    "division": "II",
    "minElo": 2200,
    "color": "sovereign"
  },
  {
    "key": "sovereign_i",
    "name": "Sovereign I",
    "tierName": "Sovereign",
    "division": "I",
    "minElo": 2300,
    "color": "sovereign"
  },
  {
    "key": "apex",
    "name": "Apex",
    "tierName": "Apex",
    "division": null,
    "minElo": 2400,
    "color": "apex"
  },
  {
    "key": "trust_elite",
    "name": "Trust Elite",
    "tierName": "Trust Elite",
    "division": null,
    "minElo": 2600,
    "color": "trust-elite"
  }
];
function getRankByElo(rawElo) {
  const elo = Math.max(0, Number(rawElo) || 0);
  let currentIndex = 0;
  for (let i = 0; i < RANK_TABLE.length; i += 1) {
    if (elo >= RANK_TABLE[i].minElo) currentIndex = i;
    else break;
  }
  return { ...RANK_TABLE[currentIndex], currentElo: elo };
}
function normalizeRank(rank, elo) { return rank && rank.name ? rank : getRankByElo(elo); }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

async function loadLeaderboard() {
  const root = document.getElementById('leaderboardRows');
  root.innerHTML = `<div class="empty">${lbT('loading')}</div>`;
  try {
    const data = await api('/api/leaderboard');
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = `<div class="empty">${lbT('empty')}</div>`;
      return;
    }
    root.innerHTML = items.map((item, idx) => {
      const rankInfo = normalizeRank(item.rank, item.elo2v2 ?? 100);
      return `
      <div class="table-row">
        <div><strong>#${esc(item.rankPosition ?? item.rank ?? (idx + 1))}</strong></div>
        <div class="table-player"><img class="avatar sm" src="${esc(item.avatarUrl || '')}" alt="avatar"><span>${esc(item.nickname || 'Unknown')}</span></div>
        <div><span class="rank-pill ${esc(rankInfo.color || 'recruit')}">${esc(rankInfo.name || 'Recruit III')}</span></div>
        <div><strong>${esc(item.elo2v2 ?? 100)}</strong></div>
      </div>
    `}).join('');
  } catch (_) {
    root.innerHTML = `<div class="empty">${lbT('loadError')}</div>`;
  }
}

async function refreshLeaderboardAuth() {
  try {
    const data = await api('/auth/me');
    const authed = !!data.user;
    const btn = document.getElementById('lbLoginBtn');
    if (btn) btn.classList.toggle('hidden', authed);
  } catch (_) {}
}


let leaderboardBootstrapped = false;
let leaderboardRefreshInFlight = false;

async function safeLeaderboardRefresh() {
  if (leaderboardRefreshInFlight) return;
  leaderboardRefreshInFlight = true;
  try {
    await refreshLeaderboardAuth();
    await loadLeaderboard();
  } finally {
    leaderboardRefreshInFlight = false;
  }
}

async function bootstrapLeaderboard() {
  if (leaderboardBootstrapped) return;
  leaderboardBootstrapped = true;

  document.getElementById('lbLoginBtn')?.addEventListener('click', () => {
    rememberAuthReturn();
    window.location.assign(getSteamAuthUrl());
  });
  document.getElementById('lbLangRu')?.addEventListener('click', () => {
    lbLang = 'ru';
    localStorage.setItem(LB_LANG_KEY, lbLang);
    applyLbLang();
    void loadLeaderboard();
  });
  document.getElementById('lbLangEn')?.addEventListener('click', () => {
    lbLang = 'en';
    localStorage.setItem(LB_LANG_KEY, lbLang);
    applyLbLang();
    void loadLeaderboard();
  });
  applyLbLang();
  await safeLeaderboardRefresh();
}

window.addEventListener('DOMContentLoaded', () => {
  void bootstrapLeaderboard();
});

window.addEventListener('pageshow', () => {
  void safeLeaderboardRefresh();
});

window.addEventListener('focus', () => {
  void safeLeaderboardRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) void safeLeaderboardRefresh();
});
