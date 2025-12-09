// Text Counter
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("tc-input");
    const clearBtn = document.getElementById("tc-clear-btn");
  
    const charWithSpacesEl = document.getElementById("tc-char-with-spaces");
    const charNoSpacesEl = document.getElementById("tc-char-no-spaces");
    const wordsEl = document.getElementById("tc-words");
    const linesEl = document.getElementById("tc-lines");
    const bytesEl = document.getElementById("tc-bytes");
  
    if (
      !inputEl ||
      !clearBtn ||
      !charWithSpacesEl ||
      !charNoSpacesEl ||
      !wordsEl ||
      !linesEl ||
      !bytesEl
    ) {
      return; // 不是这个页面时直接退出
    }
  
    function autoResize(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  
    function countBytes(text) {
      try {
        if (window.TextEncoder) {
          const enc = new TextEncoder();
          return enc.encode(text).length;
        } else {
          // 简单 fallback：按 UTF-8 粗略估算
          let count = 0;
          for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code <= 0x7f) count += 1;
            else if (code <= 0x7ff) count += 2;
            else if (code <= 0xffff) count += 3;
            else count += 4;
          }
          return count;
        }
      } catch {
        return text.length;
      }
    }
  
    function updateStats() {
      const text = inputEl.value || "";
  
      // 字符数（含空格）
      const charsWithSpaces = text.length;
  
      // 字符数（不含空白）
      const charsNoSpaces = text.replace(/\s/g, "").length;
  
      // 行数（至少为 1？这里如果完全空则为 0）
      let lines = 0;
      if (text.length > 0) {
        lines = text.split(/\r\n|\r|\n/).length;
      }
  
      // 单词数（以空白分隔；对中英混合是一个近似）
      const wordMatches = text.trim().match(/\S+/g);
      const words = wordMatches ? wordMatches.length : 0;
  
      // 字节数（UTF-8）
      const bytes = countBytes(text);
  
      charWithSpacesEl.textContent = String(charsWithSpaces);
      charNoSpacesEl.textContent = String(charsNoSpaces);
      wordsEl.textContent = String(words);
      linesEl.textContent = String(lines);
      bytesEl.textContent = String(bytes);
  
      autoResize(inputEl);
    }
  
    // 输入时实时统计
    inputEl.addEventListener("input", updateStats);
  
    // Clear 按钮
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      updateStats();
    });
  
    // 初始化一次
    updateStats();
  });
  