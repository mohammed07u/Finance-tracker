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
  Sun, Moon, Zap, Laptop, Plane, PlusCircle, Menu, Send, CalendarDays, Settings as SettingsIcon,
  ChevronLeft, ChevronRight, Download, Upload, RotateCcw, Pencil, CheckCircle2, AlertTriangle,
  MoreHorizontal, Lightbulb,
} from "lucide-react";

/* ---------------- theme tokens ---------------- */
const DARK = {
  name: "dark",
  bg: "#050B18", sidebarBg: "#0B1427", card: "#0F1A30", cardAlt: "#0A1428",
  border: "#223557", text: "#F8FAFC", textSoft: "#A7B4CA", textFaint: "#6F7F99",
  pillBg: "#101B32", inputBg: "#0A1428",
};
const LIGHT = {
  name: "light",
  bg: "#EEF1F8", sidebarBg: "#FFFFFF", card: "#FFFFFF", cardAlt: "#F5F7FC",
  border: "#E3E7F0", text: "#1B2340", textSoft: "#6B7390", textFaint: "#9AA1BD",
  pillBg: "#EEF1F8", inputBg: "#F5F7FC",
};
const BLUE = "#3B82F6";
const GREEN = "#19D3A2";
const RED = "#FF4858";
const PURPLE = "#8B5CF6";
const AMBER = "#FBBF24";
const CYAN = "#22D3EE";
const GREEN_GRAD = "linear-gradient(135deg, #19D3A2 0%, #0FA77F 100%)";
const BLUE_GRAD = "linear-gradient(135deg, #3B82F6 0%, #2554D8 100%)";
const RED_GRAD = "linear-gradient(135deg, #FF4858 0%, #D82F42 100%)";
const PURPLE_GRAD = "linear-gradient(135deg, #8B5CF6 0%, #6C3FD8 100%)";
const PURPLE_BLUE_GRAD = "linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)";
const CAT_COLORS = ["#FF4858", "#FBBF24", "#3B82F6", "#8B5CF6", "#FB923C", "#19D3A2", "#22D3EE", "#E85DA6", "#8B93AC"];

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
function loadData() { try { const raw = localStorage.getItem(STORE_KEY); if (raw) return JSON.parse(raw); } catch (e) {} return null; }
function saveData(data) { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {} }

/* ---------------- nudges (shared by bell + insights page) ---------------- */
function buildNudges({ accounts, monthIncome, monthExpense, savingsRate, emergencyMonths, netWorth, investedShare, categoryBreakdown, budgets }) {
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
  return nudges;
}

/* ---------------- atoms ---------------- */
function Card({ children, style }) {
  const T = useT();
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", ...style }}>{children}</div>;
}
function IconCircle({ Icon, bg, fg, size = 34 }) {
  return <div style={{ width: size, height: size, borderRadius: 10, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={size * 0.5} strokeWidth={2.2} /></div>;
}
function useInputStyle() {
  const T = useT();
  return { width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13.5, background: T.inputBg, color: T.text, outline: "none" };
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
  return <div style={{ height: 7, borderRadius: 4, background: T.pillBg, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 4 }} /></div>;
}
function MountainGoalArt() {
  return (
    <svg width="130" height="96" viewBox="0 0 130 96" style={{ margin: "0 auto", display: "block" }}>
      <defs>
        <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6C3FD8" /></linearGradient>
        <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#2554D8" /></linearGradient>
      </defs>
      <polygon points="10,88 48,20 86,88" fill="url(#mg1)" opacity="0.55" />
      <polygon points="45,88 78,32 112,88" fill="url(#mg2)" opacity="0.85" />
      <line x1="78" y1="32" x2="78" y2="12" stroke="#F8FAFC" strokeWidth="2" />
      <polygon points="78,12 96,18 78,24" fill="#FF4858" />
    </svg>
  );
}
function IconButton({ Icon, onClick, color, title }) {
  const T = useT();
  return <button onClick={onClick} title={title} style={{ border: "none", background: "none", color: color || T.textFaint, padding: 5, display: "flex" }}><Icon size={14} /></button>;
}

/* ---------------- toast + confirm system ---------------- */
function ToastStack({ toasts }) {
  const T = useT();
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 200, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "12px 16px", boxShadow: "0 12px 28px rgba(0,0,0,0.35)", fontSize: 13, color: T.text, animation: "toastIn 0.15s ease",
        }}>
          {t.tone === "error" ? <AlertTriangle size={16} color={RED} style={{ flexShrink: 0 }} /> : <CheckCircle2 size={16} color={GREEN} style={{ flexShrink: 0 }} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
function ConfirmModal({ state, onCancel, onConfirm }) {
  const T = useT();
  if (!state) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, maxWidth: 380, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <AlertTriangle size={20} color={AMBER} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>{state.message}</div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: RED_GRAD, color: "#fff", fontSize: 13, fontWeight: 600 }}>{state.confirmLabel || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  const T = useT();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, maxWidth: 420, width: "100%", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", color: T.textFaint }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "budgets", label: "Budgets", icon: PieIcon },
  { id: "goals", label: "Goals", icon: Target },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "guide", label: "Guide", icon: BookOpen },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];
const MOBILE_MAIN = ["dashboard", "transactions", "accounts", "goals"];

/* ---------------- app ---------------- */
export default function FinanceTracker() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goalsList, setGoalsList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("dashboard");
  const [openGuide, setOpenGuide] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const quickAmountRef = useRef(null);
  const searchInputRef = useRef(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const data = loadData();
    if (data) {
      setAccounts(data.accounts || []);
      setTransactions(data.transactions || []);
      setGoalsList(data.goalsList || []);
      setBudgets(data.budgets || []);
      setTransfers(data.transfers || []);
      setTheme(data.theme || "dark");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    saveData({ accounts, transactions, goalsList, budgets, transfers, theme });
  }, [accounts, transactions, goalsList, budgets, transfers, theme, loaded]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault(); setTab("dashboard");
        setTimeout(() => quickAmountRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTimeout(() => searchInputRef.current?.focus(), 10);
      }
      if (e.key === "Escape") { setConfirmState(null); setEditModal(null); setMoreOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const T = theme === "dark" ? DARK : LIGHT;

  function pushToast(message, tone = "success") {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }
  function askConfirm(message, onYes, confirmLabel) {
    setConfirmState({ message, onYes, confirmLabel });
  }

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

  const nudges = useMemo(() => buildNudges({
    accounts, monthIncome: thisMonth.income, monthExpense: thisMonth.expense, savingsRate,
    emergencyMonths, netWorth, investedShare, categoryBreakdown, budgets,
  }), [accounts, thisMonth, savingsRate, emergencyMonths, netWorth, investedShare, categoryBreakdown, budgets]);

  /* ---- accounts ---- */
  function addAccount(acc) { setAccounts((a) => [...a, { id: uid(), ...acc }]); pushToast("Account added"); }
  function updateAccount(id, patch) { setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a)); pushToast("Account updated"); setEditModal(null); }
  function deleteAccount(id) {
    askConfirm("Delete this account? Its transactions will stay in your history but will show no linked account.", () => {
      setAccounts((a) => a.filter((x) => x.id !== id)); pushToast("Account deleted"); setConfirmState(null);
    });
  }

  /* ---- transactions ---- */
  function addTransaction(txn) {
    const t = { id: uid(), ...txn };
    setTransactions((prev) => [t, ...prev]);
    if (txn.accountId) {
      setAccounts((prev) => prev.map((a) => a.id === txn.accountId
        ? { ...a, balance: Number(a.balance) + (txn.kind === "income" ? Number(txn.amount) : -Number(txn.amount)) } : a));
    }
    pushToast(txn.kind === "income" ? "Income added" : "Expense added");
  }
  function updateTransaction(id, patch) {
    const old = transactions.find((t) => t.id === id);
    if (!old) return;
    const updated = { ...old, ...patch };
    setTransactions((prev) => prev.map((t) => t.id === id ? updated : t));
    setAccounts((prev) => {
      let next = prev;
      if (old.accountId) next = next.map((a) => a.id === old.accountId ? { ...a, balance: Number(a.balance) - (old.kind === "income" ? Number(old.amount) : -Number(old.amount)) } : a);
      if (updated.accountId) next = next.map((a) => a.id === updated.accountId ? { ...a, balance: Number(a.balance) + (updated.kind === "income" ? Number(updated.amount) : -Number(updated.amount)) } : a);
      return next;
    });
    pushToast("Transaction updated"); setEditModal(null);
  }
  function deleteTransaction(t) {
    askConfirm("Delete this transaction? This will also reverse its effect on the linked account's balance.", () => {
      setTransactions((prev) => prev.filter((x) => x.id !== t.id));
      if (t.accountId) {
        setAccounts((prev) => prev.map((a) => a.id === t.accountId
          ? { ...a, balance: Number(a.balance) - (t.kind === "income" ? Number(t.amount) : -Number(t.amount)) } : a));
      }
      pushToast("Transaction deleted"); setConfirmState(null);
    });
  }

  /* ---- goals ---- */
  function addGoal(g) { setGoalsList((prev) => [...prev, { id: uid(), current: 0, ...g }]); pushToast("Goal created"); }
  function updateGoal(id, patch, silent) { setGoalsList((prev) => prev.map((g) => g.id === id ? { ...g, ...patch } : g)); if (!silent) { pushToast("Goal updated"); setEditModal(null); } }
  function deleteGoal(id) {
    askConfirm("Delete this goal? Its saved progress will be lost.", () => {
      setGoalsList((prev) => prev.filter((g) => g.id !== id)); pushToast("Goal deleted"); setConfirmState(null);
    });
  }

  /* ---- budgets ---- */
  function addBudget(b) { setBudgets((prev) => [...prev, { id: uid(), ...b }]); pushToast("Budget created"); }
  function updateBudget(id, patch) { setBudgets((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b)); pushToast("Budget updated"); setEditModal(null); }
  function deleteBudget(id) {
    askConfirm("Delete this budget limit?", () => {
      setBudgets((prev) => prev.filter((b) => b.id !== id)); pushToast("Budget deleted"); setConfirmState(null);
    });
  }

  /* ---- transfers ---- */
  function addTransfer({ fromId, toId, amount, date, note }) {
    if (fromId === toId || !amount || amount <= 0) return;
    setAccounts((prev) => prev.map((a) => {
      if (a.id === fromId) return { ...a, balance: Number(a.balance) - Number(amount) };
      if (a.id === toId) return { ...a, balance: Number(a.balance) + Number(amount) };
      return a;
    }));
    setTransfers((prev) => [{ id: uid(), fromId, toId, amount: Number(amount), date, note }, ...prev]);
    pushToast("Transfer completed"); setEditModal(null);
  }
  function deleteTransfer(t) {
    askConfirm("Undo this transfer? The amount will move back to the original account.", () => {
      setAccounts((prev) => prev.map((a) => {
        if (a.id === t.fromId) return { ...a, balance: Number(a.balance) + Number(t.amount) };
        if (a.id === t.toId) return { ...a, balance: Number(a.balance) - Number(t.amount) };
        return a;
      }));
      setTransfers((prev) => prev.filter((x) => x.id !== t.id));
      pushToast("Transfer undone"); setConfirmState(null);
    });
  }

  /* ---- data management ---- */
  function resetAllData() {
    askConfirm("This will permanently delete all accounts, transactions, budgets, goals and transfers. This can't be undone.", () => {
      setAccounts([]); setTransactions([]); setGoalsList([]); setBudgets([]); setTransfers([]);
      pushToast("All data cleared"); setConfirmState(null);
    }, "Delete everything");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ accounts, transactions, goalsList, budgets, transfers }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "passbook-data.json"; a.click();
    URL.revokeObjectURL(url);
    pushToast("Data exported");
  }
  function importDataFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        askConfirm("Importing will replace all current data with the contents of this file. Continue?", () => {
          setAccounts(data.accounts || []);
          setTransactions(data.transactions || []);
          setGoalsList(data.goalsList || []);
          setBudgets(data.budgets || []);
          setTransfers(data.transfers || []);
          pushToast("Data imported"); setConfirmState(null);
        }, "Replace data");
      } catch (e) {
        pushToast("That file isn't valid Passbook data", "error");
      }
    };
    reader.readAsText(file);
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  const ctx = {
    accounts, transactions, goalsList, budgets, transfers,
    addAccount, updateAccount, deleteAccount,
    addTransaction, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal,
    addBudget, updateBudget, deleteBudget,
    addTransfer, deleteTransfer,
    setEditModal, askConfirm, pushToast,
  };

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          button { cursor: pointer; font-family: inherit; }
          input, select { font-family: inherit; }
          ::placeholder { color: ${T.textFaint}; }
          ::-webkit-scrollbar { width: 7px; height: 7px; }
          ::-webkit-scrollbar-thumb { background: #26304C; border-radius: 4px; }
          select option { background: ${T.inputBg}; color: ${T.text}; }
          .quote-font { font-family: 'Caveat', cursive; }
          @keyframes toastIn { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:translateY(0);} }
          .mobile-bottom-nav { display: none; }
          @media (max-width: 820px) {
            .app-sidebar { display: none !important; }
            .app-main { padding-bottom: 90px !important; }
            .mobile-bottom-nav { display: flex !important; }
            .hide-on-mobile { display: none !important; }
          }
        `}</style>

        <Sidebar tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} nudges={nudges} />

        <div className="app-main" style={{ flex: 1, minWidth: 0, padding: "20px 28px 40px" }}>
          <TopBar todayLabel={todayLabel} theme={theme} setTheme={setTheme} nudges={nudges} setTab={setTab} resetAllData={resetAllData}
            accounts={accounts} transactions={transactions} goalsList={goalsList} budgets={budgets} searchInputRef={searchInputRef} />

          {tab === "dashboard" && (
            <Dashboard
              netWorth={netWorth} thisMonth={thisMonth} monthNet={monthNet}
              incomeChange={incomeChange} expenseChange={expenseChange} balanceChange={balanceChange} savingsChange={savingsChange}
              categoryBreakdown={categoryBreakdown} setTab={setTab} quickAmountRef={quickAmountRef} ctx={ctx}
            />
          )}
          {tab === "transactions" && <Transactions ctx={ctx} />}
          {tab === "accounts" && <Accounts ctx={ctx} />}
          {tab === "budgets" && <Budgets ctx={ctx} categoryBreakdown={categoryBreakdown} />}
          {tab === "goals" && <Goals ctx={ctx} />}
          {tab === "insights" && (
            <Reports netWorth={netWorth} byType={byType} savingsRate={savingsRate} emergencyMonths={emergencyMonths}
              investedShare={investedShare} categoryBreakdown={categoryBreakdown} nudges={nudges} />
          )}
          {tab === "calendar" && <CalendarPage ctx={ctx} />}
          {tab === "guide" && <Guide openGuide={openGuide} setOpenGuide={setOpenGuide} />}
          {tab === "settings" && <SettingsPage theme={theme} setTheme={setTheme} exportData={exportData} importDataFromFile={importDataFromFile} resetAllData={resetAllData} accounts={accounts} transactions={transactions} />}
        </div>

        <MobileBottomNav tab={tab} setTab={setTab} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
        <ToastStack toasts={toasts} />
        <ConfirmModal state={confirmState} onCancel={() => setConfirmState(null)} onConfirm={() => confirmState?.onYes?.()} />
        {editModal && <EditModalRouter editModal={editModal} setEditModal={setEditModal} ctx={ctx} />}
      </div>
    </ThemeCtx.Provider>
  );
}

/* ---------------- mobile bottom nav ---------------- */
function MobileBottomNav({ tab, setTab, moreOpen, setMoreOpen }) {
  const T = useT();
  const mainItems = NAV.filter((n) => MOBILE_MAIN.includes(n.id));
  const moreItems = NAV.filter((n) => !MOBILE_MAIN.includes(n.id));
  return (
    <>
      {moreOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }} onClick={() => setMoreOpen(false)} className="mobile-bottom-nav" />
      )}
      {moreOpen && (
        <div style={{ position: "fixed", bottom: 74, left: 10, right: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 10, zIndex: 95, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }} className="mobile-bottom-nav">
          {moreItems.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 4px", border: "none", background: tab === n.id ? T.pillBg : "transparent", borderRadius: 10, color: tab === n.id ? BLUE : T.textSoft }}>
                <Icon size={18} /><span style={{ fontSize: 11 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.sidebarBg, borderTop: `1px solid ${T.border}`, zIndex: 100, padding: "8px 6px", justifyContent: "space-around", alignItems: "center" }}>
        {mainItems.map((n) => {
          const Icon = n.icon; const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", color: active ? BLUE : T.textSoft, padding: "4px 8px" }}>
              <Icon size={19} /><span style={{ fontSize: 10.5 }}>{n.label}</span>
            </button>
          );
        })}
        <button onClick={() => setMoreOpen((o) => !o)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", color: moreOpen ? BLUE : T.textSoft, padding: "4px 8px" }}>
          <MoreHorizontal size={19} /><span style={{ fontSize: 10.5 }}>More</span>
        </button>
      </div>
    </>
  );
}

/* ---------------- sidebar ---------------- */
function TipOfDay() {
  const T = useT();
  const idx = new Date().getDate() % GUIDE.length;
  const tip = GUIDE[idx];
  return (
    <div style={{ borderRadius: 14, padding: "16px 16px", color: T.text, background: T.cardAlt, border: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><Lightbulb size={15} color={AMBER} /><span style={{ fontSize: 12, fontWeight: 700, color: T.textSoft }}>Tip of the day</span></div>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{tip.title}</div>
      <div style={{ fontSize: 11.5, color: T.textSoft, lineHeight: 1.5 }}>{tip.body.slice(0, 90)}…</div>
    </div>
  );
}

function Sidebar({ tab, setTab, collapsed, setCollapsed, nudges }) {
  const T = useT();
  const width = collapsed ? 76 : 240;
  return (
    <div className="app-sidebar" style={{ width, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "22px 14px", position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden", transition: "width 0.18s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 2px", marginBottom: 26, justifyContent: collapsed ? "center" : "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: PURPLE_BLUE_GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, color: "#fff", flexShrink: 0 }}>P</div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.2, whiteSpace: "nowrap" }}>Passbook</div>
              <div style={{ fontSize: 11, color: T.textSoft, whiteSpace: "nowrap" }}>Your Finance Tracker</div>
            </div>
          )}
        </div>
        {!collapsed && <button onClick={() => setCollapsed(true)} style={{ border: "none", background: "none", color: T.textSoft, padding: 4, flexShrink: 0 }}><Menu size={18} /></button>}
      </div>
      {collapsed && <button onClick={() => setCollapsed(false)} style={{ border: "none", background: "none", color: T.textSoft, padding: 4, marginBottom: 18, alignSelf: "center" }}><Menu size={18} /></button>}

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV.map((n) => {
          const active = tab === n.id;
          const Icon = n.icon;
          const badge = n.id === "insights" ? nudges.filter((x) => x.tone === "warn").length : 0;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} title={collapsed ? n.label : undefined} style={{
              display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "10px 0" : "10px 12px", borderRadius: 10,
              border: "none", background: active ? PURPLE_BLUE_GRAD : "transparent", color: active ? "#fff" : T.textSoft,
              fontSize: 13.8, fontWeight: active ? 600 : 500, textAlign: "left", justifyContent: collapsed ? "center" : "flex-start", position: "relative",
            }}>
              <Icon size={17} style={{ flexShrink: 0 }} /> {!collapsed && n.label}
              {!collapsed && badge > 0 && <span style={{ marginLeft: "auto", background: active ? "rgba(255,255,255,0.3)" : RED, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 8, padding: "1px 6px" }}>{badge}</span>}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <>
          <TipOfDay />
          <div style={{ padding: "16px 4px 0", fontSize: 12, color: T.textFaint, fontStyle: "italic", lineHeight: 1.5, textAlign: "center" }} className="quote-font">
            "A small step today leads to a brighter tomorrow."
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- global search ---------------- */
function GlobalSearch({ accounts, transactions, goalsList, budgets, setTab, searchInputRef }) {
  const T = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return { txns: [], accts: [], goals: [], buds: [] };
    return {
      txns: transactions.filter((t) => t.category.toLowerCase().includes(q) || (t.note || "").toLowerCase().includes(q)).slice(0, 4),
      accts: accounts.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 3),
      goals: goalsList.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 3),
      buds: budgets.filter((b) => b.category.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [q, transactions, accounts, goalsList, budgets]);
  const hasResults = results.txns.length + results.accts.length + results.goals.length + results.buds.length > 0;

  function go(tabId) { setTab(tabId); setOpen(false); }

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "1 1 320px", maxWidth: 420 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}>
        <Search size={16} color={T.textFaint} />
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search transactions, categories, notes..."
          style={{ border: "none", outline: "none", background: "transparent", color: T.text, fontSize: 13.5, flex: 1, minWidth: 0 }}
        />
        <span style={{ fontSize: 10.5, color: T.textFaint, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>Ctrl+K</span>
      </div>
      {open && q && (
        <div style={{ position: "absolute", top: 48, left: 0, right: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 8, zIndex: 60, boxShadow: "0 16px 32px rgba(0,0,0,0.3)", maxHeight: 340, overflowY: "auto" }}>
          {!hasResults ? (
            <div style={{ padding: "14px 10px", fontSize: 13, color: T.textSoft }}>No matches for "{query}"</div>
          ) : (
            <>
              {results.txns.length > 0 && <SearchGroup label="Transactions">{results.txns.map((t) => (
                <SearchRow key={t.id} icon={CATEGORY_ICONS[t.category] || CircleDollarSign} title={`${t.category}${t.note ? " · " + t.note : ""}`} sub={fmt(t.amount)} onClick={() => go("transactions")} />
              ))}</SearchGroup>}
              {results.accts.length > 0 && <SearchGroup label="Accounts">{results.accts.map((a) => (
                <SearchRow key={a.id} icon={Landmark} title={a.name} sub={fmt(a.balance)} onClick={() => go("accounts")} />
              ))}</SearchGroup>}
              {results.goals.length > 0 && <SearchGroup label="Goals">{results.goals.map((g) => (
                <SearchRow key={g.id} icon={Target} title={g.name} sub={`${fmt(g.current)} / ${fmt(g.target)}`} onClick={() => go("goals")} />
              ))}</SearchGroup>}
              {results.buds.length > 0 && <SearchGroup label="Budgets">{results.buds.map((b) => (
                <SearchRow key={b.id} icon={PieIcon} title={b.category} sub={fmt(b.limit)} onClick={() => go("budgets")} />
              ))}</SearchGroup>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
function SearchGroup({ label, children }) {
  const T = useT();
  return <div style={{ marginBottom: 6 }}><div style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 700, textTransform: "uppercase", padding: "6px 8px 2px" }}>{label}</div>{children}</div>;
}
function SearchRow({ icon: Icon, title, sub, onClick }) {
  const T = useT();
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, border: "none", background: "transparent", textAlign: "left" }}
      onMouseDown={(e) => e.preventDefault()}>
      <IconCircle Icon={Icon} bg={T.pillBg} fg={T.textSoft} size={28} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: T.textSoft, flexShrink: 0 }}>{sub}</div>
    </button>
  );
}

function TopBar({ todayLabel, theme, setTheme, nudges, setTab, resetAllData, accounts, transactions, goalsList, budgets, searchInputRef }) {
  const T = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const warnCount = nudges.filter((n) => n.tone === "warn").length;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <GlobalSearch accounts={accounts} transactions={transactions} goalsList={goalsList} budgets={budgets} setTab={setTab} searchInputRef={searchInputRef} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 6, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.textSoft, cursor: "pointer" }} onClick={() => setTab("calendar")}>
          {todayLabel} <ChevronDown size={13} />
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ width: 38, height: 38, borderRadius: "50%", background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSoft }}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div style={{ position: "relative" }} ref={bellRef}>
          <button onClick={() => setBellOpen((o) => !o)} style={{ position: "relative", width: 38, height: 38, borderRadius: "50%", background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={16} color={T.textSoft} />
            {warnCount > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: RED, color: "#fff", fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{warnCount}</div>}
          </button>
          {bellOpen && (
            <div style={{ position: "absolute", right: 0, top: 46, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10, width: 300, zIndex: 60, boxShadow: "0 16px 32px rgba(0,0,0,0.3)", maxHeight: 360, overflowY: "auto" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, padding: "0 4px" }}>Notifications</div>
              {nudges.length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.textSoft, padding: "10px 4px" }}>Nothing to flag right now.</div>
              ) : nudges.map((n, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 4px", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                  <Sparkles size={14} color={n.tone === "warn" ? AMBER : n.tone === "good" ? GREEN : T.textSoft} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.4 }}>{n.text}</div>
                </div>
              ))}
              <button onClick={() => { setTab("insights"); setBellOpen(false); }} style={{ width: "100%", marginTop: 8, border: "none", background: T.pillBg, color: BLUE, borderRadius: 8, padding: "8px 0", fontSize: 12.5, fontWeight: 600 }}>View full Insights</button>
            </div>
          )}
        </div>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: PURPLE_BLUE_GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>Y</div>
            <ChevronDown size={14} color={T.textSoft} className="hide-on-mobile" />
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: 46, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, minWidth: 160, zIndex: 60, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}>
              <button onClick={() => { setTab("settings"); setMenuOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "none", background: "none", color: T.text, fontSize: 13 }}>Settings</button>
              <button onClick={() => { resetAllData(); setMenuOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "none", background: "none", color: RED, fontSize: 13 }}>Reset all data</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- dashboard ---------------- */
function StatCard({ label, value, change, icon: Icon, grad, onClick }) {
  const positive = change !== null && change >= 0;
  return (
    <div style={{ background: grad, borderRadius: 16, padding: "18px 20px", color: "#fff", minHeight: 108, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} /></div>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{label}</span>
        </div>
        <button onClick={onClick} style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.22)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={13} /></button>
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

function Dashboard({ netWorth, thisMonth, monthNet, incomeChange, expenseChange, balanceChange, savingsChange, categoryBreakdown, setTab, quickAmountRef, ctx }) {
  const T = useT();
  const { transactions, accounts, goalsList, deleteTransaction, setEditModal, addTransaction } = ctx;
  const recent = transactions.slice(0, 4);
  const [range, setRange] = useState("6M");
  const trend = useMemo(() => buildTrend(transactions, range), [transactions, range]);
  const hasData = trend.some((t) => t.Income > 0 || t.Expense > 0);

  return (
    <div>
      <div style={{
        borderRadius: 16, padding: "26px 28px", marginBottom: 22, position: "relative", overflow: "hidden", color: "#fff",
        backgroundImage: "linear-gradient(100deg, rgba(5,8,18,0.75) 0%, rgba(20,10,35,0.35) 55%, rgba(5,8,18,0.6) 100%), url(https://images.unsplash.com/photo-1506297282690-18c075dcf9a4?w=1600&q=60&auto=format&fit=crop)",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap", minHeight: 150,
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{greetingWord()},<br /><span style={{ background: "linear-gradient(90deg,#8B5CF6,#22D3EE)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>You!</span> 👋</div>
          <div style={{ fontSize: 13.5, opacity: 0.92, marginTop: 8, lineHeight: 1.6 }}>Take control of your money.<br />A better tomorrow starts with smarter decisions today.</div>
        </div>
        <div className="hide-on-mobile" style={{ textAlign: "right" }}>
          <div className="quote-font" style={{ fontSize: 19, opacity: 0.95, maxWidth: 200, lineHeight: 1.3 }}>"Discipline today creates freedom tomorrow."</div>
          <div style={{ height: 2, width: 90, background: "linear-gradient(90deg,transparent,#8B5CF6)", marginTop: 6, marginLeft: "auto", boxShadow: "0 0 8px #8B5CF6" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Current Balance" value={netWorth} change={balanceChange} icon={Wallet2} grad={GREEN_GRAD} onClick={() => setTab("accounts")} />
        <StatCard label="Total Income" value={thisMonth.income} change={incomeChange} icon={ArrowUpRight} grad={BLUE_GRAD} onClick={() => setTab("transactions")} />
        <StatCard label="Total Expense" value={thisMonth.expense} change={expenseChange} icon={ArrowDownRight} grad={RED_GRAD} onClick={() => setTab("transactions")} />
        <StatCard label="Total Savings" value={monthNet} change={savingsChange} icon={PieIcon} grad={PURPLE_GRAD} onClick={() => setTab("goals")} />
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
                  <Area type="monotone" dataKey="Income" stroke={GREEN} strokeWidth={2.5} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="Expense" stroke={RED} strokeWidth={2.5} fill="url(#expenseGrad)" />
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
          {recent.length === 0 ? <EmptyState icon={FileText} text={<>No transactions yet<br />Add your first transaction to get started.</>} /> : recent.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} onEdit={() => setEditModal({ type: "transaction", data: t })} accounts={accounts} />)}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><PieIcon size={16} color={T.textSoft} /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Spending by Category</span></div>
            <button onClick={() => setTab("insights")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12.5, fontWeight: 600 }}>View All →</button>
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
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={2}>
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
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700 }}><Target size={16} color="#C9A6FF" /> Your Financial Goals</span>
          <button onClick={() => setTab("goals")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Plus size={12} /> Add Goal</button>
        </div>
        <MountainGoalArt />
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>No goals yet</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginBottom: 14 }}>Set a goal and make it happen!</div>
          <button onClick={() => setTab("goals")} style={{ width: "100%", background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600 }}>Create Your First Goal</button>
        </div>
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

  const CatIcon = CATEGORY_ICONS[category] || CircleDollarSign;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: PURPLE_BLUE_GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} color="#fff" /></div>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Quick Add Transaction</span>
        </div>
        <span style={{ fontSize: 10.5, color: T.textFaint, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>Ctrl+N</span>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 14, background: T.pillBg, borderRadius: 9, padding: 3 }}>
        {["expense", "income"].map((k) => (
          <button key={k} onClick={() => setKind(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: "none", background: kind === k ? PURPLE_BLUE_GRAD : "transparent", color: kind === k ? "#fff" : T.textSoft }}>{k === "income" ? "Income" : "Expense"}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Description"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Groceries, Salary, Rent..." /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Amount"><input ref={quickAmountRef} style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></Field>
          <Field label="Category">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconCircle Icon={CatIcon} bg={T.pillBg} fg={PURPLE} size={30} />
              <select style={{ ...inputStyle, flex: 1 }} value={category} onChange={(e) => setCategory(e.target.value)}>{(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Account">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconCircle Icon={Wallet} bg={T.pillBg} fg={BLUE} size={30} />
              <select style={{ ...inputStyle, flex: 1 }} value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.length === 0 && <option value="">Add an account</option>}{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
            </div>
          </Field>
        </div>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={submit} style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Send size={14} /> Add Transaction</button>
      </div>
    </Card>
  );
}

function TxnRow({ t, onDelete, onEdit, accounts }) {
  const T = useT();
  const acct = accounts?.find((a) => a.id === t.accountId);
  const isIncome = t.kind === "income";
  const Icon = CATEGORY_ICONS[t.category] || CircleDollarSign;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: `1px solid ${T.border}`, gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <IconCircle Icon={Icon} bg={isIncome ? "rgba(25,211,162,0.16)" : "rgba(255,72,88,0.16)"} fg={isIncome ? GREEN : RED} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category}{t.note ? ` · ${t.note}` : ""}</div>
          <div style={{ fontSize: 11.5, color: T.textSoft }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{acct ? ` · ${acct.name}` : ""}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isIncome ? GREEN : RED, marginRight: 4 }}>{isIncome ? "+" : "−"}{fmt(t.amount)}</div>
        {onEdit && <IconButton Icon={Pencil} onClick={onEdit} title="Edit" />}
        <IconButton Icon={Trash2} onClick={onDelete} title="Delete" />
      </div>
    </div>
  );
}

/* ---------------- accounts page ---------------- */
function Accounts({ ctx }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const { accounts, addAccount, deleteAccount, setEditModal, transfers, deleteTransfer } = ctx;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Accounts</div>
        <div style={{ display: "flex", gap: 8 }}>
          {accounts.length >= 2 && (
            <button onClick={() => setEditModal({ type: "transfer", data: null })} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}><ArrowLeftRight size={14} /> Transfer Money</button>
          )}
          <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>{showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add account"}</button>
        </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginRight: 4 }}>{fmt(a.balance)}</div>
                  <IconButton Icon={Pencil} onClick={() => setEditModal({ type: "account", data: a })} title="Edit" />
                  <IconButton Icon={Trash2} onClick={() => deleteAccount(a.id)} title="Delete" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}

      {transfers.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><ArrowLeftRight size={13} /> Recent transfers</div>
          <Card style={{ padding: 0 }}>
            {transfers.slice(0, 8).map((t, i) => {
              const from = accounts.find((a) => a.id === t.fromId);
              const to = accounts.find((a) => a.id === t.toId);
              return (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{from?.name || "Deleted account"} → {to?.name || "Deleted account"}</div>
                    <div style={{ fontSize: 11.5, color: T.textSoft }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{t.note ? ` · ${t.note}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginRight: 4 }}>{fmt(t.amount)}</div>
                    <IconButton Icon={Trash2} onClick={() => deleteTransfer(t)} title="Undo transfer" />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- transactions page ---------------- */
function Transactions({ ctx }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const { accounts, transactions, addTransaction, deleteTransaction, setEditModal } = ctx;
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
              <button key={k} onClick={() => setKind(k)} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}`, background: kind === k ? PURPLE_BLUE_GRAD : "transparent", color: kind === k ? "#fff" : T.textSoft }}>{k === "income" ? "Money in" : "Money out"}</button>
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
        {filtered.length === 0 ? <EmptyState icon={FileText} text="Nothing here yet." /> : filtered.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} onEdit={() => setEditModal({ type: "transaction", data: t })} accounts={accounts} />)}
      </Card>
    </div>
  );
}

/* ---------------- budgets page ---------------- */
function Budgets({ ctx, categoryBreakdown }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const { budgets, addBudget, deleteBudget, setEditModal } = ctx;
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: over ? RED : T.textSoft, fontWeight: over ? 700 : 400, marginRight: 4 }}>{fmt(spent)} / {fmt(b.limit)}</span>
                    <IconButton Icon={Pencil} onClick={() => setEditModal({ type: "budget", data: b })} title="Edit" />
                    <IconButton Icon={Trash2} onClick={() => deleteBudget(b.id)} title="Delete" />
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
function Goals({ ctx }) {
  const T = useT();
  const inputStyle = useInputStyle();
  const { goalsList, addGoal, updateGoal, deleteGoal, setEditModal } = ctx;
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
        <Card>
          <MountainGoalArt />
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>No goals yet</div>
            <div style={{ fontSize: 13, color: T.textSoft }}>Add one for a laptop, a trip, or an emergency fund, and track your progress toward it.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {goalsList.map((g) => {
            const Icon = goalIconFor(g.name);
            const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
            const complete = pct >= 100;
            return (
              <Card key={g.id} style={complete ? { border: `1px solid ${GREEN}` } : undefined}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5, fontWeight: 700 }}><IconCircle Icon={Icon} bg="rgba(139,92,246,0.16)" fg={PURPLE} size={32} /> {g.name}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    <IconButton Icon={Pencil} onClick={() => setEditModal({ type: "goal", data: g })} title="Edit" />
                    <IconButton Icon={Trash2} onClick={() => deleteGoal(g.id)} title="Delete" />
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 8 }}>{fmt(g.current)} of {fmt(g.target)} · {pct.toFixed(0)}%{complete ? " · 🎉 Achieved!" : ""}</div>
                <ProgressBar pct={pct} color={complete ? GREEN : PURPLE} />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => updateGoal(g.id, { current: Math.max(0, Number(g.current) - 1000) }, true)} style={{ flex: 1, border: `1px solid ${T.border}`, background: "transparent", color: T.text, borderRadius: 7, padding: "7px 0", fontSize: 12.5, fontWeight: 600 }}>− ₹1,000</button>
                  <button onClick={() => updateGoal(g.id, { current: Number(g.current) + 1000 }, true)} style={{ flex: 1, border: "none", background: PURPLE, color: "#fff", borderRadius: 7, padding: "7px 0", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><PlusCircle size={13} /> ₹1,000</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- reports/insights page ---------------- */
function Reports({ netWorth, byType, savingsRate, emergencyMonths, investedShare, categoryBreakdown, nudges }) {
  const T = useT();
  const toneStyle = { good: ["rgba(25,211,162,0.14)", GREEN], warn: ["rgba(251,191,36,0.14)", AMBER], neutral: [T.pillBg, T.textSoft] };

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Insights</div>
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

/* ---------------- calendar page ---------------- */
function CalendarPage({ ctx }) {
  const T = useT();
  const { transactions, accounts, deleteTransaction, setEditModal } = ctx;
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = useMemo(() => {
    const m = {};
    transactions.forEach((t) => {
      const k = dateKey(t.date);
      if (!m[k]) m[k] = { income: 0, expense: 0, count: 0 };
      m[k][t.kind] += Number(t.amount);
      m[k].count++;
    });
    return m;
  }, [transactions]);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedTxns = selectedDay ? transactions.filter((t) => dateKey(t.date) === selectedDay) : [];

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Calendar</div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginBottom: 18 }}>See which days had money moving, at a glance.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} style={{ border: `1px solid ${T.border}`, background: "none", color: T.text, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={16} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
              <button onClick={() => { setCursor(new Date()); setSelectedDay(dateKey(new Date())); }} style={{ border: `1px solid ${T.border}`, background: "none", color: BLUE, borderRadius: 7, padding: "4px 9px", fontSize: 11.5, fontWeight: 600 }}>Today</button>
            </div>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ border: `1px solid ${T.border}`, background: "none", color: T.text, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.textSoft, fontWeight: 600 }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = dateKey(new Date(year, month, d));
              const info = byDay[key];
              const isToday = key === dateKey(new Date());
              const isSelected = key === selectedDay;
              return (
                <button key={i} onClick={() => setSelectedDay(key)} style={{
                  aspectRatio: "1", borderRadius: 8, border: isSelected ? `1.5px solid ${BLUE}` : isToday ? `1.5px solid ${T.textFaint}` : `1px solid ${T.border}`,
                  background: isSelected ? "rgba(59,130,246,0.12)" : T.cardAlt, color: T.text, fontSize: 12.5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 2,
                }}>
                  {d}
                  {info && (
                    <span style={{ display: "flex", gap: 2 }}>
                      {info.income > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN }} />}
                      {info.expense > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: RED }} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>{selectedDay ? new Date(selectedDay).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "Select a day"}</div>
          {!selectedDay ? (
            <EmptyState icon={CalendarDays} text="Click a date on the calendar to see what happened that day." />
          ) : selectedTxns.length === 0 ? (
            <EmptyState icon={FileText} text="No transactions on this day." />
          ) : (
            selectedTxns.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} onEdit={() => setEditModal({ type: "transaction", data: t })} accounts={accounts} />)
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------------- settings page ---------------- */
function SettingsPage({ theme, setTheme, exportData, importDataFromFile, resetAllData, accounts, transactions }) {
  const T = useT();
  const fileRef = useRef(null);
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Settings</div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginBottom: 18 }}>Appearance and data controls for this device.</div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>Appearance</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTheme("light")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: theme === "light" ? BLUE : "transparent", color: theme === "light" ? "#fff" : T.text, fontSize: 13, fontWeight: 600 }}><Sun size={15} /> Light</button>
          <button onClick={() => setTheme("dark")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: theme === "dark" ? BLUE : "transparent", color: theme === "dark" ? "#fff" : T.text, fontSize: 13, fontWeight: 600 }}><Moon size={15} /> Dark</button>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>Your data</div>
        <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 14 }}>Everything is stored privately in this browser only — {accounts.length} account{accounts.length !== 1 ? "s" : ""}, {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={exportData} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontSize: 13, fontWeight: 600 }}><Download size={15} /> Export as JSON</button>
          <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontSize: 13, fontWeight: 600 }}><Upload size={15} /> Import from JSON</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) importDataFromFile(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={resetAllData} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: "none", background: RED_GRAD, color: "#fff", fontSize: 13, fontWeight: 600 }}><RotateCcw size={15} /> Reset all data</button>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>About Passbook</div>
        <div style={{ fontSize: 12.5, color: T.textSoft, lineHeight: 1.6 }}>A personal finance tracker for bank accounts, share market holdings, and any other platform you hold money on. No account, no server — everything lives on this device unless you export it yourself.</div>
      </Card>
    </div>
  );
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

/* ---------------- edit modals ---------------- */
function EditModalRouter({ editModal, setEditModal, ctx }) {
  const { type, data } = editModal;
  if (type === "transaction") return <EditTransactionModal t={data} ctx={ctx} onClose={() => setEditModal(null)} />;
  if (type === "account") return <EditAccountModal a={data} ctx={ctx} onClose={() => setEditModal(null)} />;
  if (type === "goal") return <EditGoalModal g={data} ctx={ctx} onClose={() => setEditModal(null)} />;
  if (type === "budget") return <EditBudgetModal b={data} ctx={ctx} onClose={() => setEditModal(null)} />;
  if (type === "transfer") return <TransferModal ctx={ctx} onClose={() => setEditModal(null)} />;
  return null;
}

function EditTransactionModal({ t, ctx }) {
  const inputStyle = useInputStyle();
  const { accounts, updateTransaction } = ctx;
  const [kind, setKind] = useState(t.kind);
  const [category, setCategory] = useState(t.category);
  const [amount, setAmount] = useState(String(t.amount));
  const [accountId, setAccountId] = useState(t.accountId || "");
  const [date, setDate] = useState(dateKey(t.date));
  const [note, setNote] = useState(t.note || "");
  const [error, setError] = useState("");

  return (
    <Modal title="Edit transaction" onClose={() => ctx.setEditModal(null)}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["expense", "income"].map((k) => (
          <button key={k} onClick={() => { setKind(k); setCategory(k === "expense" ? EXPENSE_CATS[0] : INCOME_CATS[0]); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: kind === k ? PURPLE_BLUE_GRAD : "transparent", color: kind === k ? "#fff" : "inherit" }}>{k === "income" ? "Income" : "Expense"}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Category"><select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>{(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
        <Field label="Amount"><input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Account"><select style={inputStyle} value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
        <Field label="Date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Note"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={() => { if (!amount || Number(amount) <= 0) { setError("Enter a valid amount."); return; } updateTransaction(t.id, { kind, category, amount: Number(amount), accountId, date: new Date(date).toISOString(), note: note.trim() }); }}
          style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700 }}>Save changes</button>
      </div>
    </Modal>
  );
}

function EditAccountModal({ a, ctx }) {
  const inputStyle = useInputStyle();
  const { updateAccount } = ctx;
  const [name, setName] = useState(a.name);
  const [type, setType] = useState(a.type);
  const [balance, setBalance] = useState(String(a.balance));
  const [error, setError] = useState("");
  return (
    <Modal title="Edit account" onClose={() => ctx.setEditModal(null)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Account name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Type"><select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>{ACCOUNT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></Field>
        <Field label="Balance (₹)"><input style={inputStyle} type="number" value={balance} onChange={(e) => setBalance(e.target.value)} /></Field>
        <div style={{ fontSize: 11.5, color: "inherit", opacity: 0.7 }}>Editing the balance directly is a manual correction — it won't create a transaction.</div>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={() => { if (!name.trim() || isNaN(Number(balance))) { setError("Check the name and balance."); return; } updateAccount(a.id, { name: name.trim(), type, balance: Number(balance) }); }}
          style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700 }}>Save changes</button>
      </div>
    </Modal>
  );
}

function EditGoalModal({ g, ctx }) {
  const inputStyle = useInputStyle();
  const { updateGoal } = ctx;
  const [name, setName] = useState(g.name);
  const [target, setTarget] = useState(String(g.target));
  const [current, setCurrent] = useState(String(g.current));
  const [error, setError] = useState("");
  return (
    <Modal title="Edit goal" onClose={() => ctx.setEditModal(null)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Goal name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Target amount (₹)"><input style={inputStyle} type="number" value={target} onChange={(e) => setTarget(e.target.value)} /></Field>
        <Field label="Saved so far (₹)"><input style={inputStyle} type="number" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={() => { if (!name.trim() || !target || Number(target) <= 0) { setError("Check the name and target."); return; } updateGoal(g.id, { name: name.trim(), target: Number(target), current: Number(current) || 0 }); }}
          style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700 }}>Save changes</button>
      </div>
    </Modal>
  );
}

function EditBudgetModal({ b, ctx }) {
  const inputStyle = useInputStyle();
  const { updateBudget } = ctx;
  const [limit, setLimit] = useState(String(b.limit));
  const [error, setError] = useState("");
  return (
    <Modal title={`Edit ${b.category} budget`} onClose={() => ctx.setEditModal(null)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Monthly limit (₹)"><input style={inputStyle} type="number" value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={() => { if (!limit || Number(limit) <= 0) { setError("Enter a valid limit."); return; } updateBudget(b.id, { limit: Number(limit) }); }}
          style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700 }}>Save changes</button>
      </div>
    </Modal>
  );
}

function TransferModal({ ctx }) {
  const inputStyle = useInputStyle();
  const { accounts, addTransfer } = ctx;
  const [fromId, setFromId] = useState(accounts[0]?.id || "");
  const [toId, setToId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal title="Transfer money" onClose={() => ctx.setEditModal(null)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="From"><select style={inputStyle} value={fromId} onChange={(e) => setFromId(e.target.value)}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}</select></Field>
        <Field label="To"><select style={inputStyle} value={toId} onChange={(e) => setToId(e.target.value)}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}</select></Field>
        <Field label="Amount (₹)"><input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></Field>
        <Field label="Date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Note (optional)"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Moving savings to TMB" /></Field>
        {error && <div style={{ color: RED, fontSize: 12 }}>{error}</div>}
        <button onClick={() => {
          if (fromId === toId) { setError("Pick two different accounts."); return; }
          if (!amount || Number(amount) <= 0) { setError("Enter a valid amount."); return; }
          addTransfer({ fromId, toId, amount: Number(amount), date: new Date(date).toISOString(), note: note.trim() });
        }} style={{ background: PURPLE_BLUE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><ArrowLeftRight size={14} /> Transfer</button>
      </div>
    </Modal>
  );
}
