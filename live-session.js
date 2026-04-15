
(() => {
  const BACKEND_BASE_URL = (() => {
    const fromWindow = window.TRUST_BACKEND_BASE_URL;
    const fromMeta = document.querySelector('meta[name="trust-backend-url"]')?.content;
    const fromStorage = window.localStorage.getItem('trust_backend_base_url');
    return (fromWindow || fromMeta || fromStorage || 'https://YOUR-BACKEND.up.railway.app').replace(/\/+$/, '');
  })();

  const state = {
    started: false,
    user: null,
    party: null,
    match: null,
    stats: null,
    lastInviteIds: new Set(),
    lastMatchState: null,
    pollTimer: null,
    busy: false
  };

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));
  }

  async function api(path, options = {}) {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `request_failed_${response.status}`);
    return data;
  }

  function ensureShell() {
    if (document.getElementById('liveSessionRoot')) return;
    const root = el('div');
    root.id = 'liveSessionRoot';
    root.innerHTML = `
      <div id="liveToastStack" class="live-toast-stack"></div>
      <div id="liveOverlay" class="live-overlay hidden">
        <div class="live-backdrop"></div>
        <div class="live-modal-card">
          <div class="live-modal-head">
            <div>
              <div class="live-modal-title" id="liveModalTitle">TRUST</div>
              <div class="live-modal-subtitle" id="liveModalSubtitle">Live update</div>
            </div>
            <button type="button" class="live-close-btn" id="liveModalClose">✕</button>
          </div>
          <div id="liveModalBody" class="live-modal-body"></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.querySelector('#liveModalClose')?.addEventListener('click', closeModal);
    root.querySelector('.live-backdrop')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    document.getElementById('liveOverlay')?.classList.add('hidden');
  }

  function openModal(title, subtitle, bodyHtml) {
    ensureShell();
    document.getElementById('liveModalTitle').textContent = title || 'TRUST';
    document.getElementById('liveModalSubtitle').textContent = subtitle || '';
    document.getElementById('liveModalBody').innerHTML = bodyHtml || '';
    document.getElementById('liveOverlay')?.classList.remove('hidden');
  }

  function pushToast(id, html, sticky = false) {
    ensureShell();
    const stack = document.getElementById('liveToastStack');
    if (!stack || document.querySelector(`[data-live-toast-id="${id}"]`)) return;
    const toast = el('div', 'live-toast-card', html);
    toast.dataset.liveToastId = id;
    stack.appendChild(toast);
    if (!sticky) {
      window.setTimeout(() => toast.remove(), 6000);
    }
    return toast;
  }

  function connectString(match) {
    const room = match?.room || {};
    const server = room.server || {};
    if (!server.ip || !server.port) return 'Сервер ещё назначается';
    return `connect ${server.ip}:${server.port}${server.password ? `; password ${server.password}` : ''}`;
  }

  async function acceptInvite(inviteId, btn) {
    if (btn) btn.disabled = true;
    try {
      await api(`/api/party/invite/${encodeURIComponent(inviteId)}/accept`, { method: 'POST' });
      closeModal();
      await refresh();
    } catch (error) {
      alert(`Не удалось принять инвайт: ${error.message}`);
      if (btn) btn.disabled = false;
    }
  }

  async function declineInvite(inviteId, btn) {
    if (btn) btn.disabled = true;
    try {
      await api(`/api/party/invite/${encodeURIComponent(inviteId)}/decline`, { method: 'POST' });
      closeModal();
      await refresh();
    } catch (error) {
      alert(`Не удалось отклонить инвайт: ${error.message}`);
      if (btn) btn.disabled = false;
    }
  }

  async function acceptMatch(publicMatchId, btn) {
    if (btn) btn.disabled = true;
    try {
      await api(`/api/matches/${encodeURIComponent(publicMatchId)}/accept`, { method: 'POST' });
      await refresh(true);
    } catch (error) {
      alert(`Не удалось принять матч: ${error.message}`);
      if (btn) btn.disabled = false;
    }
  }

  async function voteMap(publicMatchId, mapName, btn) {
    if (btn) btn.disabled = true;
    try {
      await api(`/api/matches/${encodeURIComponent(publicMatchId)}/map-vote`, {
        method: 'POST',
        body: JSON.stringify({ mapName })
      });
      await refresh(true);
    } catch (error) {
      alert(`Не удалось выбрать карту: ${error.message}`);
      if (btn) btn.disabled = false;
    }
  }

  function bindModalActions() {
    const body = document.getElementById('liveModalBody');
    if (!body) return;
    body.querySelectorAll('[data-live-accept-invite]').forEach((btn) => btn.addEventListener('click', () => acceptInvite(btn.dataset.liveAcceptInvite, btn)));
    body.querySelectorAll('[data-live-decline-invite]').forEach((btn) => btn.addEventListener('click', () => declineInvite(btn.dataset.liveDeclineInvite, btn)));
    body.querySelectorAll('[data-live-accept-match]').forEach((btn) => btn.addEventListener('click', () => acceptMatch(btn.dataset.liveAcceptMatch, btn)));
    body.querySelectorAll('[data-live-vote-map]').forEach((btn) => btn.addEventListener('click', () => voteMap(btn.dataset.liveMatchId, btn.dataset.liveVoteMap, btn)));
    body.querySelectorAll('[data-live-open-app]').forEach((btn) => btn.addEventListener('click', () => { window.location.href = './app.html'; }));
  }

  function renderInviteModal(invite) {
    openModal(
      'Инвайт в party',
      'Можно принять прямо на этой странице',
      `
        <div class="live-info-line">Игрок <strong>${esc(invite.fromNickname || invite.fromUserNickname || 'Unknown')}</strong> приглашает тебя в duo.</div>
        <div class="live-modal-actions">
          <button type="button" class="btn primary" data-live-accept-invite="${esc(invite.id)}">Принять</button>
          <button type="button" class="btn ghost" data-live-decline-invite="${esc(invite.id)}">Отклонить</button>
          <button type="button" class="btn secondary" data-live-open-app>Открыть app</button>
        </div>`
    );
    bindModalActions();
  }

  function renderMatchModal(match) {
    const room = match.room || {};
    const canAccept = room.actions?.canAccept || (match.status === 'pending_acceptance' && !match.accepted);
    const canVoteMap = room.actions?.canVoteMap || (['map_voting', 'server_assigned'].includes(match.status) && !match.mapName);
    let body = `
      <div class="live-match-grid">
        <div class="live-stat-card"><span>Статус</span><strong>${esc(room.statusText || match.status || '—')}</strong></div>
        <div class="live-stat-card"><span>Приняли</span><strong>${esc(`${match.acceptedCount || room.counts?.accepted || 0}/${match.totalPlayers || room.counts?.totalPlayers || 4}`)}</strong></div>
        <div class="live-stat-card"><span>Матч</span><strong>${esc(match.publicMatchId || match.matchId || '—')}</strong></div>
      </div>`;

    if (canAccept) {
      body += `<div class="live-modal-actions"><button type="button" class="btn primary" data-live-accept-match="${esc(match.publicMatchId)}">Принять матч</button><button type="button" class="btn secondary" data-live-open-app>Открыть app</button></div>`;
    } else if (canVoteMap) {
      const maps = Array.isArray(match.mapPool) ? match.mapPool : ['shortdust', 'lake', 'overpass', 'vertigo', 'nuke'];
      body += `<div class="live-info-line">Все приняли матч. Выбери карту прямо здесь:</div><div class="live-map-grid">${maps.map((map) => `<button type="button" class="btn secondary block" data-live-match-id="${esc(match.publicMatchId)}" data-live-vote-map="${esc(map)}">${esc(map)}</button>`).join('')}</div>`;
    } else if (match.mapName) {
      body += `<div class="live-info-line">Карта: <strong>${esc(match.mapName)}</strong></div>`;
    }

    if (['server_assigned', 'live'].includes(match.status)) {
      body += `<div class="live-connect-box"><div class="live-connect-label">Connect</div><code>${esc(connectString(match))}</code></div>`;
      body += `<div class="live-modal-actions"><button type="button" class="btn secondary" data-live-open-app>Открыть Match Room</button></div>`;
    }

    openModal('Матч найден', 'Матч доступен на любой странице', body);
    bindModalActions();
  }

  function updateStatsBadges() {
    const stats = state.stats || {};
    const searchingPlayers = Number(stats.searchingPlayers || 0);
    const activeMatches = Number(stats.activeMatches || 0);
    document.querySelectorAll('[data-live-searching-count]').forEach((node) => { node.textContent = searchingPlayers; });
    document.querySelectorAll('[data-live-active-matches]').forEach((node) => { node.textContent = activeMatches; });
  }

  function maybeShowInviteNotice() {
    const invites = state.party?.pendingInvites || [];
    const currentIds = new Set(invites.map((invite) => String(invite.id)));
    invites.forEach((invite) => {
      const inviteId = String(invite.id);
      if (state.lastInviteIds.has(inviteId)) return;
      pushToast(`invite-${inviteId}`, `
        <div class="live-toast-title">Новый инвайт в party</div>
        <div class="live-toast-text">${esc(invite.fromNickname || invite.fromUserNickname || 'Игрок')} приглашает тебя в duo.</div>
        <div class="live-toast-actions"><button type="button" class="btn secondary live-toast-open">Открыть</button></div>
      `, true)?.querySelector('.live-toast-open')?.addEventListener('click', () => renderInviteModal(invite));
    });
    state.lastInviteIds = currentIds;
  }

  function maybeShowMatchNotice(forceModal = false) {
    const match = state.match;
    const currentKey = match ? `${match.publicMatchId}:${match.status}:${match.mapName || ''}:${match.acceptedCount || 0}` : null;
    const changed = currentKey && currentKey !== state.lastMatchState;
    if (match && (forceModal || changed)) {
      pushToast(`match-${match.publicMatchId}-${match.status}`, `
        <div class="live-toast-title">Матч найден</div>
        <div class="live-toast-text">${esc((match.room && match.room.statusText) || match.status || 'Матч готов')}</div>
        <div class="live-toast-actions"><button type="button" class="btn secondary live-toast-open">Открыть</button></div>
      `, true)?.querySelector('.live-toast-open')?.addEventListener('click', () => renderMatchModal(match));
      if (forceModal || match.status === 'pending_acceptance' || match.status === 'map_voting') {
        renderMatchModal(match);
      }
    }
    state.lastMatchState = currentKey;
  }

  async function refresh(forceModal = false) {
    if (state.busy) return;
    state.busy = true;
    try {
      const [auth, party, match, stats] = await Promise.allSettled([
        api('/auth/me'),
        api('/api/party/me'),
        api('/api/matches/me/current'),
        api('/api/queue/stats')
      ]);
      state.user = auth.status === 'fulfilled' ? (auth.value.user || null) : null;
      state.party = party.status === 'fulfilled' ? (party.value.party || null) : null;
      state.match = match.status === 'fulfilled' ? (match.value.match || null) : null;
      if (state.match && Array.isArray(match.value.mapPool)) state.match.mapPool = match.value.mapPool;
      state.stats = stats.status === 'fulfilled' ? (stats.value.stats || null) : null;
      updateStatsBadges();
      if (!state.user) return;
      maybeShowInviteNotice();
      maybeShowMatchNotice(forceModal);
    } finally {
      state.busy = false;
    }
  }

  function start() {
    if (state.started) return;
    state.started = true;
    ensureShell();
    void refresh();
    state.pollTimer = window.setInterval(() => { void refresh(); }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
