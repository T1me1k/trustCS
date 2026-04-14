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
  mapPool: ['shortdust', 'lake', 'overpass', 'vertigo', 'nuke']
};

function $(id) { return document.getElementById(id); }
function hide(id, on) { $(id)?.classList.toggle('hidden', on); }
function text(id, value) { const el = $(id); if (el) el.textContent = value; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

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

function formatRelativeClock(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  if (!Number.isFinite(total)) return '—';
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hours} ч ${rem} мин`;
  }
  if (mins > 0) return `${mins} мин ${secs} сек`;
  return `${secs} сек`;
}

function phaseLabel(phase) {
  return ({ accept: 'Accept', map_veto: 'Map', connect: 'Connect', live: 'LIVE', result: 'Result' }[phase] || phase || '—');
}

function connectionBadge(connectionState) {
  if (connectionState === 'connected') return { cls: 'ok', text: 'На сервере' };
  if (connectionState === 'disconnected') return { cls: 'warn', text: 'Отключён' };
  if (connectionState === 'abandoned') return { cls: 'warn', text: 'Abandon' };
  return { cls: 'idle', text: 'Ждёт connect' };
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

  $('partyBadge').textContent = hasParty ? `${count}/2` : 'Нет party';
  $('partyBadge').className = `pill ${hasParty ? 'ok' : 'idle'}`;
  text('queuePartyStat', hasParty ? `${count}/2` : '1/2');
  hide('leavePartyBtn', !hasParty);
  hide('disbandPartyBtn', !(hasParty && party.isLeader));

  if (!hasParty) {
    membersEl.innerHTML = '<div class="empty">Party пока нет. Она создастся автоматически при поиске или по кнопке.</div>';
  } else {
    membersEl.innerHTML = (party.members || []).map((m) => `
      <div class="member-item">
        <div class="member-main">
          <img class="avatar sm" src="${esc(m.avatarUrl || '')}" alt="avatar">
          <div>
            <div>${esc(m.nickname || 'Unknown')}</div>
            <div class="muted">${esc(m.role || 'member')} • Elo ${esc(m.elo2v2 ?? 100)}</div>
          </div>
        </div>
        <span class="pill ${m.role === 'leader' ? 'live' : 'idle'}">${m.role === 'leader' ? 'Leader' : 'Member'}</span>
      </div>
    `).join('');
  }

  invitesEl.innerHTML = invites.length
    ? invites.map((inv) => `
      <div class="invite-item">
        <div>
          <div style="font-weight:700">${esc(inv.fromNickname || 'Игрок')}</div>
          <div class="muted">Приглашает в party</div>
        </div>
        <div class="inline">
          <button class="btn secondary" data-accept-invite="${esc(inv.id)}">Принять</button>
          <button class="btn ghost" data-decline-invite="${esc(inv.id)}">Отклонить</button>
        </div>
      </div>
    `).join('')
    : '<div class="empty">Входящих инвайтов нет.</div>';
}

  membersEl.innerHTML = (party.members || []).map((m) => `
    <div class="member-item">
      <div class="member-main">
        <img class="avatar sm" src="${esc(m.avatarUrl || '')}" alt="avatar">
        <div>
          <div>${esc(m.nickname || 'Unknown')}</div>
          <div class="muted">${esc(m.role || 'member')} • Elo ${esc(m.elo2v2 ?? 100)}</div>
        </div>
      </div>
      <span class="pill ${m.role === 'leader' ? 'live' : 'idle'}">${m.role === 'leader' ? 'Leader' : 'Member'}</span>
    </div>
  `).join('');

  const invites = party.pendingInvites || [];
  invitesEl.innerHTML = invites.length
    ? invites.map((inv) => `
      <div class="invite-item">
        <div>
          <div style="font-weight:700">${esc(inv.fromNickname || 'Игрок')}</div>
          <div class="muted">Приглашает в party</div>
        </div>
        <div class="inline">
          <button class="btn secondary" data-accept-invite="${esc(inv.id)}">Принять</button>
          <button class="btn ghost" data-decline-invite="${esc(inv.id)}">Отклонить</button>
        </div>
      </div>
    `).join('')
    : '<div class="empty">Входящих инвайтов нет.</div>';
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
  return match?.room?.server?.connectCommand || (match?.serverIp && match?.serverPort ? `connect ${match.serverIp}:${match.serverPort}; password ${match.serverPassword || ''}`.trim() : 'Сервер ещё назначается');
}

function playerCardHtml(p, accent = 'idle') {
  const badge = connectionBadge(p.connectionState);
  const reconnect = p.reconnectRemainingSec ? `<div class="muted">Reconnect: ${esc(formatDuration(p.reconnectRemainingSec))}</div>` : '';
  const accepted = p.accepted ? 'Accepted' : 'Waiting';
  return `
    <div class="match-player-card ${accent}">
      <div class="member-main">
        <img class="avatar sm" src="${esc(p.avatarUrl || '')}" alt="avatar">
        <div>
          <div style="font-weight:700">${esc(p.nickname || 'Unknown')}</div>
          <div class="muted">Elo ${esc(p.elo || 100)}${p.mapVote ? ` • vote: ${esc(p.mapVote)}` : ''}</div>
          ${reconnect}
        </div>
      </div>
      <div class="match-player-badges">
        <span class="pill ${p.accepted ? 'ok' : 'idle'}">${accepted}</span>
        <span class="pill ${badge.cls}">${badge.text}</span>
      </div>
    </div>
  `;
}

function renderTimeline(room) {
  return `
    <div class="timeline-grid">
      ${(room.timeline || []).map((step) => `
        <div class="timeline-step ${step.state}">
          <div class="timeline-step-top">
            <span class="pill ${step.state === 'done' ? 'ok' : step.state === 'current' ? 'live' : 'idle'}">${esc(step.title)}</span>
          </div>
          <div style="font-weight:700;margin-top:10px">${esc(step.key === room.phase ? `${step.title} now` : step.title)}</div>
          <div class="muted" style="margin-top:8px">${esc(step.description)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderActionPanel(room) {
  const phase = room.phase;
  const acceptTimer = room.deadlines?.acceptRemainingSec > 0 ? `До auto-cancel: ${formatDuration(room.deadlines.acceptRemainingSec)}` : '';
  const connectTimer = room.deadlines?.connectRemainingSec > 0 ? `До connect timeout: ${formatDuration(room.deadlines.connectRemainingSec)}` : '';
  const ownReconnect = room.me?.reconnectRemainingSec > 0 ? `На переподключение осталось ${formatDuration(room.me.reconnectRemainingSec)}` : '';

  let html = `<div class="room-panel emphasis"><div class="label">Действия</div><div style="font-size:18px;font-weight:800">${esc(room.statusText || 'Матч в процессе')}</div>`;
  if (acceptTimer || connectTimer || ownReconnect) {
    html += `<div class="muted" style="margin-top:8px">${esc([acceptTimer, connectTimer, ownReconnect].filter(Boolean).join(' • '))}</div>`;
  }
  html += `<div class="room-actions">`;

  if (room.actions?.canAccept) {
    html += `<button class="btn primary" id="acceptMatchBtn">ПРИНЯТЬ МАТЧ</button>`;
  }
  if (room.actions?.canCopyConnect) {
    html += `<button class="btn secondary" id="copyConnectRoomBtn">Копировать connect</button>`;
  }
  html += `</div>`;

  if (room.actions?.canVoteMap) {
    html += `<div style="margin-top:16px"><div class="label">Выбор карты</div><div class="map-grid">${state.mapPool.map((map) => `<button class="btn secondary" data-map-vote="${esc(map)}">${esc(map)}</button>`).join('')}</div></div>`;
  } else if (phase === 'map_veto' && !room.mapName) {
    html += `<div class="empty" style="margin-top:16px">Все игроки уже здесь. Осталось завершить голосование по карте.</div>`;
  }

  if (room.server?.connectCommand) {
    html += `<div class="room-connect-box"><div class="label">Connect</div><div class="connect-code">${esc(room.server.connectCommand)}</div></div>`;
  }

  html += `</div>`;
  return html;
}

function renderCurrentMatch() {
  const match = state.match;
  const hasMatch = !!match;
  hide('currentMatchEmpty', hasMatch);
  hide('currentMatchCard', !hasMatch);
  $('currentMatchBadge').textContent = hasMatch ? (phaseLabel(match.phase) || match.status || 'Match room') : 'Нет матча';
  $('currentMatchBadge').className = `pill ${hasMatch ? 'live' : 'idle'}`;
  if (!hasMatch) return;

  const room = match.room || {
    phase: match.phase,
    title: `TRUST ${match.mode || '2x2'} Match Room`,
    subtitle: match.statusText || 'Текущий матч',
    statusText: match.statusText || match.status,
    players: match.players || [],
    teams: { teamA: (match.players || []).filter((p) => p.team === 'A'), teamB: (match.players || []).filter((p) => p.team === 'B') },
    mapName: match.mapName,
    server: {
      name: match.serverName || 'EU-1',
      region: match.serverRegion || 'EU',
      connectCommand: connectString(match)
    },
    timeline: match.timeline || [],
    score: { teamA: match.teamAScore || 0, teamB: match.teamBScore || 0, winnerTeam: match.winnerTeam || null },
    actions: { canAccept: match.status === 'pending_acceptance' && !match.accepted, canVoteMap: ['map_voting', 'server_assigned'].includes(match.status) && !match.mapName, canCopyConnect: !!match.serverIp },
    deadlines: { acceptRemainingSec: match.acceptRemainingSec, connectRemainingSec: match.connectRemainingSec }
  };

  const phasePill = phaseLabel(room.phase);
  const scoreLine = room.phase === 'result' || room.phase === 'live'
    ? `${room.score?.teamA ?? 0} : ${room.score?.teamB ?? 0}${room.score?.winnerTeam ? ` • победила команда ${room.score.winnerTeam}` : ''}`
    : (room.mapName ? `Карта: ${room.mapName}` : 'Карта ещё выбирается');

  $('currentMatchCard').innerHTML = `
    <div class="match-room-shell">
      <div class="room-hero">
        <div>
          <div class="badge">MATCH ROOM</div>
          <div class="room-title">${esc(room.title || 'TRUST Match Room')}</div>
          <div class="muted" style="margin-top:10px">${esc(room.subtitle || '')}</div>
        </div>
        <div class="room-hero-side">
          <span class="pill live">${esc(phasePill)}</span>
          <div class="room-score">${esc(scoreLine)}</div>
          <div class="muted">ID: ${esc(match.publicMatchId || match.matchId || '—')}</div>
        </div>
      </div>

      ${renderTimeline(room)}

      <div class="room-grid">
        ${renderActionPanel(room)}

        <div class="room-panel">
          <div class="section-title"><h3>Сервер</h3><span class="pill ok">${esc(room.server?.name || 'EU-1')}</span></div>
          <div class="room-info-row"><span>Регион</span><strong>${esc(room.server?.region || 'EU')}</strong></div>
          <div class="room-info-row"><span>Карта</span><strong>${esc(room.mapName || 'ещё не выбрана')}</strong></div>
          <div class="room-info-row"><span>Accept</span><strong>${esc(`${match.acceptedCount || room.counts?.accepted || 0}/${match.totalPlayers || room.counts?.totalPlayers || 4}`)}</strong></div>
          <div class="room-info-row"><span>Connected</span><strong>${esc(`${match.connectedCount || room.counts?.connected || 0}/${match.totalPlayers || room.counts?.totalPlayers || 4}`)}</strong></div>
          <div class="room-info-row"><span>Accept deadline</span><strong>${esc(room.deadlines?.acceptExpiresAt ? formatRelativeClock(room.deadlines.acceptExpiresAt) : '—')}</strong></div>
          <div class="room-info-row"><span>Connect deadline</span><strong>${esc(room.deadlines?.connectExpiresAt ? formatRelativeClock(room.deadlines.connectExpiresAt) : '—')}</strong></div>
        </div>
      </div>

      <div class="room-grid team-boards">
        <div class="room-panel team-panel">
          <div class="section-title"><h3>Team A</h3><span class="pill idle">2 slots</span></div>
          <div class="list">${(room.teams?.teamA || []).map((p) => playerCardHtml(p, 'team-a')).join('')}</div>
        </div>
        <div class="room-panel team-panel">
          <div class="section-title"><h3>Team B</h3><span class="pill idle">2 slots</span></div>
          <div class="list">${(room.teams?.teamB || []).map((p) => playerCardHtml(p, 'team-b')).join('')}</div>
        </div>
      </div>
    </div>
  `;

  $('acceptMatchBtn')?.addEventListener('click', async () => {
    try {
      setBusy('acceptMatchBtn', true, 'ПРИНИМАЕМ...');
      await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/accept`, { method: 'POST' });
      await refreshAll();
    } catch (err) {
      showAlert(`Не удалось принять матч: ${err.message}`, 'error');
      setBusy('acceptMatchBtn', false);
    }
  });

  $('copyConnectRoomBtn')?.addEventListener('click', copyConnect);
  $('currentMatchCard').querySelectorAll('[data-map-vote]').forEach((btn) => btn.addEventListener('click', async () => {
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
  $('partyInvites')?.addEventListener('click', async (event) => {
    const acceptId = event.target?.dataset?.acceptInvite;
    const declineId = event.target?.dataset?.declineInvite;
    if (acceptId) await acceptInvite(acceptId);
    if (declineId) await declineInvite(declineId);
  });

  await refreshAll();
  setInterval(() => { void refreshAll(); }, 5000);
});
