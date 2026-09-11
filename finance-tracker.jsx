import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Landmark, TrendingUp, Wallet, PiggyBank, Plus, Trash2, ArrowUpRight, ArrowDownRight,
  BookOpen, Sparkles, ChevronDown, X, LayoutDashboard, ListTree, Lightbulb,
} from "lucide-react";

/* ---------------- tokens ---------------- */
const INK = "#1C2541";
const INK_SOFT = "#5B6584";
const PAPER = "#F6F3EC";
const CARD = "#FFFFFF";
const LINE = "#DAD4C4";
const EMERALD = "#1F6B4F";
const EMERALD_SOFT = "#E4F0E9";
const CLAY = "#B5533C";
const CLAY_SOFT = "#F6E7E2";
const GOLD = "#B8860F";
const GOLD_SOFT = "#F6EDD6";
const SLATE_SOFT = "#EDEAE0";

const CAT_COLORS = ["#1F6B4F", "#B5533C", "#B8860F", "#3B5B8C", "#7A4E9E", "#5B6584", "#C07A2A", "#4C8577"];

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
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" });
};
const lastNMonthKeys = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
};

const GUIDE = [
  {
    title: "Build a real emergency fund",
    body: "Keep 3 to 6 months of expenses in your bank account or a liquid fund — money you can touch within a day. This is what stops one bad month from turning into debt.",
  },
  {
    title: "Give every rupee a job — try 50/30/20",
    body: "50% of income to needs (rent, food, bills), 30% to wants, 20% to savings and investing. It's a starting ratio, not a law — adjust it, but track it.",
  },
  {
    title: "Start investing before you feel ready",
    body: "A SIP into an index fund started at a modest amount and left alone for years usually beats a bigger SIP started five years late. Time in the market matters more than timing it.",
  },
  {
    title: "Spread money across platforms",
    body: "Bank deposits are safe but lose to inflation over time. Shares and mutual funds grow faster but swing more. Holding a mix — not all in one platform — is how you manage that trade-off.",
  },
  {
    title: "Insure before you invest",
    body: "A term life policy and a health policy are cheap compared to the disaster they prevent. Get these in place before chasing investment returns.",
  },
  {
    title: "Small leaks sink big ships",
    body: "Subscriptions, delivery fees, impulse buys — track them for one month and you'll usually find 5 to 10% of your spending you didn't mean to commit to.",
  },
  {
    title: "Avoid revolving high-interest debt",
    body: "Credit card interest often runs past 30% a year. Paying only the minimum turns a small bill into a long one. Clear it in full, every cycle, before anything else.",
  },
  {
    title: "Review your money every month",
    body: "A 15-minute check-in — what came in, what went out, what changed — catches problems early and keeps your goals honest.",
  },
];

/* ---------------- storage ---------------- */
const STORE_KEY = "finance-tracker-data-v1";
async function loadData() {
  try {
    const res = await window.storage.get(STORE_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
    /* no saved data yet */
  }
  return null;
}
async function saveData(data) {
  try {
    await window.storage.set(STORE_KEY, JSON.stringify(data), false);
  } catch (e) {
    console.error("save failed", e);
  }
}

/* ---------------- small UI atoms ---------------- */
function Card({ children, style }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: "18px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function IconBadge({ Icon, bg, fg }) {
  return (
    <div
      style={{
        width: 34, height: 34, borderRadius: 8, background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <Icon size={17} strokeWidth={2} />
    </div>
  );
}

/* ---------------- app ---------------- */
export default function FinanceTracker() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [showAcctForm, setShowAcctForm] = useState(false);
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [openGuide, setOpenGuide] = useState(null);
  const firstRun = useRef(true);

  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data) {
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    saveData({ accounts, transactions });
  }, [accounts, transactions, loaded]);

  const netWorth = useMemo(() => accounts.reduce((s, a) => s + Number(a.balance || 0), 0), [accounts]);

  const byType = useMemo(() => {
    const m = {};
    ACCOUNT_TYPES.forEach((t) => (m[t.id] = 0));
    accounts.forEach((a) => (m[a.type] = (m[a.type] || 0) + Number(a.balance || 0)));
    return m;
  }, [accounts]);

  const thisMonthKey = monthKey(new Date());
  const monthTxns = useMemo(
    () => transactions.filter((t) => monthKey(new Date(t.date)) === thisMonthKey),
    [transactions, thisMonthKey]
  );
  const monthIncome = monthTxns.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthTxns.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : null;

  const categoryBreakdown = useMemo(() => {
    const m = {};
    monthTxns.filter((t) => t.kind === "expense").forEach((t) => {
      m[t.category] = (m[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTxns]);

  const trend = useMemo(() => {
    const keys = lastNMonthKeys(6);
    return keys.map((k) => {
      const txns = transactions.filter((t) => monthKey(new Date(t.date)) === k);
      return {
        month: monthLabel(k),
        Income: txns.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0),
        Expense: txns.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }, [transactions]);

  const avgMonthlyExpense = useMemo(() => {
    const keys = lastNMonthKeys(3);
    const totals = keys.map((k) =>
      transactions.filter((t) => monthKey(new Date(t.date)) === k && t.kind === "expense")
        .reduce((s, t) => s + Number(t.amount), 0)
    );
    const nonZero = totals.filter((t) => t > 0);
    if (nonZero.length === 0) return 0;
    return nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
  }, [transactions]);

  const emergencyMonths = avgMonthlyExpense > 0 ? (byType.bank + byType.cash) / avgMonthlyExpense : null;
  const investedShare = netWorth > 0 ? ((byType.stocks + byType.other) / netWorth) * 100 : 0;

  function addAccount(acc) {
    setAccounts((a) => [...a, { id: uid(), ...acc }]);
    setShowAcctForm(false);
  }
  function deleteAccount(id) {
    setAccounts((a) => a.filter((x) => x.id !== id));
  }
  function addTransaction(txn) {
    const t = { id: uid(), ...txn };
    setTransactions((prev) => [t, ...prev]);
    if (txn.accountId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === txn.accountId
            ? { ...a, balance: Number(a.balance) + (txn.kind === "income" ? Number(txn.amount) : -Number(txn.amount)) }
            : a
        )
      );
    }
    setShowTxnForm(false);
  }
  function deleteTransaction(t) {
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
    if (t.accountId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === t.accountId
            ? { ...a, balance: Number(a.balance) - (t.kind === "income" ? Number(t.amount) : -Number(t.amount)) }
            : a
        )
      );
    }
  }

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts", icon: Landmark },
    { id: "transactions", label: "Transactions", icon: ListTree },
    { id: "insights", label: "Insights", icon: Lightbulb },
    { id: "guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <div
      style={{
        fontFamily: "'Source Sans Pro', 'Segoe UI', sans-serif",
        background: PAPER,
        minHeight: "100%",
        color: INK,
        padding: "0 0 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Source+Sans+Pro:wght@400;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .num { font-family: 'IBM Plex Mono', monospace; }
        .headline { font-family: 'Fraunces', serif; }
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; }
        input, select { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #C9C2AE; border-radius: 3px; }
      `}</style>

      {/* header */}
      <div style={{ borderBottom: `1px solid ${LINE}`, background: PAPER, position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "26px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: INK_SOFT, letterSpacing: 0.3, marginBottom: 4 }}>Total net worth</div>
              <div className="headline num" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>
                {fmt(netWorth)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: INK_SOFT }}>This month in</div>
                <div className="num" style={{ fontSize: 17, color: EMERALD, fontWeight: 600 }}>{fmt(monthIncome)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: INK_SOFT }}>This month out</div>
                <div className="num" style={{ fontSize: 17, color: CLAY, fontWeight: 600 }}>{fmt(monthExpense)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, marginTop: 22, overflowX: "auto" }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 14px", border: "none", background: "transparent",
                    borderBottom: active ? `2px solid ${INK}` : "2px solid transparent",
                    color: active ? INK : INK_SOFT, fontWeight: active ? 600 : 400,
                    fontSize: 14, whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "26px 20px 0" }}>
        {tab === "dashboard" && (
          <Dashboard
            accounts={accounts}
            byType={byType}
            categoryBreakdown={categoryBreakdown}
            trend={trend}
            transactions={transactions}
            deleteTransaction={deleteTransaction}
            setTab={setTab}
          />
        )}
        {tab === "accounts" && (
          <Accounts
            accounts={accounts}
            showForm={showAcctForm}
            setShowForm={setShowAcctForm}
            addAccount={addAccount}
            deleteAccount={deleteAccount}
          />
        )}
        {tab === "transactions" && (
          <Transactions
            accounts={accounts}
            transactions={transactions}
            showForm={showTxnForm}
            setShowForm={setShowTxnForm}
            addTransaction={addTransaction}
            deleteTransaction={deleteTransaction}
          />
        )}
        {tab === "insights" && (
          <Insights
            netWorth={netWorth}
            byType={byType}
            savingsRate={savingsRate}
            emergencyMonths={emergencyMonths}
            investedShare={investedShare}
            categoryBreakdown={categoryBreakdown}
            monthIncome={monthIncome}
            monthExpense={monthExpense}
            accounts={accounts}
          />
        )}
        {tab === "guide" && <Guide openGuide={openGuide} setOpenGuide={setOpenGuide} />}
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ accounts, byType, categoryBreakdown, trend, transactions, deleteTransaction, setTab }) {
  const recent = transactions.slice(0, 6);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {ACCOUNT_TYPES.map((t) => (
          <Card key={t.id} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <IconBadge Icon={t.icon} bg={SLATE_SOFT} fg={INK} />
              <span style={{ fontSize: 12.5, color: INK_SOFT }}>{t.label}</span>
            </div>
            <div className="num" style={{ fontSize: 18, fontWeight: 600 }}>{fmt(byType[t.id] || 0)}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 10 }}>Income vs expense, last 6 months</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={trend} barGap={4}>
                <CartesianGrid vertical={false} stroke={LINE} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: INK_SOFT }} axisLine={{ stroke: LINE }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: INK_SOFT }} axisLine={false} tickLine={false} width={40}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
                <Bar dataKey="Income" fill={EMERALD} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expense" fill={CLAY} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 10 }}>Where this month went</div>
          {categoryBreakdown.length === 0 ? (
            <div style={{ fontSize: 13, color: INK_SOFT, padding: "40px 0", textAlign: "center" }}>
              No expenses logged yet this month.
            </div>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: INK_SOFT }}>Recent activity</div>
          <button onClick={() => setTab("transactions")} style={{ border: "none", background: "none", fontSize: 12.5, color: INK, fontWeight: 600 }}>
            View all →
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState text="No transactions yet. Add your salary credit or first expense to get started." />
        ) : (
          <div>
            {recent.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ fontSize: 13.5, color: INK_SOFT, padding: "22px 4px" }}>{text}</div>;
}

function TxnRow({ t, onDelete, accounts }) {
  const acct = accounts?.find((a) => a.id === t.accountId);
  const isIncome = t.kind === "income";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0", borderTop: `1px solid ${LINE}`, gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <IconBadge Icon={isIncome ? ArrowUpRight : ArrowDownRight} bg={isIncome ? EMERALD_SOFT : CLAY_SOFT} fg={isIncome ? EMERALD : CLAY} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t.category}{t.note ? ` · ${t.note}` : ""}
          </div>
          <div style={{ fontSize: 12, color: INK_SOFT }}>
            {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{acct ? ` · ${acct.name}` : ""}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div className="num" style={{ fontSize: 14.5, fontWeight: 600, color: isIncome ? EMERALD : CLAY }}>
          {isIncome ? "+" : "−"}{fmt(t.amount)}
        </div>
        <button onClick={onDelete} style={{ border: "none", background: "none", color: INK_SOFT, padding: 4 }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Accounts ---------------- */
function Accounts({ accounts, showForm, setShowForm, addAccount, deleteAccount }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) { setError("Give this account a name."); return; }
    if (balance === "" || isNaN(Number(balance))) { setError("Enter a valid balance."); return; }
    addAccount({ name: name.trim(), type, balance: Number(balance) });
    setName(""); setBalance(""); setType("bank"); setError("");
  }

  const grouped = ACCOUNT_TYPES.map((t) => ({ ...t, accounts: accounts.filter((a) => a.type === t.id) }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="headline" style={{ fontSize: 20, fontWeight: 500 }}>Accounts</div>
        <button onClick={() => setShowForm((s) => !s)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: INK, color: PAPER, border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add account"}
        </button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Account name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                style={inputStyle} />
            </Field>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                {ACCOUNT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Current balance (₹)">
              <input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" placeholder="0" style={inputStyle} />
            </Field>
            <button onClick={submit} style={{ background: EMERALD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 38 }}>
              Save
            </button>
          </div>
          {error && <div style={{ color: CLAY, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      {accounts.length === 0 && !showForm && (
        <Card><EmptyState text="No accounts yet. Add your bank account, demat or stock account, and any other platform where you hold money." /></Card>
      )}

      {grouped.filter((g) => g.accounts.length > 0).map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: INK_SOFT, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <g.icon size={13} /> {g.label}
          </div>
          <Card style={{ padding: 0 }}>
            {g.accounts.map((a, i) => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px", borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
              }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{a.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{fmt(a.balance)}</div>
                  <button onClick={() => deleteAccount(a.id)} style={{ border: "none", background: "none", color: INK_SOFT }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 7,
  fontSize: 13.5, background: "#fff", color: INK, outline: "none",
};

/* ---------------- Transactions ---------------- */
function Transactions({ accounts, transactions, showForm, setShowForm, addTransaction, deleteTransaction }) {
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
    setAmount(""); setNote(""); setError("");
  }

  const filtered = transactions.filter((t) => filter === "all" ? true : t.kind === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="headline" style={{ fontSize: 20, fontWeight: 500 }}>Transactions</div>
        <button onClick={() => setShowForm((s) => !s)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: INK, color: PAPER, border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13.5, fontWeight: 600 }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add transaction"}
        </button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["expense", "income"].map((k) => (
              <button key={k} onClick={() => setKind(k)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${LINE}`,
                background: kind === k ? (k === "income" ? EMERALD : CLAY) : "#fff",
                color: kind === k ? "#fff" : INK_SOFT,
              }}>
                {k === "income" ? "Money in" : "Money out"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                {(kind === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Account">
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>
                {accounts.length === 0 && <option value="">No accounts yet</option>}
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Date">
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} />
            </Field>
            <Field label="Note (optional)">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. September salary" style={inputStyle} />
            </Field>
            <button onClick={submit} style={{ background: EMERALD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, height: 38 }}>
              Save
            </button>
          </div>
          {error && <div style={{ color: CLAY, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </Card>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["all", "All"], ["income", "Money in"], ["expense", "Money out"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            padding: "6px 12px", borderRadius: 16, fontSize: 12.5, border: `1px solid ${LINE}`,
            background: filter === id ? SLATE_SOFT : "#fff", color: INK, fontWeight: filter === id ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      <Card style={{ padding: "6px 20px" }}>
        {filtered.length === 0 ? (
          <EmptyState text="Nothing here yet." />
        ) : (
          filtered.map((t) => <TxnRow key={t.id} t={t} onDelete={() => deleteTransaction(t)} accounts={accounts} />)
        )}
      </Card>
    </div>
  );
}

/* ---------------- Insights ---------------- */
function Insights({ netWorth, byType, savingsRate, emergencyMonths, investedShare, categoryBreakdown, monthIncome, monthExpense, accounts }) {
  const nudges = [];

  if (accounts.length === 0) {
    nudges.push({ tone: "neutral", text: "Add your accounts first — bank, share market, and anything else — so this can actually track your money." });
  }
  if (monthIncome === 0 && accounts.length > 0) {
    nudges.push({ tone: "neutral", text: "No income logged this month yet. Add your salary credit as soon as it lands so your savings rate stays accurate." });
  }
  if (savingsRate !== null) {
    if (savingsRate < 0) {
      nudges.push({ tone: "warn", text: `You've spent ${fmt(monthExpense - monthIncome)} more than you earned this month. Worth a closer look at where it went.` });
    } else if (savingsRate < 20) {
      nudges.push({ tone: "warn", text: `You're saving ${savingsRate.toFixed(0)}% of income this month, below the 20% guideline. Check the category breakdown for the biggest lever.` });
    } else {
      nudges.push({ tone: "good", text: `You're saving ${savingsRate.toFixed(0)}% of income this month — at or above the 20% guideline. Keep it up.` });
    }
  }
  if (emergencyMonths !== null) {
    if (emergencyMonths < 3) {
      nudges.push({ tone: "warn", text: `Your bank and cash cover about ${emergencyMonths.toFixed(1)} months of expenses. Aim for 3 to 6 before investing aggressively.` });
    } else {
      nudges.push({ tone: "good", text: `Your emergency fund covers about ${emergencyMonths.toFixed(1)} months of expenses — a healthy cushion.` });
    }
  }
  if (netWorth > 0) {
    if (investedShare < 20) {
      nudges.push({ tone: "warn", text: `Only ${investedShare.toFixed(0)}% of your net worth is in shares or other growth platforms. Idle bank cash beyond your emergency fund loses value to inflation over time.` });
    } else if (investedShare > 80) {
      nudges.push({ tone: "warn", text: `${investedShare.toFixed(0)}% of your net worth sits in shares or other platforms with little in the bank. Make sure your emergency fund isn't at risk of market dips.` });
    } else {
      nudges.push({ tone: "good", text: `Your money is split across bank and growth platforms in a reasonable balance — about ${investedShare.toFixed(0)}% invested.` });
    }
  }
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
    const share = (top.value / total) * 100;
    if (share > 40) {
      nudges.push({ tone: "warn", text: `${top.name} makes up ${share.toFixed(0)}% of this month's spending — your single biggest category. Worth a second look.` });
    }
  }

  const toneStyle = { good: [EMERALD_SOFT, EMERALD], warn: [GOLD_SOFT, GOLD], neutral: [SLATE_SOFT, INK_SOFT] };

  return (
    <div>
      <div className="headline" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Insights</div>
      <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 18 }}>A quick read on how your money is doing right now.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
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
              <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.5 }}>{n.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </Card>
  );
}

/* ---------------- Guide ---------------- */
function Guide({ openGuide, setOpenGuide }) {
  return (
    <div>
      <div className="headline" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Finance guide</div>
      <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 18 }}>Grounded habits, not hot tips. Tap a card to read more.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GUIDE.map((g, i) => {
          const open = openGuide === i;
          return (
            <Card key={i} style={{ padding: 0 }}>
              <button onClick={() => setOpenGuide(open ? null : i)} style={{
                width: "100%", background: "none", border: "none", padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
              }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{g.title}</span>
                <ChevronDown size={16} color={INK_SOFT} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0, marginLeft: 10 }} />
              </button>
              {open && (
                <div style={{ padding: "0 18px 16px", fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>
                  {g.body}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
