// JWT Decoder
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("jwt-input");
    const decodeBtn = document.getElementById("jwt-decode-btn");
    const clearBtn = document.getElementById("jwt-clear-btn");
  
    const headerEl = document.getElementById("jwt-header");
    const payloadEl = document.getElementById("jwt-payload");
    const signatureEl = document.getElementById("jwt-signature");
    const errorEl = document.getElementById("jwt-error");
  
    if (!inputEl || !decodeBtn || !clearBtn) return; // 不是这个页面时退出
  
    function base64UrlDecode(str) {
      // Base64URL -> Base64
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      // 补 '='
      const pad = base64.length % 4;
      if (pad === 2) base64 += "==";
      else if (pad === 3) base64 += "=";
      else if (pad !== 0) throw new Error("Invalid Base64URL padding.");
  
      const decoded = atob(base64);
      try {
        // 处理 UTF-8
        return decodeURIComponent(
          decoded
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      } catch {
        // 非 UTF-8 内容就原样返回
        return decoded;
      }
    }
  
    function clearOutputs() {
      headerEl.textContent = "";
      payloadEl.textContent = "";
      signatureEl.textContent = "";
      errorEl.textContent = "";
    }
  
    function setError(msg) {
      errorEl.textContent = msg;
    }
  
    decodeBtn.addEventListener("click", () => {
      const token = inputEl.value.trim();
      clearOutputs();
  
      if (!token) {
        setError("Please paste a JWT token.");
        return;
      }
  
      const parts = token.split(".");
      if (parts.length < 2) {
        setError("Invalid JWT format. A JWT should have at least header and payload (two dots).");
        return;
      }
  
      const [headerPart, payloadPart, signaturePart] = parts;
  
      try {
        // 解析 header
        const headerJsonStr = base64UrlDecode(headerPart || "");
        const headerObj = JSON.parse(headerJsonStr);
        headerEl.textContent = JSON.stringify(headerObj, null, 2);
      } catch (e) {
        headerEl.textContent = "Failed to decode header:\n" + e.message;
      }
  
      try {
        // 解析 payload
        const payloadJsonStr = base64UrlDecode(payloadPart || "");
        const payloadObj = JSON.parse(payloadJsonStr);
        payloadEl.textContent = JSON.stringify(payloadObj, null, 2);
      } catch (e) {
        payloadEl.textContent = "Failed to decode payload:\n" + e.message;
      }
  
      // 签名部分：原样展示
      if (signaturePart) {
        signatureEl.textContent = signaturePart;
      } else {
        signatureEl.textContent = "(No signature part found)";
      }
    });
  
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      clearOutputs();
    });
  });
  