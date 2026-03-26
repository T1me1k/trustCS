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

const state = {
  user: null,
  party: null,
  queue: null,
  match: null,
  history: []
};

function qs(id) { return document.getElementById(id); }
function setHidden(id, hidden) { qs(id)?.classList.toggle('hidden', hidden); }
function setText(id, text) { const el = qs(id); if (el) el.textContent = text; }
function esc(text) { return String(text ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

function showAlert(message, kind = 'info') {
  const el = qs('globalAlert');
  el.textContent = message;
  el.className = 'alert';
  if (kind === 'error') el.style.borderColor = 'rgba(239,68,68,.35)', el.style.background = 'rgba(239,68,68,.12)';
  else el.style.borderColor = 'rgba(139,92,246,.24)', el.style.background = 'rgba(139,92,246,.12)';
  el.classList.remove('hidden');
  clearTimeout(showAlert._t);
  showAlert._t = setTimeout(() => el.classList.add('hidden'), 3400);
}

function applyAuthUI() {
  const user = state.user;
  const authed = !!user;
  setHidden('loginBtn', authed);
  setHidden('sidebarLogoutBtn', !authed);
  setHidden('profileGuest', authed);
  setHidden('profileCard', !authed);

  qs('authBadge').textContent = authed ? 'Steam connected' : 'Гость';
  qs('authBadge').className = `status-pill ${authed ? 'ok' : 'idle'}`;

  if (authed) {
    qs('profileAvatar').src = user.avatarUrl || '';
    setText('profileNickname', user.nickname || 'Unknown');
    setText('profileSteamId', user.steamId64 || '');
    setText('profileElo', user.elo2v2 ?? 100);
    setText('profileMatches', user.matchesPlayed2v2 ?? 0);
    setText('profileWins', user.wins2v2 ?? 0);
    setText('profileLosses', user.losses2v2 ?? 0);
    setText('playCtaText', 'Создай party на 2 игроков и запускай поиск.');
  } else {
    setText('playCtaText', 'Сначала войди через Steam.');
  }
}

function renderParty() {
  const party = state.party;
  const membersEl = qs('partyMembers');
  const invitesEl = qs('partyInvites');
  membersEl.innerHTML = '';
  invitesEl.innerHTML = '';

  const hasParty = !!party;
  qs('partyBadge').textContent = hasParty ? `${party.members?.length || 0}/2` : 'Нет party';
  qs('partyBadge').className = `status-pill ${hasParty ? 'ok' : 'idle'}`;
  setHidden('leavePartyBtn', !hasParty);
  setHidden('disbandPartyBtn', !(hasParty && party.isLeader));

  if (!hasParty) {
    membersEl.innerHTML = '<div class="empty-state soft"><p>Party пока нет.</p></div>';
    invitesEl.innerHTML = '<div class="empty-state soft"><p>Входящих инвайтов нет.</p></div>';
    return;
  }

  const members = party.members || [];
  membersEl.innerHTML = members.map((m) => `
    <div class="party-member">
      <div class="party-member-main">
        <img class="player-mini-avatar" src="${esc(m.avatarUrl || '')}" alt="avatar" />
        <div>
          <div>${esc(m.nickname || 'Unknown')}</div>
          <div class="muted">${esc(m.role || 'member')} • Elo ${esc(m.elo2v2 ?? 100)}</div>
        </div>
      </div>
      <span class="status-pill ${m.role === 'leader' ? 'live' : 'idle'}">${m.role === 'leader' ? 'Leader' : 'Member'}</span>
    </div>
  `).join('');

  const invites = party.pendingInvites || [];
  if (!invites.length) {
    invitesEl.innerHTML = '<div class="empty-state soft"><p>Входящих инвайтов нет.</p></div>';
    return;
  }

  invitesEl.innerHTML = invites.map((inv) => `
    <div class="invite-item">
      <div>
        <strong>${esc(inv.fromNickname || 'Игрок')}</strong>
        <div class="muted">Приглашение в party</div>
      </div>
      <div class="top-actions">
        <button class="btn secondary" data-accept-invite="${esc(inv.id)}">Принять</button>
        <button class="btn ghost" data-decline-invite="${esc(inv.id)}">Отклонить</button>
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  const queue = state.queue;
  const searching = queue && queue.status === 'queued';
  qs('queueBadge').textContent = searching ? 'В очереди' : 'Не в очереди';
  qs('queueBadge').className = `status-pill ${searching ? 'live' : 'idle'}`;
  qs('matchmakingState').textContent = searching ? 'Идёт поиск' : 'Ожидание';
  qs('matchmakingState').className = `status-pill ${searching ? 'live' : 'idle'}`;
  setHidden('searchingBanner', !searching);
  qs('joinQueueBtn').disabled = searching || !state.user;
}

function renderMatch() {
  const match = state.match;
  const empty = !match;
  setHidden('currentMatchEmpty', !empty);
  setHidden('currentMatchCard', empty);
  qs('currentMatchBadge').textContent = empty ? 'Нет матча' : (match.status || 'Матч');
  qs('currentMatchBadge').className = `status-pill ${empty ? 'idle' : 'ok'}`;
  if (empty) return;

  setText('currentMatchId', match.matchId || 'match');
  setText('currentMatchMeta', `${match.map || 'de_dust2'} • Твоя команда ${match.team || '—'}`);
  setText('currentMatchStatus', match.status || 'server_assigned');
  qs('currentMatchStatus').className = 'status-pill live';
  const connectLine = `${match.serverIp || '127.0.0.1'}:${match.serverPort || 27015}  password ${match.serverPassword || 'trust'}`;
  setText('serverConnectLine', connectLine);
  qs('copyConnectBtn').dataset.connect = `connect ${match.serverIp}:${match.serverPort}; password "${match.serverPassword}"`;

  const players = match.players || [];
  const teamA = players.filter((p) => p.team === 'A');
  const teamB = players.filter((p) => p.team === 'B');
  qs('teamAPlayers').innerHTML = teamA.length ? teamA.map(playerChip).join('') : '<div class="empty-state soft"><p>Нет игроков</p></div>';
  qs('teamBPlayers').innerHTML = teamB.length ? teamB.map(playerChip).join('') : '<div class="empty-state soft"><p>Нет игроков</p></div>';
}

function playerChip(p) {
  return `
    <div class="player-chip">
      <div>
        <strong>${esc(p.nickname || 'Player')}</strong>
        <div class="muted">Elo ${esc(p.elo ?? 100)}</div>
      </div>
      <span class="status-pill ${p.team === state.match?.team ? 'ok' : 'idle'}">${esc(p.team || '')}</span>
    </div>
  `;
}

function renderHistory() {
  const items = state.history || [];
  const el = qs('historyList');
  if (!items.length) {
    el.innerHTML = '<div class="empty-state"><p>История пока пустая.</p></div>';
    return;
  }
  el.innerHTML = items.map((item) => {
    const result = item.result || (item.eloDelta > 0 ? 'win' : 'loss');
    const delta = Number(item.eloDelta || 0);
    return `
      <div class="history-item">
        <div>
          <strong>${esc(item.matchId || item.publicMatchId || 'match')}</strong>
          <div class="muted">${esc(item.map || 'de_dust2')} • ${esc(item.finishedAt || item.createdAt || '')}</div>
        </div>
        <div>
          <span class="status-pill ${result === 'win' ? 'ok' : 'warn'}">${result === 'win' ? 'WIN' : 'LOSS'}</span>
          <div class="muted center-text">${delta > 0 ? '+' : ''}${delta}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSearchResults(items) {
  const el = qs('userSearchResults');
  if (!items.length) {
    el.innerHTML = '<div class="empty-state soft"><p>Никого не нашли.</p></div>';
    return;
  }
  el.innerHTML = items.map((item) => `
    <div class="search-result">
      <div class="search-result-main">
        <img class="player-mini-avatar" src="${esc(item.avatarUrl || '')}" alt="avatar" />
        <div>
          <div>${esc(item.nickname || 'Unknown')}</div>
          <div class="muted">Elo ${esc(item.elo2v2 ?? 100)}</div>
        </div>
      </div>
      <button class="btn secondary" data-invite-user="${esc(item.id)}">Пригласить</button>
    </div>
  `).join('');
}

async function loadAuth() {
  const data = await api('/auth/me');
  state.user = data.user || null;
  applyAuthUI();
  return state.user;
}

async function loadAccount() {
  if (!state.user) return;
  const data = await api('/api/account/me');
  state.user = data.user;
  applyAuthUI();
}

async function loadParty() {
  if (!state.user) return state.party = null, renderParty();
  const data = await api('/api/party/me');
  state.party = data.party;
  renderParty();
}

async function loadQueue() {
  if (!state.user) return state.queue = null, renderQueue();
  const data = await api('/api/queue/me');
  state.queue = data.queue;
  renderQueue();
}

async function loadCurrentMatch() {
  if (!state.user) return state.match = null, renderMatch();
  const data = await api('/api/matches/me/current');
  state.match = data.match;
  renderMatch();
}

async function loadHistory() {
  if (!state.user) return state.history = [], renderHistory();
  const data = await api('/api/matches/me/history?limit=8');
  state.history = data.items || [];
  renderHistory();
}

async function refreshAll() {
  try {
    await loadAuth();
    if (!state.user) {
      applyAuthUI(); renderParty(); renderQueue(); renderMatch(); renderHistory();
      return;
    }
    await Promise.all([loadAccount(), loadParty(), loadQueue(), loadCurrentMatch(), loadHistory()]);
  } catch (err) {
    console.error(err);
    showAlert('Не удалось обновить данные app.', 'error');
  }
}

function goSteamLogin() { window.location.href = `${BACKEND_BASE_URL}/auth/steam`; }
async function logout() { try { await api('/auth/logout', { method: 'POST' }); } catch {} window.location.href = './index.html'; }

async function createParty() {
  try {
    await api('/api/party/create', { method: 'POST' });
    showAlert('Party создана.');
    await loadParty();
  } catch (err) { showAlert(`Не удалось создать party: ${err.message}`, 'error'); }
}

async function leaveParty() {
  try {
    await api('/api/party/leave', { method: 'POST' });
    showAlert('Ты покинул party.');
    await Promise.all([loadParty(), loadQueue()]);
  } catch (err) { showAlert(`Не удалось выйти из party: ${err.message}`, 'error'); }
}

async function disbandParty() {
  try {
    await api('/api/party/disband', { method: 'POST' });
    showAlert('Party распущена.');
    await Promise.all([loadParty(), loadQueue()]);
  } catch (err) { showAlert(`Не удалось распустить party: ${err.message}`, 'error'); }
}

async function searchUsers() {
  const q = qs('userSearchInput').value.trim();
  if (!q) return;
  try {
    const data = await api(`/api/account/users/search?q=${encodeURIComponent(q)}`);
    renderSearchResults(data.items || []);
  } catch (err) { showAlert(`Поиск не удался: ${err.message}`, 'error'); }
}

async function inviteUser(targetUserId) {
  try {
    await api('/api/party/invite', { method: 'POST', body: JSON.stringify({ targetUserId }) });
    showAlert('Инвайт отправлен.');
    await loadParty();
  } catch (err) { showAlert(`Инвайт не отправлен: ${err.message}`, 'error'); }
}

async function acceptInvite(id) {
  try {
    await api(`/api/party/invite/${id}/accept`, { method: 'POST' });
    showAlert('Инвайт принят.');
    await Promise.all([loadParty(), loadQueue()]);
  } catch (err) { showAlert(`Не удалось принять инвайт: ${err.message}`, 'error'); }
}

async function declineInvite(id) {
  try {
    await api(`/api/party/invite/${id}/decline`, { method: 'POST' });
    showAlert('Инвайт отклонён.');
    await loadParty();
  } catch (err) { showAlert(`Не удалось отклонить инвайт: ${err.message}`, 'error'); }
}

async function joinQueue() {
  try {
    await api('/api/queue/join', { method: 'POST', body: JSON.stringify({ mode: '2x2' }) });
    showAlert('Поиск матча запущен.');
    await loadQueue();
  } catch (err) { showAlert(`Не удалось запустить поиск: ${err.message}`, 'error'); }
}

async function cancelQueue() {
  try {
    await api('/api/queue/cancel', { method: 'POST' });
    showAlert('Поиск остановлен.');
    await loadQueue();
  } catch (err) { showAlert(`Не удалось отменить поиск: ${err.message}`, 'error'); }
}

async function startLauncherLink() {
  const clientId = qs('launcherClientId').value.trim();
  if (!clientId) return showAlert('Укажи Client ID launcher.', 'error');
  try {
    const data = await api('/launcher/link/start', {
      method: 'POST',
      body: JSON.stringify({ clientId, nickname: state.user?.nickname || '' })
    });
    qs('launcherLinkResult').textContent = `Код привязки: ${data.link?.code || data.link?.value || JSON.stringify(data.link)}`;
  } catch (err) { showAlert(`Не удалось создать код: ${err.message}`, 'error'); }
}

function bindDelegatedClicks() {
  document.body.addEventListener('click', async (e) => {
    const inviteBtn = e.target.closest('[data-invite-user]');
    if (inviteBtn) return inviteUser(inviteBtn.dataset.inviteUser);
    const accBtn = e.target.closest('[data-accept-invite]');
    if (accBtn) return acceptInvite(accBtn.dataset.acceptInvite);
    const decBtn = e.target.closest('[data-decline-invite]');
    if (decBtn) return declineInvite(decBtn.dataset.declineInvite);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  qs('loginBtn')?.addEventListener('click', goSteamLogin);
  qs('sidebarLogoutBtn')?.addEventListener('click', logout);
  qs('createPartyBtn')?.addEventListener('click', createParty);
  qs('leavePartyBtn')?.addEventListener('click', leaveParty);
  qs('disbandPartyBtn')?.addEventListener('click', disbandParty);
  qs('userSearchBtn')?.addEventListener('click', searchUsers);
  qs('userSearchInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchUsers(); });
  qs('joinQueueBtn')?.addEventListener('click', joinQueue);
  qs('cancelQueueBtn')?.addEventListener('click', cancelQueue);
  qs('startLauncherLinkBtn')?.addEventListener('click', startLauncherLink);
  qs('copyConnectBtn')?.addEventListener('click', async () => {
    const connect = qs('copyConnectBtn').dataset.connect || '';
    if (!connect) return;
    try { await navigator.clipboard.writeText(connect); showAlert('Команда connect скопирована.'); }
    catch { showAlert(connect); }
  });

  bindDelegatedClicks();
  await refreshAll();
  setInterval(async () => {
    if (!state.user) return;
    try { await Promise.all([loadQueue(), loadCurrentMatch(), loadParty()]); } catch {}
  }, 5000);
});
