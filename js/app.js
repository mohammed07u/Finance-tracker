// ============================================================
// CONFIG — paste your Apps Script Web App URL here.
// It must end in /exec (not /dev), and the deployment's
// "Who has access" must be set to "Anyone".
// ============================================================
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwsAdGuA9cZ7HKUU3x2GyS0BrIHU1smYOFIErMPEeIJstDsyrM2hOSda2gma2-VKTWB/exec",
  REQUEST_TIMEOUT_MS: 12000,
};

const CATEGORY_COLORS = {
  Food: "#c9932e",
  Transport: "#3f7d63",
  Bills: "#b5562e",
  Shopping: "#7a6ba8",
  Health: "#3f7fa6",
  Salary: "#2f6b4f",
  Other: "#8a8375",
};

const els = {
  statusBar: document.getElementById("statusBar"),
  statusText: document.getElementById("statusText"),
  retryBtn: document.getElementById("retryBtn"),
  balance: document.getElementById("balance"),
  totalIn: document.getElementById("totalIn"),
  totalOut: document.getElementById("totalOut"),
  chartCanvas: document.getElementById("categoryChart"),
  chartEmpty: document.getElementById("chartEmpty"),
  chartLegend: document.getElementById("chartLegend"),
  form: document.getElementById("entryForm"),
  description: document.getElementById("description"),
  amount: document.getElementById("amount"),
  category: document.getElementById("category"),
  typeBtns: Array.from(document.querySelectorAll(".type-btn")),
  submitBtn: document.getElementById("submitBtn"),
  ledgerList: document.getElementById("ledgerList"),
  ledgerEmpty: document.getElementById("ledgerEmpty"),
  entryCount: document.getElementById("entryCount"),
};

let entries = [];
let currentType = "expense";

// ---------- networking helper with a real timeout ----------
async function callScript({ method = "GET", action, body }) {
  if (!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.includes("PASTE_YOUR")) {
    throw new Error("No Apps Script URL configured yet — paste it into CONFIG.SCRIPT_URL in js/app.js.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    let url = CONFIG.SCRIPT_URL;
    const opts = { method, signal: controller.signal };

    if (method === "GET") {
      url += `?action=${encodeURIComponent(action)}`;
    } else {
      // text/plain avoids a CORS preflight against Apps Script
      opts.headers = { "Content-Type": "text/plain;charset=utf-8" };
      opts.body = JSON.stringify({ action, ...body });
    }

    const res = await fetch(url, opts);

    if (!res.ok) {
      throw new Error(`Script responded with HTTP ${res.status}. Check the deployment is live and set to "Anyone" access.`);
    }

    const data = await res.json().catch(() => {
      throw new Error("Script responded but not with JSON — check Code.gs is deployed as a Web App, not left as a plain script.");
    });

    if (!data || data.ok === false) {
      throw new Error(data && data.error ? data.error : "Script returned an error with no details.");
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`No response after ${CONFIG.REQUEST_TIMEOUT_MS / 1000}s — the script URL is likely wrong, undeployed, or unreachable.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- status bar ----------
function setStatus(state, message) {
  els.statusBar.classList.remove("ok", "error");
  if (state === "ok") els.statusBar.classList.add("ok");
  if (state === "error") els.statusBar.classList.add("error");
  els.statusText.textContent = message;
  els.retryBtn.classList.toggle("hidden", state !== "error");
}

// ---------- init / connection ----------
async function init() {
  setStatus("connecting", "Connecting to sheet…");
  renderSkeleton();
  try {
    await callScript({ method: "GET", action: "ping" });
    setStatus("ok", "Synced with Google Sheet");
    await loadEntries();
  } catch (err) {
    console.error(err);
    setStatus("error", "Couldn't connect to the sheet");
    showConnectionError(err.message);
  }
}

function showConnectionError(message) {
  els.ledgerList.innerHTML = "";
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.innerHTML = `<strong>Connection failed</strong>${escapeHtml(message)}`;
  els.ledgerList.appendChild(banner);
  els.ledgerEmpty.classList.add("hidden");
  els.entryCount.textContent = "—";
}

els.retryBtn.addEventListener("click", init);

async function loadEntries() {
  try {
    const data = await callScript({ method: "GET", action: "list" });
    entries = (data.entries || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    renderAll();
  } catch (err) {
    console.error(err);
    setStatus("error", "Lost connection to the sheet");
    showConnectionError(err.message);
  }
}

// ---------- render ----------
function renderSkeleton() {
  els.ledgerList.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const li = document.createElement("li");
    li.className = "skeleton-row";
    els.ledgerList.appendChild(li);
  }
}

function renderAll() {
  renderLedger();
  renderTotals();
  renderChart();
}

function formatMoney(n) {
  const v = Number(n) || 0;
  return "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTotals() {
  const totalIn = entries.filter(e => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalOut = entries.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalIn - totalOut;

  els.totalIn.textContent = formatMoney(totalIn);
  els.totalOut.textContent = formatMoney(totalOut);
  els.balance.textContent = formatMoney(balance);
  els.balance.classList.remove("flash");
  void els.balance.offsetWidth; // restart animation
  els.balance.classList.add("flash");
}

function renderLedger() {
  els.ledgerList.innerHTML = "";
  els.entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  els.ledgerEmpty.classList.toggle("hidden", entries.length > 0);

  entries.forEach(entry => {
    const li = document.createElement("li");
    li.className = "ledger-row";
    li.dataset.id = entry.id;

    const sign = entry.type === "income" ? "+" : "−";
    const dateStr = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

    li.innerHTML = `
      <div class="row-main">
        <p class="row-desc">${escapeHtml(entry.description)}</p>
        <p class="row-meta">${escapeHtml(entry.category)} · ${dateStr}</p>
      </div>
      <div class="row-amount ${entry.type === "income" ? "in" : "out"}">${sign} ${formatMoney(entry.amount)}</div>
      <button class="row-delete" title="Delete" aria-label="Delete entry">✕</button>
    `;

    li.querySelector(".row-delete").addEventListener("click", () => handleDelete(entry.id, li));
    els.ledgerList.appendChild(li);
  });
}

function renderChart() {
  const ctx = els.chartCanvas.getContext("2d");
  const size = els.chartCanvas.width;
  ctx.clearRect(0, 0, size, size);

  const byCategory = {};
  entries.filter(e => e.type === "expense").forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
  els.chartEmpty.classList.toggle("hidden", total > 0);
  els.chartLegend.innerHTML = "";

  if (total === 0) return;

  const cx = size / 2, cy = size / 2, rOuter = size / 2 - 8, rInner = rOuter * 0.6;
  let startAngle = -Math.PI / 2;

  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amt]) => {
      const slice = (amt / total) * Math.PI * 2;
      const endAngle = startAngle + slice;
      const color = CATEGORY_COLORS[cat] || "#8a8375";

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rOuter, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle = endAngle;

      const li = document.createElement("li");
      li.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${escapeHtml(cat)} · ${Math.round((amt / total) * 100)}%`;
      els.chartLegend.appendChild(li);
    });

  // punch the hole for the doughnut look
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ---------- type toggle ----------
els.typeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    els.typeBtns.forEach(b => b.classList.toggle("active", b === btn));
  });
});

// ---------- add entry ----------
els.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const entry = {
    description: els.description.value.trim(),
    amount: parseFloat(els.amount.value),
    category: els.category.value,
    type: currentType,
  };
  if (!entry.description || !entry.amount || entry.amount <= 0) return;

  setSubmitting(true);
  try {
    const data = await callScript({ method: "POST", action: "add", body: { entry } });
    entries.unshift(data.entry || { ...entry, id: Date.now(), timestamp: new Date().toISOString() });
    renderAll();
    els.form.reset();
    els.amount.value = "";
    els.description.focus();
  } catch (err) {
    console.error(err);
    setStatus("error", "Couldn't save — sheet unreachable");
    showConnectionError(err.message);
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(isSubmitting) {
  els.submitBtn.disabled = isSubmitting;
  els.submitBtn.querySelector(".submit-spinner").classList.toggle("hidden", !isSubmitting);
}

// ---------- delete entry ----------
async function handleDelete(id, rowEl) {
  rowEl.classList.add("removing");
  try {
    await callScript({ method: "POST", action: "delete", body: { id } });
    setTimeout(() => {
      entries = entries.filter(e => String(e.id) !== String(id));
      renderAll();
    }, 200);
  } catch (err) {
    console.error(err);
    rowEl.classList.remove("removing");
    setStatus("error", "Couldn't delete — sheet unreachable");
  }
}

init();
