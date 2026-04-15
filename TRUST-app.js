const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();

const AUTH_RETURN_STORAGE_KEY = 'trust_post_auth_return';
function getSteamAuthUrl() {
  const returnTo = encodeURIComponent(window.location.href);
  return `${BACKEND_BASE_URL}/auth/steam?returnTo=${returnTo}`;
}
function rememberAuthReturn() {
  try {
    sessionStorage.setItem(AUTH_RETURN_STORAGE_KEY, window.location.href);
  } catch (_) {}
}



const RANK_TABLE = [
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

function renderRankTooltip(activeRankKey) {
  const root = $('rankTooltipList');
  if (!root) return;
  root.innerHTML = RANK_TABLE.map((rank) => `
    <div class="rank-tooltip-row ${rank.key === activeRankKey ? 'active' : ''}">
      <div class="rank-tooltip-rank">
        <div>
          <div class="rank-tooltip-name">${esc(rank.name)}</div>
          <div class="muted">${esc(rank.minElo)}+ Elo</div>
        </div>
      </div>
      <span class="rank-pill ${esc(rank.color)}">${esc(rank.minElo)}+</span>
    </div>
  `).join('');
}


function setupRankTooltipInteractions() {
  const card = document.querySelector('.rank-hover-card');
  const trigger = $('profileRankTrigger');
  const tooltip = $('rankTooltip');
  if (!card || !trigger || !tooltip || card.dataset.bound === '1') return;
  card.dataset.bound = '1';

  let closeTimer = null;
  const open = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    card.classList.add('is-open');
    card.setAttribute('data-open', 'true');
    trigger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      card.classList.remove('is-open');
      card.setAttribute('data-open', 'false');
      trigger.setAttribute('aria-expanded', 'false');
    }, 40);
  };
  const toggle = () => {
    if (card.classList.contains('is-open')) close(); else open();
  };

  ['mouseenter', 'pointerenter'].forEach((eventName) => {
    card.addEventListener(eventName, open);
    tooltip.addEventListener(eventName, open);
  });
  ['mouseleave', 'pointerleave'].forEach((eventName) => {
    card.addEventListener(eventName, close);
    tooltip.addEventListener(eventName, close);
  });
  trigger.addEventListener('focus', open);
  trigger.addEventListener('blur', () => {
    if (!card.matches(':hover')) close();
  });
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    toggle();
  });
  document.addEventListener('click', (event) => {
    if (!card.contains(event.target)) {
      card.classList.remove('is-open');
      card.setAttribute('data-open', 'false');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

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
  inviteToastTimers: new Map(),
  postMatchSummary: null
};

let queueTimerInterval = null;

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

function formatQueueElapsed(totalSeconds) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatDuration(totalSec) {
  if (totalSec == null || Number.isNaN(Number(totalSec))) return '—';
  const sec = Number(totalSec);
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}м ${String(seconds).padStart(2, '0')}с`;
}

function getPostMatchStorageKey(matchId) {
  return `trust_post_match_seen_${matchId}`;
}
function markPostMatchSeen(matchId) {
  if (!matchId) return;
  try { localStorage.setItem(getPostMatchStorageKey(matchId), '1'); } catch (_) {}
}
function hasSeenPostMatch(matchId) {
  if (!matchId) return true;
  try { return localStorage.getItem(getPostMatchStorageKey(matchId)) === '1'; } catch (_) { return false; }
}
function formatStreakValue(value) {
  const n = Number(value) || 0;
  return `${n}W`;
}
function buildPostMatchSummary(item, profile) {
  if (!item || !item.publicMatchId || !item.result) return null;
  const result = item.result === 'win' ? 'win' : 'loss';
  const eloDelta = Number(item.eloDelta || 0);
  const eloAfter = Number(profile?.elo2v2 || 100);
  const eloBefore = eloAfter - eloDelta;
  const currentStreak = Number(profile?.currentWinStreak || 0);
  const streakAfter = result === 'win' ? currentStreak : 0;
  const streakBefore = result === 'win' ? Math.max(0, streakAfter - 1) : Math.max(0, currentStreak);
  const streakDeltaLabel = result === 'win' ? '+1 win streak' : 'Streak reset';
  return {
    publicMatchId: item.publicMatchId,
    result,
    mapName: item.mapName || '—',
    scoreLabel: `${item.teamAScore ?? 0} : ${item.teamBScore ?? 0}`,
    eloDelta,
    eloAfter,
    eloBefore,
    streakBefore,
    streakAfter,
    streakDeltaLabel,
    finishedAt: item.finishedAt || null
  };
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

function getRankByElo(rawElo) {
  const elo = Math.max(0, Number(rawElo) || 0);
  const ranks = RANK_TABLE;
  let currentIndex = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    if (elo >= ranks[i].minElo) currentIndex = i;
    else break;
  }
  const current = ranks[currentIndex];
  const next = ranks[currentIndex + 1] || null;
  const progressPercent = next
    ? Math.max(0, Math.min(100, Math.round(((elo - current.minElo) / Math.max(1, next.minElo - current.minElo)) * 100)))
    : 100;
  return {
    key: current.key,
    name: current.name,
    color: current.color,
    currentElo: elo,
    nextRankName: next?.name || null,
    nextRankElo: next?.minElo || null,
    pointsToNext: next ? Math.max(0, next.minElo - elo) : 0,
    progressPercent,
    isMaxRank: !next
  };
}
function normalizeRank(rank, elo) {
  return rank && rank.name ? rank : getRankByElo(elo);
}
function getRankPillMarkup(rank, elo) {
  const info = normalizeRank(rank, elo);
  return `<span class="rank-pill ${esc(info.color || 'iron')}">${esc(info.name)}</span>`;
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
  const rank = normalizeRank(profile.rank, profile.elo2v2 ?? 100);
  const rankPill = $('profileRankPill');
  if (rankPill) { rankPill.textContent = rank.name; rankPill.className = `rank-pill ${rank.color || 'iron'}`; }
  renderRankTooltip(rank.key);
  text('profileRankName', rank.name);
  text('profileRankProgressText', rank.isMaxRank ? 'Максимальное звание достигнуто' : `До следующего звания: ${rank.pointsToNext}`);
  text('profileRankNext', rank.isMaxRank ? 'MAX' : `${rank.nextRankName} • ${rank.nextRankElo}`);
  const rankFill = $('profileRankProgressFill');
  if (rankFill) rankFill.style.width = `${rank.progressPercent || 0}%`;
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
  return;
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
            <div class="muted rank-inline">${esc(m.role || 'member')} • ${getRankPillMarkup(m.rank, m.elo2v2 ?? 100)} <span class="muted">Elo ${esc(m.elo2v2 ?? 100)}</span></div>
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
    const createdAt = invite.createdAt ? new Date(invite.createdAt).getTime() : Date.now();
    const expiresAt = invite.expiresAt ? new Date(invite.expiresAt).getTime() : (createdAt + 10000);
    const totalMs = Math.max(1, expiresAt - createdAt);
    const remainingMs = Math.max(0, expiresAt - Date.now());
    const remainingPercent = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
    progress.style.transitionDuration = `${remainingMs}ms`;
    progress.style.width = `${remainingPercent}%`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.style.width = '0%';
      });
    });
  }

  const expiresAtMs = invite.expiresAt ? new Date(invite.expiresAt).getTime() : Date.now() + 10000;
  const timeoutMs = Math.max(0, expiresAtMs - Date.now());
  const timer = window.setTimeout(() => dismissInviteToast(inviteId), timeoutMs || 10);
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


function stopQueueTimer() {
  if (queueTimerInterval) {
    clearInterval(queueTimerInterval);
    queueTimerInterval = null;
  }
  hide('queueTimerRow', true);
  text('queueTimerValue', '00:00');
}

function startQueueTimer(startAt) {
  stopQueueTimer();
  if (!startAt) return;
  const startedMs = new Date(startAt).getTime();
  if (Number.isNaN(startedMs)) return;
  hide('queueTimerRow', false);
  const tick = () => {
    const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
    text('queueTimerValue', formatQueueElapsed(elapsedSeconds));
  };
  tick();
  queueTimerInterval = setInterval(tick, 1000);
}

function renderRestrictionCard() {
  const restrictions = state.restrictions || null;
  const block = restrictions?.restriction || null;
  const isQueuePresenceOnly = block?.reasonKey === 'already_in_queue';
  const visible = !!block?.isActive && !isQueuePresenceOnly;
  hide('restrictionCard', !visible);
  if (!visible) return;
  text('restrictionTitle', block.title || 'Поиск временно недоступен');
  text('restrictionMessage', block.message || 'У игрока есть активное ограничение.');
  text('restrictionReason', block.reasonKey || block.type || 'queue_lock');
  text('restrictionRemaining', block.remainingText || 'до разблокировки');
  text('restrictionBadge', block.category === 'queue_lock' ? 'Locked' : 'Cooldown');
  $('restrictionBadge').className = `pill ${block.category === 'queue_lock' ? 'warn' : 'live'}`;
}

function renderQueue() {
  const queue = state.queue;
  const inQueue = !!queue;
  const restrictions = state.restrictions || null;
  const canQueue = restrictions?.canQueue !== false;
  $('queueBadge').textContent = inQueue ? 'В очереди' : 'Не в очереди';
  $('queueBadge').className = `pill ${inQueue ? 'ok' : 'idle'}`;
  $('matchmakingState').textContent = inQueue ? 'Поиск...' : (canQueue ? 'Ожидание' : 'Blocked');
  $('matchmakingState').className = `pill ${inQueue ? 'live' : canQueue ? 'idle' : 'warn'}`;
  text('searchStateText', inQueue
    ? 'Матчмейкер подбирает 2x2 игру. Можно играть соло или вдвоём.'
    : canQueue
      ? 'Нажми «Найти матч». Если party нет, она создастся автоматически.'
      : (restrictions?.restriction?.message || 'Поиск временно недоступен.'));
  hide('joinQueueBtn', inQueue);
  hide('cancelQueueBtn', !inQueue);
  if ($('joinQueueBtn')) $('joinQueueBtn').disabled = !inQueue && !canQueue;

  const queueStartedAt = queue?.queuedAt || queue?.joinedAt || queue?.createdAt || queue?.startedAt || queue?.searchStartedAt || null;
  if (inQueue && queueStartedAt) {
    startQueueTimer(queueStartedAt);
  } else {
    stopQueueTimer();
  }
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
  hide('queueStageCard', hasMatch);
  hide('matchStageCard', !hasMatch);
  $('currentMatchBadge').textContent = hasMatch ? (match.status || 'Матч') : 'Нет матча';
  $('currentMatchBadge').className = `pill ${hasMatch ? 'live' : 'idle'}`;
  if (!hasMatch) return;

  text('currentMatchId', match.publicMatchId || match.matchId || '—');
  text('currentMatchMeta', `${match.mode || '2x2'} • карта: ${match.mapName || 'не выбрана'}`);
  text('currentMatchStatus', match.status || '—');
  $('currentMatchStatus').className = `pill ${match.status === 'live' ? 'live' : match.status === 'server_assigned' ? 'ok' : match.status === 'finished' ? 'ok' : 'warn'}`;
  text('serverConnectLine', connectString(match));

  const roomGrid = $('currentMatchRoomGrid');
  const timeline = $('currentMatchTimeline');
  const room = match.room || {};
  const deadlines = room.deadlines || {};
  roomGrid.innerHTML = `
    <div class="current-match-room-stat"><span>Phase</span><strong>${esc(room.phase || match.phase || 'waiting')}</strong></div>
    <div class="current-match-room-stat"><span>Accepted</span><strong>${esc(`${match.acceptedCount || 0}/${match.totalPlayers || 4}`)}</strong></div>
    <div class="current-match-room-stat"><span>Connected</span><strong>${esc(`${match.connectedCount || 0}/${match.totalPlayers || 4}`)}</strong></div>
    <div class="current-match-room-stat"><span>Deadline</span><strong>${esc(room.phase === 'accept' ? formatDuration(deadlines.acceptRemainingSec) : room.phase === 'connect' ? formatDuration(deadlines.connectRemainingSec) : '—')}</strong></div>
  `;
  timeline.innerHTML = (match.timeline || []).map((step) => `
    <div class="current-match-step ${esc(step.state || 'upcoming')}">
      <div class="current-match-step-title">${esc(step.title || step.key || 'Step')}</div>
      <div class="muted">${esc(step.description || '')}</div>
    </div>
  `).join('');

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
          <div class="muted rank-inline">${getRankPillMarkup(p.rank, p.elo || p.elo2v2 || 100)} <span class="muted">Elo ${esc(p.elo || p.elo2v2 || 100)}</span>${p.mapVote ? ` <span class="muted">• vote: ${esc(p.mapVote)}</span>` : ''}</div>
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
                <div class="muted rank-inline">${getRankPillMarkup(player.rank, player.elo2v2 ?? 100)} <span class="muted">Elo ${esc(player.elo2v2 ?? 100)}</span>${player.result ? ` <span class="muted">• ${esc(player.result)}</span>` : ''}</div>
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

function renderPostMatchModal() {
  const modal = $('postMatchModal');
  const summary = state.postMatchSummary;
  hide('postMatchModal', !summary);
  if (!summary) return;

  const isWin = summary.result === 'win';
  text('postMatchResultLabel', isWin ? 'WIN' : 'LOSS');
  text('postMatchSubtitle', isWin ? 'You won your latest 2x2 match.' : 'Your latest 2x2 match ended in a loss.');
  text('postMatchScore', summary.scoreLabel || '—');
  text('postMatchMap', summary.mapName || '—');
  text('postMatchEloDelta', `${summary.eloDelta > 0 ? '+' : ''}${summary.eloDelta}`);
  text('postMatchEloAfter', `Now ${summary.eloAfter}`);
  text('postMatchStreakDelta', summary.streakDeltaLabel || '—');
  text('postMatchStreakAfter', `Current ${formatStreakValue(summary.streakAfter)}`);
  text('postMatchMatchId', summary.publicMatchId || '—');
  text('postMatchFinishedAt', formatDate(summary.finishedAt));
  text('postMatchResultPill', isWin ? 'WIN' : 'LOSS');

  const pill = $('postMatchResultPill');
  const card = $('postMatchCard');
  pill.className = `post-match-result-pill ${isWin ? 'win' : 'loss'}`;
  if (card) card.className = `card post-match-card ${isWin ? 'win' : 'loss'}`;
}

function evaluatePostMatchSummary() {
  if (state.postMatchSummary) return;
  const latest = (state.profileHistory || [])[0] || null;
  const summary = buildPostMatchSummary(latest, state.profile);
  if (!summary || hasSeenPostMatch(summary.publicMatchId)) {
    state.postMatchSummary = null;
    return;
  }
  state.postMatchSummary = summary;
}

async function closePostMatchModal() {
  const matchId = state.postMatchSummary?.publicMatchId || null;
  if (matchId) {
    markPostMatchSeen(matchId);
    try {
      await api(`/api/matches/${encodeURIComponent(matchId)}/post-match/ack`, { method: 'POST' });
    } catch (_) {}
  }
  state.postMatchSummary = null;
  renderPostMatchModal();
}

async function openProfileFromPostMatch() {
  const profileSection = document.querySelector('.sidebar .card');
  if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  await closePostMatchModal();
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
  state.restrictions = data.restrictions || null;
  if (!state.queue) stopQueueTimer();
}
async function refreshMatch() {
  const data = await api('/api/matches/me/current');
  state.match = data.match || null;
  if (state.match) stopQueueTimer();
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
async function refreshPostMatchSummary() {
  const data = await api('/api/matches/me/post-match');
  const summary = data.summary || null;
  if (!summary) {
    state.postMatchSummary = null;
    return;
  }
  const profile = state.profile || null;
  state.postMatchSummary = {
    ...summary,
    scoreLabel: `${summary.teamAScore ?? 0} : ${summary.teamBScore ?? 0}`,
    eloAfter: summary.eloAfter ?? profile?.elo2v2 ?? 100,
    streakAfter: profile?.currentWinStreak ?? 0,
    streakDeltaLabel: summary.result === 'win' ? '+1 win streak' : 'Streak reset'
  };
}

async function refreshAll() {
  await Promise.allSettled([
    refreshAccount(),
    refreshParty(),
    refreshQueue(),
    refreshMatch(),
    refreshProfile(),
    refreshProfileHistory(),
    refreshPostMatchSummary()
  ]);
  renderAuth();
  renderProfileOverview();
  renderParty();
  renderRestrictionCard();
  renderQueue();
  renderCurrentMatch();
  renderHistory();
  evaluatePostMatchSummary();
  renderMatchDetailsModal();
  renderPostMatchModal();
}

function login() { rememberAuthReturn(); window.location.assign(getSteamAuthUrl()); }
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
    root.innerHTML = items.map((item) => {
      const canPullFromParty = item.partyStatus && item.partyStatus !== 'closed';
      const presenceLabel = item.presenceLabel || 'Онлайн';
      const inviteLabel = canPullFromParty ? 'Пригласить в party' : 'Пригласить';
      return `
      <div class="member-item">
        <div class="member-main">
          ${getAvatarMarkup(item.avatarUrl, item.nickname, 'avatar sm')}
          <div>
            <div>${esc(item.nickname || 'Unknown')}</div>
            <div class="muted rank-inline">${getRankPillMarkup(item.rank, item.elo2v2 ?? 100)} <span class="muted">Elo ${esc(item.elo2v2 ?? 100)}</span></div>
            <div class="muted search-user-meta">${esc(presenceLabel)}${canPullFromParty ? ' • его текущее lobby закроется после принятия' : ''}</div>
          </div>
        </div>
        <button class="btn secondary" data-invite-user="${esc(item.id)}">${inviteLabel}</button>
      </div>
    `;
    }).join('');
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
    if (!state.user) {
      showAlert('Сначала войди через Steam.', 'error');
      return;
    }
    if (!state.party?.id) {
      await api('/api/party/create', { method: 'POST' });
      await refreshParty();
      renderParty();
      renderRestrictionCard();
      renderQueue();
    }
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
  setupRankTooltipInteractions();
  $('appLangRu')?.addEventListener('click', () => {
    appLang = 'ru';
    localStorage.setItem(APP_LANG_KEY, appLang);
    applyAppLang();
    renderAuth();
    renderProfileOverview();
    renderParty();
    renderRestrictionCard();
    renderQueue();
    renderCurrentMatch();
    renderHistory();
    renderMatchDetailsModal();
    renderPostMatchModal();
  });
  $('appLangEn')?.addEventListener('click', () => {
    appLang = 'en';
    localStorage.setItem(APP_LANG_KEY, appLang);
    applyAppLang();
    renderAuth();
    renderProfileOverview();
    renderParty();
    renderRestrictionCard();
    renderQueue();
    renderCurrentMatch();
    renderHistory();
    renderMatchDetailsModal();
    renderPostMatchModal();
  });
  applyAppLang();
  $('appLoginBtn')?.addEventListener('click', login);
  $('appLogoutBtn')?.addEventListener('click', logout);
  $('createPartyBtn')?.addEventListener('click', (event) => { event.preventDefault(); void createParty(); });
  $('leavePartyBtn')?.addEventListener('click', (event) => { event.preventDefault(); void leaveParty(); });
  $('userSearchBtn')?.addEventListener('click', (event) => { event.preventDefault(); void searchUsers(); });
  $('joinQueueBtn')?.addEventListener('click', (event) => { event.preventDefault(); void joinQueue(); });
  $('cancelQueueBtn')?.addEventListener('click', (event) => { event.preventDefault(); void cancelQueue(); });
  $('copyConnectBtn')?.addEventListener('click', (event) => { event.preventDefault(); void copyConnect(); });
  $('postMatchContinueBtn')?.addEventListener('click', (event) => { event.preventDefault(); void closePostMatchModal(); });
  $('postMatchProfileBtn')?.addEventListener('click', (event) => { event.preventDefault(); void openProfileFromPostMatch(); });
  document.addEventListener('click', (event) => {
    const createBtn = event.target.closest('#createPartyBtn');
    if (createBtn) {
      event.preventDefault();
      void createParty();
      return;
    }
    const leaveBtn = event.target.closest('#leavePartyBtn');
    if (leaveBtn) {
      event.preventDefault();
      void leaveParty();
      return;
    }
    void handleDelegatedClick(event);
  });

  await refreshAll();
  setInterval(() => { void refreshAll(); }, 5000);
});
