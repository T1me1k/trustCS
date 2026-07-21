import React, { StrictMode, useEffect, useMemo, useState } from 'https://esm.sh/react@19.1.1';
import { createRoot } from 'https://esm.sh/react-dom@19.1.1/client';

const LANG_KEY = 'trust_lang';

const I18N = {
  ru: {
    login: 'Войти через Steam', brandSub: '2x2 leaderboard', navHome: 'Главная', navPlay: 'Играть', navLeaderboard: 'Лидерборд', navProfile: 'Профиль',
    season: 'SEASON 1', title: 'Лидерборд TRUST 2x2', subtitle: 'Топ игроков по Elo. Рейтинг считается на backend и одинаков для сайта и launcher.',
    searching: 'В поиске', liveMatches: 'LIVE матчей', headPlayer: 'Игрок', headRank: 'Звание', loading: 'Загружаем лидерборд...',
    empty: 'Лидерборд пока пуст.', loadError: 'Не удалось загрузить лидерборд.', retry: 'Повторить', unknown: 'Unknown', searchPlaceholder: 'Поиск игрока по нику...', noSearchResults: 'Игрок не найден', topThree: 'ТОП-3 игрока'
  },
  en: {
    login: 'Sign in with Steam', brandSub: '2x2 leaderboard', navHome: 'Home', navPlay: 'Play', navLeaderboard: 'Leaderboard', navProfile: 'Profile',
    season: 'SEASON 1', title: 'TRUST 2v2 Leaderboard', subtitle: 'Top players by Elo. Rating is calculated by the backend and shared by the site and launcher.',
    searching: 'Searching', liveMatches: 'LIVE matches', headPlayer: 'Player', headRank: 'Rank', loading: 'Loading leaderboard...',
    empty: 'The leaderboard is empty for now.', loadError: 'Failed to load leaderboard.', retry: 'Retry', unknown: 'Unknown', searchPlaceholder: 'Search player by nickname...', noSearchResults: 'Player not found', topThree: 'TOP 3 players'
  }
};

const RANK_TABLE = [
  { key: 'iron', name: 'Iron', minElo: 0, color: 'iron', icon: './assets/ranks/iron.svg' },
  { key: 'bronze', name: 'Bronze', minElo: 225, color: 'bronze', icon: './assets/ranks/bronze.svg' },
  { key: 'silver', name: 'Silver', minElo: 450, color: 'silver', icon: './assets/ranks/silver.svg' },
  { key: 'gold', name: 'Gold', minElo: 675, color: 'gold', icon: './assets/ranks/gold.svg' },
  { key: 'platinum', name: 'Platinum', minElo: 900, color: 'platinum', icon: './assets/ranks/platinum.svg' },
  { key: 'diamond', name: 'Diamond', minElo: 1125, color: 'diamond', icon: './assets/ranks/diamond.svg' },
  { key: 'master', name: 'Master', minElo: 1350, color: 'master', icon: './assets/ranks/master.svg' },
  { key: 'grandmaster', name: 'Grandmaster', minElo: 1575, color: 'grandmaster', icon: './assets/ranks/grandmaster.svg' },
  { key: 'elite', name: 'Elite', minElo: 1800, color: 'elite', icon: './assets/ranks/elite.svg' },
  { key: 'legend', name: 'Legend', minElo: 2000, color: 'legend', icon: './assets/ranks/legend.svg' }
];

function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
}

function getBackendBaseUrl() {
  const fromWindow = window.TRUST_BACKEND_BASE_URL;
  const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
  const fromStorage = window.localStorage.getItem('trust_backend_base_url');
  return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
}

async function api(path, options = {}) {
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
  return data;
}

function getInitialLang() {
  return window.localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ru';
}

function getRankByElo(elo) {
  return [...RANK_TABLE].reverse().find((rank) => elo >= rank.minElo) || RANK_TABLE[0];
}

function normalizeRank(rank, elo) {
  if (rank?.name) {
    const fallback = getRankByElo(elo);
    return {
      key: rank.key || fallback.key,
      name: rank.name,
      minElo: rank.minElo ?? fallback.minElo,
      color: rank.color || fallback.color,
      icon: rank.icon || fallback.icon
    };
  }
  return getRankByElo(elo);
}

function rememberAuthReturn() {
  try { window.sessionStorage.setItem('trust_post_auth_return', window.location.href); } catch (_) {}
}

function TrustHeader({ authed, lang, setLang }) {
  const t = I18N[lang];
  const signIn = () => {
    rememberAuthReturn();
    window.location.assign(`${getBackendBaseUrl()}/auth/steam?returnTo=${encodeURIComponent(window.location.href)}`);
  };

  return h(React.Fragment, null,
    h('header', { className: 'topbar' },
      h('div', { className: 'container topbar-inner' },
        h('div', { className: 'brand' },
          h('div', { className: 'brand-mark' }, 'T'),
          h('div', null, h('div', { className: 'brand-name' }, 'TRUST'), h('div', { className: 'brand-sub' }, t.brandSub))
        ),
        h('nav', { className: 'nav' },
          h('a', { href: './index.html' }, t.navHome),
          h('a', { href: './app.html' }, t.navPlay),
          h('a', { className: 'active', href: './leaderboard.html' }, t.navLeaderboard),
          h('a', { href: './profile.html' }, t.navProfile)
        ),
        h('div', { className: 'actions' },
          h('div', { className: 'lang-switch', 'aria-label': 'Language switch' },
            h('button', { type: 'button', className: `lang-btn ${lang === 'ru' ? 'active' : ''}`, onClick: () => setLang('ru') }, 'RU'),
            h('button', { type: 'button', className: `lang-btn ${lang === 'en' ? 'active' : ''}`, onClick: () => setLang('en') }, 'ENG')
          ),
          !authed && h('button', { className: 'btn primary', onClick: signIn }, t.login)
        )
      )
    ),
    h('div', { className: 'container mobile-nav mobile-nav-leaderboard', 'aria-label': 'Mobile navigation' },
      h('a', { className: 'mobile-nav-link', href: './index.html' }, t.navHome),
      h('a', { className: 'mobile-nav-link', href: './app.html' }, t.navPlay),
      h('a', { className: 'mobile-nav-link active', href: './leaderboard.html' }, t.navLeaderboard),
      h('a', { className: 'mobile-nav-link', href: './profile.html' }, t.navProfile)
    )
  );
}


function PlayerAvatar({ item, className = 'avatar sm' }) {
  const name = item.nickname || 'Unknown';
  return item.avatarUrl
    ? h('img', { className, src: item.avatarUrl, alt: name })
    : h('div', { className: `${className} avatar-fallback` }, name.slice(0, 1).toUpperCase());
}

function getPlayerPosition(item, index) {
  return item.rankPosition ?? (typeof item.rank === 'number' ? item.rank : undefined) ?? index + 1;
}

function TopThreePodium({ items, lang }) {
  const t = I18N[lang];
  const topThree = items.slice(0, 3);
  if (!topThree.length) return null;
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return h('div', { className: 'leaderboard-podium-wrap' },
    h('div', { className: 'leaderboard-section-kicker' }, t.topThree),
    h('div', { className: 'leaderboard-podium' },
      podiumOrder.map((item) => {
        const originalIndex = items.indexOf(item);
        const position = getPlayerPosition(item, originalIndex);
        const elo = item.elo2v2 ?? 100;
        const rank = normalizeRank(typeof item.rank === 'object' ? item.rank : undefined, elo);
        const placeClass = position === 1 ? 'first' : position === 2 ? 'second' : 'third';
        return h('article', { className: `podium-card ${placeClass}`, key: `podium-${position}-${item.nickname || 'player'}` },
          h('div', { className: 'podium-place' }, `#${position}`),
          h(PlayerAvatar, { item, className: 'avatar podium-avatar' }),
          h('div', { className: 'podium-name' }, item.nickname || t.unknown),
          h('div', { className: 'podium-elo' }, elo, ' Elo'),
          h('span', { className: `rank-pill ${rank.color || 'silver'}` }, rank.icon && h('img', { className: 'rank-medal-img', src: rank.icon, alt: '', loading: 'lazy' }), h('span', null, rank.name || 'Iron')),
          h('div', { className: 'podium-block', 'aria-hidden': true })
        );
      })
    )
  );
}

function LeaderboardRows({ items, lang, emptyText }) {
  const t = I18N[lang];
  if (!items.length) return h('div', { className: 'empty' }, emptyText || t.empty);
  return items.map((item, index) => {
    const elo = item.elo2v2 ?? 100;
    const rank = normalizeRank(typeof item.rank === 'object' ? item.rank : undefined, elo);
    const position = item.rankPosition ?? (typeof item.rank === 'number' ? item.rank : undefined) ?? index + 1;
    return h('div', { className: 'table-row', key: `${item.nickname || 'player'}-${position}` },
      h('div', null, h('strong', null, `#${position}`)),
      h('div', { className: 'table-player' }, h(PlayerAvatar, { item }), h('span', null, item.nickname || t.unknown)),
      h('div', null, h('span', { className: `rank-pill ${rank.color || 'silver'}` }, rank.icon && h('img', { className: 'rank-medal-img', src: rank.icon, alt: '', loading: 'lazy' }), h('span', null, rank.name || 'Iron'))),
      h('div', null, h('strong', null, elo))
    );
  });
}

function LeaderboardApp() {
  const [lang, setLangState] = useState(getInitialLang);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [search, setSearch] = useState('');
  const t = I18N[lang];

  const setLang = (nextLang) => {
    setLangState(nextLang);
    window.localStorage.setItem(LANG_KEY, nextLang);
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const [leaderboard, auth] = await Promise.allSettled([api('/api/leaderboard'), api('/auth/me')]);
      if (leaderboard.status === 'fulfilled') setItems(leaderboard.value.items || []);
      else setError(true);
      if (auth.status === 'fulfilled') setAuthed(Boolean(auth.value.user));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { void loadLeaderboard(); }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => String(item.nickname || '').toLowerCase().includes(query));
  }, [items, search]);

  const liveStats = useMemo(() => h('p', { className: 'muted', style: { marginTop: 10 } },
    `${t.searching}: `, h('strong', { 'data-live-searching-count': true }, '0'), ` • ${t.liveMatches}: `, h('strong', { 'data-live-active-matches': true }, '0')
  ), [t.liveMatches, t.searching]);

  return h(React.Fragment, null,
    h(TrustHeader, { authed, lang, setLang }),
    h('main', { className: 'container app-shell' },
      h('section', { className: 'card' },
        h('span', { className: 'badge' }, t.season),
        h('h1', { style: { margin: '16px 0 10px', fontSize: 48, letterSpacing: '-.06em' } }, t.title),
        h('p', { className: 'muted' }, t.subtitle),
        liveStats
      ),
      h('section', { className: 'card', style: { marginTop: 18 } },
        h(TopThreePodium, { items, lang }),
        h('div', { className: 'leaderboard-tools' },
          h('input', { className: 'input leaderboard-search', type: 'search', value: search, placeholder: t.searchPlaceholder, onChange: (event) => setSearch(event.target.value), 'aria-label': t.searchPlaceholder })
        ),
        h('div', { className: 'table-head' }, h('div', null, '#'), h('div', null, t.headPlayer), h('div', null, t.headRank), h('div', null, 'Elo')),
        h('div', { className: 'list' },
          loading && h('div', { className: 'empty' }, t.loading),
          !loading && error && h('div', { className: 'empty' }, t.loadError, h('div', { style: { marginTop: 12 } }, h('button', { className: 'btn secondary', type: 'button', onClick: loadLeaderboard }, t.retry))),
          !loading && !error && h(LeaderboardRows, { items: filteredItems, lang, emptyText: search.trim() ? t.noSearchResults : t.empty })
        )
      )
    )
  );
}

createRoot(document.getElementById('leaderboard-root')).render(h(StrictMode, null, h(LeaderboardApp)));
