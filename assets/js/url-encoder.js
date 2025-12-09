// URL Encoder / Decoder
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("url-input");
    const outputEl = document.getElementById("url-output");
    const encodeBtn = document.getElementById("encode-btn");
    const decodeBtn = document.getElementById("decode-btn");
    const clearBtn = document.getElementById("clear-url-btn");
    const copyBtn = document.getElementById("copy-url-btn");
  
    if (!inputEl || !outputEl) return; // 不是这个页面时直接退出
  
    function autoResize(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  
    autoResize(inputEl);
    autoResize(outputEl);
  
    inputEl.addEventListener("input", () => autoResize(inputEl));
    outputEl.addEventListener("input", () => autoResize(outputEl));
  
    function setResult(text, isError = false) {
      outputEl.value = text;
      autoResize(outputEl);
      if (isError) {
        outputEl.classList.add("error");
      } else {
        outputEl.classList.remove("error");
      }
    }
  
    encodeBtn.addEventListener("click", () => {
      const raw = inputEl.value;
      if (!raw) {
        setResult("Input is empty. Please enter some text or a URL.", true);
        return;
      }
      try {
        const encoded = encodeURIComponent(raw);
        setResult(encoded, false);
      } catch (e) {
        setResult("Failed to encode: " + e.message, true);
      }
    });
  
    decodeBtn.addEventListener("click", () => {
      const raw = inputEl.value;
      if (!raw) {
        setResult("Input is empty. Please enter some encoded text or a URL.", true);
        return;
      }
      try {
        const decoded = decodeURIComponent(raw);
        setResult(decoded, false);
      } catch (e) {
        setResult("Invalid encoded string:\n" + e.message, true);
      }
    });
  
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      outputEl.value = "";
      outputEl.classList.remove("error");
      autoResize(inputEl);
      autoResize(outputEl);
    });
  
    copyBtn.addEventListener("click", async () => {
      const text = outputEl.value.trim();
      if (!text) {
        alert("Nothing to copy. Please encode or decode first.");
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
        // 可选：alert("Result copied to clipboard.");
      } catch (err) {
        console.error(err);
        alert("Failed to copy to clipboard.");
      }
    });
  });
  