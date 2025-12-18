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
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
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
  const currentPath = window.location.pathname.split("/").pop() || "";

  navLinks.forEach((link) => {
    const path = link.getAttribute("data-path");
    if (path === currentPath) {
      link.classList.add("active");
    }
  });

  initActiveLinkAndOpenGroup();
  initToolSearch();
  initRecentTools();
  initMobileAutoClose();
  initAccordionGroups();
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



const RECENT_KEY = "toolsHubRecent";
const MAX_RECENT = 5;

function getCurrentPath() {
  return window.location.pathname.split("/").pop() || "";
}

function initActiveLinkAndOpenGroup() {
  const currentPath = getCurrentPath();
  const navLinks = document.querySelectorAll(".nav-link[data-path]");

  navLinks.forEach((link) => {
    const path = link.getAttribute("data-path");
    if (path === currentPath) {
      link.classList.add("active");
      // 自动展开所在 group
      const group = link.closest(".nav-group");
      if (group) group.open = true;
    }
  });
}

function initRecentTools() {
  const currentPath = getCurrentPath();
  const links = Array.from(document.querySelectorAll(".nav-link[data-path]"));

  function getMetaByPath(path) {
    const a = links.find((x) => x.getAttribute("data-path") === path);
    if (!a) return null;
    return { path, title: (a.textContent || "").trim(), href: a.getAttribute("href") };
  }

  // 记录点击
  links.forEach((a) => {
    a.addEventListener("click", () => {
      const path = a.getAttribute("data-path");
      const meta = getMetaByPath(path);
      if (!meta) return;

      const raw = localStorage.getItem(RECENT_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const next = [meta, ...arr.filter((x) => x.path !== meta.path)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));

      // 移动端：点了就关侧栏
      const app = document.querySelector(".app");
      if (app && app.classList.contains("sidebar-open")) {
        app.classList.remove("sidebar-open");
      }
    });
  });

  // 渲染
  const recentSection = document.querySelector("#recent-section");
  const recentList = document.querySelector("#recent-list");
  if (!recentSection || !recentList) return;

  const raw = localStorage.getItem(RECENT_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  const filtered = arr
    .map((x) => getMetaByPath(x.path))
    .filter(Boolean)
    .filter((x) => x.path !== currentPath);

  if (filtered.length === 0) return;

  recentList.innerHTML = filtered
    .slice(0, 3)
    .map(
      (x) =>
        `<li class="nav-item"><a class="nav-link" href="${x.href}" data-path="${x.path}">${x.title}</a></li>`
    )
    .join("");

  recentSection.hidden = false;
}

function initToolSearch() {
  const input = document.querySelector(".tool-search");
  const clearBtn = document.querySelector(".tool-search-clear");
  const searchWrap = document.querySelector(".sidebar-search");
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  const items = Array.from(document.querySelectorAll(".nav-item"));
  const links = Array.from(document.querySelectorAll(".nav-link[data-path]"));

  if (!input || !clearBtn || !searchWrap) return;

  function setWrapState() {
    if (input.value.trim()) searchWrap.classList.add("has-value");
    else searchWrap.classList.remove("has-value");
  }

  function applyFilter(q) {
    const query = q.trim().toLowerCase();

    // 先清理
    links.forEach((a) => a.classList.remove("search-hit"));
    items.forEach((li) => (li.style.display = ""));
    groups.forEach((g) => (g.style.display = ""));

    if (!query) return;

    // 匹配项显示，不匹配隐藏
    const hitGroups = new Set();

    items.forEach((li) => {
      const a = li.querySelector(".nav-link");
      const text = (a?.textContent || "").toLowerCase();

      if (text.includes(query)) {
        a.classList.add("search-hit");
        const group = li.closest(".nav-group");
        if (group) {
          hitGroups.add(group);
          group.open = true;
        }
      } else {
        li.style.display = "none";
      }
    });

    // 没命中的 group 整个隐藏（更清爽）
    groups.forEach((g) => {
      if (!hitGroups.has(g)) g.style.display = "none";
    });
  }

  input.addEventListener("input", () => {
    setWrapState();
    applyFilter(input.value);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    setWrapState();
    applyFilter("");
    input.focus();
  });

  setWrapState();
}

function initMobileAutoClose() {
  const app = document.querySelector(".app");
  if (!app) return;

  document.addEventListener("click", (e) => {
    const a = e.target.closest?.(".nav-link");
    if (!a) return;

    if (app.classList.contains("sidebar-open")) {
      app.classList.remove("sidebar-open");
    }
  });
}

function initAccordionGroups() {
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  const search = document.querySelector(".tool-search");
  if (groups.length === 0) return;

  const isSearching = () => !!(search && search.value.trim());

  // ✅ 关键：初始化时就修正“只开一个”
  const activeLink = document.querySelector(".nav-link.active, .nav-link.is-active");
  const activeGroup = activeLink?.closest(".nav-group");

  const keep =
    activeGroup ||
    groups.find((g) => g.open) ||
    groups[0];

  groups.forEach((g) => {
    g.open = (g === keep);
  });

  // 用户点击时：打开一个，自动关其他
  groups.forEach((g) => {
    g.addEventListener("toggle", () => {
      if (isSearching()) return;
      if (!g.open) return;
      groups.forEach((other) => {
        if (other !== g) other.open = false;
      });
    });
  });
}
