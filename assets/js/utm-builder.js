// UTM Campaign URL Builder
document.addEventListener("DOMContentLoaded", () => {
  const urlEl = document.getElementById("utm-url");
  const sourceEl = document.getElementById("utm-source");
  const mediumEl = document.getElementById("utm-medium");
  const campaignEl = document.getElementById("utm-campaign");
  const termEl = document.getElementById("utm-term");
  const contentEl = document.getElementById("utm-content");
  const caseEl = document.getElementById("utm-case");
  const outputEl = document.getElementById("utm-output");
  const buildBtn = document.getElementById("build-utm-btn");
  const clearBtn = document.getElementById("clear-utm-btn");
  const copyBtn = document.getElementById("copy-utm-btn");

  if (!urlEl || !outputEl || !buildBtn) return;

  function normalize(value) {
    const raw = value.trim();
    if (!raw) return "";

    if (caseEl.value === "lower") return raw.toLowerCase();
    if (caseEl.value === "snake") return raw.toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
    if (caseEl.value === "kebab") return raw.toLowerCase().replace(/\s+/g, "-").replace(/_+/g, "-");
    return raw;
  }

  function setResult(text, isError = false) {
    outputEl.value = text;
    outputEl.classList.toggle("error", isError);
    outputEl.style.height = "auto";
    outputEl.style.height = outputEl.scrollHeight + "px";
  }

  function buildUrl() {
    const rawUrl = urlEl.value.trim();
    if (!rawUrl) {
      setResult("Add a website URL first.", true);
      return;
    }

    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      setResult("Enter a valid URL, including https:// or http://.", true);
      return;
    }

    const params = {
      utm_source: normalize(sourceEl.value),
      utm_medium: normalize(mediumEl.value),
      utm_campaign: normalize(campaignEl.value),
      utm_term: normalize(termEl.value),
      utm_content: normalize(contentEl.value)
    };

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });

    setResult(url.toString());
  }

  buildBtn.addEventListener("click", buildUrl);

  clearBtn.addEventListener("click", () => {
    [urlEl, sourceEl, mediumEl, campaignEl, termEl, contentEl, outputEl].forEach((el) => {
      el.value = "";
    });
    outputEl.classList.remove("error");
  });

  [urlEl, sourceEl, mediumEl, campaignEl, termEl, contentEl, caseEl].forEach((el) => {
    el.addEventListener("input", () => {
      if (urlEl.value.trim()) buildUrl();
    });
    el.addEventListener("change", () => {
      if (urlEl.value.trim()) buildUrl();
    });
  });

  copyBtn.addEventListener("click", async () => {
    const text = outputEl.value.trim();
    if (!text || outputEl.classList.contains("error")) {
      alert("Build a campaign URL first.");
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
});
