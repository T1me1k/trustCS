const BACKEND_BASE_URL = 'https://trust-backend-production-e1d1.up.railway.app';
async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, { credentials: 'include', headers: { ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}
function esc(v){ return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
async function loadLeaderboard(){
  const root = document.getElementById('leaderboardRows');
  root.innerHTML = '<div class="empty">Загрузка...</div>';
  try{
    const data = await api('/api/leaderboard');
    const items = data.items || [];
    if (!items.length){ root.innerHTML = '<div class="empty">Лидерборд пока пустой.</div>'; return; }
    root.innerHTML = items.map((item, idx) => `<div class="table-row"><div><strong>#${esc(item.rank ?? (idx + 1))}</strong></div><div class="table-player"><img class="avatar sm" src="${esc(item.avatarUrl || item.avatar_url || '')}" alt="avatar"><span>${esc(item.nickname || item.steam_persona_name || item.persona_name || 'Unknown')}</span></div><div><strong>${esc(item.elo2v2 ?? item.elo_2v2 ?? 100)}</strong></div></div>`).join('');
  }catch{ root.innerHTML = '<div class="empty">Не удалось загрузить лидерборд.</div>'; }
}
window.addEventListener('DOMContentLoaded', ()=>{ document.getElementById('lbLoginBtn')?.addEventListener('click', ()=>{ window.location.href = `${BACKEND_BASE_URL}/auth/steam`; }); loadLeaderboard(); });
