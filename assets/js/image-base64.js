// Image to Base64 Tool
document.addEventListener("DOMContentLoaded", () => {
    const imgInput = document.getElementById("img-input");
    const imgPreview = document.getElementById("img-preview");
    const imgSizeInfo = document.getElementById("img-size");
    const fileNameSpan = document.getElementById("file-name");
  
    const base64Output = document.getElementById("base64-output");
    const copyBase64Btn = document.getElementById("copy-base64-btn");
  
    const base64Input = document.getElementById("base64-input");
    const decodeBtn = document.getElementById("decode-btn");
    const decodedPreview = document.getElementById("decoded-preview");
    const decodedSizeInfo = document.getElementById("decoded-size");
    const downloadBtn = document.getElementById("download-btn");
  
    // 不是这个页面就直接返回，避免其他页面报错
    if (
      !imgInput ||
      !imgPreview ||
      !base64Output ||
      !base64Input ||
      !decodeBtn ||
      !downloadBtn
    ) {
      return;
    }
  
    // 只保存「右侧 Decode 出来的图片」的 Data URL
    let lastDecodedDataUrl = "";
  
    /* ------------------------------ 左：Image → Base64 ------------------------------ */
    imgInput.addEventListener("change", () => {
      const file = imgInput.files[0];
      if (!file) return;
  
      if (fileNameSpan) {
        fileNameSpan.textContent = file.name;
      }
  
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = e.target.result; // data:image/...;base64,xxxx
  
        // 左侧预览
        imgPreview.src = base64;
        imgPreview.style.display = "block";
  
        // 输出 Base64
        base64Output.value = base64;
  
        // 显示图片大小
        imgSizeInfo.textContent = `Image Size: ${(file.size / 1024).toFixed(2)} KB`;
      };
      reader.readAsDataURL(file);
    });
  
    /* ------------------------------ Copy Base64 ------------------------------ */
    copyBase64Btn.addEventListener("click", async () => {
      const text = base64Output.value.trim();
      if (!text) {
        alert("No Base64 code available to copy.");
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
        // 可选：提示成功
        // alert("Base64 copied!");
      } catch (e) {
        alert("Failed to copy Base64.");
      }
    });
  
    /* ------------------------------ 右：Base64 → Image ------------------------------ */
    decodeBtn.addEventListener("click", () => {
      const raw = base64Input.value.trim();
      if (!raw) {
        alert("Please paste a Base64 string.");
        return;
      }
  
      // 支持两种形式：
      // 1) data:image/png;base64,xxxx
      // 2) 纯 base64：iVBORw0KGgoAAAANS...
      let dataUrl = raw;
      if (!raw.startsWith("data:")) {
        // 默认按 PNG
        dataUrl = "data:image/png;base64," + raw;
      }
  
      // 右侧预览
      decodedPreview.src = dataUrl;
      decodedPreview.style.display = "block";
  
      // 记录“可下载的解码结果”，只来自右侧功能
      lastDecodedDataUrl = dataUrl;
  
      // 估算大小
      try {
        const base64Part = dataUrl.split(",")[1] || "";
        const sizeInBytes = atob(base64Part).length;
        decodedSizeInfo.textContent = `Estimated Size: ${(sizeInBytes / 1024).toFixed(2)} KB`;
      } catch {
        decodedSizeInfo.textContent = "";
      }
    });
  
    /* ------------------------------ Download Decoded Image ------------------------------ */
    downloadBtn.addEventListener("click", () => {
      if (!lastDecodedDataUrl) {
        alert("Please decode a Base64 string first.");
        return;
      }
  
      // 尝试从 data URL 中解析 MIME 类型和扩展名
      let filename = "image";
      let ext = "png";
  
      try {
        const match = lastDecodedDataUrl.match(/^data:(image\/[a-zA-Z0-9+.\-]+);base64,/);
        if (match) {
          const mime = match[1]; // e.g. image/png
          const parts = mime.split("/");
          if (parts.length === 2) {
            ext = parts[1];
          }
        }
      } catch {
        // ignore, fallback to png
      }
  
      const a = document.createElement("a");
      a.href = lastDecodedDataUrl;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
  