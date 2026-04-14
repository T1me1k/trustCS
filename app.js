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
  profile: null,
  profileHistory: [],
  matchDetails: null,
  mapPool: ['shortdust', 'lake', 'overpass', 'vertigo', 'nuke'],
  inviteToastSeen: new Set(),
  inviteToastDismissed: new Set(),
  inviteToastTimers: new Map()
};

function $(id) { return document.getElementById(id); }
function hide(id, on) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('hidden', on);
  el.style.display = on ? 'none' : '';
}
function text(id, value) { const el = $(id); if (el) el.textContent = value; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function formatPercent(value) { return `${Number(value || 0)}%`; }
function formatDate(value) {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function formatDuration(totalSec) {
  if (totalSec == null || Number.isNaN(Number(totalSec))) return '—';
  const sec = Number(totalSec);
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}м ${String(seconds).padStart(2, '0')}с`;
}
function formatStanding(standing) {
  if (standing === 'hot') return 'HOT';
  if (standing === 'good') return 'GOOD';
  return 'BUILDING';
}
function standingPillClass(standing) {
  if (standing === 'hot') return 'ok';
  if (standing === 'good') return 'live';
  return 'idle';
}
function resultPillClass(result) {
  if (result === 'win') return 'ok';
  if (result === 'loss') return 'warn';
  return 'idle';
}
function getAvatarMarkup(avatarUrl, fallback, className = 'avatar sm') {
  if (avatarUrl) return `<img class="${className}" src="${esc(avatarUrl)}" alt="avatar">`;
  return `<div class="avatar-fallback ${className.includes('sm') ? 'sm' : ''}">${esc((fallback || '?').slice(0, 1).toUpperCase())}</div>`;
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

function renderRecentForm(rootId, values) {
  const root = $(rootId);
  if (!root) return;
  const items = Array.isArray(values) ? values : [];
  if (!items.length) {
    root.innerHTML = '<div class="empty-chip">Пока пусто</div>';
    return;
  }
  root.innerHTML = items.map((item) => {
    const normalized = String(item).toUpperCase() === 'W' ? 'W' : 'L';
    return `<span class="form-chip ${normalized === 'W' ? 'win' : 'loss'}">${normalized}</span>`;
  }).join('');
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

  const profile = state.profile || state.user;
  $('profileAvatar').src = profile.avatarUrl || '';
  text('profileNickname', profile.nickname || 'Unknown');
  text('profileSteamId', profile.steamId || profile.steamId64 || '');
  text('profileElo', profile.elo2v2 ?? 100);
  text('profileWinRate', formatPercent(profile.winRate2v2 || 0));
  text('profileMatches', profile.matchesPlayed2v2 ?? 0);
  text('profileRecord', `${profile.wins2v2 ?? 0} / ${profile.losses2v2 ?? 0}`);
  text('profileCurrentStreak', `${profile.currentWinStreak ?? 0}W`);
  text('profileBestStreak', `${profile.bestWinStreak ?? 0}W`);
  text('profileFavoriteMap', profile.favoriteMap || '—');
  renderRecentForm('profileRecentForm', profile.recentForm || []);
  text('playCtaText', 'Режим только 2x2: можно искать матч соло или вдвоём. Готовая пати из двух не разделяется, соло-игроку подбирается тиммейт.');
}

function renderProfileOverview() {
  const profile = state.profile;
  const hasProfile = !!profile;
  hide('profileOverviewGuest', hasProfile);
  hide('profileOverview', !hasProfile);
  $('profileStanding').textContent = hasProfile ? formatStanding(profile.standing) : 'building';
  $('profileStanding').className = `pill ${hasProfile ? standingPillClass(profile.standing) : 'idle'}`;
  if (!hasProfile) return;

  $('profileHeroAvatar').src = profile.avatarUrl || '';
  text('profileHeroName', profile.nickname || 'Unknown');
  text('profileHeroSteam', profile.steamId || profile.steamId64 || '');
  text('profileHeroElo', profile.elo2v2 ?? 100);
  text('profileWins', profile.wins2v2 ?? 0);
  text('profileLosses', profile.losses2v2 ?? 0);
  text('profileHeroWinRate', formatPercent(profile.winRate2v2 || 0));
  text('profileHeroMatches', profile.matchesPlayed2v2 ?? 0);
  text('profileHeroCurrentStreak', `${profile.currentWinStreak ?? 0}W`);
  text('profileHeroBestStreak', `${profile.bestWinStreak ?? 0}W`);
  text('profileHeroFavoriteMap', profile.favoriteMap || '—');
  text('profileHeroStanding', formatStanding(profile.standing));
  renderRecentForm('profileHeroForm', profile.recentForm || []);
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
  hide('createPartyBtn', hasParty);
  hide('leavePartyBtn', !hasParty);

  if (!hasParty) {
    membersEl.innerHTML = '<div class="empty">Party пока нет. Она создастся автоматически при поиске или по кнопке.</div>';
  } else {
    membersEl.innerHTML = (party.members || []).map((m) => `
      <div class="member-item">
        <div class="member-main">
          ${getAvatarMarkup(m.avatarUrl, m.nickname, 'avatar sm')}
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
      <div class="invite-item invite-inline-card" data-invite-card="${esc(inv.id)}">
        <div>
          <div style="font-weight:700">${esc(inv.fromNickname || 'Игрок')}</div>
          <div class="muted">Приглашает в party</div>
        </div>
        <div class="invite-actions invite-actions-inline">
          <button class="btn secondary" data-accept-invite="${esc(inv.id)}">Принять</button>
          <button class="btn ghost" data-decline-invite="${esc(inv.id)}">Отклонить</button>
        </div>
      </div>
    `).join('')
    : '<div class="empty">Входящих инвайтов нет.</div>';

  syncInviteToasts(invites);
}

function syncInviteToasts(invites) {
  const layer = $('inviteToastLayer');
  if (!layer) return;
  const currentIds = new Set((invites || []).map((inv) => String(inv.id)));

  [...state.inviteToastSeen].forEach((id) => {
    if (!currentIds.has(id)) state.inviteToastSeen.delete(id);
  });
  [...state.inviteToastDismissed].forEach((id) => {
    if (!currentIds.has(id)) state.inviteToastDismissed.delete(id);
  });

  layer.querySelectorAll('.invite-toast').forEach((node) => {
    if (!currentIds.has(node.dataset.inviteId)) removeInviteToast(node.dataset.inviteId);
  });

  (invites || []).forEach((inv) => {
    const inviteId = String(inv.id);
    if (state.inviteToastDismissed.has(inviteId) || state.inviteToastSeen.has(inviteId)) return;
    state.inviteToastSeen.add(inviteId);
    createInviteToast(inv);
  });
}

function createInviteToast(invite) {
  const layer = $('inviteToastLayer');
  if (!layer) return;
  const inviteId = String(invite.id);
  if (layer.querySelector(`[data-invite-id="${CSS.escape(inviteId)}"]`)) return;

  const avatarMarkup = invite.fromAvatarUrl
    ? `<img class="invite-toast-avatar real-avatar" src="${esc(invite.fromAvatarUrl)}" alt="avatar">`
    : `<div class="invite-toast-avatar">${esc((invite.fromNickname || 'Игрок').slice(0, 1).toUpperCase())}</div>`;

  const toast = document.createElement('div');
  toast.className = 'invite-toast';
  toast.dataset.inviteId = inviteId;
  toast.innerHTML = `
    <button class="invite-toast-close" type="button" aria-label="Скрыть" data-dismiss-invite-toast="${esc(inviteId)}">×</button>
    <div class="invite-toast-head">
      <div class="invite-toast-title">Приглашение в party</div>
    </div>
    <div class="invite-toast-body">
      ${avatarMarkup}
      <div>
        <div class="invite-toast-name">${esc(invite.fromNickname || 'Игрок')}</div>
        <div class="invite-toast-sub">приглашает тебя в duo party</div>
      </div>
    </div>
    <div class="invite-toast-actions">
      <button class="btn secondary" data-accept-invite="${esc(inviteId)}">Принять</button>
      <button class="btn ghost" data-decline-invite="${esc(inviteId)}">Отклонить</button>
    </div>
    <div class="invite-toast-progress"><div class="invite-toast-progress-bar"></div></div>
  `;

  layer.prepend(toast);
  requestAnimationFrame(() => toast.classList.add('shown'));

  const progress = toast.querySelector('.invite-toast-progress-bar');
  if (progress) {
    progress.style.width = '100%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.style.width = '0%';
      });
    });
  }

  const timer = window.setTimeout(() => dismissInviteToast(inviteId), 10000);
  state.inviteToastTimers.set(inviteId, timer);
}

function clearInviteToastTimer(inviteId) {
  const timer = state.inviteToastTimers.get(inviteId);
  if (timer) {
    clearTimeout(timer);
    state.inviteToastTimers.delete(inviteId);
  }
}

function removeInviteToast(inviteId) {
  clearInviteToastTimer(inviteId);
  const layer = $('inviteToastLayer');
  const node = layer?.querySelector(`[data-invite-id="${CSS.escape(String(inviteId))}"]`);
  if (!node) return;
  node.classList.remove('shown');
  node.classList.add('hiding');
  window.setTimeout(() => node.remove(), 180);
}

function dismissInviteToast(inviteId) {
  state.inviteToastDismissed.add(String(inviteId));
  removeInviteToast(inviteId);
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
  const items = state.profileHistory || [];
  text('historyCountBadge', items.length);
  if (!items.length) {
    root.innerHTML = '<div class="empty">История матчей пока пуста.</div>';
    return;
  }
  root.innerHTML = items.map((item) => {
    const resultLabel = item.result === 'win' ? 'WIN' : item.result === 'loss' ? 'LOSS' : '—';
    const scoreLabel = `${item.teamAScore ?? 0} : ${item.teamBScore ?? 0}`;
    const teammate = item.teammate?.nickname ? esc(item.teammate.nickname) : '—';
    const opponents = (item.opponents || []).map((p) => esc(p.nickname)).join(', ') || '—';
    const eloDelta = item.eloDelta == null ? '—' : `${item.eloDelta > 0 ? '+' : ''}${item.eloDelta}`;
    return `
      <article class="history-card">
        <div class="history-card-top">
          <div>
            <div class="history-card-id">${esc(item.publicMatchId || 'match')}</div>
            <div class="muted">${formatDate(item.finishedAt)} • ${esc(item.mapName || '—')}</div>
          </div>
          <span class="pill ${resultPillClass(item.result)}">${resultLabel}</span>
        </div>
        <div class="history-card-grid">
          <div class="history-card-stat"><span>Счёт</span><strong>${esc(scoreLabel)}</strong></div>
          <div class="history-card-stat"><span>Elo</span><strong>${esc(eloDelta)}</strong></div>
          <div class="history-card-stat"><span>Длительность</span><strong>${esc(formatDuration(item.durationSec))}</strong></div>
          <div class="history-card-stat"><span>Тиммейт</span><strong>${teammate}</strong></div>
        </div>
        <div class="history-card-foot muted">Против: ${opponents}</div>
        <div class="history-card-actions">
          <button class="btn secondary" data-open-match-details="${esc(item.publicMatchId)}">Подробнее</button>
        </div>
      </article>
    `;
  }).join('');
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
        ${getAvatarMarkup(p.avatarUrl, p.nickname, 'avatar sm')}
        <div>
          <div>${esc(p.nickname || 'Unknown')}</div>
          <div class="muted">Elo ${esc(p.elo || p.elo2v2 || 100)}${p.mapVote ? ` • vote: ${esc(p.mapVote)}` : ''}</div>
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
    html += '<button class="btn primary" id="acceptMatchBtn">ПРИНЯТЬ МАТЧ</button>';
  } else if (match.status === 'pending_acceptance') {
    html += '<div class="empty">Ждём, пока все игроки примут матч.</div>';
  }

  if (canVoteMap) {
    html += '<div style="margin-top:14px"><div class="label">Выбор карты</div><div class="list">';
    html += state.mapPool.map((map) => `<button class="btn secondary block" data-map-vote="${esc(map)}">${esc(map)}</button>`).join('');
    html += '</div></div>';
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

function renderMatchDetailsModal() {
  const modal = $('matchDetailsModal');
  const details = state.matchDetails;
  hide('matchDetailsModal', !details);
  if (!details) return;

  text('matchDetailsTitle', details.publicMatchId || 'Детали матча');
  text('matchDetailsMeta', `${details.mode || '2x2'} • ${details.mapName || 'карта не выбрана'} • ${details.status || '—'}`);

  const teamHtml = (title, players) => `
    <div class="team">
      <div style="font-weight:700;margin-bottom:12px">${title}</div>
      <div class="list">
        ${(players || []).map((player) => `
          <div class="member-item compact">
            <div class="member-main">
              ${getAvatarMarkup(player.avatarUrl, player.nickname, 'avatar sm')}
              <div>
                <div>${esc(player.nickname || 'Unknown')}</div>
                <div class="muted">Elo ${esc(player.elo2v2 ?? 100)}${player.result ? ` • ${esc(player.result)}` : ''}</div>
              </div>
            </div>
            <span class="pill ${player.result === 'win' ? 'ok' : player.result === 'loss' ? 'warn' : player.accepted ? 'live' : 'idle'}">${player.result ? esc(player.result) : player.accepted ? 'Accepted' : '—'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  $('matchDetailsBody').innerHTML = `
    <div class="details-summary-grid">
      <div class="stat"><span>Счёт</span><strong>${esc(`${details.score?.teamA ?? 0} : ${details.score?.teamB ?? 0}`)}</strong></div>
      <div class="stat"><span>Победитель</span><strong>${esc(details.score?.winnerTeam || '—')}</strong></div>
      <div class="stat"><span>Сервер</span><strong>${esc(details.server?.name || details.server?.region || '—')}</strong></div>
      <div class="stat"><span>Финиш</span><strong>${esc(formatDate(details.timeline?.finishedAt))}</strong></div>
    </div>
    <div class="details-timeline">
      <div class="timeline-row"><span class="muted">Accept</span><strong>${esc(formatDate(details.timeline?.acceptedAt))}</strong></div>
      <div class="timeline-row"><span class="muted">Map voting start</span><strong>${esc(formatDate(details.timeline?.mapVotingStartedAt))}</strong></div>
      <div class="timeline-row"><span class="muted">Map voting end</span><strong>${esc(formatDate(details.timeline?.mapVotingFinishedAt))}</strong></div>
      <div class="timeline-row"><span class="muted">Live start</span><strong>${esc(formatDate(details.timeline?.startedAt))}</strong></div>
      <div class="timeline-row"><span class="muted">Result</span><strong>${esc(formatDate(details.timeline?.finishedAt))}</strong></div>
    </div>
    <div class="match-grid" style="margin-top:16px">
      ${teamHtml('Team A', details.teams?.A || [])}
      ${teamHtml('Team B', details.teams?.B || [])}
    </div>
  `;
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
async function refreshProfile() {
  const data = await api('/api/profile/me');
  state.profile = data.profile || null;
}
async function refreshProfileHistory() {
  const data = await api('/api/profile/me/history?limit=12');
  state.profileHistory = data.items || [];
}

async function refreshAll() {
  await Promise.allSettled([
    refreshAccount(),
    refreshParty(),
    refreshQueue(),
    refreshMatch(),
    refreshProfile(),
    refreshProfileHistory()
  ]);
  renderAuth();
  renderProfileOverview();
  renderParty();
  renderQueue();
  renderCurrentMatch();
  renderHistory();
  renderMatchDetailsModal();
}

function login() { window.location.href = `${BACKEND_BASE_URL}/auth/steam`; }
async function logout() { try { await api('/auth/logout', { method: 'POST' }); } catch (_) {} window.location.reload(); }

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
          ${getAvatarMarkup(item.avatarUrl, item.nickname, 'avatar sm')}
          <div>
            <div>${esc(item.nickname || 'Unknown')}</div>
            <div class="muted">Elo ${esc(item.elo2v2 ?? 100)}</div>
          </div>
        </div>
        <button class="btn secondary" data-invite-user="${esc(item.id)}">Пригласить</button>
      </div>
    `).join('');
  } catch (err) {
    root.innerHTML = `<div class="empty">Ошибка поиска: ${esc(err.message)}</div>`;
  }
}

async function inviteUser(userId) {
  try {
    if (!state.party?.id) {
      await api('/api/party/create', { method: 'POST' });
      await refreshParty();
    }
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
    removeInviteToast(id);
    await refreshAll();
    showAlert('Инвайт принят.');
  } catch (err) {
    showAlert(`Не удалось принять инвайт: ${err.message}`, 'error');
  }
}

async function declineInvite(id) {
  try {
    await api(`/api/party/invite/${encodeURIComponent(id)}/decline`, { method: 'POST' });
    dismissInviteToast(id);
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

async function openMatchDetails(publicMatchId) {
  try {
    const data = await api(`/api/matches/${encodeURIComponent(publicMatchId)}/details`);
    state.matchDetails = data.match || null;
    renderMatchDetailsModal();
  } catch (err) {
    showAlert(`Не удалось загрузить детали матча: ${err.message}`, 'error');
  }
}
function closeMatchDetails() {
  state.matchDetails = null;
  renderMatchDetailsModal();
}

async function handleDelegatedClick(event) {
  const acceptBtn = event.target.closest('[data-accept-invite]');
  if (acceptBtn) {
    acceptBtn.disabled = true;
    await acceptInvite(acceptBtn.dataset.acceptInvite);
    return;
  }
  const declineBtn = event.target.closest('[data-decline-invite]');
  if (declineBtn) {
    declineBtn.disabled = true;
    await declineInvite(declineBtn.dataset.declineInvite);
    return;
  }
  const dismissBtn = event.target.closest('[data-dismiss-invite-toast]');
  if (dismissBtn) {
    dismissInviteToast(dismissBtn.dataset.dismissInviteToast);
    return;
  }
  const inviteBtn = event.target.closest('[data-invite-user]');
  if (inviteBtn) {
    inviteBtn.disabled = true;
    try { await inviteUser(inviteBtn.dataset.inviteUser); } finally { inviteBtn.disabled = false; }
    return;
  }
  const detailsBtn = event.target.closest('[data-open-match-details]');
  if (detailsBtn) {
    await openMatchDetails(detailsBtn.dataset.openMatchDetails);
    return;
  }
  const closeModalBtn = event.target.closest('[data-close-modal="match-details"]');
  if (closeModalBtn) {
    closeMatchDetails();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  $('appLoginBtn')?.addEventListener('click', login);
  $('appLogoutBtn')?.addEventListener('click', logout);
  $('createPartyBtn')?.addEventListener('click', createParty);
  $('leavePartyBtn')?.addEventListener('click', leaveParty);
  $('userSearchBtn')?.addEventListener('click', searchUsers);
  $('joinQueueBtn')?.addEventListener('click', joinQueue);
  $('cancelQueueBtn')?.addEventListener('click', cancelQueue);
  $('copyConnectBtn')?.addEventListener('click', copyConnect);
  document.addEventListener('click', (event) => { void handleDelegatedClick(event); });

  await refreshAll();
  setInterval(() => { void refreshAll(); }, 5000);
});
