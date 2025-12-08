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
