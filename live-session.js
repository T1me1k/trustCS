(function () {
  const BACKEND_BASE_URL = (() => {
    const fromWindow = window.TRUST_BACKEND_BASE_URL;
    const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
    const fromStorage = window.localStorage.getItem('trust_backend_base_url');
    return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
  })();

  const POLL_MS = 2000;
  const toastSeen = new Set();
  const toastDismissed = new Set();
  const toastTimers = new Map();
  let refreshInFlight = false;
  let booted = false;
  let timer = null;
  let currentUser = null;
  let currentParty = null;
  let currentMatch = null;
  let matchBannerDismissedFor = null;

  function t(key) {
    const lang = localStorage.getItem('trust_lang') === 'en' ? 'en' : 'ru';
    const dict = {
      ru: {
        inviteTitle: 'Инвайт в party',
        inviteSub: 'приглашает тебя в лобби. Инвайт живёт 10 секунд.',
        accept: 'Принять',
        decline: 'Отклонить',
        openApp: 'Открыть app',
        matchTitle: 'Матч найден',
        matchPending: 'Все 4 игрока должны подтвердить матч.',
        matchMap: 'Матч принят. Идёт стадия выбора карты.',
        matchConnect: 'Сервер готов. Можно подключаться к матчу.',
        matchLive: 'Матч уже идёт.',
        matchFinished: 'Матч завершён.',
        acceptMatch: 'Принять матч',
        accepted: 'Принято',
        invitedAccepted: 'Инвайт принят.',
        invitedDeclined: 'Инвайт отклонён.',
        matchAccepted: 'Матч принят.',
        loading: 'Загрузка...',
        queue: '2x2',
        map: 'Карта',
        status: 'Статус',
        playersAccepted: 'приняли',
        viewApp: 'Открыть матч',
        connect: 'Steam connect',
        close: 'Закрыть'
      },
      en: {
        inviteTitle: 'Party invite',
        inviteSub: 'invited you to a lobby. Invite lasts 10 seconds.',
        accept: 'Accept',
        decline: 'Decline',
        openApp: 'Open app',
        matchTitle: 'Match found',
        matchPending: 'All 4 players must accept the match.',
        matchMap: 'Match accepted. Map voting is in progress.',
        matchConnect: 'Server is ready. You can join the match.',
        matchLive: 'The match is already live.',
        matchFinished: 'The match has finished.',
        acceptMatch: 'Accept match',
        accepted: 'Accepted',
        invitedAccepted: 'Invite accepted.',
        invitedDeclined: 'Invite declined.',
        matchAccepted: 'Match accepted.',
        loading: 'Loading...',
        queue: '2v2',
        map: 'Map',
        status: 'Status',
        playersAccepted: 'accepted',
        viewApp: 'Open match',
        connect: 'Steam connect',
        close: 'Close'
      }
    };
    return dict[lang][key] || dict.ru[key] || key;
  }

  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function api(path, options = {}) {
    return fetch(`${BACKEND_BASE_URL}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
      return data;
    });
  }

  function showInlineNotice(message, tone) {
    const root = ensureNoticeRoot();
    root.textContent = message;
    root.className = `alert live-session-inline-notice ${tone === 'error' ? 'live-session-inline-notice-error' : ''}`;
    root.classList.remove('hidden');
    window.clearTimeout(root._hideTimer);
    root._hideTimer = window.setTimeout(() => root.classList.add('hidden'), 3200);
  }

  function ensureNoticeRoot() {
    let root = document.getElementById('liveSessionInlineNotice');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'liveSessionInlineNotice';
    root.className = 'alert live-session-inline-notice hidden';
    root.style.position = 'fixed';
    root.style.left = '16px';
    root.style.right = '16px';
    root.style.top = '92px';
    root.style.zIndex = '140';
    document.body.appendChild(root);
    return root;
  }

  function ensureUi() {
    if (!document.getElementById('liveSessionLayer')) {
      const layer = document.createElement('div');
      layer.id = 'liveSessionLayer';
      layer.className = 'live-session-layer';
      document.body.appendChild(layer);
    }
    if (!document.getElementById('liveSessionBanner')) {
      const banner = document.createElement('div');
      banner.id = 'liveSessionBanner';
      banner.className = 'live-session-banner hidden';
      document.body.appendChild(banner);
    }
  }

  function initials(name) {
    return String(name || '?').trim().slice(0, 1).toUpperCase() || '?';
  }

  function clearToastTimer(inviteId) {
    const timerId = toastTimers.get(inviteId);
    if (timerId) window.clearTimeout(timerId);
    toastTimers.delete(inviteId);
  }

  function removeInviteToast(inviteId) {
    clearToastTimer(inviteId);
    const node = document.querySelector(`[data-live-invite-id="${inviteId}"]`);
    if (node) node.remove();
  }

  async function acceptInvite(inviteId) {
    try {
      await api(`/api/party/invite/${encodeURIComponent(inviteId)}/accept`, { method: 'POST' });
      removeInviteToast(inviteId);
      showInlineNotice(t('invitedAccepted'));
      await refresh();
    } catch (err) {
      showInlineNotice(`Invite: ${err.message}`, 'error');
      await refresh();
    }
  }

  async function declineInvite(inviteId) {
    try {
      await api(`/api/party/invite/${encodeURIComponent(inviteId)}/decline`, { method: 'POST' });
      removeInviteToast(inviteId);
      toastDismissed.add(String(inviteId));
      showInlineNotice(t('invitedDeclined'));
      await refresh();
    } catch (err) {
      showInlineNotice(`Invite: ${err.message}`, 'error');
    }
  }

  function renderInviteToasts() {
    ensureUi();
    const layer = document.getElementById('liveSessionLayer');
    const invites = currentParty?.pendingInvites || [];
    const activeIds = new Set(invites.map((invite) => String(invite.id)));

    layer.querySelectorAll('[data-live-invite-id]').forEach((node) => {
      if (!activeIds.has(node.dataset.liveInviteId)) removeInviteToast(node.dataset.liveInviteId);
    });

    invites.forEach((invite) => {
      const inviteId = String(invite.id);
      if (toastDismissed.has(inviteId) || document.querySelector(`[data-live-invite-id="${inviteId}"]`)) return;
      toastSeen.add(inviteId);
      const card = document.createElement('div');
      card.className = 'live-session-toast';
      card.dataset.liveInviteId = inviteId;
      card.innerHTML = `
        <button class="live-session-close" type="button" data-live-action="dismiss-invite" data-invite-id="${esc(inviteId)}">×</button>
        <div class="live-session-toast-head">
          <div class="live-session-toast-title">${esc(t('inviteTitle'))}</div>
        </div>
        <div class="live-session-toast-body">
          <div class="live-session-toast-avatar">${invite.fromAvatarUrl ? `<img src="${esc(invite.fromAvatarUrl)}" alt="avatar">` : esc(initials(invite.fromNickname))}</div>
          <div>
            <div class="live-session-toast-name">${esc(invite.fromNickname || 'Unknown')}</div>
            <div class="live-session-toast-sub">${esc(t('inviteSub'))}</div>
          </div>
        </div>
        <div class="live-session-actions">
          <button class="btn primary" type="button" data-live-action="accept-invite" data-invite-id="${esc(inviteId)}">${esc(t('accept'))}</button>
          <button class="btn ghost" type="button" data-live-action="decline-invite" data-invite-id="${esc(inviteId)}">${esc(t('decline'))}</button>
        </div>
        <div class="live-session-progress"><div class="live-session-progress-bar"></div></div>
      `;
      layer.appendChild(card);
      const bar = card.querySelector('.live-session-progress-bar');
      window.requestAnimationFrame(() => bar?.classList.add('animate'));

      const expiresAt = invite.expiresAt ? new Date(invite.expiresAt).getTime() : Date.now() + 10000;
      const msLeft = Math.max(250, expiresAt - Date.now());
      const timeoutId = window.setTimeout(() => removeInviteToast(inviteId), msLeft + 50);
      toastTimers.set(inviteId, timeoutId);
    });
  }

  function connectCommand(match) {
    if (!match?.serverIp || !match?.serverPort) return null;
    return `steam://connect/${match.serverIp}:${match.serverPort}`;
  }

  async function acceptMatch(publicMatchId) {
    try {
      await api(`/api/matches/${encodeURIComponent(publicMatchId)}/accept`, { method: 'POST' });
      showInlineNotice(t('matchAccepted'));
      matchBannerDismissedFor = null;
      await refresh();
    } catch (err) {
      showInlineNotice(`Match: ${err.message}`, 'error');
      await refresh();
    }
  }

  function statusDescription(match) {
    if (!match) return '';
    if (match.status === 'pending_acceptance') return t('matchPending');
    if (match.status === 'map_voting') return t('matchMap');
    if (match.status === 'server_assigned') return t('matchConnect');
    if (match.status === 'live') return t('matchLive');
    return t('matchFinished');
  }

  function renderMatchBanner() {
    ensureUi();
    const banner = document.getElementById('liveSessionBanner');
    const match = currentMatch;
    if (!currentUser || !match || matchBannerDismissedFor === match.publicMatchId) {
      banner.classList.add('hidden');
      banner.innerHTML = '';
      return;
    }

    const canAccept = match.status === 'pending_acceptance' && !match.accepted;
    const canConnect = ['server_assigned', 'live'].includes(match.status) && !!connectCommand(match);
    const acceptedLabel = `${match.acceptedCount || 0}/${match.totalPlayers || 4} ${t('playersAccepted')}`;
    banner.classList.remove('hidden');
    banner.innerHTML = `
      <button class="live-session-close live-session-banner-close" type="button" data-live-action="dismiss-match">×</button>
      <div class="live-session-banner-main">
        <div class="live-session-banner-badge">M</div>
        <div>
          <div class="live-session-banner-title">${esc(t('matchTitle'))}</div>
          <div class="live-session-banner-sub">${esc(statusDescription(match))}</div>
          <div class="live-session-toast-meta">
            <span class="live-session-mini-pill live">ID ${esc(match.publicMatchId || '—')}</span>
            <span class="live-session-mini-pill ${match.status === 'pending_acceptance' ? 'warn' : 'ok'}">${esc(match.status || 'pending')}</span>
            <span class="live-session-mini-pill">${esc(acceptedLabel)}</span>
            ${match.mapName ? `<span class="live-session-mini-pill">${esc(t('map'))}: ${esc(match.mapName)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="live-session-banner-actions">
        ${canAccept ? `<button class="btn primary" type="button" data-live-action="accept-match" data-match-id="${esc(match.publicMatchId)}">${esc(t('acceptMatch'))}</button>` : ''}
        ${canConnect ? `<a class="btn secondary" href="${esc(connectCommand(match))}">${esc(t('connect'))}</a>` : ''}
        <a class="btn ghost" href="./app.html">${esc(t('viewApp'))}</a>
      </div>
    `;
  }

  async function refresh() {
    if (refreshInFlight) return;
    refreshInFlight = true;
    try {
      const auth = await api('/auth/me').catch(() => ({ user: null }));
      currentUser = auth.user || null;
      if (!currentUser) {
        currentParty = null;
        currentMatch = null;
        renderInviteToasts();
        renderMatchBanner();
        return;
      }
      const [partyData, matchData] = await Promise.all([
        api('/api/party/me').catch(() => ({ party: null })),
        api('/api/matches/me/current').catch(() => ({ match: null }))
      ]);
      currentParty = partyData.party || null;
      currentMatch = matchData.match || null;
      if (!currentMatch) matchBannerDismissedFor = null;
      renderInviteToasts();
      renderMatchBanner();
    } finally {
      refreshInFlight = false;
    }
  }

  function handleClicks(event) {
    const action = event.target.closest('[data-live-action]');
    if (!action) return;
    event.preventDefault();
    const type = action.dataset.liveAction;
    if (type === 'accept-invite') return void acceptInvite(action.dataset.inviteId);
    if (type === 'decline-invite') return void declineInvite(action.dataset.inviteId);
    if (type === 'dismiss-invite') {
      const inviteId = String(action.dataset.inviteId || '');
      toastDismissed.add(inviteId);
      removeInviteToast(inviteId);
      return;
    }
    if (type === 'accept-match') return void acceptMatch(action.dataset.matchId);
    if (type === 'dismiss-match') {
      matchBannerDismissedFor = currentMatch?.publicMatchId || '__none__';
      renderMatchBanner();
    }
  }

  function boot() {
    if (booted) return;
    booted = true;
    ensureUi();
    document.addEventListener('click', handleClicks);
    void refresh();
    timer = window.setInterval(() => void refresh(), POLL_MS);
    window.addEventListener('focus', () => void refresh());
    window.addEventListener('pageshow', () => void refresh());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
  }

  window.TRUST_LIVE_SESSION = { refresh, boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
