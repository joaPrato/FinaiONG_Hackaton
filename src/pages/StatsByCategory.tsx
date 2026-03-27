import { useQuery } from "@tanstack/react-query";
import { fetchStatsByProject, type ProjectStat } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { translateCategory } from "@/lib/utils";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0 }).format(n);
}

export default function StatsByCategory() {
  const { data: projects, isLoading, error } = useQuery<ProjectStat[]>({
    queryKey: ["stats-by-project"],
    queryFn: fetchStatsByProject,
  });

  // Preparamos los datos traduciendo los nombres
  const chartData = projects?.map((p) => ({
    name: translateCategory(p.project),
    balance: p.balance,
    ingresos: p.income,
    egresos: p.expense
  })) || [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[#facc15] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
          Análisis por <span className="text-[#facc15]">Categoría</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Distribución de fondos por proyecto y rubro</p>
      </header>

      {chartData.length > 0 && (
        <Card className="bg-[#121214] border-white/5 border shadow-2xl">
          <CardHeader className="border-b border-white/5 flex flex-row items-center gap-2">
            <BarChart3 size={18} className="text-[#facc15]" />
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Balance Neto por Categoría (ARS)</CardTitle>
          </CardHeader>
          <CardContent className="pt-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    width={150}
                  />
                  <Tooltip 
                    cursor={{fill: 'white', opacity: 0.05}}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#facc15' }}
                    formatter={(value: number) => [`$${formatCurrency(value)}`, 'Balance']}
                  />
                  <Bar dataKey="balance" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((p, i) => (
          <Card key={p.project} className="bg-[#121214] border-white/5 border hover:border-[#facc15]/30 transition-all group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-white/90 group-hover:text-[#facc15] transition-colors uppercase tracking-tight">
                {translateCategory(p.project)}
              </CardTitle>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-gray-500">INGRESOS</span>
                <span className="text-[#22c55e] font-bold">+${formatCurrency(p.income)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-gray-500">EGRESOS</span>
                <span className="text-[#ef4444] font-bold">-${formatCurrency(p.expense)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">Balance</span>
                <span className={`text-sm font-heading font-bold ${p.balance < 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
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