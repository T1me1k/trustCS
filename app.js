const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();

const state = {
  user: null,
  party: null,
  queue: null,
  match: null,
  history: [],
  mapPool: ['shortdust', 'lake', 'overpass', 'vertigo', 'nuke'],
  ui: { inviteVisuals: {} }
};

function $(id) { return document.getElementById(id); }
function hide(id, on) { $(id)?.classList.toggle('hidden', on); }
function text(id, value) { const el = $(id); if (el) el.textContent = value; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

function parseTime(value) {
  const ts = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(ts) ? ts : null;
}

function formatSecondsLeft(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs ? `${mins}м ${secs}с` : `${mins}м`;
  }
  return `${seconds}с`;
}

function getInviteVisual(invite) {
  const key = String(invite.id);
  const store = state.ui.inviteVisuals;
  const now = Date.now();
  const actualExpiry = parseTime(invite.expiresAt);

  if (!store[key]) {
    store[key] = {
      toastEndsAt: now + 10_000,
      hidden: false
    };
  }

  const item = store[key];
  const toastRemainingMs = Math.max(0, item.toastEndsAt - now);
  if (toastRemainingMs <= 0) item.hidden = true;

  return {
    showToast: !item.hidden,
    toastRemainingMs,
    toastProgress: Math.max(0, Math.min(100, (toastRemainingMs / 10000) * 100)),
    actualExpiry,
    actualRemainingMs: actualExpiry ? Math.max(0, actualExpiry - now) : null
  };
}

function cleanupInviteVisuals() {
  const activeIds = new Set((state.party?.pendingInvites || []).map((inv) => String(inv.id)));
  for (const key of Object.keys(state.ui.inviteVisuals)) {
    if (!activeIds.has(key)) delete state.ui.inviteVisuals[key];
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}

function showAlert(message, kind = 'info') {
  const el = $('globalAlert');
  if (!el) return;
  el.textContent = message;
  el.className = 'alert';
  if (kind === 'error') {
    el.style.borderColor = 'rgba(239,68,68,.35)';
    el.style.background = 'rgba(239,68,68,.12)';
  } else {
    el.style.borderColor = 'rgba(139,92,246,.24)';
    el.style.background = 'rgba(139,92,246,.10)';
  }
  el.classList.remove('hidden');
  clearTimeout(showAlert._t);
  showAlert._t = setTimeout(() => el.classList.add('hidden'), 3600);
}

function setBusy(buttonId, busy, labelWhenBusy = '...') {
  const el = $(buttonId);
  if (!el) return;
  if (busy) {
    el.dataset.originalText = el.textContent;
    el.textContent = labelWhenBusy;
    el.disabled = true;
  } else {
    el.textContent = el.dataset.originalText || el.textContent;
    el.disabled = false;
  }
}

function renderAuth() {
  const authed = !!state.user;
  hide('appLoginBtn', authed);
  hide('appLogoutBtn', !authed);
  hide('profileGuest', authed);
  hide('profileCard', !authed);
  $('authBadge').textContent = authed ? 'Steam connected' : 'Гость';
  $('authBadge').className = `pill ${authed ? 'ok' : 'idle'}`;

  if (!authed) {
    text('playCtaText', 'Сначала войди через Steam. Потом можно искать матч в 2x2 соло или вдвоём.');
    return;
  }

  const u = state.user;
  $('profileAvatar').src = u.avatarUrl || '';
  text('profileNickname', u.nickname || 'Unknown');
  text('profileSteamId', u.steamId || u.steamId64 || '');
  text('profileElo', u.elo2v2 ?? 100);
  text('profileMatches', u.matchesPlayed2v2 ?? 0);
  text('profileWins', u.wins2v2 ?? 0);
  text('profileLosses', u.losses2v2 ?? 0);
  text('playCtaText', 'Режим только 2x2: можно искать матч соло или вдвоём. Готовая пати из двух не разделяется, соло-игроку подбирается тиммейт.');
}

function renderParty() {
  const party = state.party;
  const membersEl = $('partyMembers');
  const invitesEl = $('partyInvites');
  membersEl.innerHTML = '';
  invitesEl.innerHTML = '';

  const hasParty = !!party?.id;
  const count = party?.members?.length || 0;
  const invites = party?.pendingInvites || [];

  $('partyBadge').textContent = hasParty ? `${count}/2` : 'Соло';
  $('partyBadge').className = `pill ${hasParty ? 'ok' : 'idle'}`;
  text('queuePartyStat', hasParty ? `${count}/2` : '1/2');
  hide('leavePartyBtn', !hasParty);
  hide('disbandPartyBtn', !(hasParty && party.isLeader));

  if (!hasParty) {
    membersEl.innerHTML = `
      <div class="party-slot-card accent">
        <div class="party-slot-head">
          <span class="pill live">SOLO</span>
          <span class="muted">Тиммейт подберётся в матчмейкинге</span>
        </div>
        <div class="party-slot-title">Сейчас ты без party</div>
        <div class="muted">Можно искать матч одному или создать duo прямо здесь.</div>
      </div>
    `;
  } else {
    membersEl.innerHTML = (party.members || []).map((m) => `
      <div class="party-slot-card ${m.role === 'leader' ? 'accent' : ''}">
        <div class="party-slot-head">
          <img class="avatar sm" src="${esc(m.avatarUrl || '')}" alt="avatar">
          <span class="pill ${m.role === 'leader' ? 'live' : 'idle'}">${m.role === 'leader' ? 'Leader' : 'Member'}</span>
        </div>
        <div class="party-slot-title">${esc(m.nickname || 'Unknown')}</div>
        <div class="muted">Elo ${esc(m.elo2v2 ?? 100)}</div>
      </div>
    `).join('');

    if ((party.members || []).length < 2) {
      membersEl.innerHTML += `
        <div class="party-slot-card empty-slot">
          <div class="party-slot-head"><span class="pill idle">+1</span></div>
          <div class="party-slot-title">Свободный слот</div>
          <div class="muted">Пригласи друга по нику или ищи матч соло.</div>
        </div>
      `;
    }
  }

  invitesEl.innerHTML = invites.length
    ? invites.map((inv) => {
        const visual = getInviteVisual(inv);
        const expiresText = visual.actualRemainingMs != null
          ? `Истечёт через ${formatSecondsLeft(visual.actualRemainingMs / 1000)}`
          : 'Ожидает ответа';
        return `
          <div class="invite-shelf-card">
            <div class="invite-shelf-main">
              <img class="avatar sm" src="${esc(inv.fromAvatarUrl || '')}" alt="avatar">
              <div>
                <div style="font-weight:700">${esc(inv.fromNickname || 'Игрок')}</div>
                <div class="muted">Приглашает в party • ${expiresText}</div>
              </div>
            </div>
            <div class="invite-actions compact">
              <button class="btn secondary" type="button" data-accept-invite="${esc(inv.id)}">Принять</button>
              <button class="btn ghost" type="button" data-decline-invite="${esc(inv.id)}">Отклонить</button>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="empty">Входящих инвайтов нет.</div>';

  cleanupInviteVisuals();
  renderInviteOverlay();
}

function renderQueue() {
  const queue = state.queue;
  const inQueue = !!queue;
  $('queueBadge').textContent = inQueue ? 'В очереди' : 'Не в очереди';
  $('queueBadge').className = `pill ${inQueue ? 'ok' : 'idle'}`;
  $('matchmakingState').textContent = inQueue ? 'Поиск...' : 'Ожидание';
  $('matchmakingState').className = `pill ${inQueue ? 'live' : 'idle'}`;
  text('searchStateText', inQueue ? 'Матчмейкер подбирает 2x2 игру. Можно играть соло или вдвоём.' : 'Нажми «Найти матч». Если party нет, она создастся автоматически.');
  hide('joinQueueBtn', inQueue);
  hide('cancelQueueBtn', !inQueue);
}

function renderInviteOverlay() {
  const root = $('inviteOverlay');
  if (!root) return;

  const invites = (state.party?.pendingInvites || []).filter((inv) => getInviteVisual(inv).showToast);
  if (!invites.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = invites.map((inv) => {
    const visual = getInviteVisual(inv);
    const secondsLeft = Math.max(0, Math.ceil(visual.toastRemainingMs / 1000));
    return `
      <div class="invite-toast">
        <div class="invite-toast-top">
          <span class="pill live">PARTY INVITE</span>
          <span class="invite-toast-timer">${secondsLeft}с</span>
        </div>
        <div class="invite-toast-body">
          <img class="avatar" src="${esc(inv.fromAvatarUrl || '')}" alt="avatar">
          <div>
            <div class="invite-toast-title">${esc(inv.fromNickname || 'Игрок')} зовёт тебя в party</div>
            <div class="muted">Уведомление висит 10 секунд. Сам invite ниже остаётся активным до backend expiry.</div>
          </div>
        </div>
        <div class="invite-actions">
          <button class="btn primary" type="button" data-accept-invite="${esc(inv.id)}">Принять</button>
          <button class="btn ghost" type="button" data-decline-invite="${esc(inv.id)}">Отклонить</button>
        </div>
        <div class="invite-progress"><span style="width:${visual.toastProgress}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderHistory() {
  const root = $('historyList');
  const items = state.history || [];
  if (!items.length) {
    root.innerHTML = '<div class="empty">История матчей пока пуста.</div>';
    return;
  }
  root.innerHTML = items.map((item) => `
    <div class="history-item">
      <div>
        <div style="font-weight:700">${esc(item.public_match_id || item.matchId || 'match')}</div>
        <div class="muted">${esc(item.map_name || '—')} • ${esc(item.team_a_score ?? 0)} : ${esc(item.team_b_score ?? 0)}</div>
      </div>
      <span class="pill ${item.result === 'win' ? 'ok' : 'warn'}">${esc(item.result || item.winner_team || '—')}</span>
    </div>
  `).join('');
}

function connectString(match) {
  if (!match?.serverIp || !match?.serverPort) return 'Сервер ещё назначается';
  return `connect ${match.serverIp}:${match.serverPort}; password ${match.serverPassword || ''}`.trim();
}

function renderCurrentMatch() {
  const match = state.match;
  const hasMatch = !!match;
  hide('currentMatchEmpty', hasMatch);
  hide('currentMatchCard', !hasMatch);
  $('currentMatchBadge').textContent = hasMatch ? (match.status || 'Матч') : 'Нет матча';
  $('currentMatchBadge').className = `pill ${hasMatch ? 'live' : 'idle'}`;
  if (!hasMatch) return;

  text('currentMatchId', match.publicMatchId || match.matchId || '—');
  text('currentMatchMeta', `${match.mode || '2x2'} • карта: ${match.mapName || 'не выбрана'}`);
  text('currentMatchStatus', match.status || '—');
  $('currentMatchStatus').className = `pill ${match.status === 'live' ? 'live' : match.status === 'server_assigned' ? 'ok' : 'warn'}`;
  text('serverConnectLine', connectString(match));

  const teamA = (match.players || []).filter((p) => p.team === 'A');
  const teamB = (match.players || []).filter((p) => p.team === 'B');
  $('teamAPlayers').innerHTML = teamA.map(playerHtml).join('');
  $('teamBPlayers').innerHTML = teamB.map(playerHtml).join('');

  renderAcceptAndMapVoting(match);
}

function playerHtml(p) {
  return `
    <div class="member-item">
      <div class="member-main">
        <img class="avatar sm" src="${esc(p.avatarUrl || '')}" alt="avatar">
        <div>
          <div>${esc(p.nickname || 'Unknown')}</div>
          <div class="muted">Elo ${esc(p.elo || 100)}${p.mapVote ? ` • vote: ${esc(p.mapVote)}` : ''}</div>
        </div>
      </div>
      <span class="pill ${p.accepted ? 'ok' : 'idle'}">${p.accepted ? 'Accepted' : 'Waiting'}</span>
    </div>
  `;
}

function renderAcceptAndMapVoting(match) {
  let box = $('matchActions');
  if (!box) {
    box = document.createElement('div');
    box.id = 'matchActions';
    box.style.marginTop = '14px';
    $('currentMatchCard').appendChild(box);
  }

  const canAccept = match.status === 'pending_acceptance' && !match.accepted;
  const canVoteMap = match.acceptedCount === match.totalPlayers && ['map_voting', 'server_assigned'].includes(match.status) && !match.mapName;
  const acceptedText = `${match.acceptedCount || 0}/${match.totalPlayers || 4} приняли матч`;

  let html = `<div class="muted" style="margin-bottom:10px">${esc(acceptedText)}</div>`;
  if (canAccept) {
    html += `<button class="btn primary" id="acceptMatchBtn">ПРИНЯТЬ МАТЧ</button>`;
  } else if (match.status === 'pending_acceptance') {
    html += `<div class="empty">Ждём, пока все игроки примут матч.</div>`;
  }

  if (canVoteMap) {
    html += `<div style="margin-top:14px"><div class="label">Выбор карты</div><div class="list">`;
    html += state.mapPool.map((map) => `<button class="btn secondary block" data-map-vote="${esc(map)}">${esc(map)}</button>`).join('');
    html += `</div></div>`;
  } else if (match.status === 'map_voting' && !match.mapName) {
    html += `<div class="empty" style="margin-top:12px">После принятия всеми игроками выбирается карта из пула: ${state.mapPool.join(', ')}.</div>`;
  } else if (match.mapName) {
    html += `<div class="empty" style="margin-top:12px">Выбрана карта: ${esc(match.mapName)}.</div>`;
  }

  box.innerHTML = html;

  $('acceptMatchBtn')?.addEventListener('click', async () => {
    try {
      setBusy('acceptMatchBtn', true, 'ПРИНИМАЕМ...');
      await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/accept`, { method: 'POST' });
      await refreshAll();
    } catch (err) {
      showAlert(`Не удалось принять матч: ${err.message}`, 'error');
    } finally {
      setBusy('acceptMatchBtn', false);
    }
  });

  box.querySelectorAll('[data-map-vote]').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      btn.disabled = true;
      await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/map-vote`, {
        method: 'POST',
        body: JSON.stringify({ mapName: btn.dataset.mapVote })
      });
      await refreshAll();
    } catch (err) {
      showAlert(`Не удалось выбрать карту: ${err.message}`, 'error');
      btn.disabled = false;
    }
  }));
}

async function refreshAccount() {
  const data = await api('/auth/me');
  state.user = data.user || null;
}

async function refreshParty() {
  const data = await api('/api/party/me');
  state.party = data.party || null;
}

async function refreshQueue() {
  const data = await api('/api/queue/me');
  state.queue = data.queue || null;
}

async function refreshMatch() {
  const data = await api('/api/matches/me/current');
  state.match = data.match || null;
  if (Array.isArray(data.mapPool)) state.mapPool = data.mapPool;
}

async function refreshHistory() {
  const data = await api('/api/matches/me/history');
  state.history = data.items || [];
}

async function refreshAll() {
  await Promise.allSettled([
    refreshAccount(),
    refreshParty(),
    refreshQueue(),
    refreshMatch(),
    refreshHistory()
  ]);
  renderAuth();
  renderParty();
  renderQueue();
  renderCurrentMatch();
  renderHistory();
}

async function login() {
  window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
}

async function logout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch (_) {}
  window.location.reload();
}

async function createParty() {
  try {
    await api('/api/party/create', { method: 'POST' });
    await refreshAll();
    showAlert('Party создана.');
  } catch (err) {
    showAlert(`Не удалось создать party: ${err.message}`, 'error');
  }
}

async function leaveParty() {
  try {
    await api('/api/party/leave', { method: 'POST' });
    await refreshAll();
    showAlert('Ты покинул party.');
  } catch (err) {
    showAlert(`Не удалось выйти из party: ${err.message}`, 'error');
  }
}

async function disbandParty() {
  try {
    await api('/api/party/disband', { method: 'POST' });
    await refreshAll();
    showAlert('Party распущена.');
  } catch (err) {
    showAlert(`Не удалось распустить party: ${err.message}`, 'error');
  }
}

async function searchUsers() {
  const q = $('userSearchInput')?.value?.trim();
  const root = $('userSearchResults');
  if (!q) {
    root.innerHTML = '<div class="empty">Введи ник игрока.</div>';
    return;
  }
  try {
    const data = await api(`/api/account/users/search?q=${encodeURIComponent(q)}`);
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = '<div class="empty">Игроки не найдены.</div>';
      return;
    }
    root.innerHTML = items.map((item) => `
      <div class="member-item">
        <div class="member-main">
          <img class="avatar sm" src="${esc(item.avatarUrl || '')}" alt="avatar">
          <div>
            <div>${esc(item.nickname || 'Unknown')}</div>
            <div class="muted">Elo ${esc(item.elo2v2 ?? 100)}</div>
          </div>
        </div>
        <button class="btn secondary" data-invite-user="${esc(item.id)}">Пригласить</button>
      </div>
    `).join('');
    root.querySelectorAll('[data-invite-user]').forEach((btn) => btn.addEventListener('click', () => inviteUser(btn.dataset.inviteUser)));
  } catch (err) {
    root.innerHTML = `<div class="empty">Ошибка поиска: ${esc(err.message)}</div>`;
  }
}

async function inviteUser(userId) {
  try {
    await api('/api/party/invite', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId })
    });
    await refreshAll();
    showAlert('Инвайт отправлен.');
  } catch (err) {
    showAlert(`Не удалось отправить инвайт: ${err.message}`, 'error');
  }
}

async function acceptInvite(id) {
  try {
    await api(`/api/party/invite/${encodeURIComponent(id)}/accept`, { method: 'POST' });
    await refreshAll();
    showAlert('Инвайт принят.');
  } catch (err) {
    showAlert(`Не удалось принять инвайт: ${err.message}`, 'error');
  }
}

async function declineInvite(id) {
  try {
    await api(`/api/party/invite/${encodeURIComponent(id)}/decline`, { method: 'POST' });
    await refreshAll();
    showAlert('Инвайт отклонён.');
  } catch (err) {
    showAlert(`Не удалось отклонить инвайт: ${err.message}`, 'error');
  }
}

async function joinQueue() {
  try {
    await api('/api/queue/join', { method: 'POST', body: JSON.stringify({ mode: '2x2' }) });
    await refreshAll();
    showAlert('Поиск матча запущен.');
  } catch (err) {
    showAlert(`Не удалось запустить поиск: ${err.message}`, 'error');
  }
}

async function cancelQueue() {
  try {
    await api('/api/queue/cancel', { method: 'POST' });
    await refreshAll();
    showAlert('Поиск матча отменён.');
  } catch (err) {
    showAlert(`Не удалось отменить поиск: ${err.message}`, 'error');
  }
}

async function copyConnect() {
  if (!state.match) return;
  await navigator.clipboard.writeText(connectString(state.match));
  showAlert('Команда connect скопирована.');
}

window.addEventListener('DOMContentLoaded', async () => {
  $('appLoginBtn')?.addEventListener('click', login);
  $('appLogoutBtn')?.addEventListener('click', logout);
  $('createPartyBtn')?.addEventListener('click', createParty);
  $('leavePartyBtn')?.addEventListener('click', leaveParty);
  $('disbandPartyBtn')?.addEventListener('click', disbandParty);
  $('userSearchBtn')?.addEventListener('click', searchUsers);
  $('joinQueueBtn')?.addEventListener('click', joinQueue);
  $('cancelQueueBtn')?.addEventListener('click', cancelQueue);
  $('copyConnectBtn')?.addEventListener('click', copyConnect);
  document.addEventListener('click', async (event) => {
    const target = event.target.closest?.('[data-accept-invite], [data-decline-invite]');
    if (!target) return;
    event.preventDefault();
    const acceptId = target.dataset.acceptInvite;
    const declineId = target.dataset.declineInvite;
    if (acceptId) await acceptInvite(acceptId);
    if (declineId) await declineInvite(declineId);
  });

  await refreshAll();
  setInterval(() => { void refreshAll(); }, 5000);
  setInterval(() => { renderInviteOverlay(); }, 1000);
});
