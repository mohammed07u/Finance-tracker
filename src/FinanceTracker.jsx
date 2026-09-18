import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Landmark, TrendingUp, Wallet, PiggyBank, Plus, Trash2, ArrowUpRight, ArrowDownRight,
  BookOpen, Sparkles, ChevronDown, X, LayoutDashboard, ArrowLeftRight, BarChart3, Target,
  Search, Bell, FileText, PieChart as PieIcon, Wallet2, ShoppingCart, Home, Car, Plug,
  ShoppingBag, HeartPulse, Clapperboard, CircleDollarSign, Gift, Percent, Briefcase,
  MoreVertical, Sun, Moon, Zap, Laptop, Plane, Crown, PlusCircle, Cloud, CloudOff, RefreshCw,
} from "lucide-react";

/* ---------------- theme tokens ---------------- */
const DARK = {
  name: "dark",
  bg: "#0A0F1E", sidebarBg: "#0D1326", card: "#131A2E", cardAlt: "#0F1526",
  border: "#232B45", text: "#E9ECF6", textSoft: "#8B93AC", textFaint: "#5C6584",
  pillBg: "#1B2340", inputBg: "#0F1526",
};
const LIGHT = {
  name: "light",
  bg: "#EEF1F8", sidebarBg: "#FFFFFF", card: "#FFFFFF", cardAlt: "#F5F7FC",
  border: "#E3E7F0", text: "#1B2340", textSoft: "#6B7390", textFaint: "#9AA1BD",
  pillBg: "#EEF1F8", inputBg: "#F5F7FC",
};
const BLUE = "#3B82F6";
const GREEN = "#14B87F";
const RED = "#F0685C";
const PURPLE = "#9B6BF0";
const AMBER = "#F0B23C";
const GREEN_GRAD = "linear-gradient(135deg, #14B87F 0%, #0C8F63 100%)";
const BLUE_GRAD = "linear-gradient(135deg, #3B82F6 0%, #2554D8 100%)";
const RED_GRAD = "linear-gradient(135deg, #F0685C 0%, #D5372F 100%)";
const PURPLE_GRAD = "linear-gradient(135deg, #9B6BF0 0%, #6C3FD8 100%)";
const CAT_COLORS = ["#F0685C", "#F0B23C", "#E85DA6", "#9B6BF0", "#3BC8E8", "#14B87F", "#3B82F6", "#8B93AC"];

const ThemeCtx = createContext(DARK);
const useT = () => useContext(ThemeCtx);

const ACCOUNT_TYPES = [
  { id: "bank", label: "Bank", icon: Landmark },
  { id: "stocks", label: "Share market", icon: TrendingUp },
  { id: "other", label: "Other platform", icon: Wallet },
  { id: "cash", label: "Cash", icon: PiggyBank },
];
const EXPENSE_CATS = ["Food", "Rent", "Transport", "Utilities", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS = ["Salary", "Bonus", "Interest", "Dividend", "Freelance", "Other income"];
const CATEGORY_ICONS = {
  Food: ShoppingCart, Rent: Home, Transport: Car, Utilities: Plug, Shopping: ShoppingBag,
  Health: HeartPulse, Education: BookOpen, Entertainment: Clapperboard, Other: CircleDollarSign,
  Salary: Landmark, Bonus: Gift, Interest: Percent, Dividend: TrendingUp, Freelance: Briefcase, "Other income": CircleDollarSign,
};

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n || 0));
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const dateKey = (d) => new Date(d).toISOString().slice(0, 10);
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const prevMonthKey = (key) => { const [y, m] = key.split("-").map(Number); return monthKey(new Date(y, m - 2, 1)); };
const monthLabel = (key) => { const [y, m] = key.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" }); };
const lastNMonthKeys = (n) => { const out = []; const now = new Date(); for (let i = n - 1; i >= 0; i--) out.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1))); return out; };
const pctChange = (curr, prev) => (prev ? ((curr - prev) / Math.abs(prev)) * 100 : null);
const greetingWord = () => { const h = new Date().getHours(); if (h < 12) return "Good Morning"; if (h < 17) return "Good Afternoon"; return "Good Evening"; };

function goalIconFor(name) {
  const n = name.toLowerCase();
  if (n.includes("laptop") || n.includes("phone") || n.includes("computer")) return Laptop;
  if (n.includes("trip") || n.includes("travel") || n.includes("vacation")) return Plane;
  if (n.includes("emergency")) return PiggyBank;
  if (n.includes("home") || n.includes("house")) return Home;
  if (n.includes("car") || n.includes("bike") || n.includes("vehicle")) return Car;
  return Target;
}

const GUIDE = [
  { title: "Build a real emergency fund", body: "Keep 3 to 6 months of expenses in your bank account or a liquid fund — money you can touch within a day. This is what stops one bad month from turning into debt." },
  { title: "Give every rupee a job — try 50/30/20", body: "50% of income to needs (rent, food, bills), 30% to wants, 20% to savings and investing. It's a starting ratio, not a law — adjust it, but track it." },
  { title: "Start investing before you feel ready", body: "A SIP into an index fund started at a modest amount and left alone for years usually beats a bigger SIP started five years late. Time in the market matters more than timing it." },
  { title: "Spread money across platforms", body: "Bank deposits are safe but lose to inflation over time. Shares and mutual funds grow faster but swing more. Holding a mix — not all in one platform — is how you manage that trade-off." },
  { title: "Insure before you invest", body: "A term life policy and a health policy are cheap compared to the disaster they prevent. Get these in place before chasing investment returns." },
  { title: "Small leaks sink big ships", body: "Subscriptions, delivery fees, impulse buys — track them for one month and you'll usually find 5 to 10% of your spending you didn't mean to commit to." },
  { title: "Avoid revolving high-interest debt", body: "Credit card interest often runs past 30% a year. Paying only the minimum turns a small bill into a long one. Clear it in full, every cycle, before anything else." },
  { title: "Review your money every month", body: "A 15-minute check-in — what came in, what went out, what changed — catches problems early and keeps your goals honest." },
];

/* ---------------- storage ---------------- */
const STORE_KEY = "finance-tracker-data-v3";

// Paste your Google Apps Script Web App URL here (Deploy > Manage deployments > Web app).
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoYYWEWBoq415zOvospF-xQclgLDr-yhkDasIK-5Tlbr7XZFwJTVwdm2iAZkhjM3kMAQ/exec";

// Local cache — used instantly on load and as an offline fallback if the sheet is unreachable.
function loadLocalCache() { try { const raw = localStorage.getItem(STORE_KEY); if (raw) return JSON.parse(raw); } catch (e) {} return null; }
function saveLocalCache(data) { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {} }

// Remote (Google Sheet via Apps Script) — the sheet holds one JSON blob per collection
// (accounts / transactions / goalsList / budgets / theme), so arbitrary shaped records
// don't need a rigid column layout.
async function loadRemoteData() {
  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) return null;
  const res = await fetch(`${SCRIPT_URL}?action=all`);
  if (!res.ok) throw new Error("Sheet returned an error");
  const data = await res.json();
  if (!data || typeof data !== "object" || data.error) throw new Error(data?.error || "Bad response");
  return data;
}

let saveTimer = null;
function saveRemoteData(data, onStatus) {
  if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) return;
  clearTimeout(saveTimer);
  onStatus && onStatus("saving");
  saveTimer = setTimeout(async () => {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "sync", ...data }),
      });
      onStatus && onStatus("synced");
    } catch (e) {
      onStatus && onStatus("offline");
    }
  }, 800);
}

/* ---------------- atoms ---------------- */
function Card({ children, style }) {
  const T = useT();
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px", transition: "background .2s ease, border-color .2s ease", ...style }}>{children}</div>;
}
function IconCircle({ Icon, bg, fg, size = 34 }) {
  return <div style={{ width: size, height: size, borderRadius: 10, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={size * 0.5} strokeWidth={2.2} /></div>;
}
function useInputStyle() {
  const T = useT();
  return { width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13.5, background: T.inputBg, color: T.text, outline: "none", transition: "border-color .15s ease, box-shadow .15s ease" };
}
function Field({ label, children }) {
  const T = useT();
  return <div><div style={{ fontSize: 11.5, color: T.textSoft, marginBottom: 5 }}>{label}</div>{children}</div>;
}
function EmptyState({ icon: Icon, text }) {
  const T = useT();
  return (
    <div style={{ textAlign: "center", padding: "30px 10px" }}>
      {Icon && <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.pillBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Icon size={19} color={T.textFaint} /></div>}
      <div style={{ fontSize: 13.5, color: T.textSoft, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
function ProgressBar({ pct, color }) {
  const T = useT();
  return <div style={{ height: 7, borderRadius: 4, background: T.pillBg, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 4, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} /></div>;
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "budgets", label: "Budgets", icon: PieIcon },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "guide", label: "Guide", icon: BookOpen },
];

/* ---------------- app ---------------- */
export default function FinanceTracker() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goalsList, setGoalsList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("dashboard");
  const [openGuide, setOpenGuide] = useState(null);
  const [syncStatus, setSyncStatus] = useState("connecting"); // connecting | synced | saving | offline | local
  const quickAmountRef = useRef(null);
  const firstRun = useRef(true);

  useEffect(() => {
    (async () => {
      const cached = loadLocalCache();
      if (cached) {
        setAccounts(cached.accounts || []);
        setTransactions(cached.transactions || []);
        setGoalsList(cached.goalsList || []);
        setBudgets(cached.budgets || []);
        setTheme(cached.theme || "dark");
      }
      try {
        const remote = await loadRemoteData();
        if (remote) {
          setAccounts(remote.accounts || []);
          setTransactions(remote.transactions || []);
          setGoalsList(remote.goalsList || []);
          setBudgets(remote.budgets || []);
          setTheme(remote.theme || cached?.theme || "dark");
          setSyncStatus("synced");
        } else {
          setSyncStatus(cached ? "local" : "offline");
        }
      } catch (e) {
        setSyncStatus(cached ? "local" : "offline");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    const snapshot = { accounts, transactions, goalsList, budgets, theme };
    saveLocalCache(snapshot);
    saveRemoteData(snapshot, setSyncStatus);
  }, [accounts, transactions, goalsList, budgets, theme, loaded]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setTab("dashboard");
        setTimeout(() => quickAmountRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const T = theme === "dark" ? DARK : LIGHT;

  const netWorth = useMemo(() => accounts.reduce((s, a) => s + Number(a.balance || 0), 0), [accounts]);
  const byType = useMemo(() => {
    const m = {}; ACCOUNT_TYPES.forEach((t) => (m[t.id] = 0));
    accounts.forEach((a) => (m[a.type] = (m[a.type] || 0) + Number(a.balance || 0)));
    return m;
  }, [accounts]);

  const thisMonthKey = monthKey(new Date());
  const lastMonthKeyVal = prevMonthKey(thisMonthKey);
  const monthTotals = (key) => {
    const txns = transactions.filter((t) => monthKey(new Date(t.date)) === key);
    return {
      income: txns.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0),
      expense: txns.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0),
    };
  };
  const thisMonth = monthTotals(thisMonthKey);
  const lastMonth = monthTotals(lastMonthKeyVal);
  const monthNet = thisMonth.income - thisMonth.expense;
  const lastMonthNet = lastMonth.income - lastMonth.expense;
  const startOfMonthBalance = netWorth - monthNet;

  const incomeChange = pctChange(thisMonth.income, lastMonth.income);
  const expenseChange = pctChange(thisMonth.expense, lastMonth.expense);
  const balanceChange = pctChange(monthNet, startOfMonthBalance !== 0 ? startOfMonthBalance : null);
  const savingsChange = pctChange(monthNet, lastMonthNet);

  const monthTxns = useMemo(() => transactions.filter((t) => monthKey(new Date(t.date)) === thisMonthKey), [transactions, thisMonthKey]);
  const savingsRate = thisMonth.income > 0 ? (monthNet / thisMonth.income) * 100 : null;

  const categoryBreakdown = useMemo(() => {
    const m = {};
    monthTxns.filter((t) => t.kind === "expense").forEach((t) => { m[t.category] = (m[t.category] || 0) + Number(t.amount); });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTxns]);

  const avgMonthlyExpense = useMemo(() => {
    const totals = lastNMonthKeys(3).map((k) => monthTotals(k).expense).filter((t) => t > 0);
    return totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  }, [transactions]);
  const emergencyMonths = avgMonthlyExpense > 0 ? (byType.bank + byType.cash) / avgMonthlyExpense : null;
  const investedShare = netWorth > 0 ? ((byType.stocks + byType.other) / netWorth) * 100 : 0;

  function addAccount(acc) { setAccounts((a) => [...a, { id: uid(), ...acc }]); }
  function deleteAccount(id) { setAccounts((a) => a.filter((x) => x.id !== id)); }
  function addTransaction(txn) {
    const t = { id: uid(), ...txn };
    setTransactions((prev) => [t, ...prev]);
    if (txn.accountId) {
      setAccounts((prev) => prev.map((a) => a.id === txn.accountId
        ? { ...a, balance: Number(a.balance) + (txn.kind === "income" ? Number(txn.amount) : -Number(txn.amount)) } : a));
    }
  }
  function deleteTransaction(t) {
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
    if (t.accountId) {
      setAccounts((prev) => prev.map((a) => a.id === t.accountId
        ? { ...a, balance: Number(a.balance) - (t.kind === "income" ? Number(t.amount) : -Number(t.amount)) } : a));
    }
  }
  function addGoal(g) { setGoalsList((prev) => [...prev, { id: uid(), current: 0, ...g }]); }
  function updateGoal(id, patch) { setGoalsList((prev) => prev.map((g) => g.id === id ? { ...g, ...patch } : g)); }
  function deleteGoal(id) { setGoalsList((prev) => prev.filter((g) => g.id !== id)); }
  function addBudget(b) { setBudgets((prev) => [...prev, { id: uid(), ...b }]); }
  function deleteBudget(id) { setBudgets((prev) => prev.filter((b) => b.id !== id)); }

  const nudgeCount = useMemo(() => {
    let n = 0;
    if (savingsRate !== null && savingsRate < 20) n++;
    if (emergencyMonths !== null && emergencyMonths < 3) n++;
    if (netWorth > 0 && (investedShare < 20 || investedShare > 80)) n++;
    budgets.forEach((b) => {
      const spent = categoryBreakdown.find((c) => c.name === b.category)?.value || 0;
      if (spent > b.limit) n++;
    });
    return n;
  }, [savingsRate, emergencyMonths, investedShare, netWorth, budgets, categoryBreakdown]);

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          button { cursor: pointer; font-family: inherit; }
          input, select { font-family: inherit; }
          ::placeholder { color: ${T.textFaint}; }
          ::-webkit-scrollbar { width: 7px; height: 7px; }
          ::-webkit-scrollbar-thumb { background: #26304C; border-radius: 4px; }
          select option { background: ${T.inputBg}; color: ${T.text}; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .ft-fade-up { animation: fadeUp .35s ease both; }
        `}</style>

        <Sidebar tab={tab} setTab={setTab} />

        <div style={{ flex: 1, minWidth: 0, padding: "20px 28px 40px" }}>
          <TopBar todayLabel={todayLabel} theme={theme} setTheme={setTheme} nudgeCount={nudgeCount} syncStatus={syncStatus} />

          <div key={tab} className="ft-fade-up">
            {tab === "dashboard" && (
              <Dashboard
                netWorth={netWorth} thisMonth={thisMonth} monthNet={monthNet}
                incomeChange={incomeChange} expenseChange={expenseChange} balanceChange={balanceChange} savingsChange={savingsChange}
                transactions={transactions} categoryBreakdown={categoryBreakdown} accounts={accounts}
                addTransaction={addTransaction} deleteTransaction={deleteTransaction}
                goalsList={goalsList} setTab={setTab} quickAmountRef={quickAmountRef}
              />
            )}
            {tab === "transactions" && <Transactions accounts={accounts} transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />}
            {tab === "accounts" && <Accounts accounts={accounts} addAccount={addAccount} deleteAccount={deleteAccount} />}
            {tab === "budgets" && <Budgets budgets={budgets} addBudget={addBudget} deleteBudget={deleteBudget} categoryBreakdown={categoryBreakdown} />}
            {tab === "goals" && <Goals goalsList={goalsList} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} />}
            {tab === "reports" && (
              <Reports netWorth={netWorth} byType={byType} savingsRate={savingsRate} emergencyMonths={emergencyMonths}
                investedShare={investedShare} categoryBreakdown={categoryBreakdown} monthIncome={thisMonth.income}
                monthExpense={thisMonth.expense} accounts={accounts} budgets={budgets} />
            )}
            {tab === "guide" && <Guide openGuide={openGuide} setOpenGuide={setOpenGuide} />}
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

/* ---------------- sidebar ---------------- */
function Sidebar({ tab, setTab }) {
  const T = useT();
  return (
    <div style={{ width: 240, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "22px 16px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 26 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#3BC8E8,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, color: "#fff" }}>P</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>Passbook</div>
          <div style={{ fontSize: 11, color: T.textSoft }}>Your Finance Tracker</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV.map((n) => {
          const active = tab === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9,
              border: "none", background: active ? BLUE : "transparent", color: active ? "#fff" : T.textSoft,
              fontSize: 13.8, fontWeight: active ? 600 : 500, textAlign: "left", transition: "background .15s ease, color .15s ease",
            }}>
              <Icon size={17} /> {n.label}
            </button>
          );
        })}
      </div>

      <div style={{ borderRadius: 14, padding: "18px 16px", marginTop: 14, background: "linear-gradient(160deg, #16321F 0%, #0D1A12 100%)", border: `1px solid #1E3A28`, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Crown size={15} color={AMBER} />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>Upgrade Your Habits</div>
        <div style={{ fontSize: 12, color: "#9FB0A5", lineHeight: 1.5, marginBottom: 12 }}>Track smarter. Save better. Live brighter.</div>
        <button onClick={() => setTab("guide")} style={{ width: "100%", background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          Let's Grow <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}

function SyncPill({ status }) {
  const T = useT();
  const map = {
    connecting: { icon: RefreshCw, label: "Connecting…", color: T.textSoft, spin: true },
    saving: { icon: RefreshCw, label: "Saving…", color: T.textSoft, spin: true },
    synced: { icon: Cloud, label: "Synced with sheet", color: GREEN, spin: false },
    local: { icon: CloudOff, label: "Local only", color: AMBER, spin: false },
    offline: { icon: CloudOff, label: "Offline", color: RED, spin: false },
  };
  const s = map[status] || map.offline;
  const Icon = s.icon;
  return (
    <div title={s.label} style={{ display: "flex", alignItems: "center", gap: 7, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 12, color: s.color, fontWeight: 600 }}>
      <Icon size={13} style={s.spin ? { animation: "spin 1s linear infinite" } : undefined} />
      <span style={{ display: "none" }}>{s.label}</span>
    </div>
  );
}

function TopBar({ todayLabel, theme, setTheme, nudgeCount, syncStatus }) {
  const T = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", flex: "1 1 320px", maxWidth: 420 }}>
        <Search size={16} color={T.textFaint} />
        <span style={{ fontSize: 13.5, color: T.textFaint }}>Search transactions, categories...</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SyncPill status={syncStatus} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.textSoft }}>{todayLabel}</div>
        <div style={{ display: "flex", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3 }}>
          <button onClick={() => setTheme("light")} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: theme === "light" ? BLUE : "transparent", color: theme === "light" ? "#fff" : T.textSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Sun size={14} /></button>
          <button onClick={() => setTheme("dark")} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: theme === "dark" ? BLUE : "transparent", color: theme === "dark" ? "#fff" : T.textSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Moon size={14} /></button>
        </div>
        <div style={{ position: "relative", width: 38, height: 38, borderRadius: 9, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={16} color={T.textSoft} />
          {nudgeCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: RED, color: "#fff", fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{nudgeCount}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#3BC8E8,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>Y</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- dashboard ---------------- */
function StatCard({ label, value, change, icon: Icon, grad }) {
  const positive = change !== null && change >= 0;
  return (
    <div style={{ background: grad, borderRadius: 14, padding: "18px 20px", color: "#fff", minHeight: 108, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} /></div>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{label}</span>
        </div>
        <MoreVertical size={15} style={{ opacity: 0.7 }} />
      </div>
      <div>
        <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>{fmt(value)}</div>
        <div style={{ fontSize: 11.5, opacity: 0.9 }}>{change === null ? "No prior data yet" : <>{positive ? "▲" : "▼"} {Math.abs(change).toFixed(0)}% from last month</>}</div>
      </div>
    </div>
  );
}

function buildTrend(transactions, range) {
  const monthTotalsFn = (key) => {
    const txns = transactions.filter((t) => monthKey(new Date(t.date)) === key);
    return { income: txns.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0), expense: txns.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0) };
  };
  if (range === "7D" || range === "30D") {
    const days = range === "7D" ? 7 : 30;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const dayTxns = transactions.filter((t) => dateKey(t.date) === key);
      out.push({
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        Income: dayTxns.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0),
        Expense: dayTxns.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return out;
  }
  let n = 6;
  if (range === "1Y") n = 12;
  if (range === "All") {
    if (transactions.length === 0) n = 6;
    else {
      const earliest = transactions.reduce((min, t) => (new Date(t.date) < min ? new Date(t.date) : min), new Date());
      const monthsSince = (new Date().getFullYear() - earliest.getFullYear()) * 12 + (new Date().getMonth() - earliest.getMonth()) + 1;
      n = Math.min(Math.max(monthsSince, 6), 36);
    }
  }
  return lastNMonthKeys(n).map((k) => {
    const t = monthTotalsFn(k);
    const [y, m] = k.split("-");
    return { label: `${monthLabel(k)} ${y.slice(2)}`, Income: t.income, Expense: t.expense };
  });
}

function CustomTooltip({ active, payload, label }) {
  const T = useT();
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: T.text }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textSoft, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          {p.dataKey} <span style={{ marginLeft: "auto", fontWeight: 700, color: T.text }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ netWorth, thisMonth, monthNet, incomeChange, expenseChange, balanceChange, savingsChange, transactions, categoryBreakdown, accounts, addTransaction, deleteTransaction, goalsList, setTab, quickAmountRef }) {
  const T = useT();
  const recent = transactions.slice(0, 4);
  const [range, setRange] = useState("6M");
  const trend = useMemo(() => buildTrend(transactions, range), [transactions, range]);
  const hasData = trend.some((t) => t.Income > 0 || t.Expense > 0);

  return (
    <div>
      <div style={{
        borderRadius: 16, padding: "22px 26px", marginBottom: 22, position: "relative", overflow: "hidden", color: "#fff",
        backgroundImage: "linear-gradient(100deg, rgba(8,12,26,0.75) 0%, rgba(8,12,26,0.35) 55%, rgba(8,12,26,0.65) 100%), url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=60)",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{greetingWord()}, <span style={{ color: "#6EE7C0" }}>You</span> 👋</div>
          <div style={{ fontSize: 13.5, opacity: 0.9, marginTop: 4 }}>Here's your financial overview for today.</div>
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.9, maxWidth: 220, textAlign: "right", fontStyle: "italic" }}>"A better tomorrow starts with smarter decisions today."</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Current Balance" value={netWorth} change={balanceChange} icon={Wallet2} grad={GREEN_GRAD} />
        <StatCard label="Total Income" value={thisMonth.income} change={incomeChange} icon={ArrowUpRight} grad={BLUE_GRAD} />
        <StatCard label="Total Expense" value={thisMonth.expense} change={expenseChange} icon={ArrowDownRight} grad={RED_GRAD} />
        <StatCard label="Total Savings" value={monthNet} change={savingsChange} icon={PieIcon} grad={PURPLE_GRAD} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={16} color={T.textSoft} /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Income vs Expense</span></div>
            <div style={{ display: "flex", gap: 3, background: T.pillBg, borderRadius: 8, padding: 3 }}>
              {["7D", "30D", "6M", "1Y", "All"].map((r) => (
                <button key={r} onClick={() => setRange(r)} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, border: "none", background: range === r ? BLUE : "transparent", color: range === r ? "#fff" : T.textSoft }}>{r}</button>
              ))}
            </div>
          </div>
          {!hasData ? (
            <EmptyState icon={BarChart3} text={<>No data yet<br />Start adding transactions to see your income vs expense trends.</>} />
          ) : (
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity={0.35} /><stop offset="100%" stopColor={GREEN} stopOpacity={0} /></linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={RED} stopOpacity={0.3} /><stop offset="100%" stopColor={RED} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={T.border} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Income" stroke={GREEN} strokeWidth={2.5} fill="url(#incomeGrad)" isAnimationActive={true} animationDuration={600} />
                  <Area type="monotone" dataKey="Expense" stroke={RED} strokeWidth={2.5} fill="url(#expenseGrad)" isAnimationActive={true} animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: T.textSoft, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} /> Income</span>
                <span style={{ fontSize: 12, color: T.textSoft, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: RED }} /> Expense</span>
              </div>
            </div>
          )}
        </Card>

        <QuickAdd accounts={accounts} addTransaction={addTransaction} quickAmountRef={quickAmountRef} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} color={T.textSoft} /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Recent Transactions</span></div>
            <button onClick={() => setTab("transactions")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12.5, fontWeight: 600 }}>View All →</button>
          </div>
          {recent.length === 0 ? <EmptyState icon={FileText} text={<>No transactions yet<br />Add your first transaction to get started.</>} /> : recent.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><PieIcon size={16} color={T.textSoft} /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Spending by Category</span></div>
            <button onClick={() => setTab("reports")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12.5, fontWeight: 600 }}>View All →</button>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", border: `10px solid ${T.pillBg}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: T.textSoft }}>Total</div><div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(0)}</div></div>
              </div>
              <div style={{ fontSize: 12.5, color: T.textSoft }}>No expenses logged yet this month.</div>
            </div>
          ) : <CategoryDonut data={categoryBreakdown} />}
        </Card>

        <GoalsSummaryCard goalsList={goalsList} setTab={setTab} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 22px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Zap size={16} color={AMBER} /><span style={{ fontSize: 13.5, color: T.textSoft }}>Small steps today, big financial freedom tomorrow.</span></div>
        <button onClick={() => setTab("goals")} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>Keep Going <ArrowUpRight size={13} /></button>
      </div>
    </div>
  );
}

function CategoryDonut({ data }) {
  const T = useT();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 14px" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={2} isAnimationActive={true} animationDuration={500}>
              {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 10.5, color: T.textSoft }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(total)}</div>
        </div>
      </div>
      {data.slice(0, 6).map((d, i) => (
        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: T.textSoft }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[i % CAT_COLORS.length] }} /> {d.name}</span>
          <span style={{ color: T.text }}>{((d.value / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

function GoalsSummaryCard({ goalsList, setTab }) {
  const T = useT();
  if (goalsList.length === 0) {
    return (
      <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Target size={16} color="#C9A6FF" /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Set a Financial Goal</span></div>
          <div style={{ fontSize: 12.5, color: T.textSoft, lineHeight: 1.5, marginBottom: 16 }}>Turn your goals into reality with better money habits.</div>
        </div>
        <button onClick={() => setTab("goals")} style={{ background: PURPLE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Set Goal <ArrowUpRight size={14} /></button>
      </Card>
    );
  }
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Target size={16} color="#C9A6FF" /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Your Financial Goals</span></div>
        <button onClick={() => setTab("goals")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12.5, fontWeight: 600 }}>View All →</button>
      </div>
      {goalsList.slice(0, 3).map((g) => {
        const Icon = goalIconFor(g.name);
        const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
        return (
          <div key={g.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}><Icon size={14} color={T.textSoft} /> {g.name}</span>
              <span style={{ fontSize: 11.5, color: T.textSoft }}>{pct.toFixed(0)}%</span>
            </div>
            <ProgressBar pct={pct} color={PURPLE} />
          </div>
        );
      })}
    </Card>
  );
}

function QuickAdd({ accounts, addTransaction, quickAmountRef }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const [kind, setKind] = useState("expense");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => { setCategory(kind === "expense" ? EXPENSE_CATS[0] : INCOME_CATS[0]); }, [kind]);
  useEffect(() => { if (!accountId && accounts[0]) setAccountId(accounts[0].id); }, [accounts]);

  function submit() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("Enter a valid amount."); return; }
    if (!accountId) { setError("Add an account first."); return; }
    addTransaction({ kind, category, amount: Number(amount), accountId, date: new Date(date).toISOString(), note: note.trim() });
    setAmount(""); setNote(""); setError("");
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} color="#fff" /></div>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Quick Add Transaction</span>
        </div>
        <span style={{ fontSize: 10.5, color: T.textFaint, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>Ctrl+N</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["expense", "income"].map((k) => (
          <button key={k} onClick={() => setKind(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: kind === k ? (k === "income" ? GREEN : RED) : T.pillBg, color: kind === k ? "#fff" : T.textSoft, transition: "background .15s ease" }}>{k === "income" ? "Income" : "Expense"}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Description"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Groceries, Salary, Rent..." /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Amount"><input ref={quickAmountRef} style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></Field>
          <Field label="Category"><select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>{(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Account"><select style={inputStyle} value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.length === 0 && <option value="">Add an account</option>}{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
        </div>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={submit} style={{ background: RED_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={15} /> Add Transaction</button>
      </div>
    </Card>
  );
}

function TxnRow({ t, onDelete, accounts }) {
  const T = useT();
  const acct = accounts?.find((a) => a.id === t.accountId);
  const isIncome = t.kind === "income";
  const Icon = CATEGORY_ICONS[t.category] || CircleDollarSign;
  return (
    <div className="ft-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: `1px solid ${T.border}`, gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <IconCircle Icon={Icon} bg={isIncome ? "rgba(20,184,127,0.18)" : "rgba(240,104,92,0.18)"} fg={isIncome ? GREEN : RED} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category}{t.note ? ` · ${t.note}` : ""}</div>
          <div style={{ fontSize: 11.5, color: T.textSoft }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{acct ? ` · ${acct.name}` : ""}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isIncome ? GREEN : RED }}>{isIncome ? "+" : "−"}{fmt(t.amount)}</div>
        <button onClick={onDelete} style={{ border: "none", background: "none", color: T.textFaint, padding: 4 }}><Trash2 size={13.5} /></button>
      </div>
    </div>
  );
}

/* ---------------- accounts page ---------------- */
function Accounts({ accounts, addAccount, deleteAccount }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) { setError("Give this account a name."); return; }
    if (balance === "" || isNaN(Number(balance))) { setError("Enter a valid balance."); return; }
    addAccount({ name: name.trim(), type, balance: Number(balance) });
    setName(""); setBalance(""); setType("bank"); setError(""); setShowForm(false);
  }

  const grouped = ACCOUNT_TYPES.map((t) => ({ ...t, accounts: accounts.filter((a) => a.type === t.id) }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Accounts</div>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>{showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add account"}</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Account name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings" style={inputStyle} /></Field>
            <Field label="Type"><select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>{ACCOUNT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></Field>
            <Field label="Current balance (₹)"><input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" placeholder="0" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: RED, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      {accounts.length === 0 && !showForm && <Card><EmptyState icon={Landmark} text="No accounts yet. Add your bank account, demat or stock account, and any other platform where you hold money." /></Card>}

      {grouped.filter((g) => g.accounts.length > 0).map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><g.icon size={13} /> {g.label}</div>
          <Card style={{ padding: 0 }}>
            {g.accounts.map((a, i) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{a.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(a.balance)}</div>
                  <button onClick={() => deleteAccount(a.id)} style={{ border: "none", background: "none", color: T.textFaint }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

/* ---------------- transactions page ---------------- */
function Transactions({ accounts, transactions, addTransaction, deleteTransaction }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState("expense");
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { setCategory(kind === "expense" ? EXPENSE_CATS[0] : INCOME_CATS[0]); }, [kind]);
  useEffect(() => { if (!accountId && accounts[0]) setAccountId(accounts[0].id); }, [accounts]);

  function submit() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("Enter a valid amount."); return; }
    if (!accountId) { setError("Add an account first, then link this transaction to it."); return; }
    addTransaction({ kind, category, amount: Number(amount), accountId, date: new Date(date).toISOString(), note: note.trim() });
    setAmount(""); setNote(""); setError(""); setShowForm(false);
  }

  const filtered = transactions.filter((t) => filter === "all" ? true : t.kind === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Transactions</div>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>{showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add transaction"}</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["expense", "income"].map((k) => (
              <button key={k} onClick={() => setKind(k)} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}`, background: kind === k ? (k === "income" ? GREEN : RED) : "transparent", color: kind === k ? "#fff" : T.textSoft }}>{k === "income" ? "Money in" : "Money out"}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>{(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Amount (₹)"><input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" style={inputStyle} /></Field>
            <Field label="Account"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.length === 0 && <option value="">No accounts yet</option>}{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Date"><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></Field>
            <Field label="Note (optional)"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. September salary" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: RED, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["all", "All"], ["income", "Money in"], ["expense", "Money out"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding: "6px 12px", borderRadius: 16, fontSize: 12.5, border: `1px solid ${T.border}`, background: filter === id ? T.pillBg : "transparent", color: T.text, fontWeight: filter === id ? 600 : 400 }}>{label}</button>
        ))}
      </div>

      <Card style={{ padding: "6px 22px" }}>
        {filtered.length === 0 ? <EmptyState icon={FileText} text="Nothing here yet." /> : filtered.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)}
      </Card>
    </div>
  );
}

/* ---------------- budgets page ---------------- */
function Budgets({ budgets, addBudget, deleteBudget, categoryBreakdown }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");

  const available = EXPENSE_CATS.filter((c) => !budgets.some((b) => b.category === c));

  function submit() {
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) { setError("Enter a valid monthly limit."); return; }
    addBudget({ category, limit: Number(limit) });
    setLimit(""); setError(""); setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Budgets</div>
        {available.length > 0 && <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>{showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add budget"}</button>}
      </div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginBottom: 18 }}>Set a monthly spending limit per category and track it live.</div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>{available.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Monthly limit (₹)"><input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" placeholder="5000" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: RED, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      {budgets.length === 0 ? (
        <Card><EmptyState icon={PieIcon} text="No budgets set yet. Add a monthly limit for a category like Food or Shopping to start tracking against it." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {budgets.map((b) => {
            const spent = categoryBreakdown.find((c) => c.name === b.category)?.value || 0;
            const pct = (spent / b.limit) * 100;
            const over = spent > b.limit;
            const color = over ? RED : pct > 70 ? AMBER : GREEN;
            const Icon = CATEGORY_ICONS[b.category] || CircleDollarSign;
            return (
              <Card key={b.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700 }}><Icon size={16} color={T.textSoft} /> {b.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: over ? RED : T.textSoft, fontWeight: over ? 700 : 400 }}>{fmt(spent)} / {fmt(b.limit)}</span>
                    <button onClick={() => deleteBudget(b.id)} style={{ border: "none", background: "none", color: T.textFaint }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <ProgressBar pct={pct} color={color} />
                {over && <div style={{ fontSize: 12, color: RED, marginTop: 8 }}>Over budget by {fmt(spent - b.limit)} this month.</div>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- goals page ---------------- */
function Goals({ goalsList, addGoal, updateGoal, deleteGoal }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) { setError("Give this goal a name."); return; }
    if (!target || Number(target) <= 0) { setError("Enter a valid target amount."); return; }
    addGoal({ name: name.trim(), target: Number(target) });
    setName(""); setTarget(""); setError(""); setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Financial Goals</div>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>{showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add goal"}</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Goal name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Laptop, Vacation Trip" style={inputStyle} /></Field>
            <Field label="Target amount (₹)"><input value={target} onChange={(e) => setTarget(e.target.value)} type="number" placeholder="80000" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: RED, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      {goalsList.length === 0 ? (
        <Card><EmptyState icon={Target} text="No goals yet. Add one for a laptop, a trip, or an emergency fund, and track your progress toward it." /></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {goalsList.map((g) => {
            const Icon = goalIconFor(g.name);
            const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
            return (
              <Card key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5, fontWeight: 700 }}><IconCircle Icon={Icon} bg="rgba(155,107,240,0.16)" fg={PURPLE} size={32} /> {g.name}</span>
                  <button onClick={() => deleteGoal(g.id)} style={{ border: "none", background: "none", color: T.textFaint }}><Trash2 size={14} /></button>
                </div>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 8 }}>{fmt(g.current)} of {fmt(g.target)} · {pct.toFixed(0)}%</div>
                <ProgressBar pct={pct} color={PURPLE} />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => updateGoal(g.id, { current: Math.max(0, Number(g.current) - 1000) })} style={{ flex: 1, border: `1px solid ${T.border}`, background: "transparent", color: T.text, borderRadius: 7, padding: "7px 0", fontSize: 12.5, fontWeight: 600 }}>− ₹1,000</button>
                  <button onClick={() => updateGoal(g.id, { current: Number(g.current) + 1000 })} style={{ flex: 1, border: "none", background: PURPLE, color: "#fff", borderRadius: 7, padding: "7px 0", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><PlusCircle size={13} /> ₹1,000</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- reports page ---------------- */
function Reports({ netWorth, byType, savingsRate, emergencyMonths, investedShare, categoryBreakdown, monthIncome, monthExpense, accounts, budgets }) {
  const T = useT();
  const nudges = [];
  if (accounts.length === 0) nudges.push({ tone: "neutral", text: "Add your accounts first — bank, share market, and anything else — so this can actually track your money." });
  if (monthIncome === 0 && accounts.length > 0) nudges.push({ tone: "neutral", text: "No income logged this month yet. Add your salary credit as soon as it lands so your savings rate stays accurate." });
  if (savingsRate !== null) {
    if (savingsRate < 0) nudges.push({ tone: "warn", text: `You've spent ${fmt(monthExpense - monthIncome)} more than you earned this month. Worth a closer look at where it went.` });
    else if (savingsRate < 20) nudges.push({ tone: "warn", text: `You're saving ${savingsRate.toFixed(0)}% of income this month, below the 20% guideline. Check the category breakdown for the biggest lever.` });
    else nudges.push({ tone: "good", text: `You're saving ${savingsRate.toFixed(0)}% of income this month — at or above the 20% guideline. Keep it up.` });
  }
  if (emergencyMonths !== null) {
    if (emergencyMonths < 3) nudges.push({ tone: "warn", text: `Your bank and cash cover about ${emergencyMonths.toFixed(1)} months of expenses. Aim for 3 to 6 before investing aggressively.` });
    else nudges.push({ tone: "good", text: `Your emergency fund covers about ${emergencyMonths.toFixed(1)} months of expenses — a healthy cushion.` });
  }
  if (netWorth > 0) {
    if (investedShare < 20) nudges.push({ tone: "warn", text: `Only ${investedShare.toFixed(0)}% of your net worth is in shares or other growth platforms. Idle bank cash beyond your emergency fund loses value to inflation over time.` });
    else if (investedShare > 80) nudges.push({ tone: "warn", text: `${investedShare.toFixed(0)}% of your net worth sits in shares or other platforms with little in the bank. Make sure your emergency fund isn't at risk of market dips.` });
    else nudges.push({ tone: "good", text: `Your money is split across bank and growth platforms in a reasonable balance — about ${investedShare.toFixed(0)}% invested.` });
  }
  budgets.forEach((b) => {
    const spent = categoryBreakdown.find((c) => c.name === b.category)?.value || 0;
    if (spent > b.limit) nudges.push({ tone: "warn", text: `${b.category} is over budget by ${fmt(spent - b.limit)} this month.` });
  });
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
    const share = (top.value / total) * 100;
    if (share > 40) nudges.push({ tone: "warn", text: `${top.name} makes up ${share.toFixed(0)}% of this month's spending — your single biggest category. Worth a second look.` });
  }

  const toneStyle = { good: ["rgba(20,184,127,0.14)", GREEN], warn: ["rgba(240,178,60,0.14)", AMBER], neutral: [T.pillBg, T.textSoft] };

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Reports</div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginBottom: 18 }}>A quick read on how your money is doing right now.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Savings rate, this month" value={savingsRate === null ? "—" : `${savingsRate.toFixed(0)}%`} />
        <MetricCard label="Emergency fund" value={emergencyMonths === null ? "—" : `${emergencyMonths.toFixed(1)} mo`} />
        <MetricCard label="Invested share of net worth" value={`${investedShare.toFixed(0)}%`} />
      </div>

      {categoryBreakdown.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>Spending by category, this month</div>
          {categoryBreakdown.map((c, i) => {
            const total = categoryBreakdown.reduce((s, x) => s + x.value, 0);
            const pct = (c.value / total) * 100;
            const Icon = CATEGORY_ICONS[c.name] || CircleDollarSign;
            return (
              <div key={c.name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon size={13} color={T.textSoft} /> {c.name}</span>
                  <span style={{ color: T.textSoft }}>{fmt(c.value)} · {pct.toFixed(0)}%</span>
                </div>
                <ProgressBar pct={pct} color={CAT_COLORS[i % CAT_COLORS.length]} />
              </div>
            );
          })}
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {nudges.map((n, i) => {
          const [bg, fg] = toneStyle[n.tone];
          return (
            <div key={i} style={{ display: "flex", gap: 12, background: bg, borderRadius: 10, padding: "14px 16px" }}>
              <Sparkles size={16} color={fg} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>{n.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MetricCard({ label, value }) {
  const T = useT();
  return <Card style={{ padding: "14px 16px" }}><div style={{ fontSize: 12, color: T.textSoft, marginBottom: 6 }}>{label}</div><div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div></Card>;
}

/* ---------------- guide page ---------------- */
function Guide({ openGuide, setOpenGuide }) {
  const T = useT();
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Finance guide</div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginBottom: 18 }}>Grounded habits, not hot tips. Tap a card to read more.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GUIDE.map((g, i) => {
          const open = openGuide === i;
          return (
            <Card key={i} style={{ padding: 0 }}>
              <button onClick={() => setOpenGuide(open ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", color: T.text }}>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{g.title}</span>
                <ChevronDown size={16} color={T.textSoft} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0, marginLeft: 10 }} />
              </button>
              {open && <div style={{ padding: "0 20px 16px", fontSize: 13.5, color: T.textSoft, lineHeight: 1.6 }}>{g.body}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
