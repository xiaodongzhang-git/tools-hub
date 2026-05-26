document.addEventListener("DOMContentLoaded", () => {
  const includeTargets = document.querySelectorAll("[data-include]");
  const INCLUDE_VERSION = "20260526";

  // 没有需要 include 的，直接初始化布局
  if (includeTargets.length === 0) {
    if (window.initLayout) {
      window.initLayout();
    }
    return;
  }

  let remaining = includeTargets.length;

  includeTargets.forEach((el) => {
    const file = el.getAttribute("data-include");
    if (!file) {
      remaining--;
      return;
    }

    const url = file.includes("?") ? `${file}&v=${INCLUDE_VERSION}` : `${file}?v=${INCLUDE_VERSION}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        return res.text();
      })
      .then((html) => {
        el.innerHTML = html;
      })
      .catch((err) => {
        console.error(err);
        el.innerHTML = "";
      })
      .finally(() => {
        remaining--;
        if (remaining === 0 && window.initLayout) {
          window.initLayout();
        }
      });
  });

  // include.js 里加载完 sidebar 后
  const currentPath = location.pathname.split("/").pop() || "";
  document
    .querySelectorAll(".nav-link[data-path]")
    .forEach((link) => {
      if (link.getAttribute("data-path") === currentPath) {
        link.classList.add("active"); // 或 is-active
      }
    });

});
