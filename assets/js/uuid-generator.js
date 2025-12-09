// UUID Generator
document.addEventListener("DOMContentLoaded", () => {
    const countInput = document.getElementById("uuid-count");
    const uppercaseCheckbox = document.getElementById("uuid-uppercase");
    const noHyphenCheckbox = document.getElementById("uuid-no-hyphen");
    const generateBtn = document.getElementById("uuid-generate-btn");
    const clearBtn = document.getElementById("uuid-clear-btn");
    const copyBtn = document.getElementById("uuid-copy-btn");
    const outputEl = document.getElementById("uuid-output");
  
    if (!countInput || !generateBtn || !outputEl) return;
  
    function generateUuidV4() {
      // 优先使用 crypto.getRandomValues
      if (window.crypto && crypto.getRandomValues) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
  
        // 按 RFC 4122 设置 version & variant
        buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // variant
  
        const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
  
        return (
          hex.slice(0, 8) +
          "-" +
          hex.slice(8, 12) +
          "-" +
          hex.slice(12, 16) +
          "-" +
          hex.slice(16, 20) +
          "-" +
          hex.slice(20)
        );
      } else {
        // 兼容旧环境：退回到 Math.random 版本
        const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return template.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
    }
  
    function formatUuid(uuid) {
      let result = uuid;
      if (noHyphenCheckbox.checked) {
        result = result.replace(/-/g, "");
      }
      if (uppercaseCheckbox.checked) {
        result = result.toUpperCase();
      }
      return result;
    }
  
    generateBtn.addEventListener("click", () => {
      let count = parseInt(countInput.value, 10);
      if (isNaN(count) || count < 1) count = 1;
      if (count > 100) count = 100;
      countInput.value = String(count);
  
      const uuids = [];
      for (let i = 0; i < count; i++) {
        uuids.push(formatUuid(generateUuidV4()));
      }
      outputEl.value = uuids.join("\n");
    });
  
    clearBtn.addEventListener("click", () => {
      outputEl.value = "";
    });
  
    copyBtn.addEventListener("click", async () => {
      const text = outputEl.value.trim();
      if (!text) {
        alert("No UUIDs to copy. Please generate first.");
        return;
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const temp = document.createElement("textarea");
          temp.value = text;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
        }
        // 可选提示
        // alert("UUIDs copied to clipboard.");
      } catch (e) {
        alert("Failed to copy UUIDs.");
      }
    });
  });
  