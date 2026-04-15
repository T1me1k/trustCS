const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();


const LEADERBOARD_I18N = {
  en: {
    nav_home: 'Home', nav_play: 'Play', nav_leaderboard: 'Leaderboard',
    brand_sub: '2x2 leaderboard', login: 'Sign in with Steam', season: 'SEASON 1',
    title: 'TRUST 2x2 Leaderboard', subtitle: 'Top players by Elo. Rating is calculated on the backend and shared across the site and launcher.',
    col_player: 'Player', col_rank: 'Rank', loading: 'Loading...', empty: 'Leaderboard is empty for now.', error: 'Failed to load leaderboard.'
  },
  ru: {
    nav_home: 'Главная', nav_play: 'Играть', nav_leaderboard: 'Лидерборд',
    brand_sub: '2x2 лидерборд', login: 'Войти через Steam', season: 'SEASON 1',
    title: 'Лидерборд TRUST 2x2', subtitle: 'Топ игроков по Elo. Рейтинг считается на backend и одинаков для сайта и launcher.',
    col_player: 'Игрок', col_rank: 'Звание', loading: 'Загрузка...', empty: 'Лидерборд пока пустой.', error: 'Не удалось загрузить лидерборд.'
  }
};
function lbLang(){ return (localStorage.getItem('trust_lang') || 'en') === 'ru' ? 'ru' : 'en'; }
function lbT(key){ return LEADERBOARD_I18N[lbLang()]?.[key] ?? LEADERBOARD_I18N.en[key] ?? key; }
function applyLeaderboardLanguage(){
  document.documentElement.lang = lbLang();
  document.querySelectorAll('.lang-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === lbLang()));
  const nav = document.querySelectorAll('.nav a');
  if (nav[0]) nav[0].textContent = lbT('nav_home');
  if (nav[1]) nav[1].textContent = lbT('nav_play');
  if (nav[2]) nav[2].textContent = lbT('nav_leaderboard');
  const brandSub = document.querySelector('.brand-sub'); if (brandSub) brandSub.textContent = lbT('brand_sub');
  if ($('lbLoginBtn')) $('lbLoginBtn').textContent = lbT('login');
  const badge = document.querySelector('.card .badge'); if (badge) badge.textContent = lbT('season');
  const title = document.querySelector('main .card h1'); if (title) title.textContent = lbT('title');
  const subtitle = document.querySelector('main .card p.muted'); if (subtitle) subtitle.textContent = lbT('subtitle');
  const cols = document.querySelectorAll('.table-head div');
  if (cols[1]) cols[1].textContent = lbT('col_player');
  if (cols[2]) cols[2].textContent = lbT('col_rank');
}
function $(id) { return document.getElementById(id); }

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}


function getRankByElo(rawElo) {
  const elo = Math.max(0, Number(rawElo) || 0);
  const ranks = [
    { key: 'iron', name: 'Iron', minElo: 0, color: 'iron' },
    { key: 'bronze', name: 'Bronze', minElo: 300, color: 'bronze' },
    { key: 'silver', name: 'Silver', minElo: 500, color: 'silver' },
    { key: 'gold_nova', name: 'Gold Nova', minElo: 700, color: 'gold' },
    { key: 'master_guardian', name: 'Master Guardian', minElo: 900, color: 'guardian' },
    { key: 'distinguished', name: 'Distinguished', minElo: 1100, color: 'distinguished' },
    { key: 'legendary_eagle', name: 'Legendary Eagle', minElo: 1300, color: 'eagle' },
    { key: 'supreme', name: 'Supreme', minElo: 1500, color: 'supreme' },
    { key: 'global_elite', name: 'Global Elite', minElo: 1700, color: 'global' }
  ];
  let currentIndex = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    if (elo >= ranks[i].minElo) currentIndex = i;
    else break;
  }
  return { ...ranks[currentIndex] };
}
function normalizeRank(rank, elo) {
  return rank && rank.name ? rank : getRankByElo(elo);
}
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

async function loadLeaderboard() {
  const root = document.getElementById('leaderboardRows');
  root.innerHTML = `<div class="empty">${esc(lbT('loading'))}</div>`;
  try {
    const data = await api('/api/leaderboard');
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = `<div class="empty">${esc(lbT('empty'))}</div>`;
      return;
    }
    root.innerHTML = items.map((item, idx) => {
      const rankInfo = normalizeRank(item.rank, item.elo2v2 ?? 100);
      return `
      <div class="table-row">
        <div><strong>#${esc(item.rankPosition ?? item.rank ?? (idx + 1))}</strong></div>
        <div class="table-player"><img class="avatar sm" src="${esc(item.avatarUrl || '')}" alt="avatar"><span>${esc(item.nickname || 'Unknown')}</span></div>
        <div><span class="rank-pill ${esc(rankInfo.color || 'iron')}">${esc(rankInfo.name || 'Iron')}</span></div>
        <div><strong>${esc(item.elo2v2 ?? 100)}</strong></div>
      </div>
    `}).join('');
  } catch (_) {
    root.innerHTML = `<div class="empty">${esc(lbT('error'))}</div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  applyLeaderboardLanguage();
  document.addEventListener('click', (event) => {
    const langBtn = event.target.closest('[data-lang]');
    if (!langBtn) return;
    localStorage.setItem('trust_lang', langBtn.dataset.lang === 'ru' ? 'ru' : 'en');
    applyLeaderboardLanguage();
    loadLeaderboard();
  });
  document.getElementById('lbLoginBtn')?.addEventListener('click', () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
  });
  loadLeaderboard();
});
