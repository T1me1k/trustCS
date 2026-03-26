const BACKEND_BASE_URL = 'https://trust-backend-production-e1d1.up.railway.app';

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `request_failed_${response.status}`);
  }
  return data;
}

function qs(id) { return document.getElementById(id); }
function setHidden(id, hidden) { qs(id)?.classList.toggle('hidden', hidden); }

function applyUser(user) {
  const loggedIn = !!user;
  setHidden('headerDashboardBtn', !loggedIn);
  setHidden('headerLogoutBtn', !loggedIn);
  setHidden('headerLoginBtn', loggedIn);
  setHidden('landingUserCard', !loggedIn);
  setHidden('landingGuestCard', loggedIn);

  qs('authStateBadge').textContent = loggedIn ? 'Steam connected' : 'Гость';
  qs('authStateBadge').className = `status-pill ${loggedIn ? 'ok' : 'idle'}`;

  if (loggedIn) {
    qs('landingAvatar').src = user.avatarUrl || '';
    qs('landingNickname').textContent = user.nickname || 'Unknown';
    qs('landingSteamId').textContent = user.steamId || '';
  }
}

async function refreshAuth() {
  try {
    const data = await api('/auth/me');
    applyUser(data.user || null);
  } catch {
    applyUser(null);
  }
}

async function refreshHealth() {
  try {
    await api('/health');
    qs('backendStatus').textContent = 'ONLINE';
    qs('backendStatus').className = 'status-pill ok';
    qs('backendStatusText').textContent = 'Backend доступен и отвечает.';
  } catch {
    qs('backendStatus').textContent = 'OFFLINE';
    qs('backendStatus').className = 'status-pill warn';
    qs('backendStatusText').textContent = 'Backend сейчас не ответил. Проверь Railway deploy и CORS.';
  }
}

async function refreshConfig() {
  try {
    const data = await api('/config');
    qs('configStatus').textContent = data.config?.matchmakingEnabled ? 'MATCHMAKING ON' : 'OFF';
    qs('configStatus').className = `status-pill ${data.config?.matchmakingEnabled ? 'ok' : 'warn'}`;
    qs('configText').textContent = `${data.config?.appName || 'TRUST'} • latest ${data.config?.latestVersion || '—'} • режим ${data.config?.mode || '—'}`;
  } catch {
    qs('configStatus').textContent = 'Ошибка';
    qs('configStatus').className = 'status-pill warn';
    qs('configText').textContent = 'Не удалось загрузить config.';
  }
}

function goSteamLogin() {
  window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
}

async function logout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  window.location.reload();
}

window.addEventListener('DOMContentLoaded', async () => {
  ['headerLoginBtn', 'heroLoginBtn'].forEach((id) => qs(id)?.addEventListener('click', goSteamLogin));
  qs('headerDashboardBtn')?.addEventListener('click', () => { window.location.href = './app.html'; });
  qs('headerLogoutBtn')?.addEventListener('click', logout);

  await Promise.all([refreshAuth(), refreshHealth(), refreshConfig()]);
});
