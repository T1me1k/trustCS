const BACKEND_BASE_URL = 'https://trust-backend-production-e1d1.up.railway.app';

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}

function esc(text) { return String(text ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

async function loadLeaderboard() {
  const root = document.getElementById('leaderboardRows');
  root.innerHTML = '<div class="empty-state"><p>Загрузка...</p></div>';
  try {
    const data = await api('/api/leaderboard');
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = '<div class="empty-state"><p>Лидерборд пока пустой.</p></div>';
      return;
    }
    root.innerHTML = items.map((item) => `
      <div class="table-row">
        <div><strong>#${esc(item.rank)}</strong></div>
        <div class="table-player">
          <img class="player-mini-avatar" src="${esc(item.avatar_full_url || '')}" alt="avatar" />
          <span>${esc(item.persona_name || 'Unknown')}</span>
        </div>
        <div><strong>${esc(item.elo_2v2 ?? 100)}</strong></div>
      </div>
    `).join('');
  } catch (err) {
    root.innerHTML = '<div class="empty-state"><p>Не удалось загрузить лидерборд.</p></div>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lbLoginBtn')?.addEventListener('click', () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
  });
  loadLeaderboard();
});
