const BACKEND_BASE_URL = 'https://trust-backend-production-e1d1.up.railway.app';
async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, { credentials: 'include', headers: { ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}
function $(id){ return document.getElementById(id); }
function hide(id, on){ $(id)?.classList.toggle('hidden', on); }
function applyUser(user){
  const authed = !!user;
  hide('landingAppBtn', !authed); hide('landingLogoutBtn', !authed); hide('landingLoginBtn', authed); hide('landingGuestCard', authed); hide('landingUserCard', !authed);
  $('landingAuthBadge').textContent = authed ? 'Steam connected' : 'Гость';
  $('landingAuthBadge').className = `pill ${authed ? 'ok' : 'idle'}`;
  if (!authed) return;
  $('landingAvatar').src = user.avatarUrl || '';
  $('landingNickname').textContent = user.nickname || 'Unknown';
  $('landingSteamId').textContent = user.steamId || user.steamId64 || '';
  $('landingElo').textContent = user.elo2v2 ?? 100;
  $('landingMatches').textContent = user.matchesPlayed2v2 ?? 0;
  $('landingWins').textContent = user.wins2v2 ?? 0;
}
async function refreshAuth(){ try{ const data = await api('/auth/me'); applyUser(data.user || null); }catch{ applyUser(null); } }
async function refreshHealth(){ try{ await api('/health'); $('backendBadge').textContent='ONLINE'; $('backendBadge').className='pill ok'; $('backendText').textContent='Backend доступен и отвечает.'; }catch{ $('backendBadge').textContent='OFFLINE'; $('backendBadge').className='pill warn'; $('backendText').textContent='Backend сейчас не ответил. Проверь Railway deploy и CORS.'; } }
async function refreshConfig(){ try{ const data = await api('/config'); const cfg = data.config || {}; $('configBadge').textContent = cfg.matchmakingEnabled ? 'MATCHMAKING ON' : 'OFF'; $('configBadge').className = `pill ${cfg.matchmakingEnabled ? 'ok' : 'warn'}`; $('configText').textContent = `${cfg.appName || 'TRUST'} • latest ${cfg.latestVersion || '—'} • режим ${cfg.mode || '2x2'}`; }catch{ $('configBadge').textContent='Ошибка'; $('configBadge').className='pill warn'; $('configText').textContent='Не удалось загрузить config.'; } }
function login(){ window.location.href = `${BACKEND_BASE_URL}/auth/steam`; }
async function logout(){ try{ await api('/auth/logout', { method:'POST' }); }catch{} window.location.reload(); }
window.addEventListener('DOMContentLoaded', async () => {
  ['landingLoginBtn','heroLoginBtn'].forEach((id)=>$(id)?.addEventListener('click', login));
  $('landingLogoutBtn')?.addEventListener('click', logout);
  await Promise.all([refreshAuth(), refreshHealth(), refreshConfig()]);
});
