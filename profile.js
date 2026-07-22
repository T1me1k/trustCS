const PROFILE_I18N = {
  ru: {
    login:'Войти через Steam', logout:'Выйти', navHome:'Главная', navPlay:'Играть', navLeaderboard:'Лидерборд', navProfile:'Профиль', brandSub:'player profile',
    guestTitle:'Войди через Steam, чтобы открыть профиль.', guestText:'Профиль показывает твой ранг, рейтинг, прогресс, winrate, серии и историю матчей.', guestLeaderboard:'Смотреть лидерборд',
    steamConnected:'Steam connected', play:'Играть', currentRank:'Текущее звание', progressTitle:'Прогресс звания', current:'Сейчас', next:'Следующее', seasonTitle:'Season snapshot', seasonPeak:'Пик сезона', position:'Позиция', lastMatch:'Последний матч',
    matches:'Матчи', winrate:'Winrate', record:'W / L', currentStreak:'Серия', bestStreak:'Лучшая серия', favoriteMap:'Лучшая карта', recentMatches:'Последние матчи', form:'Форма игрока', insight:'Инсайт',
    noMatches:'Матчей пока нет. Сыграй первый ranked-матч, чтобы начать историю профиля.', maxRank:'Максимальное звание достигнуто', pointsLeft:'до следующего звания', rating:'Rating', never:'—',
    detailedStats:'Расширенная статистика', statsUnavailable:'Расширенная статистика недоступна', wins:'Побед', losses:'Поражения', avgDamage:'Средний урон', headshotRate:'HS%', mvp:'MVP матчей', kd:'K/D', currentStreak:'Текущая серия', bestStreak:'Лучшая серия побед', mapStats:'Статистика по картам', previous:'Назад', next:'Вперёд', detailedUnavailable:'Подробная статистика недоступна', pending:'Ожидание', draw:'Ничья'
  },
  en: {
    login:'Sign in with Steam', logout:'Sign out', navHome:'Home', navPlay:'Play', navLeaderboard:'Leaderboard', navProfile:'Profile', brandSub:'player profile',
    guestTitle:'Sign in with Steam to open your profile.', guestText:'Your profile shows rank, rating, progress, winrate, streaks and match history.', guestLeaderboard:'View leaderboard',
    steamConnected:'Steam connected', play:'Play', currentRank:'Current rank', progressTitle:'Rank progress', current:'Current', next:'Next', seasonTitle:'Season snapshot', seasonPeak:'Season peak', position:'Position', lastMatch:'Last match',
    matches:'Matches', winrate:'Winrate', record:'W / L', currentStreak:'Streak', bestStreak:'Best streak', favoriteMap:'Best map', recentMatches:'Recent matches', form:'Player form', insight:'Insight',
    noMatches:'No matches yet. Play your first ranked match to start building your profile.', maxRank:'Maximum rank reached', pointsLeft:'to next rank', rating:'Rating', never:'—',
    detailedStats:'Detailed statistics', statsUnavailable:'Detailed statistics unavailable', wins:'Wins', losses:'Losses', avgDamage:'Average damage', headshotRate:'HS%', mvp:'Match MVPs', kd:'K/D', currentStreak:'Current streak', bestStreak:'Best win streak', mapStats:'Map statistics', previous:'Previous', next:'Next', detailedUnavailable:'Detailed statistics unavailable', pending:'Pending', draw:'Draw'
  }
};
const PROFILE_LANG_KEY = 'trust_lang';
let profileLang = localStorage.getItem(PROFILE_LANG_KEY) === 'en' ? 'en' : 'ru';
let historyPage = 1;
let historyTotalPages = 1;
let currentSteamId = null;
const pt = (key) => (PROFILE_I18N[profileLang] && PROFILE_I18N[profileLang][key]) || PROFILE_I18N.ru[key] || key;
const $ = (id) => document.getElementById(id);
function text(id, value) { const el = $(id); if (el) el.textContent = value; }
function hide(id, hidden) { const el = $(id); if (el) el.classList.toggle('hidden', !!hidden); }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatPercent(value) { return TrustApi?.formatPercent ? TrustApi.formatPercent(value) : `${Number(value || 0)}%`; }
function formatDate(value) { return TrustApi?.formatDate ? TrustApi.formatDate(value, profileLang) : pt('never'); }
function formatDuration(totalSec) { return TrustApi?.formatDuration ? TrustApi.formatDuration(totalSec) : '—'; }
function formatEloChange(value) { return TrustApi?.formatEloChange ? TrustApi.formatEloChange(value) : (value == null ? '—' : `${Number(value) > 0 ? '+' : ''}${Number(value)}`); }
function calculateKd(kills, deaths) { return TrustApi?.calculateKd ? TrustApi.calculateKd(kills, deaths) : '0.00'; }
function mapName(name) { return TrustApi?.formatMapName ? TrustApi.formatMapName(name) : (name || '—'); }
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
  text('detailedStatsTitle', pt('detailedStats')); text('detailedStatsPill', pt('statsUnavailable')); text('mapStatsTitle', pt('mapStats')); text('historyPrevBtn', pt('previous')); text('historyNextBtn', pt('next'));
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
function resultLabel(result) { return result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : result === 'draw' ? 'DRAW' : 'PENDING'; }
function matchIdOf(item) { return item.id || item.matchId || item.match_id; }
function renderHistory(items, meta = {}) {
  const root = $('profileMatchList'); if (!root) return;
  historyTotalPages = Number(meta.totalPages || meta.pages || historyTotalPages || 1);
  text('recentCount', items.length); text('historyPageLabel', `${historyPage} / ${historyTotalPages}`);
  const prev = $('historyPrevBtn'); const next = $('historyNextBtn'); if (prev) prev.disabled = historyPage <= 1; if (next) next.disabled = historyPage >= historyTotalPages;
  if (!items.length) { root.innerHTML = `<div class="empty">${esc(pt('noMatches'))}</div>`; return; }
  root.innerHTML = items.map((item) => {
    const deltaValue = item.eloDelta ?? item.eloChange;
    const delta = formatEloChange(deltaValue);
    const score = `${item.teamAScore ?? item.scoreA ?? 0} : ${item.teamBScore ?? item.scoreB ?? 0}`;
    const teammate = item.teammate?.nickname || '—';
    const kda = item.kills != null || item.deaths != null || item.assists != null ? `${item.kills ?? 0}/${item.deaths ?? 0}/${item.assists ?? 0}` : '';
    const href = matchIdOf(item) ? `./match.html?id=${encodeURIComponent(matchIdOf(item))}` : '';
    const tag = href ? 'a' : 'article';
    return `<${tag} class="profile-match-card history-match-link" ${href ? `href="${href}" aria-label="Open match ${esc(matchIdOf(item))}"` : ''}>
      <div class="profile-match-main">
        <span class="pill ${resultClass(item.result)}">${resultLabel(item.result)}</span>
        <div><strong>${esc(mapName(item.mapName))}</strong><div class="muted">${esc(formatDate(item.finishedAt || item.completedAt || item.startedAt))} • ${esc(formatDuration(item.durationSec || item.durationSeconds))}${kda ? ` • K/D/A ${esc(kda)}` : ''}${item.hasTelemetry === false ? ` • ${esc(pt('detailedUnavailable'))}` : ''}${item.isMatchMvp ? ' • ★ MVP' : ''}</div></div>
      </div>
      <div class="profile-match-score"><strong>${esc(score)}</strong><span class="muted">${esc(teammate)}</span></div>
      <div class="profile-match-delta ${String(delta).startsWith('-') ? 'negative' : 'positive'}">${esc(delta)}</div>
    </${tag}>`;
  }).join('');
}
function streakText(streak) { const count = Number(streak?.count || 0); if (!count) return profileLang === 'ru' ? 'Нет серии' : 'No streak'; const isLoss = String(streak?.type).toLowerCase().startsWith('loss'); return profileLang === 'ru' ? `${count} ${isLoss ? 'поражения' : 'победы'}` : `${count} ${isLoss ? 'losses' : 'wins'}`; }
function renderDetailedStats(stats) {
  const root = $('profileDetailedStats'); const maps = $('profileMapStats'); if (!root || !maps) return;
  const data = stats?.stats || stats || null;
  if (!data) { root.innerHTML = `<div class="empty">${esc(pt('statsUnavailable'))}</div>`; maps.innerHTML = `<div class="empty">${esc(pt('statsUnavailable'))}</div>`; return; }
  root.classList.add('profile-stats-grid');
  const cells = [[pt('matches'), data.matches ?? data.totalMatches], [pt('wins'), data.wins], [pt('losses'), data.losses], [pt('winrate'), formatPercent(data.winrate ?? data.winRate)], [pt('kd'), data.kd ?? calculateKd(data.kills, data.deaths)], [pt('avgDamage'), data.averageDamage ?? data.avgDamage], [pt('headshotRate'), formatPercent(data.headshotRate ?? data.hsPercent)], [pt('mvp'), data.mvpMatches ?? data.mvps ?? data.mvp], [pt('currentStreak'), streakText(data.currentStreak)], [pt('bestStreak'), data.bestWinStreak ?? data.bestStreak]];
  root.innerHTML = cells.map(([label,value]) => `<div class="stat profile-stat"><span>${esc(label)}</span><strong>${esc(value ?? '—')}</strong></div>`).join('');
  const mapItems = [...(data.maps || data.mapStats || [])].sort((a,b)=>Number(b.matches||0)-Number(a.matches||0));
  maps.innerHTML = mapItems.length ? `<table class="map-stats-table"><thead><tr><th>MAP</th><th>MATCHES</th><th>WINS</th><th>WINRATE</th><th>K/D</th><th>AVG DAMAGE</th></tr></thead><tbody>${mapItems.map(m => `<tr><td data-label="MAP"><strong>${esc(mapName(m.map || m.mapName))}</strong></td><td data-label="MATCHES">${esc(m.matches ?? 0)}</td><td data-label="WINS">${esc(m.wins ?? 0)}</td><td data-label="WINRATE">${esc(formatPercent(m.winrate ?? m.winRate))}</td><td data-label="K/D">${esc(m.kd ?? m.averageKd ?? m.avgKd ?? '—')}</td><td data-label="AVG DAMAGE">${esc(m.averageDamage ?? m.avgDamage ?? '—')}</td></tr>`).join('')}</tbody></table>` : `<div class="empty">${esc(pt('noMatches'))}</div>`;
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
function renderProfile(profile, history, stats, historyMeta = {}) {
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
  renderForm(profile.recentForm || []); renderHistory(history || [], historyMeta); renderDetailedStats(stats); text('profileInsight', profileInsight(profile));
}
async function loadHistoryPage(page) {
  if (!currentSteamId) return;
  historyPage = page;
  const prev = $('historyPrevBtn'); const next = $('historyNextBtn'); if (prev) prev.disabled = true; if (next) next.disabled = true;
  const hist = await TrustApi.getPlayerMatches(currentSteamId, historyPage, 20).catch(() => ({items:[]}));
  renderHistory(hist.items || hist.matches || [], hist.pagination || hist.meta || hist);
}
async function boot() {
  applyLang();
  $('profileLangRu')?.addEventListener('click', () => { profileLang='ru'; localStorage.setItem(PROFILE_LANG_KEY, profileLang); applyLang(); });
  $('profileLangEn')?.addEventListener('click', () => { profileLang='en'; localStorage.setItem(PROFILE_LANG_KEY, profileLang); applyLang(); });
  const login = () => { window.location.href = getSteamAuthUrl(); };
  $('profileLoginBtn')?.addEventListener('click', login); $('guestLoginBtn')?.addEventListener('click', login);
  $('profileLogoutBtn')?.addEventListener('click', async () => { try { await api('/api/auth/logout', { method:'POST' }); } catch (_) {} window.location.reload(); });
  $('historyPrevBtn')?.addEventListener('click', () => loadHistoryPage(Math.max(1, historyPage - 1)));
  $('historyNextBtn')?.addEventListener('click', () => loadHistoryPage(historyPage + 1));
  try {
    const me = await api('/api/profile/me');
    if (!me.profile) return renderGuest();
    const steamId = me.profile.steamId64 || me.profile.steamId;
    if (steamId !== currentSteamId) { currentSteamId = steamId; historyPage = 1; }
    const hist = steamId ? await TrustApi.getPlayerMatches(steamId, historyPage, 20).catch(() => ({items:[]})) : {items:[]};
    const stats = steamId ? await TrustApi.getPlayerStats(steamId).catch(() => null) : null;
    renderProfile(me.profile, hist.items || hist.matches || [], stats, hist.pagination || hist.meta || hist);
  } catch (err) { renderGuest(); }
}
document.addEventListener('DOMContentLoaded', boot);
