const API_BASE = "https://trust-backend-production-e1d1.up.railway.app";

const healthValue = document.getElementById("healthValue");
const onlineValue = document.getElementById("onlineValue");

const authGuestBlock = document.getElementById("authGuestBlock");
const authUserBlock = document.getElementById("authUserBlock");
const trustUserAvatar = document.getElementById("trustUserAvatar");
const trustUserName = document.getElementById("trustUserName");
const trustUserProfile = document.getElementById("trustUserProfile");
const launcherLinkCodeInput = document.getElementById("launcherLinkCodeInput");
const launcherLinkConfirmBtn = document.getElementById("launcherLinkConfirmBtn");
const launcherLinkStatus = document.getElementById("launcherLinkStatus");
const trustLogoutBtn = document.getElementById("trustLogoutBtn");

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
    throw new Error(data.error || data.details || `HTTP ${response.status}`);
  }

  return data;
}

async function updateLiveStatus() {
  try {
    const data = await fetchJson(`${API_BASE}/health`);

    if (healthValue) {
      healthValue.textContent = data.status === "online" ? "ONLINE" : "DEGRADED";
    }

    if (onlineValue) {
      onlineValue.textContent = String(data.onlineCount ?? 0);
    }
  } catch (err) {
    console.error("updateLiveStatus error:", err);

    if (healthValue) {
      healthValue.textContent = "OFFLINE";
    }

    if (onlineValue) {
      onlineValue.textContent = "0";
    }
  }
}

function setGuestMode() {
  if (authGuestBlock) authGuestBlock.style.display = "";
  if (authUserBlock) authUserBlock.style.display = "none";
}

function setUserMode(user) {
  if (authGuestBlock) authGuestBlock.style.display = "none";
  if (authUserBlock) authUserBlock.style.display = "";

  if (trustUserAvatar) {
    trustUserAvatar.src = user.avatar_full_url || "";
    trustUserAvatar.style.display = user.avatar_full_url ? "block" : "none";
  }

  if (trustUserName) {
    trustUserName.textContent = user.persona_name || `Steam ${user.steam_id}`;
  }

  if (trustUserProfile) {
    trustUserProfile.href =
      user.profile_url || `https://steamcommunity.com/profiles/${user.steam_id}`;
  }
}

async function fetchAuthMe() {
  return fetchJson(`${API_BASE}/auth/me`);
}

async function logoutTrust() {
  return fetchJson(`${API_BASE}/auth/logout`, {
    method: "POST"
  });
}

async function confirmLauncherLink(code) {
  return fetchJson(`${API_BASE}/launcher/link/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  });
}

function setLinkStatus(text) {
  if (launcherLinkStatus) {
    launcherLinkStatus.textContent = text || "";
  }
}

async function initAuthUi() {
  try {
    const data = await fetchAuthMe();

    if (!data.authenticated || !data.user) {
      setGuestMode();
      return;
    }

    setUserMode(data.user);
  } catch (err) {
    console.error("initAuthUi error:", err);
    setGuestMode();
  }
}

function bindLinkCodeActions() {
  if (launcherLinkConfirmBtn && launcherLinkCodeInput) {
    launcherLinkConfirmBtn.addEventListener("click", async () => {
      const code = launcherLinkCodeInput.value.trim().toUpperCase();

      if (!code) {
        setLinkStatus("Enter launcher code first.");
        return;
      }

      setLinkStatus("Linking...");

      try {
        const result = await confirmLauncherLink(code);

        if (result.alreadyLinked) {
          setLinkStatus("This launcher is already linked.");
        } else {
          setLinkStatus("Launcher linked successfully.");
        }

        launcherLinkCodeInput.value = "";
      } catch (err) {
        console.error("confirmLauncherLink error:", err);
        setLinkStatus(err.message || "Link failed.");
      }
    });

    launcherLinkCodeInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        launcherLinkConfirmBtn.click();
      }
    });
  }

  if (trustLogoutBtn) {
    trustLogoutBtn.addEventListener("click", async () => {
      try {
        await logoutTrust();
        window.location.href = "/";
      } catch (err) {
        console.error("logout error:", err);
      }
    });
  }
}

function handleLoginQueryStatus() {
  const url = new URL(window.location.href);
  const login = url.searchParams.get("login");

  if (login === "success") {
    setLinkStatus("Steam login successful.");
    window.history.replaceState({}, document.title, url.pathname);
  } else if (login === "error") {
    setLinkStatus("Steam login failed.");
    window.history.replaceState({}, document.title, url.pathname);
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

document.addEventListener("DOMContentLoaded", async () => {
  handleLoginQueryStatus();
  bindLinkCodeActions();
  initSmoothScroll();

  await updateLiveStatus();
  await initAuthUi();

  setInterval(updateLiveStatus, 10000);
});