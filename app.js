const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();



const APP_I18N = {
  en: {
    brand_sub: 'matchmaking app', nav_play: 'Play', nav_leaderboard: 'Leaderboard', nav_home: 'Home', login: 'Sign in with Steam', logout: 'Log out',
    profile_title: 'Profile', profile_guest: 'Sign in with Steam to unlock party, queue and matchmaking.', auth_guest: 'Guest', auth_connected: 'Steam connected',
    matches: 'Matches', rank_label: 'Rank', streak: 'Streak', best_streak: 'Best streak', best_map: 'Best map', recent_form: 'Recent form',
    queue_guard: 'Queue Guard', reason: 'Reason', remaining: 'Remaining', matchmaking_badge: '2x2 MATCHMAKING', find_match: 'Find match', join_queue: 'FIND MATCH', cancel: 'CANCEL',
    status: 'Status', in_queue_for: 'In queue:', mode: 'Mode', copy_connect: 'Copy connect', match_progress: 'Match progress', team_lineups: 'Team lineups',
    server: 'Server', actions: 'Actions', party_members: 'Party members', incoming_invites: 'Incoming invites', find_player: 'Find player', find: 'Find', player_example: 'For example: T1me1k',
    create_party: 'Create party', leave_party: 'Leave party', match_history: 'Match history', close: 'Close', match_issue: 'Match issue', match_issue_sub: 'Tech-report flow for Match Room', comment: 'Comment',
    issue_placeholder: 'Briefly describe the problem', submit_report: 'Send report', continue: 'Continue', open_profile: 'Open profile', rank_table_title: 'TRUST ranks', rank_table_sub: '2x2 rating',
    empty_form: 'No recent games yet', no_party: 'No party', not_in_queue: 'Not in queue', in_queue: 'In queue', waiting: 'Waiting', blocked: 'Blocked',
    sign_in_first: 'Sign in with Steam first. Then you can queue 2x2 solo or as a duo.', profile_cta_authed: '2x2 only: queue solo or as a duo. A ready duo stays together, and a solo player gets a teammate.',
    rank_max: 'Max rank reached', rank_to_next: 'To next rank: {value}', no_party_hint: 'There is no party yet. It will be created automatically when queue starts or by button.',
    role_leader: 'Leader', role_member: 'Member', invited_to_party: 'Invites you to party', accept: 'Accept', decline: 'Decline', no_invites: 'No incoming invites.',
    invite_title: 'Party invite', invite_to_duo: 'invites you to a duo party', hide: 'Hide', queue_unavailable: 'Queue is temporarily unavailable', active_restriction: 'The player has an active restriction.',
    locked: 'Locked', cooldown: 'Cooldown', queue_start_hint: 'Press “Find match”. If there is no party, it will be created automatically.',
    empty_history: 'Match history is empty for now.', duration: 'Duration', against: 'Against', details: 'Details', server_assigning: 'Server is being assigned',
    no_match: 'No match', map_not_selected: 'map not selected', accepted: 'Accepted', connected: 'Connected', deadline: 'Deadline',
    team_a: 'Team A', team_b: 'Team B', timeline_sub: 'Live room events', no_players: 'No players', room_synced: 'All players are synchronized.', room_no_events: 'No match room events yet.',
    sending: 'SENDING...', report_sent: 'Match issue has been sent to backend.', connect_copied: 'Connect command copied.', ip_copied: 'Server IP copied.',
    party_created: 'Party created.', party_left: 'You left the party.', enter_nickname: 'Enter player nickname.', players_not_found: 'No players found.', search_error: 'Search error: {value}',
    invite_sent: 'Invite sent.', invite_accepted: 'Invite accepted.', invite_declined: 'Invite declined.', sign_in_error: 'Sign in with Steam first.', queue_started: 'Match search started.', queue_cancelled: 'Match search cancelled.',
    player_waiting: '{name} has not connected yet', player_reconnect: '{name} disconnected and is waiting for reconnect', player_abandon: '{name} received abandon',
    reconnect: 'reconnect {value}', abandon: 'abandon', accept_match: 'ACCEPT MATCH', connect: 'Connect', copy_ip: 'Copy IP', copy_connect_cmd: 'Copy connect command', issue_btn: 'Match issue', room_wait: 'Waiting for the next match step.',
    no_search_data: 'When the party is ready, the leader can start queue.', pull_party: 'Invite to party', invite: 'Invite',
    party_invite_from_list: 'Invite to party',
  },
  ru: {
    brand_sub: 'приложение матчмейкинга', nav_play: 'Играть', nav_leaderboard: 'Лидерборд', nav_home: 'Главная', login: 'Войти через Steam', logout: 'Выйти',
    profile_title: 'Профиль', profile_guest: 'Войди через Steam, чтобы открыть party, очередь и матчмейкинг.', auth_guest: 'Гость', auth_connected: 'Steam connected',
    matches: 'Матчи', rank_label: 'Звание', streak: 'Серия', best_streak: 'Лучшая серия', best_map: 'Лучшая карта', recent_form: 'Последняя форма',
    queue_guard: 'Queue Guard', reason: 'Причина', remaining: 'Осталось', matchmaking_badge: '2x2 MATCHMAKING', find_match: 'Найти матч', join_queue: 'НАЙТИ МАТЧ', cancel: 'ОТМЕНИТЬ',
    status: 'Статус', in_queue_for: 'В поиске:', mode: 'Режим', copy_connect: 'Скопировать connect', match_progress: 'Прогресс матча', team_lineups: 'Составы команд',
    server: 'Сервер', actions: 'Действия', party_members: 'Состав party', incoming_invites: 'Входящие инвайты', find_player: 'Найти игрока', find: 'Найти', player_example: 'Например: T1me1k',
    create_party: 'Создать party', leave_party: 'Покинуть party', match_history: 'История матчей', close: 'Закрыть', match_issue: 'Проблема с матчем', match_issue_sub: 'Tech-report flow для Match Room', comment: 'Комментарий',
    issue_placeholder: 'Коротко опиши проблему', submit_report: 'Отправить репорт', continue: 'Продолжить', open_profile: 'Открыть профиль', rank_table_title: 'Звания TRUST', rank_table_sub: 'Рейтинг 2x2',
    empty_form: 'Пока пусто', no_party: 'Нет party', not_in_queue: 'Не в очереди', in_queue: 'В очереди', waiting: 'Ожидание', blocked: 'Blocked',
    sign_in_first: 'Сначала войди через Steam. Потом можно искать матч в 2x2 соло или вдвоём.', profile_cta_authed: 'Режим только 2x2: можно искать матч соло или вдвоём. Готовая пати из двух не разделяется, соло-игроку подбирается тиммейт.',
    rank_max: 'Максимальное звание достигнуто', rank_to_next: 'До следующего звания: {value}', no_party_hint: 'Party пока нет. Она создастся автоматически при поиске или по кнопке.',
    role_leader: 'Leader', role_member: 'Member', invited_to_party: 'Приглашает в party', accept: 'Принять', decline: 'Отклонить', no_invites: 'Входящих инвайтов нет.',
    invite_title: 'Приглашение в party', invite_to_duo: 'приглашает тебя в duo party', hide: 'Скрыть', queue_unavailable: 'Поиск временно недоступен', active_restriction: 'У игрока есть активное ограничение.',
    locked: 'Locked', cooldown: 'Cooldown', queue_start_hint: 'Нажми «Найти матч». Если party нет, она создастся автоматически.',
    empty_history: 'История матчей пока пуста.', duration: 'Длительность', against: 'Против', details: 'Подробнее', server_assigning: 'Сервер ещё назначается',
    no_match: 'Нет матча', map_not_selected: 'карта не выбрана', accepted: 'Accepted', connected: 'Connected', deadline: 'Deadline',
    team_a: 'Team A', team_b: 'Team B', timeline_sub: 'Live room events', no_players: 'Нет игроков', room_synced: 'Все игроки синхронизированы.', room_no_events: 'Пока нет событий комнаты матча.',
    sending: 'ОТПРАВКА...', report_sent: 'Проблема по матчу отправлена в backend.', connect_copied: 'Команда connect скопирована.', ip_copied: 'IP сервера скопирован.',
    party_created: 'Party создана.', party_left: 'Ты покинул party.', enter_nickname: 'Введи ник игрока.', players_not_found: 'Игроки не найдены.', search_error: 'Ошибка поиска: {value}',
    invite_sent: 'Инвайт отправлен.', invite_accepted: 'Инвайт принят.', invite_declined: 'Инвайт отклонён.', sign_in_error: 'Сначала войди через Steam.', queue_started: 'Поиск матча запущен.', queue_cancelled: 'Поиск матча отменён.',
    player_waiting: '{name} ещё не подключился', player_reconnect: '{name} вылетел и ждёт reconnect', player_abandon: '{name} получил abandon',
    reconnect: 'reconnect {value}', abandon: 'abandon', accept_match: 'ПРИНЯТЬ МАТЧ', connect: 'Подключиться', copy_ip: 'Скопировать IP', copy_connect_cmd: 'Скопировать connect-команду', issue_btn: 'Проблема с матчем', room_wait: 'Ожидание следующего шага матча.',
    no_search_data: 'Когда party готова, лидер может запустить поиск.', pull_party: 'Пригласить в party', invite: 'Пригласить',
    party_invite_from_list: 'Пригласить в party',
  }
};

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
  lang: localStorage.getItem('trust_app_lang') || 'en',
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
function t(key, params = {}) {
  const dict = APP_I18N[state.lang] || APP_I18N.en;
  const template = dict[key] ?? APP_I18N.en[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? '—'));
}
function applyTranslations() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { const key = el.dataset.i18n; if (key) el.textContent = t(key); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { const key = el.dataset.i18nPlaceholder; if (key) el.setAttribute('placeholder', t(key)); });
  document.querySelectorAll('.lang-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === state.lang));
  const trigger = $('profileRankTrigger'); if (trigger) trigger.setAttribute('aria-label', state.lang === 'ru' ? 'Показать таблицу званий' : 'Show rank table');
}
function setLanguage(lang) {
  state.lang = lang === 'ru' ? 'ru' : 'en';
  try { localStorage.setItem('trust_app_lang', state.lang); } catch (_) {}
  applyTranslations();
  renderAuth();
  renderParty();
  renderQueue();
  renderHistory();
  renderCurrentMatch();
}
function formatDate(value) {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
    root.innerHTML = `<div class="empty-chip">${t('empty_form')}</div>`;
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
  $('authBadge').textContent = authed ? t('auth_connected') : t('auth_guest');
  $('authBadge').className = `pill ${authed ? 'ok' : 'idle'}`;

  if (!authed) {
    text('playCtaText', t('sign_in_first'));
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
  text('profileRankProgressText', rank.isMaxRank ? t('rank_max') : t('rank_to_next', { value: rank.pointsToNext }));
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
  text('playCtaText', t('profile_cta_authed'));
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

  $('partyBadge').textContent = hasParty ? `${count}/2` : t('no_party');
  $('partyBadge').className = `pill ${hasParty ? 'ok' : 'idle'}`;
  text('queuePartyStat', hasParty ? `${count}/2` : '1/2');
  hide('createPartyBtn', hasParty);
  hide('leavePartyBtn', !hasParty);

  if (!hasParty) {
    membersEl.innerHTML = `<div class="empty">${t('no_party_hint')}</div>`;
  } else {
    membersEl.innerHTML = (party.members || []).map((m) => `
      <div class="member-item">
        <div class="member-main">
          ${getAvatarMarkup(m.avatarUrl, m.nickname, 'avatar sm')}
          <div>
            <div>${esc(m.nickname || 'Unknown')}</div>
            <div class="muted rank-inline">${esc(m.role === 'leader' ? t('role_leader') : t('role_member'))} • ${getRankPillMarkup(m.rank, m.elo2v2 ?? 100)} <span class="muted">Elo ${esc(m.elo2v2 ?? 100)}</span></div>
          </div>
        </div>
        <span class="pill ${m.role === 'leader' ? 'live' : 'idle'}">${m.role === 'leader' ? t('role_leader') : t('role_member')}</span>
      </div>
    `).join('');
  }

  invitesEl.innerHTML = invites.length
    ? invites.map((inv) => `
      <div class="invite-item invite-inline-card" data-invite-card="${esc(inv.id)}">
        <div>
          <div style="font-weight:700">${esc(inv.fromNickname || 'Игрок')}</div>
          <div class="muted">${t('invited_to_party')}</div>
        </div>
        <div class="invite-actions invite-actions-inline">
          <button class="btn secondary" data-accept-invite="${esc(inv.id)}">${t('accept')}</button>
          <button class="btn ghost" data-decline-invite="${esc(inv.id)}">${t('decline')}</button>
        </div>
      </div>
    `).join('')
    : `<div class="empty">${t('no_invites')}</div>`;

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
    <button class="invite-toast-close" type="button" aria-label="${esc(t('hide'))}" data-dismiss-invite-toast="${esc(inviteId)}">×</button>
    <div class="invite-toast-head">
      <div class="invite-toast-title">${t('invite_title')}</div>
    </div>
    <div class="invite-toast-body">
      ${avatarMarkup}
      <div>
        <div class="invite-toast-name">${esc(invite.fromNickname || 'Игрок')}</div>
        <div class="invite-toast-sub">${t('invite_to_duo')}</div>
      </div>
    </div>
    <div class="invite-toast-actions">
      <button class="btn secondary" data-accept-invite="${esc(inviteId)}">${t('accept')}</button>
      <button class="btn ghost" data-decline-invite="${esc(inviteId)}">${t('decline')}</button>
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
  text('restrictionTitle', block.title || t('queue_unavailable'));
  text('restrictionMessage', block.message || t('active_restriction'));
  text('restrictionReason', block.reasonKey || block.type || 'queue_lock');
  text('restrictionRemaining', block.remainingText || 'до разблокировки');
  text('restrictionBadge', block.category === 'queue_lock' ? t('locked') : t('cooldown'));
  $('restrictionBadge').className = `pill ${block.category === 'queue_lock' ? 'warn' : 'live'}`;
}

function renderQueue() {
  const queue = state.queue;
  const inQueue = !!queue;
  const restrictions = state.restrictions || null;
  const canQueue = restrictions?.canQueue !== false;
  $('queueBadge').textContent = inQueue ? t('in_queue') : t('not_in_queue');
  $('queueBadge').className = `pill ${inQueue ? 'ok' : 'idle'}`;
  $('matchmakingState').textContent = inQueue ? '...' : (canQueue ? t('waiting') : t('blocked'));
  $('matchmakingState').className = `pill ${inQueue ? 'live' : canQueue ? 'idle' : 'warn'}`;
  text('searchStateText', inQueue
    ? 'Матчмейкер подбирает 2x2 игру. Можно играть соло или вдвоём.'
    : canQueue
      ? t('queue_start_hint')
      : (restrictions?.restriction?.message || t('queue_unavailable')));
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
    root.innerHTML = `<div class="empty">${t('empty_history')}</div>`;
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
          <div class="history-card-stat"><span>${t('duration')}</span><strong>${esc(formatDuration(item.durationSec))}</strong></div>
          <div class="history-card-stat"><span>Тиммейт</span><strong>${teammate}</strong></div>
        </div>
        <div class="history-card-foot muted">${t('against')}: ${opponents}</div>
        <div class="history-card-actions">
          <button class="btn secondary" data-open-match-details="${esc(item.publicMatchId)}">${t('details')}</button>
        </div>
      </article>
    `;
  }).join('');
}

function connectString(match) {
  if (!match?.serverIp || !match?.serverPort) return t('server_assigning');
  return `connect ${match.serverIp}:${match.serverPort}; password ${match.serverPassword || ''}`.trim();
}

function renderCurrentMatch() {
  const match = state.match;
  const hasMatch = !!match;
  hide('queueStageCard', hasMatch);
  hide('matchStageCard', !hasMatch);
  $('currentMatchBadge').textContent = hasMatch ? (match.status || 'Match') : t('no_match');
  $('currentMatchBadge').className = `pill ${hasMatch ? 'live' : 'idle'}`;
  if (!hasMatch) return;

  text('currentMatchId', match.publicMatchId || match.matchId || '—');
  text('currentMatchMeta', `${match.mode || '2x2'} • ${state.lang === 'ru' ? 'карта' : 'map'}: ${match.mapName || t('map_not_selected')}`);
  text('currentMatchStatus', match.status || '—');
  $('currentMatchStatus').className = `pill ${match.status === 'live' ? 'live' : match.status === 'server_assigned' ? 'ok' : match.status === 'finished' ? 'ok' : 'warn'}`;
  text('serverConnectLine', connectString(match));

  const roomGrid = $('currentMatchRoomGrid');
  const timeline = $('currentMatchTimeline');
  const room = match.room || {};
  const deadlines = room.deadlines || {};
  roomGrid.innerHTML = `
    <div class="current-match-room-stat"><span>Phase</span><strong>${esc(room.phase || match.phase || 'waiting')}</strong></div>
    <div class="current-match-room-stat"><span>${t('accepted')}</span><strong>${esc(`${match.acceptedCount || 0}/${match.totalPlayers || 4}`)}</strong></div>
    <div class="current-match-room-stat"><span>${t('connected')}</span><strong>${esc(`${match.connectedCount || 0}/${match.totalPlayers || 4}`)}</strong></div>
    <div class="current-match-room-stat"><span>${t('deadline')}</span><strong>${esc(room.phase === 'accept' ? formatDuration(deadlines.acceptRemainingSec) : room.phase === 'connect' ? formatDuration(deadlines.connectRemainingSec) : '—')}</strong></div>
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

function login() { window.location.href = `${BACKEND_BASE_URL}/auth/steam`; }
async function logout() { try { await api('/auth/logout', { method: 'POST' }); } catch (_) {} window.location.reload(); }

async function createParty() {
  try {
    await api('/api/party/create', { method: 'POST' });
    await refreshAll();
    showAlert(t('party_created'));
  } catch (err) {
    showAlert(`Не удалось создать party: ${err.message}`, 'error');
  }
}

async function leaveParty() {
  try {
    await api('/api/party/leave', { method: 'POST' });
    await refreshAll();
    showAlert(t('party_left'));
  } catch (err) {
    showAlert(`Не удалось выйти из party: ${err.message}`, 'error');
  }
}

async function searchUsers() {
  const q = $('userSearchInput')?.value?.trim();
  const root = $('userSearchResults');
  if (!q) {
    root.innerHTML = `<div class="empty">${t('enter_nickname')}</div>`;
    return;
  }
  try {
    const data = await api(`/api/account/users/search?q=${encodeURIComponent(q)}`);
    const items = data.items || [];
    if (!items.length) {
      root.innerHTML = `<div class="empty">${t('players_not_found')}</div>`;
      return;
    }
    root.innerHTML = items.map((item) => {
      const canPullFromParty = item.partyStatus && item.partyStatus !== 'closed';
      const presenceLabel = item.presenceLabel || 'Онлайн';
      const inviteLabel = canPullFromParty ? t('pull_party') : t('invite');
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
    root.innerHTML = `<div class="empty">${t('search_error', { value: esc(err.message) })}</div>`;
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
    showAlert(t('invite_sent'));
  } catch (err) {
    showAlert(`Не удалось отправить инвайт: ${err.message}`, 'error');
  }
}

async function acceptInvite(id) {
  try {
    await api(`/api/party/invite/${encodeURIComponent(id)}/accept`, { method: 'POST' });
    removeInviteToast(id);
    await refreshAll();
    showAlert(t('invite_accepted'));
  } catch (err) {
    showAlert(`Не удалось принять инвайт: ${err.message}`, 'error');
  }
}

async function declineInvite(id) {
  try {
    await api(`/api/party/invite/${encodeURIComponent(id)}/decline`, { method: 'POST' });
    dismissInviteToast(id);
    await refreshAll();
    showAlert(t('invite_declined'));
  } catch (err) {
    showAlert(`Не удалось отклонить инвайт: ${err.message}`, 'error');
  }
}

async function joinQueue() {
  try {
    if (!state.user) {
      showAlert(t('sign_in_error'), 'error');
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
    showAlert(t('queue_started'));
  } catch (err) {
    showAlert(`Не удалось запустить поиск: ${err.message}`, 'error');
  }
}

async function cancelQueue() {
  try {
    await api('/api/queue/cancel', { method: 'POST' });
    await refreshAll();
    showAlert(t('queue_cancelled'));
  } catch (err) {
    showAlert(`Не удалось отменить поиск: ${err.message}`, 'error');
  }
}

async function copyConnect() {
  if (!state.match) return;
  await navigator.clipboard.writeText(connectString(state.match));
  showAlert(t('connect_copied'));
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



function matchPhaseBadgeClass(phase) {
  if (phase === 'live' || phase === 'finished') return 'ok';
  if (phase === 'cancelled') return 'warn';
  return 'live';
}

function getPlayerDelayReason(player) {
  if (!player) return '';
  if (!player.accepted) return `${player.nickname || 'Игрок'} ещё не принял матч`;
  if (player.connectionState === 'waiting_connect') return t('player_waiting', { name: player.nickname || (state.lang === 'ru' ? 'Игрок' : 'Player') });
  if (player.connectionState === 'disconnected') return t('player_reconnect', { name: player.nickname || (state.lang === 'ru' ? 'Игрок' : 'Player') });
  if (player.connectionState === 'abandoned') return t('player_abandon', { name: player.nickname || (state.lang === 'ru' ? 'Игрок' : 'Player') });
  return '';
}

function renderMatchPlayerCard(p) {
  const tags = [];
  if (p.partyMarker) tags.push(`<span class="tag duo">${esc(p.partyMarker)}</span>`);
  tags.push(`<span class="tag ${esc(p.statusTone || 'idle')}">${esc(p.statusLabel || 'Pending')}</span>`);
  if (p.mapVote) tags.push(`<span class="tag">vote: ${esc(p.mapVote)}</span>`);
  if (p.isReconnecting) tags.push(`<span class="tag warn">${esc(t('reconnect', { value: formatDuration(p.reconnectRemainingSec) }))}</span>`);
  if (p.isAbandoned) tags.push(`<span class="tag danger">${t('abandon')}</span>`);
  return `
    <div class="match-player-card">
      <div class="match-player-main">
        ${getAvatarMarkup(p.avatarUrl, p.nickname, 'avatar sm')}
        <div>
          <div>${esc(p.nickname || 'Unknown')}</div>
          <div class="muted rank-inline">${getRankPillMarkup(p.rank, p.elo || p.elo2v2 || 100)} <span class="muted">Elo ${esc(p.elo || p.elo2v2 || 100)}</span></div>
          <div class="match-player-meta">${tags.join('')}</div>
        </div>
      </div>
    </div>`;
}

function renderMatchRoomActions(match) {
  const room = match?.room || {};
  const actions = [];
  if (room.actions?.canAccept) actions.push(`<button class="btn primary" data-room-action="accept">${t('accept_match')}</button>`);
  if (room.actions?.canVoteMap) {
    actions.push(state.mapPool.map((map) => `<button class="btn secondary" data-room-action="vote" data-map-name="${esc(map)}">Карта: ${esc(map)}</button>`).join(''));
  }
  if (room.phase === 'connect' || room.phase === 'live') {
    if (room.actions?.canConnect) actions.push(`<button class="btn primary" data-room-action="connect">${t('connect')}</button>`);
    if (room.actions?.canCopyIp) actions.push(`<button class="btn secondary" data-room-action="copy-ip">${t('copy_ip')}</button>`);
    if (room.actions?.canCopyCommand) actions.push(`<button class="btn secondary" data-room-action="copy-command">${t('copy_connect_cmd')}</button>`);
  }
  if (room.phase === 'live') {
    actions.push('<button class="btn secondary" data-room-action="room">Комната матча</button>');
    actions.push(`<button class="btn ghost" data-room-action="issue">${t('issue_btn')}</button>`);
  }
  if (room.phase === 'finished' || room.phase === 'cancelled') {
    actions.push('<button class="btn secondary" data-room-action="result">Открыть результат</button>');
    actions.push('<button class="btn ghost" data-room-action="profile">Открыть профиль</button>');
    actions.push('<button class="btn primary" data-room-action="play-again">Играть ещё</button>');
  }
  $('matchRoomActions').innerHTML = actions.join('') || `<div class="empty">${t('room_wait')}</div>`;
}

function renderCurrentMatch() {
  const match = state.match;
  const hasMatch = !!match;
  hide('queueStageCard', hasMatch);
  hide('matchStageCard', !hasMatch);
  $('currentMatchBadge').textContent = hasMatch ? ((match.room?.phaseLabel) || match.status || 'Match') : t('no_match');
  $('currentMatchBadge').className = `pill ${hasMatch ? matchPhaseBadgeClass(match.room?.phase) : 'idle'}`;
  if (!hasMatch) return;

  const room = match.room || {};
  text('currentMatchId', room.publicMatchId || match.publicMatchId || '—');
  text('currentMatchMeta', `${match.mode || '2x2'} • ${state.lang === 'ru' ? 'карта' : 'map'}: ${room.mapName || t('map_not_selected')} • ${state.lang === 'ru' ? 'сервер' : 'server'}: ${room.server?.name || 'EU-1'}`);
  text('currentMatchStatus', room.statusText || match.status || '—');
  $('currentMatchStatus').className = `pill ${matchPhaseBadgeClass(room.phase)}`;
  text('serverConnectLine', room.server?.connectCommand || connectString(match));

  $('currentMatchSummaryGrid').innerHTML = `
    <div class="match-room-summary-card"><span>Фаза</span><strong>${esc(room.phaseLabel || room.phase || '—')}</strong></div>
    <div class="match-room-summary-card"><span>Match ID</span><strong>${esc(room.publicMatchId || '—')}</strong></div>
    <div class="match-room-summary-card"><span>Карта</span><strong>${esc(room.mapName || 'pending')}</strong></div>
    <div class="match-room-summary-card"><span>Сервер</span><strong>${esc(room.server?.name || 'EU-1')}</strong></div>
    <div class="match-room-summary-card"><span>Таймер фазы</span><strong>${esc(formatDuration(room.currentDeadlineSec))}</strong></div>
    <div class="match-room-summary-card"><span>Финиш</span><strong>${esc(room.finishReasonLabel || '—')}</strong></div>`;

  $('currentMatchStageTimeline').innerHTML = (room.progressTimeline || []).map((step) => `
    <div class="match-room-stage-step ${esc(step.state || 'upcoming')}">
      <div class="current-match-step-title">${esc(step.title || step.key)}</div>
      <div class="muted">${esc(step.description || '')}</div>
    </div>`).join('');

  $('teamAPlayers').innerHTML = ((room.teams?.teamA) || []).map(renderMatchPlayerCard).join('') || `<div class="empty">${t('no_players')}</div>`;
  $('teamBPlayers').innerHTML = ((room.teams?.teamB) || []).map(renderMatchPlayerCard).join('') || `<div class="empty">${t('no_players')}</div>`;

  const blocker = (match.players || []).map(getPlayerDelayReason).find(Boolean);
  text('matchRoomWhyBlocked', blocker || (room.finalMessage || t('room_synced')));

  $('matchRoomEvents').innerHTML = (room.eventTimeline || []).length
    ? room.eventTimeline.map((event) => `
      <div class="match-event-item">
        <div class="match-event-time">${esc(formatDate(event.createdAt))}</div>
        <div>
          <div class="match-event-title">${esc(event.title || event.type || 'Event')}</div>
          <div class="muted">${esc(event.description || '')}</div>
        </div>
      </div>`).join('')
    : `<div class="empty">${t('room_no_events')}</div>`;

  renderMatchRoomActions(match);
}

async function submitMatchIssue() {
  const match = state.match;
  if (!match?.publicMatchId) return;
  try {
    setBusy('submitMatchIssueBtn', true, t('sending'));
    await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        phase: match.room?.phase || match.phase || 'live',
        reason: $('matchIssueReason')?.value || 'other',
        comment: $('matchIssueComment')?.value || ''
      })
    });
    $('matchIssueComment').value = '';
    hide('matchIssueModal', true);
    showAlert(t('report_sent'));
    await refreshMatch();
    renderCurrentMatch();
  } catch (err) {
    showAlert(`${state.lang === 'ru' ? 'Не удалось отправить репорт' : 'Failed to send report'}: ${err.message}`, 'error');
  } finally {
    setBusy('submitMatchIssueBtn', false);
  }
}

function openMatchIssueModal() { hide('matchIssueModal', false); }
function closeMatchIssueModal() { hide('matchIssueModal', true); }

async function refreshMatch() {
  const data = await api('/api/matches/me/current');
  state.match = data.match || null;
  state.issueReasons = data.issueReasons || [];
  if (state.match) stopQueueTimer();
  if (Array.isArray(data.mapPool)) state.mapPool = data.mapPool;
}

async function executeRoomAction(action, mapName) {
  const match = state.match;
  if (!match?.publicMatchId) return;
  if (action === 'accept') {
    await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/accept`, { method: 'POST' });
    await refreshAll();
    return;
  }
  if (action === 'vote') {
    await api(`/api/matches/${encodeURIComponent(match.publicMatchId)}/map-vote`, { method: 'POST', body: JSON.stringify({ mapName }) });
    await refreshAll();
    return;
  }
  if (action === 'connect') {
    window.open(`steam://connect/${match.serverIp}:${match.serverPort}`, '_self');
    return;
  }
  if (action === 'copy-ip') {
    await navigator.clipboard.writeText(`${match.serverIp}:${match.serverPort}`);
    showAlert(t('ip_copied'));
    return;
  }
  if (action === 'copy-command') {
    await copyConnect();
    return;
  }
  if (action === 'issue') { openMatchIssueModal(); return; }
  if (action === 'result') { await openMatchDetails(match.publicMatchId); return; }
  if (action === 'profile') { document.querySelector('.sidebar .card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  if (action === 'play-again') { if (state.queue) await cancelQueue(); await joinQueue(); return; }
  if (action === 'room') { showAlert(state.lang === 'ru' ? 'Ты уже в комнате матча.' : 'You are already in the match room.'); }
}

document.addEventListener('click', (event) => {
  const actionBtn = event.target.closest('[data-room-action]');
  if (actionBtn) {
    event.preventDefault();
    void executeRoomAction(actionBtn.dataset.roomAction, actionBtn.dataset.mapName || null);
    return;
  }
  const issueClose = event.target.closest('[data-close-modal="match-issue"]');
  if (issueClose) {
    event.preventDefault();
    closeMatchIssueModal();
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach((btn) => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
  setupRankTooltipInteractions();
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
  $('submitMatchIssueBtn')?.addEventListener('click', (event) => { event.preventDefault(); void submitMatchIssue(); });
  document.addEventListener('click', (event) => {
    void handleDelegatedClick(event);
  });

  await refreshAll();
  setInterval(() => { void refreshAll(); }, 5000);
});
