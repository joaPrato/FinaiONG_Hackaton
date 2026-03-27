const BASE = "http://localhost:3000";

export interface Transaction {
  id: string;
  type: "income" | "expense" | "debt" | "asset";
  amount: number;
  description: string;
  category: string;
  date: string;
  hederaSequence?: string;
}

export interface Stats {
  totalIncome: number;
  totalExpense: number;
  totalDebt: number;
  totalAssets: number;
}

export interface ProjectStat {
  project: string;
  income: number;
  expense: number;
  balance: number;
}

export interface RecordResult {
  parsed: {
    type: string;
    amount: number;
    description: string;
    category: string;
  };
  hederaSequenceNumber: string;
  transactionId: string;
}

function mapTransaction(item: any): Transaction {
  const d = item.data ?? {};
  return {
    id: String(item.sequence),
    type: d.type,
    amount: d.amount,
    description: d.description,
    category: d.category,
    date: d.timestamp,
    hederaSequence: String(item.sequence),
  };
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  const s = json.stats;
  return {
    totalIncome: s.total_income,
    totalExpense: s.total_expense,
    totalDebt: s.total_debt,
    totalAssets: s.total_assets,
  };
}

export async function fetchHistory(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/api/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  const json = await res.json();
  return (json.history ?? []).map(mapTransaction);
}

export async function fetchHistoryByType(type: string): Promise<Transaction[]> {
  const url = type === "all" ? `${BASE}/api/history` : `${BASE}/api/history/by-type?type=${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch history");
  const json = await res.json();
  return (json.history ?? []).map(mapTransaction);
}

export async function recordTransaction(text: string, userWallet: string): Promise<RecordResult> {
  const res = await fetch(`${BASE}/api/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userWallet }),
  });
  if (!res.ok) throw new Error("Failed to record transaction");
  const json = await res.json();
  return {
    parsed: json.data,
    hederaSequenceNumber: String(json.hedera_sequence),
    transactionId: String(json.hedera_sequence),
  };
}

export async function fetchStatsByProject(): Promise<ProjectStat[]> {
  const res = await fetch(`${BASE}/api/stats/by-project`);
  if (!res.ok) throw new Error("Failed to fetch stats by project");
  const json = await res.json();
  return (json.by_project ?? []).map((p: any) => ({
    project: p.project,
    income: p.total_income,
    expense: p.total_expense,
    balance: p.balance,
  }));
}
