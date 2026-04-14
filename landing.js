const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();

const LANDING_I18N = {
  en: {
    brand_sub: 'Competitive 2v2 platform',
    nav_platform: 'Platform',
    nav_status: 'Status',
    nav_leaderboard: 'Leaderboard',
    cabinet: 'Cabinet',
    login: 'Sign in with Steam',
    logout: 'Log out',
    release_badge: 'TRUST RELEASE',
    hero_title: 'Competitive 2v2<br>matchmaking with<br>less noise.',
    hero_text: 'Queue solo or as a duo, keep one shared rating, accept the match, vote the map and move straight into a clean server-driven flow.',
    hero_cta_login: 'Sign in with Steam',
    hero_cta_open: 'Open app',
    hero_cta_leaderboard: 'Leaderboard',
    metric_format: 'Format',
    metric_platforms: 'Platforms',
    metric_platforms_value: 'Web + Launcher',
    account_title: 'Account',
    account_guest: 'Sign in with Steam to unlock party, queue and profile.',
    account_matches: 'Matches',
    account_wins: 'Wins',
    account_mode: 'Mode',
    account_open: 'Open player cabinet',
    feature_ready_title: 'Built around the real match flow',
    feature_ready_text: 'Party, ready-check, map choice, connect, live state and result all live in one backend-driven flow instead of separate scripts.',
    feature_server_title: 'Server-authoritative logic',
    feature_server_text: 'The match server controls connection state, reconnect windows and whitelist access so the platform stays consistent during real games.',
    feature_simple_title: 'Minimal surface, serious core',
    feature_simple_text: 'No overloaded hubs. Just profile, party, queue, current match, history and a clean route back into the next game.',
    backend_title: 'Backend',
    backend_text_loading: 'Checking TRUST backend availability.',
    config_title: 'Config',
    config_text_loading: 'Loading matchmaking config.',
    principle_title: 'Principle',
    principle_text: 'Nick and account come from Steam, the mode is only 2v2, and once all players accept the match the platform moves into map selection and server connect.',
    how_title: 'How it works',
    how_step_1: 'Sign in with Steam and open your profile.',
    how_step_2: 'Queue solo or invite one teammate into a duo.',
    how_step_3: 'Accept the match, vote the map and join the server.',
    cta_badge: 'TRUST 2v2',
    cta_title: 'Ready to play the final version of the platform, not a test page.',
    cta_text: 'The landing is now focused on status, identity and direct access into the real app flow.',
    auth_guest: 'Guest',
    auth_connected: 'Steam connected',
    backend_online: 'ONLINE',
    backend_offline: 'OFFLINE',
    backend_online_text: 'Backend is reachable and responding.',
    backend_offline_text: 'Backend did not respond. Check Railway deploy, URL and CORS.',
    config_waiting: 'Waiting',
    config_on: 'MATCHMAKING ON',
    config_off: 'OFF',
    config_error: 'Error',
    config_error_text: 'Failed to load config.',
    config_format: '{app} • latest {version} • mode {mode}'
  },
  ru: {
    brand_sub: 'Соревновательная 2x2 платформа',
    nav_platform: 'Платформа',
    nav_status: 'Статус',
    nav_leaderboard: 'Лидерборд',
    cabinet: 'Кабинет',
    login: 'Войти через Steam',
    logout: 'Выйти',
    release_badge: 'TRUST RELEASE',
    hero_title: 'Соревновательный 2x2<br>матчмейкинг без<br>лишнего шума.',
    hero_text: 'Ищи матч соло или вдвоём, играй с единым рейтингом, принимай ready-check, выбирай карту и переходи в чистый серверный flow.',
    hero_cta_login: 'Войти через Steam',
    hero_cta_open: 'Открыть app',
    hero_cta_leaderboard: 'Лидерборд',
    metric_format: 'Формат',
    metric_platforms: 'Платформы',
    metric_platforms_value: 'Web + Launcher',
    account_title: 'Аккаунт',
    account_guest: 'Войди через Steam, чтобы открыть party, очередь и профиль.',
    account_matches: 'Матчи',
    account_wins: 'Победы',
    account_mode: 'Режим',
    account_open: 'Открыть кабинет игрока',
    feature_ready_title: 'Построено вокруг реального матча',
    feature_ready_text: 'Party, ready-check, выбор карты, connect, live-state и результат живут в одном backend-driven flow, а не в разрозненных скриптах.',
    feature_server_title: 'Сервер — источник истины',
    feature_server_text: 'Матч-сервер контролирует состояние подключений, окна переподключения и whitelist, чтобы платформа оставалась консистентной в живых играх.',
    feature_simple_title: 'Минимальная оболочка, серьёзное ядро',
    feature_simple_text: 'Без перегруженных хабов. Только профиль, party, очередь, текущий матч, история и быстрый возврат в следующую игру.',
    backend_title: 'Backend',
    backend_text_loading: 'Проверяем доступность TRUST backend.',
    config_title: 'Конфиг',
    config_text_loading: 'Загружаем конфиг матчмейкинга.',
    principle_title: 'Принцип',
    principle_text: 'Ник и аккаунт берутся из Steam, режим только 2x2, а после принятия матча всеми игроками платформа переходит к выбору карты и подключению к серверу.',
    how_title: 'Как это работает',
    how_step_1: 'Войди через Steam и открой свой профиль.',
    how_step_2: 'Ищи матч соло или пригласи одного тиммейта в duo.',
    how_step_3: 'Прими матч, выбери карту и подключись к серверу.',
    cta_badge: 'TRUST 2x2',
    cta_title: 'Пора играть уже в финальную версию платформы, а не в тестовую страницу.',
    cta_text: 'Теперь landing сфокусирован на статусе, айдентике и прямом входе в реальный app flow.',
    auth_guest: 'Гость',
    auth_connected: 'Steam connected',
    backend_online: 'ONLINE',
    backend_offline: 'OFFLINE',
    backend_online_text: 'Backend доступен и отвечает.',
    backend_offline_text: 'Backend не ответил. Проверь Railway deploy, URL и CORS.',
    config_waiting: 'Ожидание',
    config_on: 'MATCHMAKING ON',
    config_off: 'OFF',
    config_error: 'Ошибка',
    config_error_text: 'Не удалось загрузить config.',
    config_format: '{app} • latest {version} • режим {mode}'
  }
};

const landingState = {
  user: null,
  config: null,
  backendOnline: null,
  lang: localStorage.getItem('trust_landing_lang') || 'en'
};

function $(id) { return document.getElementById(id); }
function hide(id, on) { $(id)?.classList.toggle('hidden', on); }
function t(key) {
  const dict = LANDING_I18N[landingState.lang] || LANDING_I18N.en;
  return dict[key] ?? LANDING_I18N.en[key] ?? key;
}

function formatString(template, params) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => String(params?.[key] ?? '—'));
}

function applyTranslations() {
  document.documentElement.lang = landingState.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.innerHTML = t(key);
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === landingState.lang);
  });
  applyUser(landingState.user);
  renderBackendStatus();
  renderConfigStatus();
}

async function api(path, options = {}) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}

function applyUser(user) {
  landingState.user = user || null;
  const authed = !!landingState.user;
  hide('landingAppBtn', !authed);
  hide('landingLogoutBtn', !authed);
  hide('landingLoginBtn', authed);
  hide('landingGuestCard', authed);
  hide('landingUserCard', !authed);

  $('landingAuthBadge').textContent = authed ? t('auth_connected') : t('auth_guest');
  $('landingAuthBadge').className = `pill ${authed ? 'ok' : 'idle'}`;

  if (!authed) return;
  $('landingAvatar').src = landingState.user.avatarUrl || '';
  $('landingNickname').textContent = landingState.user.nickname || 'Unknown';
  $('landingSteamId').textContent = landingState.user.steamId || landingState.user.steamId64 || '';
  $('landingElo').textContent = landingState.user.elo2v2 ?? 100;
  $('landingMatches').textContent = landingState.user.matchesPlayed2v2 ?? 0;
  $('landingWins').textContent = landingState.user.wins2v2 ?? 0;
}

async function refreshAuth() {
  try {
    const data = await api('/auth/me');
    applyUser(data.user || null);
  } catch (_) {
    applyUser(null);
  }
}

function renderBackendStatus() {
  if (landingState.backendOnline === true) {
    $('backendBadge').textContent = t('backend_online');
    $('backendBadge').className = 'pill ok';
    $('backendText').textContent = t('backend_online_text');
    return;
  }
  if (landingState.backendOnline === false) {
    $('backendBadge').textContent = t('backend_offline');
    $('backendBadge').className = 'pill warn';
    $('backendText').textContent = t('backend_offline_text');
    return;
  }
  $('backendBadge').textContent = '...';
  $('backendBadge').className = 'pill idle';
  $('backendText').textContent = t('backend_text_loading');
}

async function refreshHealth() {
  try {
    await api('/health');
    landingState.backendOnline = true;
  } catch (_) {
    landingState.backendOnline = false;
  }
  renderBackendStatus();
}

function renderConfigStatus() {
  const cfg = landingState.config;
  if (!cfg) {
    $('configBadge').textContent = t('config_waiting');
    $('configBadge').className = 'pill idle';
    $('configText').textContent = t('config_text_loading');
    return;
  }

  $('configBadge').textContent = cfg.matchmakingEnabled ? t('config_on') : t('config_off');
  $('configBadge').className = `pill ${cfg.matchmakingEnabled ? 'ok' : 'warn'}`;
  $('configText').textContent = formatString(t('config_format'), {
    app: cfg.appName || 'TRUST',
    version: cfg.latestVersion || '—',
    mode: cfg.mode || 'auto'
  });
}

async function refreshConfig() {
  try {
    const data = await api('/config');
    landingState.config = data.config || {};
  } catch (_) {
    landingState.config = null;
    $('configBadge').textContent = t('config_error');
    $('configBadge').className = 'pill warn';
    $('configText').textContent = t('config_error_text');
    return;
  }
  renderConfigStatus();
}

function login() {
  window.location.href = `${BACKEND_BASE_URL}/auth/steam`;
}

async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch (_) {}
  window.location.reload();
}

function setLanguage(lang) {
  landingState.lang = lang === 'ru' ? 'ru' : 'en';
  localStorage.setItem('trust_landing_lang', landingState.lang);
  applyTranslations();
}

window.addEventListener('DOMContentLoaded', async () => {
  ['landingLoginBtn', 'heroLoginBtn', 'bottomLoginBtn'].forEach((id) => $(id)?.addEventListener('click', login));
  $('landingLogoutBtn')?.addEventListener('click', logout);
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  applyTranslations();
  await Promise.all([refreshAuth(), refreshHealth(), refreshConfig()]);
});
