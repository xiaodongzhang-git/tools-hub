// JSON ↔ CSV Converter with file upload & download
document.addEventListener("DOMContentLoaded", () => {
  const jsonInputEl = document.getElementById("jc-json-input");
  const jsonToCsvBtn = document.getElementById("jc-json-to-csv-btn");
  const clearJsonBtn = document.getElementById("jc-clear-json-btn");

  const csvFileInput = document.getElementById("jc-csv-file");
  const csvFileNameEl = document.getElementById("jc-csv-file-name");
  const csvToJsonBtn = document.getElementById("jc-csv-to-json-btn");
  const clearCsvBtn = document.getElementById("jc-clear-csv-btn");

  const outputEl = document.getElementById("jc-output");
  const downloadBtn = document.getElementById("jc-download-btn");
  const errorEl = document.getElementById("jc-error");

  if (
    !jsonInputEl ||
    !jsonToCsvBtn ||
    !clearJsonBtn ||
    !csvFileInput ||
    !csvFileNameEl ||
    !csvToJsonBtn ||
    !clearCsvBtn ||
    !outputEl ||
    !downloadBtn ||
    !errorEl
  ) {
    return; // 不是这个页面
  }

  // 下载相关状态
  let lastResultText = "";
  let lastResultType = ""; // "csv" | "json"
  let lastDownloadFileName = "result.txt";

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function setError(msg) {
    errorEl.textContent = msg || "";
  }

  function setResult(text, type, fileName) {
    lastResultText = text || "";
    lastResultType = type || "";
    lastDownloadFileName = fileName || "result.txt";

    outputEl.value = lastResultText;
    autoResize(outputEl);
  }

  function resetAll() {
    setError("");
    setResult("", "", "result.txt");
    outputEl.classList.remove("error");
  }

  autoResize(jsonInputEl);
  autoResize(outputEl);

  jsonInputEl.addEventListener("input", () => autoResize(jsonInputEl));

  // ---------- JSON → CSV ----------

  function jsonToCsv(jsonText) {
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      throw new Error("Invalid JSON: " + e.message);
    }

    if (!Array.isArray(data)) {
      throw new Error("JSON root must be an array of objects.");
    }

    if (data.length === 0) {
      return "";
    }

    const headerSet = new Set();
    data.forEach((row) => {
      if (row && typeof row === "object" && !Array.isArray(row)) {
        Object.keys(row).forEach((k) => headerSet.add(k));
      }
    });

    const headers = Array.from(headerSet);
    if (headers.length === 0) {
      throw new Error("Array items do not contain object properties to use as CSV headers.");
    }

    function escapeCsvValue(value) {
      if (value === null || value === undefined) return "";
      let str = String(value);

      if (typeof value === "object") {
        str = JSON.stringify(value);
      }

      const mustQuote = /[",\r\n]/.test(str);
      if (mustQuote) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    const lines = [];

    // header
    lines.push(headers.map(escapeCsvValue).join(","));

    // rows
    data.forEach((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        const first = row !== undefined ? JSON.stringify(row) : "";
        lines.push(escapeCsvValue(first));
        return;
      }
      const line = headers.map((key) => {
        const value = row[key];
        return escapeCsvValue(value);
      });
      lines.push(line.join(","));
    });

    return lines.join("\r\n");
  }

  jsonToCsvBtn.addEventListener("click", () => {
    setError("");
    outputEl.classList.remove("error");

    const raw = jsonInputEl.value.trim();
    if (!raw) {
      setError("JSON input is empty. Please paste a JSON array of objects.");
      outputEl.classList.add("error");
      setResult("", "", "result.txt");
      return;
    }

    try {
      const csv = jsonToCsv(raw);
      setResult(csv, "csv", "result.csv");
    } catch (e) {
      setError(e.message || "Failed to convert JSON to CSV.");
      outputEl.classList.add("error");
      setResult("", "", "result.txt");
    }
  });

  clearJsonBtn.addEventListener("click", () => {
    jsonInputEl.value = "";
    autoResize(jsonInputEl);
    resetAll();
  });

  // ---------- CSV → JSON ----------

  function parseCsv(text) {
    const rows = [];
    let current = "";
    let inQuotes = false;
    let row = [];

    const pushCell = () => {
      row.push(current);
      current = "";
    };

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          pushCell();
        } else if (ch === "\r") {
          continue;
        } else if (ch === "\n") {
          pushCell();
          rows.push(row);
          row = [];
        } else {
          current += ch;
        }
      }
    }

    if (current.length > 0 || row.length > 0) {
      pushCell();
      rows.push(row);
    }

    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  }

  function csvToJson(csvText) {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      return "[]";
    }

    const headerRow = rows[0];
    if (headerRow.length === 0) {
      throw new Error("CSV header row is empty.");
    }

    const headers = headerRow.map((h) => h.trim());
    const result = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.every((cell) => cell.trim() === "")) continue;

      const obj = {};
      headers.forEach((key, idx) => {
        const value = row[idx] !== undefined ? row[idx] : "";
        obj[key] = value;
      });
      result.push(obj);
    }

    return JSON.stringify(result, null, 2);
  }

  csvFileInput.addEventListener("change", () => {
    const file = csvFileInput.files && csvFileInput.files[0];
    if (file) {
      csvFileNameEl.textContent = file.name;
    } else {
      csvFileNameEl.textContent = "No file selected";
    }
  });

  csvToJsonBtn.addEventListener("click", () => {
    setError("");
    outputEl.classList.remove("error");

    const file = csvFileInput.files && csvFileInput.files[0];
    if (!file) {
      setError("Please choose a CSV file first.");
      outputEl.classList.add("error");
      setResult("", "", "result.txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result != null ? String(reader.result) : "";
        const json = csvToJson(text);
        const baseName = file.name.replace(/\.[^.]+$/, "") || "result";
        setResult(json, "json", baseName + ".json");
      } catch (e) {
        setError(e.message || "Failed to convert CSV to JSON.");
        outputEl.classList.add("error");
        setResult("", "", "result.txt");
      }
    };
    reader.onerror = () => {
      setError("Failed to read CSV file.");
      outputEl.classList.add("error");
      setResult("", "", "result.txt");
    };

    reader.readAsText(file);
  });

  clearCsvBtn.addEventListener("click", () => {
    csvFileInput.value = "";
    csvFileNameEl.textContent = "No file selected";
    resetAll();
  });

  // ---------- 下载功能 ----------

  downloadBtn.addEventListener("click", () => {
    if (!lastResultText || !lastResultType) {
      alert("No result to download. Please convert JSON or CSV first.");
      return;
    }

    let mimeType = "text/plain";
    if (lastResultType === "csv") {
      mimeType = "text/csv;charset=utf-8";
    } else if (lastResultType === "json") {
      mimeType = "application/json;charset=utf-8";
    }

    const blob = new Blob([lastResultText], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = lastDownloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });
});
