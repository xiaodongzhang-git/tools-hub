// SEO Meta Tag Generator
document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("meta-title");
  const urlEl = document.getElementById("meta-url");
  const siteEl = document.getElementById("meta-site");
  const imageEl = document.getElementById("meta-image");
  const descriptionEl = document.getElementById("meta-description");
  const keywordsEl = document.getElementById("meta-keywords");
  const outputEl = document.getElementById("meta-output");
  const generateBtn = document.getElementById("generate-meta-btn");
  const clearBtn = document.getElementById("clear-meta-btn");
  const copyBtn = document.getElementById("copy-meta-btn");
  const previewUrlEl = document.getElementById("preview-url");
  const previewTitleEl = document.getElementById("preview-title");
  const previewDescriptionEl = document.getElementById("preview-description");
  const titleCountEl = document.getElementById("title-count");
  const descriptionCountEl = document.getElementById("description-count");

  if (!titleEl || !descriptionEl || !outputEl || !generateBtn) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function lengthStatus(value, min, max) {
    if (value < min) return "Short";
    if (value > max) return "Long";
    return "Good";
  }

  function updatePreview() {
    const title = titleEl.value.trim();
    const description = descriptionEl.value.trim();
    const url = urlEl.value.trim();

    previewTitleEl.textContent = title || "Your SEO title will appear here";
    previewDescriptionEl.textContent = description || "Your meta description preview will appear here.";
    previewUrlEl.textContent = url || "https://example.com/page";
    titleCountEl.textContent = `${title.length} · ${lengthStatus(title.length, 35, 60)}`;
    descriptionCountEl.textContent = `${description.length} · ${lengthStatus(description.length, 120, 160)}`;
    autoResize(descriptionEl);
  }

  function generateTags() {
    const title = titleEl.value.trim();
    const description = descriptionEl.value.trim();
    const url = urlEl.value.trim();
    const site = siteEl.value.trim();
    const image = imageEl.value.trim();
    const keywords = keywordsEl.value.trim();

    if (!title || !description) {
      outputEl.value = "Add at least a page title and meta description.";
      outputEl.classList.add("error");
      autoResize(outputEl);
      return;
    }

    const tags = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}" />`,
      keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
      `<meta name="robots" content="index, follow" />`,
      url ? `<link rel="canonical" href="${escapeHtml(url)}" />` : "",
      "",
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:type" content="website" />`,
      url ? `<meta property="og:url" content="${escapeHtml(url)}" />` : "",
      site ? `<meta property="og:site_name" content="${escapeHtml(site)}" />` : "",
      image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : "",
      "",
      `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
      image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : "",
      "",
      `<script type="application/ld+json">`,
      JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: url || undefined,
          image: image || undefined,
          isPartOf: site ? { "@type": "WebSite", name: site } : undefined
        },
        null,
        2
      ).replace(/</g, "\\u003c"),
      `<\/script>`
    ].filter((line) => line !== "").join("\n");

    outputEl.classList.remove("error");
    outputEl.value = tags;
    autoResize(outputEl);
  }

  [titleEl, urlEl, siteEl, imageEl, descriptionEl, keywordsEl].forEach((el) => {
    el.addEventListener("input", updatePreview);
  });

  generateBtn.addEventListener("click", generateTags);

  clearBtn.addEventListener("click", () => {
    [titleEl, urlEl, siteEl, imageEl, descriptionEl, keywordsEl, outputEl].forEach((el) => {
      el.value = "";
    });
    outputEl.classList.remove("error");
    updatePreview();
    autoResize(outputEl);
  });

  copyBtn.addEventListener("click", async () => {
    const text = outputEl.value.trim();
    if (!text || outputEl.classList.contains("error")) {
      alert("Generate meta tags first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "📋"), 900);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
  });

  autoResize(descriptionEl);
  autoResize(outputEl);
  updatePreview();
});
