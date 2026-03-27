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

export interface AgentResponse {
  success: boolean;
  data: {
    nombre: string;
    estado: string;
    mensaje?: string;
    alerta?: boolean;
    recomendacion?: string;
    metrica?: any;
    analisis?: any;
    tendencia?: any;
  };
}

// Función de mapeo interna para evitar errores de undefined
function mapTransaction(item: any): Transaction {
  const d = item.data || {};
  return {
    id: String(item.sequence || Math.random()),
    type: String(d.type || "expense").toLowerCase() as any,
    amount: Number(d.amount) || 0,
    description: String(d.description || "Sin descripción"),
    category: String(d.category || "General"),
    date: d.timestamp || new Date().toISOString(),
    hederaSequence: String(item.sequence),
  };
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/api/stats`);
  if (!res.ok) throw new Error("Backend Offline");
  const json = await res.json();
  
  // IMPORTANTE: Tu back envía 'total_income', 'total_expense', etc.
  const s = json.stats || {};
  return {
    totalIncome: Number(s.total_income) || 0,
    totalExpense: Number(s.total_expense) || 0,
    totalDebt: Number(s.total_debt) || 0,
    totalAssets: Number(s.total_assets) || 0,
  };
}

export async function fetchHistory(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/api/history`);
  if (!res.ok) throw new Error("Error en historial");
  const json = await res.json();
  
  // Mapeamos y damos vuelta (reverse) para que el mensaje 28 salga primero
  return (json.history ?? []).map(mapTransaction).reverse();
}

export async function fetchHistoryByType(type: string): Promise<Transaction[]> {
  const url = type === "all" ? `${BASE}/api/history` : `${BASE}/api/history/by-type?type=${type}`;
  const res = await fetch(url);
  const json = await res.json();
  return (json.history ?? []).map(mapTransaction).reverse();
}

export async function fetchStatsByProject(): Promise<ProjectStat[]> {
  const res = await fetch(`${BASE}/api/stats/by-project`);
  const json = await res.json();
  return (json.by_project ?? []).map((p: any) => ({
    project: p.project,
    income: Number(p.total_income) || 0,
    expense: Number(p.total_expense) || 0,
    balance: Number(p.balance) || 0,
  }));
}

export async function recordTransaction(text: string, userWallet: string) {
  const res = await fetch(`${BASE}/api/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userWallet }),
  });
  return res.json();
}

export async function fetchAgentLiquidez(): Promise<AgentResponse> {
  const res = await fetch(`${BASE}/api/agente/analisis-liquidez`);
  return res.json();
}

export async function fetchAgentAuditoria(): Promise<AgentResponse> {
  const res = await fetch(`${BASE}/api/agente/auditoria-gastos`);
  return res.json();
}

export async function fetchAgentSostenibilidad(): Promise<AgentResponse> {
  const res = await fetch(`${BASE}/api/agente/proyeccion-sostenibilidad`);
  return res.json();
}