const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();

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
  return ranks[currentIndex];
}
function normalizeRank(rank, elo) {
  return rank && rank.name ? rank : getRankByElo(elo);
}
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

async function loadLeaderboard() {
  const root = document.getElementById('leaderboardRows');
  root.innerHTML = '<div class="empty">Загрузка...</div>';
  try {
    const data = await api('/api/leaderboard');
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = '<div class="empty">Лидерборд пока пустой.</div>';
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
    root.innerHTML = '<div class="empty">Не удалось загрузить лидерборд.</div>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lbLoginBtn')?.addEventListener('click', () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
  });
  loadLeaderboard();
});
