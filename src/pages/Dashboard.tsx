import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchHistory, type Stats, type Transaction } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Landmark, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const kpiConfig = [
  { key: "totalIncome" as const, label: "Total Income", icon: TrendingUp, color: "text-income", prefix: "$" },
  { key: "totalExpense" as const, label: "Total Expense", icon: TrendingDown, color: "text-expense", prefix: "$" },
  { key: "totalDebt" as const, label: "Total Debt", icon: AlertTriangle, color: "text-debt", prefix: "$" },
  { key: "totalAssets" as const, label: "Total Assets", icon: Landmark, color: "text-asset", prefix: "$" },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
}

const typeBadgeClasses: Record<string, string> = {
  income: "bg-income/10 text-income",
  expense: "bg-expense/10 text-expense",
  debt: "bg-debt/10 text-debt",
  asset: "bg-asset/10 text-asset",
};

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const { data: history, isLoading: loadingHistory } = useQuery<Transaction[]>({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  const chartData = stats
    ? [{ name: "Overview", Income: stats.totalIncome, Expense: stats.totalExpense }]
    : [];

  const last5 = history?.slice(0, 5) ?? [];

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard. Is the API running?</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats &&
          kpiConfig.map(({ key, label, icon: Icon, color, prefix }) => (
            <Card key={key} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-bold">
                  {prefix}{formatCurrency(stats[key])}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-heading">Income vs Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Income" fill="hsl(var(--income))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="hsl(var(--expense))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-heading">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          ) : last5.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {last5.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeBadgeClasses[tx.type] ?? ""}`}>
                      {tx.type}
                    </span>
                    <span className="text-sm">{tx.description}</span>
                  </div>
                  <span className="font-mono text-sm font-medium">${formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
