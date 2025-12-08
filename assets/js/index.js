// JSON Formatter page logic
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("json-input");
    const outputEl = document.getElementById("json-output");
    const formatBtn = document.getElementById("format-btn");
    const clearBtn = document.getElementById("clear-btn");
    const copyBtn = document.getElementById("copy-btn");
  
    // 如果不是这个页面，直接返回
    if (!inputEl || !outputEl || !formatBtn || !clearBtn || !copyBtn) {
      return;
    }
  
    let lastFormattedJson = ""; // 保存最近一次格式化后的纯文本，用于复制
  
    // 自动根据内容调整 textarea 高度
    function autoResize(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  
    autoResize(inputEl);
  
    inputEl.addEventListener("input", () => {
      autoResize(inputEl);
    });
  
    function setErrorOutput(message) {
      outputEl.classList.add("error");
      outputEl.textContent = message;
    }
  
    function clearError() {
      outputEl.classList.remove("error");
    }
  
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  
    // 递归渲染 JSON 为多彩 + 可折叠的 HTML
    function renderJsonValue(value, key, depth, isLast) {
      const margin = depth * 1.25;
      const indentStyle = `style="margin-left:${margin}em"`;
      let html = "";
  
      const hasKey = key !== null && key !== undefined;
  
      const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  
      if (type === "object" || type === "array") {
        const isArray = type === "array";
        const bracketOpen = isArray ? "[" : "{";
        const bracketClose = isArray ? "]" : "}";
  
        // 顶部行：toggle + key + [
        html += `<div class="json-item" ${indentStyle}>`;
        html += `<span class="json-toggle"></span>`;
        if (hasKey) {
          html += `<span class="json-key">"${escapeHtml(key)}"</span>: `;
        }
        html += `<span class="json-bracket">${bracketOpen}</span>`;
        html += `</div>`;
  
        // 子元素
        html += `<div class="json-children">`;
        const entries = isArray ? value.map((v, idx) => [null, v, idx]) : Object.entries(value);
  
        entries.forEach((entry, index) => {
          let childKey;
          let childValue;
          if (isArray) {
            childKey = null;
            childValue = entry[1];
          } else {
            childKey = entry[0];
            childValue = entry[1];
          }
          const childIsLast = index === entries.length - 1;
          html += renderJsonValue(childValue, childKey, depth + 1, childIsLast);
        });
        html += `</div>`;
  
        // 收尾行： ]
        html += `<div class="json-item" ${indentStyle}>`;
        html += `<span class="json-bracket">${bracketClose}</span>`;
        if (!isLast) {
          html += `<span class="json-comma">,</span>`;
        }
        html += `</div>`;
      } else {
        // 基本类型：string / number / boolean / null
        let valueHtml = "";
        if (type === "string") {
          valueHtml = `<span class="json-string">"${escapeHtml(value)}"</span>`;
        } else if (type === "number") {
          valueHtml = `<span class="json-number">${value}</span>`;
        } else if (type === "boolean") {
          valueHtml = `<span class="json-boolean">${value}</span>`;
        } else if (type === "null") {
          valueHtml = `<span class="json-null">null</span>`;
        }
  
        html += `<div class="json-item" ${indentStyle}>`;
        if (hasKey) {
          html += `<span class="json-key">"${escapeHtml(key)}"</span>: `;
        }
        html += valueHtml;
        if (!isLast) {
          html += `<span class="json-comma">,</span>`;
        }
        html += `</div>`;
      }
  
      return html;
    }
  
    function renderJsonViewer(parsed) {
      clearError();
      const html = renderJsonValue(parsed, null, 0, true);
      outputEl.innerHTML = `<div class="json-viewer">${html}</div>`;
    }
  
    // 格式化当前输入，并渲染 + 返回结果
    function formatCurrentInput() {
      const raw = inputEl.value.trim();
  
      if (!raw) {
        setErrorOutput("Input is empty. Please paste some JSON to format.");
        lastFormattedJson = "";
        return { ok: false, value: "" };
      }
  
      try {
        const parsed = JSON.parse(raw);
        const formatted = JSON.stringify(parsed, null, 2);
        lastFormattedJson = formatted;
        renderJsonViewer(parsed);
        return { ok: true, value: formatted };
      } catch (e) {
        lastFormattedJson = "";
        setErrorOutput("Invalid JSON:\n" + e.message);
        return { ok: false, value: "" };
      }
    }
  
    // 点击 Format 按钮
    formatBtn.addEventListener("click", () => {
      formatCurrentInput();
    });
  
    // 点击 Clear 按钮
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      autoResize(inputEl);
      lastFormattedJson = "";
      clearError();
      outputEl.textContent = "";
    });
  
    // 点击 Copy 按钮：保证复制的是最新格式化结果
    copyBtn.addEventListener("click", async () => {
      // 先尝试格式化一次（会更新 lastFormattedJson）
      const result = formatCurrentInput();
      if (!result.ok) {
        alert("JSON is invalid. Please fix it before copying.");
        return;
      }
  
      const textToCopy = result.value;
  
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const temp = document.createElement("textarea");
          temp.value = textToCopy;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
        }
        // 想给提示的话可以打开下面一行
        // alert("Formatted JSON copied to clipboard.");
      } catch (err) {
        console.error(err);
        alert("Failed to copy to clipboard.");
      }
    });
  
    // 点击折叠/展开（事件委托）
    outputEl.addEventListener("click", (event) => {
      const toggle = event.target.closest(".json-toggle");
      if (!toggle) return;
  
      const item = toggle.closest(".json-item");
      if (!item) return;
  
      const children = item.nextElementSibling;
      if (!children || !children.classList.contains("json-children")) {
        return;
      }
  
      const collapsed = children.classList.toggle("collapsed");
      toggle.classList.toggle("collapsed", collapsed);
    });
  });
  