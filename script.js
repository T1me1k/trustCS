const API_BASE = "https://trust-backend-production-e1d1.up.railway.app";

const onlineCountEl = document.getElementById("onlineCount");
const serverStateEl = document.getElementById("serverState");

const statusServerTextEl = document.getElementById("statusServerText");
const statusServerSubEl = document.getElementById("statusServerSub");
const statusPlayersTextEl = document.getElementById("statusPlayersText");
const statusMotdEl = document.getElementById("statusMotd");
const latestVersionEl = document.getElementById("latestVersion");
const minVersionEl = document.getElementById("minVersion");
const copyBackendBtn = document.getElementById("copyBackendBtn");

const authGuestBlock = document.getElementById("authGuestBlock");
const authUserBlock = document.getElementById("authUserBlock");
const trustUserAvatar = document.getElementById("trustUserAvatar");
const trustUserName = document.getElementById("trustUserName");
const trustUserSteamId = document.getElementById("trustUserSteamId");
const trustUserProfile = document.getElementById("trustUserProfile");
const linkLauncherBtn = document.getElementById("linkLauncherBtn");
const launcherLinkStatus = document.getElementById("launcherLinkStatus");
const trustLogoutBtn = document.getElementById("trustLogoutBtn");
const copySteamIdBtn = document.getElementById("copySteamIdBtn");

const authStateBadge = document.getElementById("authStateBadge");
const launcherStateBadge = document.getElementById("launcherStateBadge");
const accountSessionValue = document.getElementById("accountSessionValue");
const accountLauncherValue = document.getElementById("accountLauncherValue");
const accountProfileValue = document.getElementById("accountProfileValue");

const langToggleBtn = document.getElementById("langToggle");

let currentUser = null;
let currentLang = localStorage.getItem("trust_lang") || "en";

const translations = {
  en: {
    navModes: "Modes",
    navStatus: "Status",
    navAccount: "Account",
    navDownload: "Download",
    navRoadmap: "Roadmap",
    navFaq: "FAQ",
    downloadBtnTop: "Download",
    heroBadge: "Competitive launcher for CS:GO duos and teams",
    heroTitle: "Queue smarter.<br />Play better.<br />Win with TRUST.",
    heroText: "TRUST brings launcher UX, live queue flow, real match accept, and focused 2x2 / 5x5 matchmaking into one competitive platform.",
    heroPrimaryBtn: "Download launcher",
    heroSecondaryBtn: "Live status",
    statOnlineLabel: "Players online",
    statServerLabel: "Server",
    statModesLabel: "Modes",
    statusKicker: "Live backend status",
    statusTitle: "Current platform status",
    statusServer: "Server status",
    statusPlayers: "Players online",
    statusPlayersSub: "Real-time online from backend",
    statusMotdLabel: "Message of the day",
    statusMotdSub: "Live config from TRUST backend",
    modesKicker: "Focused matchmaking",
    modesTitle: "Two clear competitive modes",
    mode2Title: "2x2 Partners",
    mode2Text: "Fast competitive queue built around partner play, tight coordination, and repeatable matchmaking.",
    mode5Title: "5x5 Classic",
    mode5Text: "Standard team-based competitive format for full squads and structured matches.",
    modeFlowTitle: "Live match flow",
    modeFlowText: "Search, find match, accept or decline, wait for players, and move into a live lobby state.",
    previewText: "Real queue flow, accept / decline, live lobby, online count, and focused competitive modes.",
    previewMode2: "Partners queue",
    previewMode5: "Classic team queue",
    previewSearchBtn: "Start Search",
    downloadKicker: "Launcher build",
    downloadTitle: "Download TRUST launcher",
    downloadCardTitle: "Windows launcher",
    downloadCardText: "Download the current TRUST launcher build and start testing 2x2 / 5x5 matchmaking.",
    downloadVersionLabel: "Latest version",
    downloadSupportLabel: "Min supported",
    downloadLauncherBtn: "Download .zip",
    copyBackendBtn: "Copy backend URL",
    installTitle: "Install guide",
    install1: "Download the launcher archive.",
    install2: "Extract it into a separate folder.",
    install3: "Run the launcher and choose 2x2 or 5x5.",
    install4: "Start queue and test live matchmaking.",
    roadmapKicker: "Roadmap",
    roadmapTitle: "What comes next",
    road1Title: "Launcher identity",
    road1Text: "Persistent nickname, permanent client ID, and cleaner lobby flow.",
    road2Title: "Website account layer",
    road2Text: "Steam login, profile dashboard, launcher linking, and account sync.",
    road3Title: "Competitive systems",
    road3Text: "Ratings, profile stats, history, and stronger matchmaking logic.",
    faqTitle: "Common questions",
    q1: "Does the website already require Steam login?",
    a1: "Not yet. The current stage focuses on launcher UX, backend queue flow, and live matchmaking.",
    q2: "Is the online counter real?",
    a2: "Yes. The website reads live health and online data from the TRUST backend.",
    q3: "What modes are available now?",
    a3: "Right now the platform is focused on two modes only: 2x2 and 5x5."
  },
  ru: {
    navModes: "Режимы",
    navStatus: "Статус",
    navAccount: "Аккаунт",
    navDownload: "Скачать",
    navRoadmap: "План",
    navFaq: "FAQ",
    downloadBtnTop: "Скачать",
    heroBadge: "Соревновательный лаунчер для CS:GO 2x2 и 5x5",
    heroTitle: "Ищи матч умнее.<br />Играй лучше.<br />Побеждай с TRUST.",
    heroText: "TRUST объединяет лаунчер, живой поиск матча, accept / decline и соревновательные режимы 2x2 / 5x5 в одной платформе.",
    heroPrimaryBtn: "Скачать лаунчер",
    heroSecondaryBtn: "Live статус",
    statOnlineLabel: "Игроков онлайн",
    statServerLabel: "Сервер",
    statModesLabel: "Режимы",
    statusKicker: "Live статус backend",
    statusTitle: "Текущее состояние платформы",
    statusServer: "Состояние сервера",
    statusPlayers: "Игроков онлайн",
    statusPlayersSub: "Онлайн в реальном времени с backend",
    statusMotdLabel: "Сообщение дня",
    statusMotdSub: "Live config из TRUST backend",
    modesKicker: "Сфокусированный матчмейкинг",
    modesTitle: "Два чётких соревновательных режима",
    mode2Title: "2x2 Партнёры",
    mode2Text: "Быстрый соревновательный поиск для игры в паре, координации и стабильного матчмейкинга.",
    mode5Title: "5x5 Классика",
    mode5Text: "Стандартный командный соревновательный формат для полных составов.",
    modeFlowTitle: "Живой flow матча",
    modeFlowText: "Поиск, найденный матч, accept / decline, ожидание игроков и переход в lobby state.",
    previewText: "Реальный queue flow, accept / decline, live lobby, online count и соревновательные режимы.",
    previewMode2: "Партнёрский поиск",
    previewMode5: "Классический командный",
    previewSearchBtn: "Начать поиск",
    downloadKicker: "Сборка лаунчера",
    downloadTitle: "Скачать TRUST launcher",
    downloadCardTitle: "Windows launcher",
    downloadCardText: "Скачай текущую сборку TRUST launcher и начни тестировать matchmaking 2x2 / 5x5.",
    downloadVersionLabel: "Последняя версия",
    downloadSupportLabel: "Минимальная версия",
    downloadLauncherBtn: "Скачать .zip",
    copyBackendBtn: "Скопировать backend URL",
    installTitle: "Инструкция по установке",
    install1: "Скачай архив лаунчера.",
    install2: "Распакуй его в отдельную папку.",
    install3: "Запусти лаунчер и выбери 2x2 или 5x5.",
    install4: "Начни поиск и протестируй live matchmaking.",
    roadmapKicker: "План",
    roadmapTitle: "Что дальше",
    road1Title: "Идентичность лаунчера",
    road1Text: "Постоянный nickname, постоянный client ID и более чистый lobby flow.",
    road2Title: "Аккаунт на сайте",
    road2Text: "Steam login, профиль, linking лаунчера и account sync.",
    road3Title: "Соревновательные системы",
    road3Text: "Рейтинг, статистика профиля, история и более сильный matchmaking.",
    faqTitle: "Частые вопросы",
    q1: "Нужен ли уже сейчас Steam login на сайте?",
    a1: "Пока основной фокус — UX лаунчера, queue flow backend и live matchmaking.",
    q2: "Онлайн-счётчик настоящий?",
    a2: "Да. Сайт читает live health и online data напрямую из TRUST backend.",
    q3: "Какие режимы сейчас доступны?",
    a3: "Сейчас платформа сфокусирована только на двух режимах: 2x2 и 5x5."
  }
};

function applyTranslations() {
  const dict = translations[currentLang] || translations.en;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!dict[key]) return;

    if (el.tagName === "H1" || el.innerHTML.includes("<br")) {
      el.innerHTML = dict[key];
    } else {
      el.textContent = dict[key];
    }
  });

  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang === "en" ? "RU" : "EN";
  }

  document.documentElement.lang = currentLang;
}

function bindLanguageToggle() {
  if (!langToggleBtn) return;

  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ru" : "en";
    localStorage.setItem("trust_lang", currentLang);
    applyTranslations();
  });
}

async function startLauncherLink() {
  return fetchJson(`${API_BASE}/launcher/link/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || data.details || `HTTP ${response.status}`);
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

async function updateLiveStatus() {
  try {
    const data = await fetchJson(`${API_BASE}/health`);
    const onlineCount = String(data.onlineCount ?? 0);
    const serverText = data.status === "online" ? "ONLINE" : "DEGRADED";

    if (onlineCountEl) onlineCountEl.textContent = onlineCount;
    if (serverStateEl) serverStateEl.textContent = serverText;
    if (statusServerTextEl) statusServerTextEl.textContent = serverText;
    if (statusServerSubEl) {
      statusServerSubEl.textContent =
        data.database === "connected" ? "Database connected" : "Database disconnected";
    }
    if (statusPlayersTextEl) statusPlayersTextEl.textContent = onlineCount;
  } catch (err) {
    console.error("updateLiveStatus error:", err);
    if (onlineCountEl) onlineCountEl.textContent = "0";
    if (serverStateEl) serverStateEl.textContent = "OFFLINE";
    if (statusServerTextEl) statusServerTextEl.textContent = "OFFLINE";
    if (statusServerSubEl) statusServerSubEl.textContent = "Backend unreachable";
    if (statusPlayersTextEl) statusPlayersTextEl.textContent = "0";
  }
}

async function updateConfig() {
  try {
    const data = await fetchJson(`${API_BASE}/config`);
    const config = data.config || {};

    if (statusMotdEl) statusMotdEl.textContent = config.motd || "Welcome to TRUST";
    if (latestVersionEl) latestVersionEl.textContent = config.latestVersion || "0.1.0";
    if (minVersionEl) minVersionEl.textContent = config.minSupportedVersion || "0.1.0";
  } catch (err) {
    console.error("updateConfig error:", err);
    if (statusMotdEl) statusMotdEl.textContent = "Config unavailable";
  }
}

function setGuestMode(reason = "") {
  currentUser = null;

  if (authGuestBlock) authGuestBlock.style.display = "";
  if (authUserBlock) authUserBlock.style.display = "none";

  if (authStateBadge) authStateBadge.textContent = reason ? `Guest session (${reason})` : "Guest session";
  if (launcherStateBadge) launcherStateBadge.textContent = "Launcher link unavailable";
  if (accountSessionValue) accountSessionValue.textContent = "Guest";
  if (accountLauncherValue) accountLauncherValue.textContent = "Login required";
  if (accountProfileValue) accountProfileValue.textContent = "Hidden";
}

function setUserMode(user) {
  currentUser = user;

  if (authGuestBlock) authGuestBlock.style.display = "none";
  if (authUserBlock) authUserBlock.style.display = "";

  if (authStateBadge) authStateBadge.textContent = "Steam authorized";
  if (launcherStateBadge) launcherStateBadge.textContent = "Ready to link launcher";

  if (trustUserAvatar) {
    if (user.avatar_full_url) {
      trustUserAvatar.src = user.avatar_full_url;
      trustUserAvatar.style.display = "block";
    } else {
      trustUserAvatar.style.display = "none";
    }
  }

  if (trustUserName) trustUserName.textContent = user.persona_name || `Steam ${user.steam_id}`;
  if (trustUserSteamId) trustUserSteamId.textContent = `Steam ID: ${user.steam_id || "—"}`;

  if (trustUserProfile) {
    trustUserProfile.href = user.profile_url || `https://steamcommunity.com/profiles/${user.steam_id}`;
  }

  if (accountSessionValue) accountSessionValue.textContent = "Authorized";
  if (accountLauncherValue) accountLauncherValue.textContent = "Available";
  if (accountProfileValue) accountProfileValue.textContent = "Steam synced";
}

async function fetchAuthMe() {
  return fetchJson(`${API_BASE}/auth/me`);
}

async function logoutTrust() {
  return fetchJson(`${API_BASE}/auth/logout`, { method: "POST" });
}

function setLinkStatus(text) {
  if (launcherLinkStatus) launcherLinkStatus.textContent = text || "";
}

async function initAuthUi() {
  try {
    if (authStateBadge) authStateBadge.textContent = "Checking session...";
    const data = await fetchAuthMe();

    if (!data.user) {
      setGuestMode("no user");
      return;
    }

    setUserMode(data.user);
  } catch (err) {
    console.error("initAuthUi error:", err);

    if (err.status === 401) {
      setGuestMode("401");
      setLinkStatus("Not logged in on website session.");
    } else {
      setGuestMode("error");
      setLinkStatus(`Account load failed: ${err.message || "unknown error"}`);
    }
  }
}

function bindLinkCodeActions() {
  if (linkLauncherBtn) {
    linkLauncherBtn.addEventListener("click", async () => {
      setLinkStatus("Preparing launcher link...");

      try {
        const result = await startLauncherLink();

        if (!result.ok || !result.launchUrl) {
          setLinkStatus("Failed to start launcher linking.");
          return;
        }

        setLinkStatus("Opening TRUST launcher...");
        if (launcherStateBadge) launcherStateBadge.textContent = "Launcher opening...";

        window.location.href = result.launchUrl;

        setTimeout(() => {
          setLinkStatus("If nothing opened, make sure TRUST launcher is installed.");
          if (launcherStateBadge) launcherStateBadge.textContent = "Waiting for launcher";
        }, 1500);
      } catch (err) {
        console.error("startLauncherLink error:", err);
        setLinkStatus(err.message || "Failed to start launcher linking.");
        if (launcherStateBadge) launcherStateBadge.textContent = "Launcher link failed";
      }
    });
  }

  if (trustLogoutBtn) {
    trustLogoutBtn.addEventListener("click", async () => {
      try {
        await logoutTrust();
        window.location.href = window.location.pathname;
      } catch (err) {
        console.error("logout error:", err);
      }
    });
  }

  if (copyBackendBtn) {
    copyBackendBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(API_BASE);
        copyBackendBtn.textContent = "Copied";
        setTimeout(() => {
          copyBackendBtn.textContent = currentLang === "ru" ? "Скопировать backend URL" : "Copy backend URL";
        }, 1500);
      } catch (err) {
        console.error("copy backend error:", err);
      }
    });
  }

  if (copySteamIdBtn) {
    copySteamIdBtn.addEventListener("click", async () => {
      if (!currentUser?.steam_id) return;

      try {
        await navigator.clipboard.writeText(currentUser.steam_id);
        copySteamIdBtn.textContent = "Copied";
        setTimeout(() => {
          copySteamIdBtn.textContent = "Copy Steam ID";
        }, 1500);
      } catch (err) {
        console.error("copy steam id error:", err);
      }
    });
  }
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".faq-item")?.classList.toggle("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  applyTranslations();
  bindLanguageToggle();
  bindLinkCodeActions();
  initSmoothScroll();
  bindFaq();

  await updateLiveStatus();
  await updateConfig();
  await initAuthUi();

  setInterval(updateLiveStatus, 10000);
  setInterval(updateConfig, 30000);
});