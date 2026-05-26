// AI Token & Cost Estimator
document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("token-input");
  const presetEl = document.getElementById("model-preset");
  const outputTokensEl = document.getElementById("output-tokens");
  const requestCountEl = document.getElementById("request-count");
  const currencyEl = document.getElementById("currency-select");
  const inputPriceEl = document.getElementById("input-price");
  const outputPriceEl = document.getElementById("output-price");
  const inputTokenCountEl = document.getElementById("input-token-count");
  const outputTokenCountEl = document.getElementById("output-token-count");
  const totalTokenCountEl = document.getElementById("total-token-count");
  const estimatedCostEl = document.getElementById("estimated-cost");

  if (!inputEl || !presetEl || !estimatedCostEl) return;

  const presets = {
    economy: { input: 0.15, output: 0.60 },
    standard: { input: 2.50, output: 10.00 },
    premium: { input: 15.00, output: 60.00 }
  };

  const currency = {
    USD: { symbol: "$", rate: 1 },
    CNY: { symbol: "¥", rate: 7.2 },
    JPY: { symbol: "¥", rate: 157 }
  };

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function estimateTokens(text) {
    if (!text) return 0;

    let latinChars = 0;
    let cjkChars = 0;
    let symbols = 0;
    let whitespaceRuns = 0;
    let inWhitespace = false;

    for (const char of text) {
      if (/\s/.test(char)) {
        if (!inWhitespace) whitespaceRuns++;
        inWhitespace = true;
        continue;
      }
      inWhitespace = false;

      if (/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(char)) {
        cjkChars++;
      } else if (/[A-Za-z0-9]/.test(char)) {
        latinChars++;
      } else {
        symbols++;
      }
    }

    return Math.max(1, Math.ceil(latinChars / 4 + cjkChars * 1.15 + symbols / 2 + whitespaceRuns * 0.25));
  }

  function numberValue(el, fallback) {
    const value = Number(el.value);
    if (!Number.isFinite(value) || value < 0) return fallback;
    return value;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  }

  function update() {
    autoResize(inputEl);

    const inputTokens = estimateTokens(inputEl.value);
    const outputTokens = numberValue(outputTokensEl, 0);
    const requests = Math.max(1, Math.round(numberValue(requestCountEl, 1)));
    const inputPrice = numberValue(inputPriceEl, 0);
    const outputPrice = numberValue(outputPriceEl, 0);

    requestCountEl.value = String(requests);

    const totalInput = inputTokens * requests;
    const totalOutput = outputTokens * requests;
    const totalTokens = totalInput + totalOutput;
    const costUsd = (totalInput / 1000000) * inputPrice + (totalOutput / 1000000) * outputPrice;

    const selectedCurrency = currency[currencyEl.value] || currency.USD;
    const convertedCost = costUsd * selectedCurrency.rate;

    inputTokenCountEl.textContent = formatNumber(totalInput);
    outputTokenCountEl.textContent = formatNumber(totalOutput);
    totalTokenCountEl.textContent = formatNumber(totalTokens);
    estimatedCostEl.textContent = `${selectedCurrency.symbol}${convertedCost.toFixed(4)} ${currencyEl.value}`;
  }

  presetEl.addEventListener("change", () => {
    if (presetEl.value === "custom") return;
    const preset = presets[presetEl.value];
    inputPriceEl.value = String(preset.input);
    outputPriceEl.value = String(preset.output);
    update();
  });

  [inputEl, outputTokensEl, requestCountEl, currencyEl, inputPriceEl, outputPriceEl].forEach((el) => {
    el.addEventListener("input", () => {
      if (el === inputPriceEl || el === outputPriceEl) {
        presetEl.value = "custom";
      }
      update();
    });
    el.addEventListener("change", update);
  });

  autoResize(inputEl);
  update();
});
