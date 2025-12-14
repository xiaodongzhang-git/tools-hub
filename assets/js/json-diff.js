(() => {
    const $ = (id) => document.getElementById(id);
  
    const leftEl = $("diff-left");
    const rightEl = $("diff-right");
  
    const leftErr = $("diff-left-error");
    const rightErr = $("diff-right-error");
  
    const btnCompare = $("diff-compare-btn");
    const btnSwap = $("diff-swap-btn");
    const btnFormatLeft = $("diff-format-left-btn");
    const btnFormatRight = $("diff-format-right-btn");
    const btnClear = $("diff-clear-btn");
  
    const optSortKeys = $("diff-sort-keys");
  
    const resultWrap = $("diff-result-wrap");
    const metaEl = $("diff-meta");
    const summaryEl = $("diff-summary");
    const listEl = $("diff-list");
    const btnCopy = $("diff-copy-btn");
  
    let lastResultText = "";
  
    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
  
    function setError(el, msg) {
      el.textContent = msg || "";
    }
  
    function isObject(v) {
      return v !== null && typeof v === "object" && !Array.isArray(v);
    }
  
    function deepSortKeys(value) {
      if (Array.isArray(value)) return value.map(deepSortKeys);
      if (isObject(value)) {
        const out = {};
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        for (const k of keys) out[k] = deepSortKeys(value[k]);
        return out;
      }
      return value;
    }
  
    function tryParseJson(text) {
      const trimmed = (text ?? "").trim();
      if (!trimmed) return { ok: false, error: "Empty JSON" };
      try {
        return { ok: true, value: JSON.parse(trimmed) };
      } catch (e) {
        return { ok: false, error: e?.message || "Invalid JSON" };
      }
    }
  
    function formatTextarea(textarea) {
      const parsed = tryParseJson(textarea.value);
      if (!parsed.ok) return parsed;
      textarea.value = JSON.stringify(parsed.value, null, 2);
      return { ok: true };
    }
  
    function joinPath(base, key) {
      if (typeof key === "number") return `${base}[${key}]`;
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return `${base}.${key}`;
      return `${base}["${String(key).replaceAll('"', '\\"')}"]`;
    }
  
    function diffValues(left, right, path, changes) {
      if (left === right) return;
  
      const leftIsArr = Array.isArray(left);
      const rightIsArr = Array.isArray(right);
  
      if (leftIsArr && rightIsArr) {
        const max = Math.max(left.length, right.length);
        for (let i = 0; i < max; i++) {
          const p = joinPath(path, i);
          if (i >= left.length) {
            changes.push({ type: "added", path: p, before: undefined, after: right[i] });
          } else if (i >= right.length) {
            changes.push({ type: "removed", path: p, before: left[i], after: undefined });
          } else {
            diffValues(left[i], right[i], p, changes);
          }
        }
        return;
      }
  
      if (isObject(left) && isObject(right)) {
        const keySet = new Set([...Object.keys(left), ...Object.keys(right)]);
        const keys = Array.from(keySet).sort((a, b) => a.localeCompare(b));
  
        for (const k of keys) {
          const p = joinPath(path, k);
          if (!(k in left)) {
            changes.push({ type: "added", path: p, before: undefined, after: right[k] });
          } else if (!(k in right)) {
            changes.push({ type: "removed", path: p, before: left[k], after: undefined });
          } else {
            diffValues(left[k], right[k], p, changes);
          }
        }
        return;
      }
  
      changes.push({ type: "changed", path, before: left, after: right });
    }
  
    function prettyValue(v) {
      if (v === undefined) return "undefined";
      if (typeof v === "string") return v.length > 300 ? v.slice(0, 300) + "…" : v;
      try {
        const s = JSON.stringify(v, null, 2);
        return s.length > 1200 ? s.slice(0, 1200) + "\n…" : s;
      } catch {
        return String(v);
      }
    }
  
    function render(changes, leftObj, rightObj) {
        resultWrap.hidden = false;
      
        const added = changes.filter((c) => c.type === "added").length;
        const removed = changes.filter((c) => c.type === "removed").length;
        const changed = changes.filter((c) => c.type === "changed").length;
      
        metaEl.textContent = `Added: ${added}  ·  Removed: ${removed}  ·  Changed: ${changed}  ·  Total: ${changes.length}`;
      
        if (changes.length === 0) {
          summaryEl.innerHTML = `<div class="jsondiff-ok">✅ No differences</div>`;
          listEl.innerHTML = "";
          lastResultText = "No differences";
      
          // 自动滚到结果区
          resultWrap.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      
        // 目录（可点击跳转）
        const toc = changes
          .map((c, i) => {
            const id = `diff-item-${i}`;
            const type =
              c.type === "added" ? "ADDED" :
              c.type === "removed" ? "REMOVED" :
              "CHANGED";
            const tocClass =
            c.type === "added" ? "jsondiff-add" :
            c.type === "removed" ? "jsondiff-del" :
            "jsondiff-chg";
      
            return `
              <a class="jsondiff-toc-item" href="#${id}" data-target="${id}">
                <span class="jsondiff-toc-badge ${tocClass}">${type}</span>
                <code class="jsondiff-toc-path">${escapeHtml(c.path)}</code>
              </a>
            `;
          })
          .join("");
      
        summaryEl.innerHTML = `
          <div class="jsondiff-toc">
            ${toc}
          </div>
        `;
      
        // diff 列表（每条带 id，支持锚点定位）
        listEl.innerHTML = changes.map((c, i) => {
          const id = `diff-item-${i}`;
      
          const badgeClass =
            c.type === "added" ? "jsondiff-add" :
            c.type === "removed" ? "jsondiff-del" :
            "jsondiff-chg";
      
          return `
            <div class="jsondiff-item" id="${id}">
              <div class="jsondiff-item-head">
                <span class="jsondiff-toc-badge ${badgeClass}">${c.type.toUpperCase()}</span>
                <code class="jsondiff-path">${escapeHtml(c.path)}</code>
              </div>
      
              <div class="jsondiff-item-body">
                <div class="jsondiff-col">
                  <div class="jsondiff-col-title">Before</div>
                  <pre class="code-output big-small-height jsondiff-pre">${escapeHtml(prettyValue(c.before))}</pre>
                </div>
                <div class="jsondiff-col">
                  <div class="jsondiff-col-title">After</div>
                  <pre class="code-output big-small-height jsondiff-pre">${escapeHtml(prettyValue(c.after))}</pre>
                </div>
              </div>
            </div>
          `;
        }).join("");
      
        // 复制内容
        lastResultText = JSON.stringify(
          { summary: { added, removed, changed, total: changes.length }, changes, left: leftObj, right: rightObj },
          null,
          2
        );
      
        // 点击目录：平滑滚动 + 高亮
        summaryEl.querySelectorAll(".jsondiff-toc-item").forEach((a) => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            const id = a.getAttribute("data-target");
            const el = document.getElementById(id);
            if (!el) return;
      
            // 先清理高亮
            document.querySelectorAll(".jsondiff-item.is-target").forEach((x) => x.classList.remove("is-target"));
      
            el.classList.add("is-target");
            el.scrollIntoView({ behavior: "smooth", block: "start" });
      
            // 同步 hash（可复制链接）
            history.replaceState(null, "", `#${id}`);
      
            // 一段时间后去掉高亮（可选）
            setTimeout(() => el.classList.remove("is-target"), 1200);
          });
        });
      
        // Compare 后自动滚到结果区域（如果你更想滚到第一条，把 resultWrap 换成 document.getElementById('diff-item-0')）
        resultWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      
  
    function compare() {
      setError(leftErr, "");
      setError(rightErr, "");
  
      const leftParsed = tryParseJson(leftEl.value);
      const rightParsed = tryParseJson(rightEl.value);
  
      if (!leftParsed.ok) setError(leftErr, leftParsed.error);
      if (!rightParsed.ok) setError(rightErr, rightParsed.error);
  
      if (!leftParsed.ok || !rightParsed.ok) {
        resultWrap.hidden = true;
        lastResultText = "";
        return;
      }
  
      let leftObj = leftParsed.value;
      let rightObj = rightParsed.value;
  
      if (optSortKeys?.checked) {
        leftObj = deepSortKeys(leftObj);
        rightObj = deepSortKeys(rightObj);
      }
  
      const changes = [];
      diffValues(leftObj, rightObj, "$", changes);
      render(changes, leftObj, rightObj);
    }
  
    function swap() {
      const t = leftEl.value;
      leftEl.value = rightEl.value;
      rightEl.value = t;
    }
  
    async function copyResult() {
      if (!lastResultText) return;
      try {
        await navigator.clipboard.writeText(lastResultText);
        btnCopy.textContent = "Copied!";
        setTimeout(() => (btnCopy.textContent = "Copy result"), 900);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = lastResultText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btnCopy.textContent = "Copied!";
        setTimeout(() => (btnCopy.textContent = "Copy result"), 900);
      }
    }
  
    btnCompare?.addEventListener("click", compare);
    btnSwap?.addEventListener("click", () => { swap(); compare(); });
  
    btnFormatLeft?.addEventListener("click", () => {
      const r = formatTextarea(leftEl);
      setError(leftErr, r.ok ? "" : r.error);
    });
  
    btnFormatRight?.addEventListener("click", () => {
      const r = formatTextarea(rightEl);
      setError(rightErr, r.ok ? "" : r.error);
    });
  
    btnClear?.addEventListener("click", () => {
      leftEl.value = "";
      rightEl.value = "";
      setError(leftErr, "");
      setError(rightErr, "");
      resultWrap.hidden = true;
      lastResultText = "";
    });
  
    btnCopy?.addEventListener("click", copyResult);
  
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        compare();
      }
    });
  
    // 初始示例（不影响用户已有输入）
    if (!leftEl.value.trim() && !rightEl.value.trim()) {
      leftEl.value = JSON.stringify({ a: 1, b: 2, obj: { x: 1 } });
      rightEl.value = JSON.stringify({ a: 1, b: 3, c: 4, obj: { x: 2 } });
    }
  })();
  