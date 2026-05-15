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
    "key": "iron",
    "name": "Iron",
    "tierName": "Iron",
    "division": null,
    "minElo": 0,
    "color": "iron",
    "icon": "./assets/ranks/iron.svg"
  },
  {
    "key": "bronze",
    "name": "Bronze",
    "tierName": "Bronze",
    "division": null,
    "minElo": 300,
    "color": "bronze",
    "icon": "./assets/ranks/bronze.svg"
  },
  {
    "key": "silver",
    "name": "Silver",
    "tierName": "Silver",
    "division": null,
    "minElo": 600,
    "color": "silver",
    "icon": "./assets/ranks/silver.svg"
  },
  {
    "key": "gold",
    "name": "Gold",
    "tierName": "Gold",
    "division": null,
    "minElo": 900,
    "color": "gold",
    "icon": "./assets/ranks/gold.svg"
  },
  {
    "key": "platinum",
    "name": "Platinum",
    "tierName": "Platinum",
    "division": null,
    "minElo": 1200,
    "color": "platinum",
    "icon": "./assets/ranks/platinum.svg"
  },
  {
    "key": "diamond",
    "name": "Diamond",
    "tierName": "Diamond",
    "division": null,
    "minElo": 1500,
    "color": "diamond",
    "icon": "./assets/ranks/diamond.svg"
  },
  {
    "key": "master",
    "name": "Master",
    "tierName": "Master",
    "division": null,
    "minElo": 1800,
    "color": "master",
    "icon": "./assets/ranks/master.svg"
  },
  {
    "key": "grandmaster",
    "name": "Grandmaster",
    "tierName": "Grandmaster",
    "division": null,
    "minElo": 2100,
    "color": "grandmaster",
    "icon": "./assets/ranks/grandmaster.svg"
  },
  {
    "key": "elite",
    "name": "Elite",
    "tierName": "Elite",
    "division": null,
    "minElo": 2400,
    "color": "elite",
    "icon": "./assets/ranks/elite.svg"
  },
  {
    "key": "legend",
    "name": "Legend",
    "tierName": "Legend",
    "division": null,
    "minElo": 2700,
    "color": "legend",
    "icon": "./assets/ranks/legend.svg"
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
function getRankIconSrc(rank) {
  const info = rank || {};
  if (info.icon) {
    const icon = String(info.icon);
    if (icon.startsWith('./assets/ranks/')) return icon;
    return `./assets/ranks/${icon.replace(/[^a-z0-9_.-]/gi, '')}`;
  }
  if (info.color) return `./assets/ranks/${String(info.color).replace(/[^a-z0-9_.-]/gi, '')}.svg`;
  return './assets/ranks/iron.svg';
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
        <div><span class="rank-pill ${esc(rankInfo.color || 'silver')}">${getRankIconSrc(rankInfo) ? `<img class="rank-medal-img" src="${esc(getRankIconSrc(rankInfo))}" alt="" loading="lazy">` : ''}<span>${esc(rankInfo.name || 'Iron')}</span></span></div>
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
