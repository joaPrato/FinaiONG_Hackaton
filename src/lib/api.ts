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

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchHistory(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/api/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchHistoryByType(type: string): Promise<Transaction[]> {
  const url = type === "all" ? `${BASE}/api/history` : `${BASE}/api/history/by-type?type=${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function recordTransaction(text: string, userWallet: string): Promise<RecordResult> {
  const res = await fetch(`${BASE}/api/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userWallet }),
  });
  if (!res.ok) throw new Error("Failed to record transaction");
  return res.json();
}

export async function fetchStatsByProject(): Promise<ProjectStat[]> {
  const res = await fetch(`${BASE}/api/stats/by-project`);
  if (!res.ok) throw new Error("Failed to fetch stats by project");
  return res.json();
}
