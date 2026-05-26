// AI Prompt Generator
document.addEventListener("DOMContentLoaded", () => {
  const typeEl = document.getElementById("prompt-type");
  const toneEl = document.getElementById("prompt-tone");
  const formatEl = document.getElementById("prompt-format");
  const audienceEl = document.getElementById("prompt-audience");
  const goalEl = document.getElementById("prompt-goal");
  const contextEl = document.getElementById("prompt-context");
  const outputEl = document.getElementById("prompt-output");
  const generateBtn = document.getElementById("generate-prompt-btn");
  const clearBtn = document.getElementById("clear-prompt-btn");
  const copyBtn = document.getElementById("copy-prompt-btn");

  if (!typeEl || !goalEl || !outputEl || !generateBtn) return;

  const templates = {
    seo: {
      role: "You are an SEO strategist and editor.",
      task: "Create a search-focused content brief that can be handed to a writer.",
      checks: [
        "Identify the likely search intent.",
        "Suggest an H1, H2/H3 outline, internal link ideas, and FAQ questions.",
        "Include practical examples and avoid generic filler."
      ]
    },
    marketing: {
      role: "You are a conversion copywriter.",
      task: "Create persuasive marketing copy for the goal below.",
      checks: [
        "Clarify the audience pain point and desired outcome.",
        "Write benefit-led copy with a clear call to action.",
        "Offer 3 headline alternatives."
      ]
    },
    code: {
      role: "You are a senior software engineer.",
      task: "Help solve the coding task below with careful reasoning.",
      checks: [
        "Ask for missing requirements only if they block a correct solution.",
        "Prefer simple, maintainable implementation choices.",
        "Include edge cases and test ideas."
      ]
    },
    learning: {
      role: "You are a patient tutor.",
      task: "Teach the topic below in a way the audience can apply.",
      checks: [
        "Start with a short mental model.",
        "Use examples and practice questions.",
        "End with a concise recap."
      ]
    },
    business: {
      role: "You are a business analyst.",
      task: "Analyze the business question below and produce actionable recommendations.",
      checks: [
        "State assumptions clearly.",
        "Compare options by impact, effort, risk, and time to value.",
        "Recommend next steps."
      ]
    },
    custom: {
      role: "You are an expert assistant.",
      task: "Complete the task below with a high-quality, useful answer.",
      checks: [
        "Use the provided context.",
        "Be specific and avoid unnecessary filler.",
        "Make the final output easy to act on."
      ]
    }
  };

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  [goalEl, contextEl, outputEl].forEach((el) => {
    autoResize(el);
    el.addEventListener("input", () => autoResize(el));
  });

  function buildPrompt() {
    const selected = templates[typeEl.value] || templates.custom;
    const goal = goalEl.value.trim();
    const context = contextEl.value.trim();
    const audience = audienceEl.value.trim() || "the intended audience";
    const tone = toneEl.value;
    const outputFormat = formatEl.value;

    if (!goal) {
      outputEl.value = "Add a goal first, then generate a prompt.";
      outputEl.classList.add("error");
      autoResize(outputEl);
      return;
    }

    const prompt = [
      selected.role,
      "",
      `Task: ${selected.task}`,
      "",
      `Goal: ${goal}`,
      `Audience: ${audience}`,
      `Tone: ${tone}`,
      `Output format: ${outputFormat}`,
      "",
      "Context and constraints:",
      context || "- No extra context provided. Make reasonable assumptions and state them briefly.",
      "",
      "Requirements:",
      ...selected.checks.map((item) => `- ${item}`),
      "- If information is uncertain, say what is uncertain and give a practical next step.",
      "- Return the answer in the requested format."
    ].join("\n");

    outputEl.classList.remove("error");
    outputEl.value = prompt;
    autoResize(outputEl);
  }

  generateBtn.addEventListener("click", buildPrompt);

  clearBtn.addEventListener("click", () => {
    audienceEl.value = "";
    goalEl.value = "";
    contextEl.value = "";
    outputEl.value = "";
    outputEl.classList.remove("error");
    [goalEl, contextEl, outputEl].forEach(autoResize);
  });

  copyBtn.addEventListener("click", async () => {
    const text = outputEl.value.trim();
    if (!text || outputEl.classList.contains("error")) {
      alert("Generate a prompt first.");
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
