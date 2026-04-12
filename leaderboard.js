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
    root.innerHTML = items.map((item, idx) => `
      <div class="table-row">
        <div><strong>#${esc(item.rank ?? (idx + 1))}</strong></div>
        <div class="table-player"><img class="avatar sm" src="${esc(item.avatarUrl || '')}" alt="avatar"><span>${esc(item.nickname || 'Unknown')}</span></div>
        <div><strong>${esc(item.elo2v2 ?? 100)}</strong></div>
      </div>
    `).join('');
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
