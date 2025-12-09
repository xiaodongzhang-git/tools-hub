// 主题在 localStorage 里的键名
const THEME_KEY = "toolsHubTheme";

function applyTheme(theme, themeToggle) {
  const body = document.body;

  if (theme === "dark") {
    body.classList.add("dark-theme");
    if (themeToggle) {
      themeToggle.textContent = "☀️";
      themeToggle.setAttribute("aria-label", "Switch to light theme");
    }
  } else {
    body.classList.remove("dark-theme");
    if (themeToggle) {
      themeToggle.textContent = "🌙";
      themeToggle.setAttribute("aria-label", "Switch to dark theme");
    }
  }
}

// 初始化布局：侧栏开关、主题开关、高亮导航
function initLayout() {
  const body = document.body;
  const app = document.querySelector(".app");
  const menuButton = document.querySelector(".menu-button");
  const themeToggle = document.querySelector(".theme-toggle");
  const navLinks = document.querySelectorAll(".nav-link[data-path]");

  // 1. 先应用保存的主题（默认 light）
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme, themeToggle);

  // 侧边栏切换（移动端）
  if (menuButton && app) {
    menuButton.addEventListener("click", () => {
      app.classList.toggle("sidebar-open");
    });
  }

  // 夜间模式切换 + 保存到 localStorage
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = body.classList.contains("dark-theme");
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme, themeToggle);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }

  // 当前导航高亮
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const path = link.getAttribute("data-path");
    if (path === currentPath) {
      link.classList.add("active");
    }
  });
}

// 暴露给 include.js 调用
window.initLayout = initLayout;


// 初始化头部日期 + 时间（考虑 header 是异步 include 进来的）
function initHeaderClock(retryCount = 0) {
  const dateEl = document.querySelector("#header-datetime .header-date");
  const timeEl = document.querySelector("#header-datetime .header-time");

  // header 可能还没被 include.js 插入，找不到就稍后重试
  if (!dateEl || !timeEl) {
    if (retryCount < 20) {
      setTimeout(() => initHeaderClock(retryCount + 1), 300);
    }
    return;
  }

  function updateClock() {
    const now = new Date();

    // 日期：例如 "Tue, Dec 9"（用户本地时区）
    const dateStr = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "2-digit",
    });

    // 时间：例如 "21:37"
    const timeStr = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24 小时制，如果想 12 小时就改为 true
    });

    dateEl.textContent = dateStr;
    timeEl.textContent = timeStr;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeaderClock();
});
