import { useQuery } from "@tanstack/react-query";
import { fetchStatsByProject, type ProjectStat } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(210, 80%, 42%)",
  "hsl(162, 55%, 42%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 55%)",
  "hsl(190, 70%, 45%)",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
}

export default function StatsByCategory() {
  const { data: projects, isLoading, error } = useQuery<ProjectStat[]>({
    queryKey: ["stats-by-project"],
    queryFn: fetchStatsByProject,
  });

  const donutData = projects?.map((p) => ({ name: p.project, value: Math.abs(p.balance) })) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load category stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold">Stats by Category</h1>

      {donutData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-heading">Balance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${formatCurrency(v)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((p, i) => (
          <Card key={p.project} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <CardTitle className="text-sm font-heading">{p.project}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income</span>
                <span className="font-mono text-income">${formatCurrency(p.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense</span>
                <span className="font-mono text-expense">${formatCurrency(p.expense)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-medium">Balance</span>
                <span className={`font-mono font-bold ${p.balance < 0 ? "text-expense" : "text-income"}`}>
                  ${formatCurrency(p.balance)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
