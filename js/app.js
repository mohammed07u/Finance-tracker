/* =========================================================
   Passbook — Finance Tracker
   Backend: Google Sheets via a Google Apps Script Web App
   ---------------------------------------------------------
   1. Open Google Sheets, create a sheet with header row:
      ID | Date | Description | Category | Type | Amount
   2. Extensions > Apps Script, paste apps-script/Code.gs
   3. Deploy > New deployment > Web app
        - Execute as: Me
        - Who has access: Anyone
   4. Copy the Web App URL and paste it below as SCRIPT_URL.
   ========================================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1szh3DweTM_1e-kW1RhKyS8_WWqLpW0GcLEkovvYf7nB8giF-0ZSOIhv2--7Kx3QUMA/exec";

const CATEGORY_COLORS = {
  Food: "#C9A227",
  Transport: "#2F4B3C",
  Bills: "#A6522C",
  Shopping: "#7D8F5B",
  Health: "#5C7A99",
  Salary: "#3E6350",
  Other: "#8A7E6A"
};

const state = {
  entries: [],
  type: "expense",
  loading: true
};

const el = {
  syncDot: document.getElementById("syncDot"),
  syncText: document.getElementById("syncText"),
  balanceFigure: document.getElementById("balanceFigure"),
  totalIncome: document.getElementById("totalIncome"),
  totalExpense: document.getElementById("totalExpense"),
  legend: document.getElementById("categoryLegend"),
  chartEmpty: document.getElementById("chartEmpty"),
  form: document.getElementById("entryForm"),
  fDesc: document.getElementById("fDesc"),
  fAmount: document.getElementById("fAmount"),
  fCategory: document.getElementById("fCategory"),
  typeToggle: document.getElementById("typeToggle"),
  submitBtn: document.getElementById("submitBtn"),
  ledgerRows: document.getElementById("ledgerRows"),
  ledgerSkeleton: document.getElementById("ledgerSkeleton"),
  entryCount: document.getElementById("entryCount"),
  toast: document.getElementById("toast")
};

let chart = null;

/* ---------------- utils ---------------- */

function formatMoney(n){
  const v = Number(n) || 0;
  return "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function animateNumber(elm, from, to, prefix = "₹"){
  const duration = 600;
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = from + (to - from) * eased;
    elm.textContent = prefix + val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function showToast(message, isError = false){
  el.toast.textContent = message;
  el.toast.classList.toggle("error", isError);
  el.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.toast.classList.remove("show"), 2600);
}

function setSyncStatus(live, text){
  el.syncDot.classList.toggle("live", live);
  el.syncText.textContent = text;
}

function uid(){
  return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------------- API ---------------- */

async function apiGet(){
  const res = await fetch(`${SCRIPT_URL}?action=list`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load sheet data");
  return res.json();
}

// Sent as text/plain to avoid a CORS preflight against Apps Script.
async function apiPost(payload){
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to reach sheet");
  return res.json();
}

/* ---------------- rendering ---------------- */

function computeTotals(){
  let income = 0, expense = 0;
  const byCategory = {};
  state.entries.forEach(e => {
    const amt = Number(e.amount) || 0;
    if (e.type === "income") income += amt;
    else {
      expense += amt;
      byCategory[e.category] = (byCategory[e.category] || 0) + amt;
    }
  });
  return { income, expense, balance: income - expense, byCategory };
}

function renderSummary(prevBalance){
  const { income, expense, balance, byCategory } = computeTotals();

  animateNumber(el.balanceFigure, prevBalance, balance);
  el.balanceFigure.classList.toggle("negative", balance < 0);
  animateNumber(el.totalIncome, 0, income);
  animateNumber(el.totalExpense, 0, expense);

  renderChart(byCategory);
  renderLegend(byCategory);

  return balance;
}

function renderLegend(byCategory){
  el.legend.innerHTML = "";
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  entries.forEach(([cat, amt]) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="legend-key">
        <span class="legend-swatch" style="background:${CATEGORY_COLORS[cat] || "#8A7E6A"}"></span>
        ${cat}
      </span>
      <span class="legend-amount">${formatMoney(amt)}</span>
    `;
    el.legend.appendChild(li);
  });
}

function renderChart(byCategory){
  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  const colors = labels.map(l => CATEGORY_COLORS[l] || "#8A7E6A");

  el.chartEmpty.classList.toggle("show", labels.length === 0);

  const ctx = document.getElementById("breakdownChart").getContext("2d");
  if (chart) chart.destroy();
  if (labels.length === 0) return;

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: "#FBF7EE",
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: "68%",
      animation: { animateRotate: true, duration: 700 },
      plugins: { legend: { display: false }, tooltip: { enabled: true } }
    }
  });
}

function renderLedger(){
  el.ledgerSkeleton.remove?.();
  const rows = [...state.entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  el.entryCount.textContent = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`;

  if (rows.length === 0){
    el.ledgerRows.innerHTML = `<div class="ledger-empty">No entries yet — add your first one above.</div>`;
    return;
  }

  el.ledgerRows.innerHTML = "";
  rows.forEach(entry => {
    const row = document.createElement("div");
    row.className = "ledger-row";
    row.dataset.id = entry.id;
    const dateLabel = new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    row.innerHTML = `
      <span class="row-date">${dateLabel}</span>
      <span class="row-main">
        <span class="row-desc">${escapeHtml(entry.description)}</span>
        <span class="row-category">${escapeHtml(entry.category)}</span>
      </span>
      <span class="row-amount ${entry.type}">${entry.type === "income" ? "+" : "−"}${formatMoney(entry.amount)}</span>
      <button class="row-delete" title="Delete" data-id="${entry.id}">✕</button>
    `;
    el.ledgerRows.appendChild(row);
  });
}

function escapeHtml(str = ""){
  return str.replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}

/* ---------------- events ---------------- */

el.typeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".toggle-option");
  if (!btn) return;
  state.type = btn.dataset.type;
  [...el.typeToggle.children].forEach(b => b.classList.toggle("active", b === btn));
});

el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const description = el.fDesc.value.trim();
  const amount = parseFloat(el.fAmount.value);
  const category = el.fCategory.value;
  if (!description || !amount || amount <= 0) return;

  const entry = {
    id: uid(),
    date: new Date().toISOString(),
    description,
    category,
    type: state.type,
    amount
  };

  el.submitBtn.disabled = true;
  const prevBalance = computeTotals().balance;

  // optimistic update
  state.entries.push(entry);
  renderLedger();
  renderSummary(prevBalance);
  el.form.reset();
  el.fCategory.value = category;

  try {
    await apiPost({ action: "add", entry });
    showToast("Entry saved to your sheet");
  } catch (err){
    state.entries = state.entries.filter(x => x.id !== entry.id);
    renderLedger();
    renderSummary(computeTotals().balance);
    showToast("Couldn't save — check your Apps Script URL", true);
  } finally {
    el.submitBtn.disabled = false;
  }
});

el.ledgerRows.addEventListener("click", async (e) => {
  const btn = e.target.closest(".row-delete");
  if (!btn) return;
  const id = btn.dataset.id;
  const rowEl = btn.closest(".ledger-row");
  const removed = state.entries.find(x => x.id === id);
  const prevBalance = computeTotals().balance;

  rowEl.classList.add("removing");
  setTimeout(() => {
    state.entries = state.entries.filter(x => x.id !== id);
    renderLedger();
    renderSummary(prevBalance);
  }, 200);

  try {
    await apiPost({ action: "delete", id });
  } catch (err){
    showToast("Couldn't delete on the sheet — restoring", true);
    if (removed) state.entries.push(removed);
    renderLedger();
    renderSummary(computeTotals().balance);
  }
});

/* ---------------- boot ---------------- */

async function init(){
  if (SCRIPT_URL.includes("PASTE_YOUR")){
    setSyncStatus(false, "Add your Apps Script URL in js/app.js");
    renderLedger();
    renderSummary(0);
    return;
  }
  try {
    const data = await apiGet();
    state.entries = Array.isArray(data.entries) ? data.entries : [];
    setSyncStatus(true, "Synced with Google Sheet");
  } catch (err){
    setSyncStatus(false, "Offline — showing local data only");
  } finally {
    renderLedger();
    renderSummary(0);
  }
}

document.addEventListener("DOMContentLoaded", init);
