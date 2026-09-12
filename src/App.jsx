import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Landmark, TrendingUp, Wallet, PiggyBank, Plus, Trash2, ArrowUpRight, ArrowDownRight,
  BookOpen, Sparkles, ChevronDown, X, LayoutDashboard, ArrowLeftRight, BarChart3, Target,
  Search, Bell, FileText, PieChart as PieIcon, Wallet2,
} from "lucide-react";

/* ---------------- tokens ---------------- */
const BG = "#0A0F1E";
const SIDEBAR_BG = "#0D1326";
const CARD = "#131A2E";
const BORDER = "#232B45";
const TEXT = "#E9ECF6";
const TEXT_SOFT = "#8B93AC";
const TEXT_FAINT = "#5C6584";
const BLUE = "#3B82F6";

const GREEN_GRAD = "linear-gradient(135deg, #14B87F 0%, #0C8F63 100%)";
const BLUE_GRAD = "linear-gradient(135deg, #3B82F6 0%, #2554D8 100%)";
const RED_GRAD = "linear-gradient(135deg, #F0685C 0%, #D5372F 100%)";
const PURPLE_GRAD = "linear-gradient(135deg, #9B6BF0 0%, #6C3FD8 100%)";

const CAT_COLORS = ["#F0685C", "#F0B23C", "#E85DA6", "#9B6BF0", "#3BC8E8", "#14B87F", "#3B82F6", "#8B93AC"];

const ACCOUNT_TYPES = [
  { id: "bank", label: "Bank", icon: Landmark },
  { id: "stocks", label: "Share market", icon: TrendingUp },
  { id: "other", label: "Other platform", icon: Wallet },
  { id: "cash", label: "Cash", icon: PiggyBank },
];

const EXPENSE_CATS = ["Food", "Rent", "Transport", "Utilities", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS = ["Salary", "Bonus", "Interest", "Dividend", "Freelance", "Other income"];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const prevMonthKey = (key) => {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 2, 1));
};
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" });
};
const lastNMonthKeys = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) out.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  return out;
};
const pctChange = (curr, prev) => (prev ? ((curr - prev) / Math.abs(prev)) * 100 : null);

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
const STORE_KEY = "finance-tracker-data-v2";
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
function saveData(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
}

/* ---------------- atoms ---------------- */
function Card({ children, style }) {
  return <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px", ...style }}>{children}</div>;
}
function IconCircle({ Icon, bg, fg, size = 34 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={size * 0.5} strokeWidth={2.2} />
    </div>
  );
}
const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13.5, background: "#0F1526", color: TEXT, outline: "none" };
function Field({ label, children }) {
  return <div><div style={{ fontSize: 11.5, color: TEXT_SOFT, marginBottom: 5 }}>{label}</div>{children}</div>;
}
function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 10px" }}>
      {Icon && (
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1B2340", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Icon size={19} color={TEXT_FAINT} />
        </div>
      )}
      <div style={{ fontSize: 13.5, color: TEXT_SOFT, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "guide", label: "Guide", icon: BookOpen },
];

/* ---------------- app ---------------- */
export default function FinanceTracker() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [openGuide, setOpenGuide] = useState(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const data = loadData();
    if (data) {
      setAccounts(data.accounts || []);
      setTransactions(data.transactions || []);
      setGoal(data.goal || null);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    saveData({ accounts, transactions, goal });
  }, [accounts, transactions, goal, loaded]);

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

  const trend = useMemo(() => {
    return lastNMonthKeys(6).map((k) => {
      const t = monthTotals(k);
      return { month: monthLabel(k), Income: t.income, Expense: t.expense };
    });
  }, [transactions]);

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
        ? { ...a, balance: Number(a.balance) + (txn.kind === "income" ? Number(txn.amount) : -Number(txn.amount)) }
        : a));
    }
  }
  function deleteTransaction(t) {
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
    if (t.accountId) {
      setAccounts((prev) => prev.map((a) => a.id === t.accountId
        ? { ...a, balance: Number(a.balance) - (t.kind === "income" ? Number(t.amount) : -Number(t.amount)) }
        : a));
    }
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; }
        input, select { font-family: inherit; }
        ::placeholder { color: ${TEXT_FAINT}; }
        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-thumb { background: #26304C; border-radius: 4px; }
        select option { background: #0F1526; }
      `}</style>

      <Sidebar tab={tab} setTab={setTab} />

      <div style={{ flex: 1, minWidth: 0, padding: "20px 28px 60px" }}>
        <TopBar todayLabel={todayLabel} />

        {tab === "dashboard" && (
          <Dashboard
            netWorth={netWorth} thisMonth={thisMonth} monthNet={monthNet}
            incomeChange={incomeChange} expenseChange={expenseChange} balanceChange={balanceChange} savingsChange={savingsChange}
            trend={trend} categoryBreakdown={categoryBreakdown}
            transactions={transactions} accounts={accounts}
            addTransaction={addTransaction} deleteTransaction={deleteTransaction}
            goal={goal} setGoal={setGoal} setTab={setTab}
          />
        )}
        {tab === "transactions" && (
          <Transactions accounts={accounts} transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />
        )}
        {tab === "accounts" && (
          <Accounts accounts={accounts} addAccount={addAccount} deleteAccount={deleteAccount} />
        )}
        {tab === "insights" && (
          <Insights netWorth={netWorth} byType={byType} savingsRate={savingsRate} emergencyMonths={emergencyMonths}
            investedShare={investedShare} categoryBreakdown={categoryBreakdown} monthIncome={thisMonth.income}
            monthExpense={thisMonth.expense} accounts={accounts} />
        )}
        {tab === "guide" && <Guide openGuide={openGuide} setOpenGuide={setOpenGuide} />}
      </div>
    </div>
  );
}

/* ---------------- sidebar ---------------- */
function Sidebar({ tab, setTab }) {
  return (
    <div style={{ width: 240, flexShrink: 0, background: SIDEBAR_BG, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "22px 16px", position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 30 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#F0B23C,#E8862A)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, color: "#1A1204" }}>₹</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>Passbook</div>
          <div style={{ fontSize: 11, color: TEXT_SOFT }}>Your Finance Tracker</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV.map((n) => {
          const active = tab === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9,
              border: "none", background: active ? BLUE : "transparent", color: active ? "#fff" : TEXT_SOFT,
              fontSize: 13.8, fontWeight: active ? 600 : 500, textAlign: "left",
            }}>
              <Icon size={17} /> {n.label}
            </button>
          );
        })}
      </div>

      <div style={{
        borderRadius: 14, padding: "18px 16px", marginTop: 14,
        background: "linear-gradient(160deg, #16321F 0%, #0D1A12 100%)", border: `1px solid #1E3A28`,
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>Better Habits, Brighter Future</div>
        <div style={{ fontSize: 12, color: TEXT_SOFT, lineHeight: 1.5 }}>Track smarter. Live better.</div>
      </div>
    </div>
  );
}

function TopBar({ todayLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", flex: "1 1 320px", maxWidth: 420 }}>
        <Search size={16} color={TEXT_FAINT} />
        <span style={{ fontSize: 13.5, color: TEXT_FAINT }}>Search transactions, accounts...</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: TEXT_SOFT }}>
          {todayLabel}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={16} color={TEXT_SOFT} />
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#3BC8E8,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
          Y
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
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{label}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>{fmt(value)}</div>
        <div style={{ fontSize: 11.5, opacity: 0.9 }}>
          {change === null ? "No prior data yet" : (
            <>{positive ? "▲" : "▼"} {Math.abs(change).toFixed(0)}% from last month</>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ netWorth, thisMonth, monthNet, incomeChange, expenseChange, balanceChange, savingsChange, trend, categoryBreakdown, transactions, accounts, addTransaction, deleteTransaction, goal, setGoal, setTab }) {
  const recent = transactions.slice(0, 5);
  const [showGoalForm, setShowGoalForm] = useState(false);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginBottom: 4 }}>Welcome back,</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Here's your financial overview 👋</div>
          <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginTop: 4 }}>Here's how your money is doing today.</div>
        </div>
        <div style={{
          borderRadius: 14, padding: "18px 22px", color: "#fff", position: "relative", overflow: "hidden",
          backgroundImage: "linear-gradient(120deg, rgba(10,15,30,0.55), rgba(10,15,30,0.75)), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=60)",
          backgroundSize: "cover", backgroundPosition: "center",
        }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 4 }}>Financial Freedom</div>
          <div style={{ fontSize: 12.5, opacity: 0.9 }}>One step at a time.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Current Balance" value={netWorth} change={balanceChange} icon={Wallet2} grad={GREEN_GRAD} />
        <StatCard label="Total Income" value={thisMonth.income} change={incomeChange} icon={ArrowUpRight} grad={BLUE_GRAD} />
        <StatCard label="Total Expense" value={thisMonth.expense} change={expenseChange} icon={ArrowDownRight} grad={RED_GRAD} />
        <StatCard label="Total Savings" value={monthNet} change={savingsChange} icon={PieIcon} grad={PURPLE_GRAD} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} color={TEXT_SOFT} />
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>Income vs Expense</span>
          </div>
          {trend.every((t) => t.Income === 0 && t.Expense === 0) ? (
            <EmptyState icon={BarChart3} text={<>No data yet<br />Start adding transactions to see your income vs expense trends.</>} />
          ) : (
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={trend} barGap={4}>
                  <CartesianGrid vertical={false} stroke={BORDER} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: TEXT_SOFT }} axisLine={{ stroke: BORDER }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: TEXT_SOFT }} axisLine={false} tickLine={false} width={44}
                    tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#0F1526", border: `1px solid ${BORDER}`, color: TEXT }} />
                  <Bar dataKey="Income" fill="#14B87F" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Expense" fill="#F0685C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <QuickAdd accounts={accounts} addTransaction={addTransaction} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} color={TEXT_SOFT} />
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>Recent Transactions</span>
            </div>
            <button onClick={() => setTab("transactions")} style={{ border: "none", background: "none", color: BLUE, fontSize: 12.5, fontWeight: 600 }}>View All →</button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={FileText} text={<>No transactions yet<br />Add your first transaction to get started.</>} />
          ) : recent.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <PieIcon size={16} color={TEXT_SOFT} />
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>Spending by Category</span>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", border: `10px solid #1B2340`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: TEXT_SOFT }}>Total</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(0)}</div>
                </div>
              </div>
              {EXPENSE_CATS.slice(0, 5).map((c, i) => (
                <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: 12.5, padding: "3px 0", color: TEXT_SOFT }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[i] }} /> {c}
                  </span>
                  <span>0%</span>
                </div>
              ))}
            </div>
          ) : (
            <CategoryDonut data={categoryBreakdown} />
          )}
        </Card>

        <GoalCard goal={goal} setGoal={setGoal} netWorth={netWorth} showForm={showGoalForm} setShowForm={setShowGoalForm} />
      </div>
    </div>
  );
}

function CategoryDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 14px" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#0F1526", border: `1px solid ${BORDER}`, color: TEXT }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 10.5, color: TEXT_SOFT }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(total)}</div>
        </div>
      </div>
      {data.slice(0, 6).map((d, i) => (
        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: TEXT_SOFT }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[i % CAT_COLORS.length] }} /> {d.name}
          </span>
          <span style={{ color: TEXT }}>{((d.value / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

function GoalCard({ goal, setGoal, netWorth, showForm, setShowForm }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  if (showForm) {
    return (
      <Card>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>Set a Financial Goal</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Goal name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency fund" /></Field>
          <Field label="Target amount (₹)"><input style={inputStyle} type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100000" /></Field>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { if (name.trim() && Number(target) > 0) { setGoal({ name: name.trim(), target: Number(target) }); setShowForm(false); } }}
              style={{ flex: 1, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 13 }}>Save Goal</button>
            <button onClick={() => setShowForm(false)} style={{ border: `1px solid ${BORDER}`, background: "none", color: TEXT_SOFT, borderRadius: 8, padding: "9px 14px", fontSize: 13 }}><X size={14} /></button>
          </div>
        </div>
      </Card>
    );
  }

  if (goal) {
    const pct = Math.min(100, (netWorth / goal.target) * 100);
    return (
      <Card style={{ backgroundImage: "linear-gradient(160deg, rgba(155,107,240,0.18), rgba(19,26,46,0))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Target size={16} color="#C9A6FF" />
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>{goal.name}</span>
        </div>
        <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginBottom: 10 }}>{fmt(netWorth)} of {fmt(goal.target)}</div>
        <div style={{ height: 8, borderRadius: 4, background: "#1B2340", overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: PURPLE_GRAD, borderRadius: 4 }} />
        </div>
        <button onClick={() => setShowForm(true)} style={{ border: "none", background: "none", color: "#C9A6FF", fontSize: 12.5, fontWeight: 600 }}>Edit goal →</button>
      </Card>
    );
  }

  return (
    <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Target size={16} color="#C9A6FF" />
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Set a Financial Goal</span>
        </div>
        <div style={{ fontSize: 12.5, color: TEXT_SOFT, lineHeight: 1.5, marginBottom: 16 }}>Turn your goals into reality with better money habits.</div>
      </div>
      <button onClick={() => setShowForm(true)} style={{ background: PURPLE_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        Set Goal <ArrowUpRight size={14} />
      </button>
    </Card>
  );
}

function QuickAdd({ accounts, addTransaction }) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#14B87F", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} color="#fff" /></div>
        <span style={{ fontSize: 14.5, fontWeight: 700 }}>Add Transaction</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["expense", "income"].map((k) => (
          <button key={k} onClick={() => setKind(k)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none",
            background: kind === k ? (k === "income" ? "#14B87F" : "#F0685C") : "#1B2340",
            color: kind === k ? "#fff" : TEXT_SOFT,
          }}>{k === "income" ? "Income" : "Expense"}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Description"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Groceries, Salary, Rent..." /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Amount"><input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></Field>
          <Field label="Category">
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              {(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Account">
            <select style={inputStyle} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.length === 0 && <option value="">Add an account</option>}
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
        </div>
        {error && <div style={{ color: "#F0685C", fontSize: 12 }}>{error}</div>}
        <button onClick={submit} style={{ background: RED_GRAD, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>
    </Card>
  );
}

function TxnRow({ t, onDelete, accounts }) {
  const acct = accounts?.find((a) => a.id === t.accountId);
  const isIncome = t.kind === "income";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: `1px solid ${BORDER}`, gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <IconCircle Icon={isIncome ? ArrowUpRight : ArrowDownRight} bg={isIncome ? "rgba(20,184,127,0.18)" : "rgba(240,104,92,0.18)"} fg={isIncome ? "#14B87F" : "#F0685C"} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category}{t.note ? ` · ${t.note}` : ""}</div>
          <div style={{ fontSize: 11.5, color: TEXT_SOFT }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{acct ? ` · ${acct.name}` : ""}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isIncome ? "#14B87F" : "#F0685C" }}>{isIncome ? "+" : "−"}{fmt(t.amount)}</div>
        <button onClick={onDelete} style={{ border: "none", background: "none", color: TEXT_FAINT, padding: 4 }}><Trash2 size={13.5} /></button>
      </div>
    </div>
  );
}

/* ---------------- accounts page ---------------- */
function Accounts({ accounts, addAccount, deleteAccount }) {
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
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add account"}
        </button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Account name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings" style={inputStyle} /></Field>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                {ACCOUNT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Current balance (₹)"><input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" placeholder="0" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: "#14B87F", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: "#F0685C", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      {accounts.length === 0 && !showForm && <Card><EmptyState icon={Landmark} text="No accounts yet. Add your bank account, demat or stock account, and any other platform where you hold money." /></Card>}

      {grouped.filter((g) => g.accounts.length > 0).map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><g.icon size={13} /> {g.label}</div>
          <Card style={{ padding: 0 }}>
            {g.accounts.map((a, i) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{a.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(a.balance)}</div>
                  <button onClick={() => deleteAccount(a.id)} style={{ border: "none", background: "none", color: TEXT_FAINT }}><Trash2 size={14} /></button>
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
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add transaction"}
        </button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["expense", "income"].map((k) => (
              <button key={k} onClick={() => setKind(k)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${BORDER}`,
                background: kind === k ? (k === "income" ? "#14B87F" : "#F0685C") : "transparent", color: kind === k ? "#fff" : TEXT_SOFT,
              }}>{k === "income" ? "Money in" : "Money out"}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                {(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹)"><input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" style={inputStyle} /></Field>
            <Field label="Account">
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>
                {accounts.length === 0 && <option value="">No accounts yet</option>}
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Date"><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></Field>
            <Field label="Note (optional)"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. September salary" style={inputStyle} /></Field>
            <button onClick={submit} style={{ background: "#14B87F", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 40 }}>Save</button>
          </div>
          {error && <div style={{ color: "#F0685C", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["all", "All"], ["income", "Money in"], ["expense", "Money out"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding: "6px 12px", borderRadius: 16, fontSize: 12.5, border: `1px solid ${BORDER}`, background: filter === id ? "#1B2340" : "transparent", color: TEXT, fontWeight: filter === id ? 600 : 400 }}>{label}</button>
        ))}
      </div>

      <Card style={{ padding: "6px 22px" }}>
        {filtered.length === 0 ? <EmptyState icon={FileText} text="Nothing here yet." /> : filtered.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)}
      </Card>
    </div>
  );
}

/* ---------------- insights page ---------------- */
function Insights({ netWorth, byType, savingsRate, emergencyMonths, investedShare, categoryBreakdown, monthIncome, monthExpense, accounts }) {
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
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
    const share = (top.value / total) * 100;
    if (share > 40) nudges.push({ tone: "warn", text: `${top.name} makes up ${share.toFixed(0)}% of this month's spending — your single biggest category. Worth a second look.` });
  }

  const toneStyle = { good: ["rgba(20,184,127,0.14)", "#14B87F"], warn: ["rgba(240,178,60,0.14)", "#F0B23C"], neutral: ["#1B2340", TEXT_SOFT] };

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Insights</div>
      <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginBottom: 18 }}>A quick read on how your money is doing right now.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Savings rate, this month" value={savingsRate === null ? "—" : `${savingsRate.toFixed(0)}%`} />
        <MetricCard label="Emergency fund" value={emergencyMonths === null ? "—" : `${emergencyMonths.toFixed(1)} mo`} />
        <MetricCard label="Invested share of net worth" value={`${investedShare.toFixed(0)}%`} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {nudges.map((n, i) => {
          const [bg, fg] = toneStyle[n.tone];
          return (
            <div key={i} style={{ display: "flex", gap: 12, background: bg, borderRadius: 10, padding: "14px 16px" }}>
              <Sparkles size={16} color={fg} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>{n.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MetricCard({ label, value }) {
  return <Card style={{ padding: "14px 16px" }}><div style={{ fontSize: 12, color: TEXT_SOFT, marginBottom: 6 }}>{label}</div><div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div></Card>;
}

/* ---------------- guide page ---------------- */
function Guide({ openGuide, setOpenGuide }) {
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Finance guide</div>
      <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginBottom: 18 }}>Grounded habits, not hot tips. Tap a card to read more.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GUIDE.map((g, i) => {
          const open = openGuide === i;
          return (
            <Card key={i} style={{ padding: 0 }}>
              <button onClick={() => setOpenGuide(open ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", color: TEXT }}>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{g.title}</span>
                <ChevronDown size={16} color={TEXT_SOFT} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0, marginLeft: 10 }} />
              </button>
              {open && <div style={{ padding: "0 20px 16px", fontSize: 13.5, color: TEXT_SOFT, lineHeight: 1.6 }}>{g.body}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
