const PROFILE_I18N = {
  ru: {
    login:'Войти через Steam', logout:'Выйти', navHome:'Главная', navPlay:'Играть', navLeaderboard:'Лидерборд', navProfile:'Профиль', brandSub:'player profile',
    guestTitle:'Войди через Steam, чтобы открыть профиль.', guestText:'Профиль показывает твой ранг, рейтинг, прогресс, winrate, серии и историю матчей.', guestLeaderboard:'Смотреть лидерборд',
    steamConnected:'Steam connected', play:'Играть', currentRank:'Текущее звание', progressTitle:'Прогресс звания', current:'Сейчас', next:'Следующее', seasonTitle:'Season snapshot', seasonPeak:'Пик сезона', position:'Позиция', lastMatch:'Последний матч',
    matches:'Матчи', winrate:'Winrate', record:'W / L', currentStreak:'Серия', bestStreak:'Лучшая серия', favoriteMap:'Лучшая карта', recentMatches:'Последние матчи', form:'Форма игрока', insight:'Инсайт',
    noMatches:'Матчей пока нет. Сыграй первый ranked-матч, чтобы начать историю профиля.', maxRank:'Максимальное звание достигнуто', pointsLeft:'до следующего звания', rating:'Rating', never:'—'
  },
  en: {
    login:'Sign in with Steam', logout:'Sign out', navHome:'Home', navPlay:'Play', navLeaderboard:'Leaderboard', navProfile:'Profile', brandSub:'player profile',
    guestTitle:'Sign in with Steam to open your profile.', guestText:'Your profile shows rank, rating, progress, winrate, streaks and match history.', guestLeaderboard:'View leaderboard',
    steamConnected:'Steam connected', play:'Play', currentRank:'Current rank', progressTitle:'Rank progress', current:'Current', next:'Next', seasonTitle:'Season snapshot', seasonPeak:'Season peak', position:'Position', lastMatch:'Last match',
    matches:'Matches', winrate:'Winrate', record:'W / L', currentStreak:'Streak', bestStreak:'Best streak', favoriteMap:'Best map', recentMatches:'Recent matches', form:'Player form', insight:'Insight',
    noMatches:'No matches yet. Play your first ranked match to start building your profile.', maxRank:'Maximum rank reached', pointsLeft:'to next rank', rating:'Rating', never:'—'
  }
};
const PROFILE_LANG_KEY = 'trust_lang';
let profileLang = localStorage.getItem(PROFILE_LANG_KEY) === 'en' ? 'en' : 'ru';
const pt = (key) => (PROFILE_I18N[profileLang] && PROFILE_I18N[profileLang][key]) || PROFILE_I18N.ru[key] || key;
const $ = (id) => document.getElementById(id);
function text(id, value) { const el = $(id); if (el) el.textContent = value; }
function hide(id, hidden) { const el = $(id); if (el) el.classList.toggle('hidden', !!hidden); }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatPercent(value) { return `${Number(value || 0)}%`; }
function formatDate(value) { if (!value) return pt('never'); const d = new Date(value); if (Number.isNaN(d.getTime())) return pt('never'); return d.toLocaleDateString(profileLang === 'ru' ? 'ru-RU' : 'en-US', { day:'2-digit', month:'short', year:'numeric' }); }
function formatDuration(totalSec) { if (totalSec == null) return '—'; const sec = Math.max(0, Number(totalSec) || 0); const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${String(s).padStart(2,'0')}`; }
function mapName(name) { const map = { shortdust:'Shortdust', lake:'Lake', overpass:'Overpass', vertigo:'Vertigo', nuke:'Nuke' }; return map[String(name || '').toLowerCase()] || name || '—'; }
const BACKEND_BASE_URL = (() => {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
})();
const API_TIMEOUT_MS = 15000;
async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), Number(options.timeoutMs || API_TIMEOUT_MS));
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, { credentials:'include', cache:'no-store', ...options, headers: { ...(options.headers || {}) }, signal: options.signal || controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
    return data;
  } finally { window.clearTimeout(timeout); }
}
function getSteamAuthUrl() { return `${BACKEND_BASE_URL}/auth/steam?returnTo=${encodeURIComponent(window.location.href)}`; }
const RANK_TABLE = [
  {
    "key": "iron",
    "name": "Iron",
    "tierName": "Iron",
    "division": null,
    "minElo": 0,
    "color": "iron",
    "icon": "./assets/ranks/iron.svg"
  },
  {
    "key": "bronze",
    "name": "Bronze",
    "tierName": "Bronze",
    "division": null,
    "minElo": 225,
    "color": "bronze",
    "icon": "./assets/ranks/bronze.svg"
  },
  {
    "key": "silver",
    "name": "Silver",
    "tierName": "Silver",
    "division": null,
    "minElo": 450,
    "color": "silver",
    "icon": "./assets/ranks/silver.svg"
  },
  {
    "key": "gold",
    "name": "Gold",
    "tierName": "Gold",
    "division": null,
    "minElo": 675,
    "color": "gold",
    "icon": "./assets/ranks/gold.svg"
  },
  {
    "key": "platinum",
    "name": "Platinum",
    "tierName": "Platinum",
    "division": null,
    "minElo": 900,
    "color": "platinum",
    "icon": "./assets/ranks/platinum.svg"
  },
  {
    "key": "diamond",
    "name": "Diamond",
    "tierName": "Diamond",
    "division": null,
    "minElo": 1125,
    "color": "diamond",
    "icon": "./assets/ranks/diamond.svg"
  },
  {
    "key": "master",
    "name": "Master",
    "tierName": "Master",
    "division": null,
    "minElo": 1350,
    "color": "master",
    "icon": "./assets/ranks/master.svg"
  },
  {
    "key": "grandmaster",
    "name": "Grandmaster",
    "tierName": "Grandmaster",
    "division": null,
    "minElo": 1575,
    "color": "grandmaster",
    "icon": "./assets/ranks/grandmaster.svg"
  },
  {
    "key": "elite",
    "name": "Elite",
    "tierName": "Elite",
    "division": null,
    "minElo": 1800,
    "color": "elite",
    "icon": "./assets/ranks/elite.svg"
  },
  {
    "key": "legend",
    "name": "Legend",
    "tierName": "Legend",
    "division": null,
    "minElo": 2000,
    "color": "legend",
    "icon": "./assets/ranks/legend.svg"
  }
];
function getRankByElo(rawElo) {
  const elo = Math.max(0, Number(rawElo) || 0);
  let currentIndex = 0;
  for (let i=0; i<RANK_TABLE.length; i += 1) { if (elo >= RANK_TABLE[i].minElo) currentIndex = i; else break; }
  const current = RANK_TABLE[currentIndex];
  const next = RANK_TABLE[currentIndex+1] || null;
  const progressPercent = next ? Math.max(0, Math.min(100, Math.round(((elo-current.minElo)/Math.max(1,next.minElo-current.minElo))*100))) : 100;
  return { ...current, currentElo: elo, nextRankName: next?.name || null, nextRankElo: next?.minElo || null, pointsToNext: next ? Math.max(0, next.minElo-elo) : 0, progressPercent, isMaxRank: !next };
}
function normalizeRank(rank, elo) { return rank && rank.name ? {...getRankByElo(elo), ...rank} : getRankByElo(elo); }
function rankIcon(rank) { return rank?.icon || `./assets/ranks/${String(rank?.color || rank?.key || 'iron').replace(/[^a-z0-9_.-]/gi,'')}.svg`; }
function applyLang() {
  document.documentElement.lang = profileLang;
  const map = { profileLoginBtn:'login', profileLogoutBtn:'logout', guestLoginBtn:'login', guestLeaderboardBtn:'guestLeaderboard', profileBrandSub:'brandSub', profileNavHome:'navHome', profileNavPlay:'navPlay', profileNavLeaderboard:'navLeaderboard', profileNavProfile:'navProfile', profileMobileNavHome:'navHome', profileMobileNavPlay:'navPlay', profileMobileNavLeaderboard:'navLeaderboard', profileMobileNavProfile:'navProfile', guestTitle:'guestTitle', guestText:'guestText', profileSteamBadge:'steamConnected', profilePlayBtn:'play', profileLeaderboardBtn:'navLeaderboard', currentRankLabel:'currentRank', progressTitle:'progressTitle', progressCurrentLabel:'current', progressNextLabel:'next', seasonTitle:'seasonTitle', seasonPeakLabel:'seasonPeak', leaderboardPositionLabel:'position', lastMatchLabel:'lastMatch', matchesLabel:'matches', winrateLabel:'winrate', recordLabel:'record', currentStreakLabel:'currentStreak', bestStreakLabel:'bestStreak', favoriteMapLabel:'favoriteMap', recentMatchesTitle:'recentMatches', formTitle:'form', insightLabel:'insight' };
  Object.entries(map).forEach(([id,k]) => text(id, pt(k)));
  $('profileLangRu')?.classList.toggle('active', profileLang === 'ru');
  $('profileLangEn')?.classList.toggle('active', profileLang === 'en');
}
function renderGuest() { hide('profileGuestState', false); hide('profileContent', true); hide('profileLoginBtn', false); hide('profileLogoutBtn', true); }
function renderForm(form) {
  const root = $('profileFormOrbs'); if (!root) return;
  if (!form || !form.length) { root.innerHTML = `<div class="empty">${esc(pt('noMatches'))}</div>`; return; }
  root.innerHTML = form.slice(0,10).map(r => `<span class="form-orb ${r === 'W' ? 'win' : 'loss'}">${esc(r)}</span>`).join('');
}
function resultClass(result) { return result === 'win' ? 'ok' : result === 'loss' ? 'warn' : 'idle'; }
function renderHistory(items) {
  const root = $('profileMatchList'); if (!root) return;
  text('recentCount', items.length);
  if (!items.length) { root.innerHTML = `<div class="empty">${esc(pt('noMatches'))}</div>`; return; }
  root.innerHTML = items.map((item) => {
    const delta = item.eloDelta == null ? '—' : `${item.eloDelta > 0 ? '+' : ''}${item.eloDelta}`;
    const score = `${item.teamAScore ?? 0} : ${item.teamBScore ?? 0}`;
    const teammate = item.teammate?.nickname || '—';
    return `<article class="profile-match-card">
      <div class="profile-match-main">
        <span class="pill ${resultClass(item.result)}">${item.result === 'win' ? 'WIN' : item.result === 'loss' ? 'LOSS' : '—'}</span>
        <div><strong>${esc(mapName(item.mapName))}</strong><div class="muted">${esc(formatDate(item.finishedAt))} • ${esc(formatDuration(item.durationSec))}</div></div>
      </div>
      <div class="profile-match-score"><strong>${esc(score)}</strong><span class="muted">${esc(teammate)}</span></div>
      <div class="profile-match-delta ${Number(item.eloDelta || 0) >= 0 ? 'positive' : 'negative'}">${esc(delta)}</div>
    </article>`;
  }).join('');
}
function profileInsight(profile) {
  const matches = Number(profile.completedMatches2v2 || profile.matchesPlayed2v2 || 0);
  if (!matches) return profileLang === 'ru' ? 'Сыграй первый матч, чтобы профиль начал собирать форму и историю.' : 'Play your first match to start building form and history.';
  const wr = Number(profile.winRate2v2 || 0);
  const streak = Number(profile.currentWinStreak || 0);
  if (streak >= 3) return profileLang === 'ru' ? `Горячая серия: ${streak} побед подряд. Хороший момент пушить следующий ранг.` : `Hot streak: ${streak} wins in a row. Good moment to push the next rank.`;
  if (wr >= 55) return profileLang === 'ru' ? 'Winrate выше среднего. Держи темп и добирай рейтинг до следующего звания.' : 'Winrate is above average. Keep the pace and push toward the next rank.';
  return profileLang === 'ru' ? 'Профиль уже собирает статистику. Стабильные win streak дадут самый быстрый прогресс.' : 'Your profile is collecting stats. Stable win streaks will move progress fastest.';
}
function renderProfile(profile, history) {
  hide('profileGuestState', true); hide('profileContent', false); hide('profileLoginBtn', true); hide('profileLogoutBtn', false);
  const elo = Number(profile.elo2v2 || 100); const rank = normalizeRank(profile.rank, elo); const icon = rankIcon(rank);
  $('heroAvatar').src = profile.avatarUrl || '';
  text('heroNickname', profile.nickname || 'Unknown'); text('heroSteamId', profile.steamId64 || profile.steamId || '');
  $('heroRankIcon').src = icon; text('heroRankName', rank.name); text('heroRating', `${elo} ${pt('rating')}`);
  text('progressCurrentRank', rank.name); text('progressNextRank', rank.isMaxRank ? 'MAX' : `${rank.nextRankName} • ${rank.nextRankElo}`);
  $('profileProgressFill').style.width = `${rank.progressPercent || 0}%`; text('profileProgressPercent', `${rank.progressPercent || 0}%`);
  text('profileProgressText', rank.isMaxRank ? pt('maxRank') : `${rank.pointsToNext} ${pt('pointsLeft')}`);
  text('seasonPeak', rank.name); text('leaderboardPosition', profile.leaderboardPosition ? `#${profile.leaderboardPosition}` : '—'); text('lastMatchAt', formatDate(profile.lastMatchAt));
  text('statMatches', profile.completedMatches2v2 ?? profile.matchesPlayed2v2 ?? 0); text('statWinrate', formatPercent(profile.winRate2v2)); text('statRecord', `${profile.wins2v2 ?? 0} / ${profile.losses2v2 ?? 0}`);
  text('statCurrentStreak', `${profile.currentWinStreak ?? 0}W`); text('statBestStreak', `${profile.bestWinStreak ?? 0}W`); text('statFavoriteMap', profile.favoriteMap ? mapName(profile.favoriteMap) : '—');
  text('standingPill', String(profile.standing || 'building').toUpperCase()); $('standingPill').className = `pill ${profile.standing === 'hot' ? 'ok' : profile.standing === 'good' ? 'live' : 'idle'}`;
  renderForm(profile.recentForm || []); renderHistory(history || []); text('profileInsight', profileInsight(profile));
}
async function boot() {
  applyLang();
  $('profileLangRu')?.addEventListener('click', () => { profileLang='ru'; localStorage.setItem(PROFILE_LANG_KEY, profileLang); applyLang(); });
  $('profileLangEn')?.addEventListener('click', () => { profileLang='en'; localStorage.setItem(PROFILE_LANG_KEY, profileLang); applyLang(); });
  const login = () => { window.location.href = getSteamAuthUrl(); };
  $('profileLoginBtn')?.addEventListener('click', login); $('guestLoginBtn')?.addEventListener('click', login);
  $('profileLogoutBtn')?.addEventListener('click', async () => { try { await api('/api/auth/logout', { method:'POST' }); } catch (_) {} window.location.reload(); });
  try {
    const me = await api('/api/profile/me');
    const hist = await api('/api/profile/me/history?limit=12').catch(() => ({items:[]}));
    if (!me.profile) return renderGuest();
    renderProfile(me.profile, hist.items || []);
  } catch (err) { renderGuest(); }
}
document.addEventListener('DOMContentLoaded', boot);
