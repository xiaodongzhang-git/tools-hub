// Base64 Text Encoder / Decoder
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("b64-input");
    const outputEl = document.getElementById("b64-output");
    const encodeBtn = document.getElementById("b64-encode-btn");
    const decodeBtn = document.getElementById("b64-decode-btn");
    const clearBtn = document.getElementById("b64-clear-btn");
    const copyBtn = document.getElementById("b64-copy-btn");
  
    if (!inputEl || !outputEl) return;
  
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
  
    // UTF-8 safe Base64
    function utf8ToBase64(str) {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch (e) {
        throw new Error("Failed to encode text as Base64.");
      }
    }
  
    function base64ToUtf8(str) {
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch (e) {
        throw new Error("Invalid Base64 string.");
      }
    }
  
    encodeBtn.addEventListener("click", () => {
      const raw = inputEl.value;
      if (!raw) {
        setResult("Input is empty. Please enter some text to encode.", true);
        return;
      }
      try {
        const encoded = utf8ToBase64(raw);
        setResult(encoded, false);
      } catch (e) {
        setResult(e.message, true);
      }
    });
  
    decodeBtn.addEventListener("click", () => {
      const raw = inputEl.value.trim();
      if (!raw) {
        setResult("Input is empty. Please enter Base64 text to decode.", true);
        return;
      }
      try {
        const decoded = base64ToUtf8(raw);
        setResult(decoded, false);
      } catch (e) {
        setResult(e.message, true);
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
      } catch (e) {
        alert("Failed to copy result.");
      }
    });
  });
  