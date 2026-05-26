// Image Compressor
document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("compress-input");
  const formatEl = document.getElementById("compress-format");
  const qualityEl = document.getElementById("compress-quality");
  const qualityValueEl = document.getElementById("quality-value");
  const widthEl = document.getElementById("compress-width");
  const heightEl = document.getElementById("compress-height");
  const compressBtn = document.getElementById("compress-btn");
  const downloadBtn = document.getElementById("download-compressed-btn");
  const clearBtn = document.getElementById("clear-compress-btn");
  const errorEl = document.getElementById("compress-error");
  const originalSizeEl = document.getElementById("original-size");
  const compressedSizeEl = document.getElementById("compressed-size");
  const savedPercentEl = document.getElementById("saved-percent");
  const dimensionsEl = document.getElementById("image-dimensions");
  const previewEl = document.getElementById("compressed-preview");
  const placeholderEl = document.getElementById("compress-placeholder");

  if (!inputEl || !compressBtn || !previewEl) return;

  let lastBlob = null;
  let lastFileName = "compressed-image.jpg";

  function formatBytes(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function extensionForType(type) {
    if (type === "image/webp") return "webp";
    if (type === "image/png") return "png";
    return "jpg";
  }

  function setError(message) {
    errorEl.textContent = message || "";
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image."));
      };
      img.src = url;
    });
  }

  function targetSize(width, height) {
    const maxWidth = Number(widthEl.value) || width;
    const maxHeight = Number(heightEl.value) || height;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
      width: Math.max(1, Math.round(width * ratio)),
      height: Math.max(1, Math.round(height * ratio))
    };
  }

  async function compressImage() {
    const file = inputEl.files && inputEl.files[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }

    setError("");

    try {
      const img = await loadImage(file);
      const size = targetSize(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size.width, size.height);

      const mimeType = formatEl.value;
      const quality = Number(qualityEl.value) / 100;
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, mimeType === "image/png" ? undefined : quality);
      });

      if (!blob) {
        setError("This browser could not export the compressed image.");
        return;
      }

      lastBlob = blob;
      const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
      lastFileName = `${baseName}-compressed.${extensionForType(mimeType)}`;

      const previewUrl = URL.createObjectURL(blob);
      previewEl.onload = () => URL.revokeObjectURL(previewUrl);
      previewEl.src = previewUrl;
      previewEl.style.display = "block";
      placeholderEl.style.display = "none";

      const saved = file.size > 0 ? Math.max(0, Math.round((1 - blob.size / file.size) * 100)) : 0;
      originalSizeEl.textContent = formatBytes(file.size);
      compressedSizeEl.textContent = formatBytes(blob.size);
      savedPercentEl.textContent = `${saved}%`;
      dimensionsEl.textContent = `${size.width}×${size.height}`;
    } catch (error) {
      setError(error.message || "Failed to compress image.");
    }
  }

  qualityEl.addEventListener("input", () => {
    qualityValueEl.textContent = qualityEl.value;
  });

  inputEl.addEventListener("change", () => {
    const file = inputEl.files && inputEl.files[0];
    originalSizeEl.textContent = file ? formatBytes(file.size) : "0 KB";
    setError("");
  });

  compressBtn.addEventListener("click", compressImage);

  downloadBtn.addEventListener("click", () => {
    if (!lastBlob) {
      setError("Compress an image before downloading.");
      return;
    }

    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lastFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    widthEl.value = "";
    heightEl.value = "";
    lastBlob = null;
    originalSizeEl.textContent = "0 KB";
    compressedSizeEl.textContent = "0 KB";
    savedPercentEl.textContent = "0%";
    dimensionsEl.textContent = "-";
    previewEl.removeAttribute("src");
    previewEl.style.display = "none";
    placeholderEl.style.display = "";
    setError("");
  });
});
