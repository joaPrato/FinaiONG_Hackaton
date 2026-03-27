// import { useQuery } from "@tanstack/react-query";
// import { fetchStats, fetchHistory, type Stats, type Transaction } from "@/lib/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { TrendingUp, TrendingDown, AlertTriangle, Landmark, Loader2 } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// const kpiConfig = [
//   { key: "totalIncome" as const, label: "Total Income", icon: TrendingUp, color: "text-income", prefix: "$" },
//   { key: "totalExpense" as const, label: "Total Expense", icon: TrendingDown, color: "text-expense", prefix: "$" },
//   { key: "totalDebt" as const, label: "Total Debt", icon: AlertTriangle, color: "text-debt", prefix: "$" },
//   { key: "totalAssets" as const, label: "Total Assets", icon: Landmark, color: "text-asset", prefix: "$" },
// ];

// function formatCurrency(n: number) {
//   return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
// }

// const typeBadgeClasses: Record<string, string> = {
//   income: "bg-income/10 text-income",
//   expense: "bg-expense/10 text-expense",
//   debt: "bg-debt/10 text-debt",
//   asset: "bg-asset/10 text-asset",
// };

// export default function Dashboard() {
//   const { data: stats, isLoading: loadingStats, error: statsError } = useQuery<Stats>({
//     queryKey: ["stats"],
//     queryFn: fetchStats,
//   });

//   const { data: history, isLoading: loadingHistory } = useQuery<Transaction[]>({
//     queryKey: ["history"],
//     queryFn: fetchHistory,
//   });

//   const chartData = stats
//     ? [{ name: "Overview", Income: stats.totalIncome, Expense: stats.totalExpense }]
//     : [];

//   const last5 = history?.slice(0, 5) ?? [];

//   if (loadingStats) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (statsError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Failed to load dashboard. Is the API running?</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats &&
//           kpiConfig.map(({ key, label, icon: Icon, color, prefix }) => (
//             <Card key={key} className="shadow-sm">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
//                 <Icon className={`h-5 w-5 ${color}`} />
//               </CardHeader>
//               <CardContent>
//                 <p className="text-2xl font-heading font-bold">
//                   {prefix}{formatCurrency(stats[key])}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//       </div>

//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-base font-heading">Income vs Expense</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                 <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="Income" fill="hsl(var(--income))" radius={[6, 6, 0, 0]} />
//                 <Bar dataKey="Expense" fill="hsl(var(--expense))" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-base font-heading">Recent Transactions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loadingHistory ? (
//             <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
//           ) : last5.length === 0 ? (
//             <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
//           ) : (
//             <div className="space-y-2">
//               {last5.map((tx) => (
//                 <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
//                   <div className="flex items-center gap-3">
//                     <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeBadgeClasses[tx.type] ?? ""}`}>
//                       {tx.type}
//                     </span>
//                     <span className="text-sm">{tx.description}</span>
//                   </div>
//                   <span className="font-mono text-sm font-medium">${formatCurrency(tx.amount)}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchHistory, fetchStatsByProject, type Stats, type Transaction, type ProjectStat } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, ListChecks, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { translateCategory } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 5000,
  });

  const { data: history } = useQuery<Transaction[]>({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  const { data: projects } = useQuery<ProjectStat[]>({
    queryKey: ["stats-by-project"],
    queryFn: fetchStatsByProject,
  });

  if (loadingStats) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[#facc15] w-10 h-10" />
      </div>
    );
  }

  // Cálculos dinámicos basados en la data real del back
  const totalIn = stats?.totalIncome || 0;
  const totalOut = stats?.totalExpense || 0;
  const totalSum = totalIn + totalOut || 1;
  const inPercent = Math.round((totalIn / totalSum) * 100);
  const outPercent = 100 - inPercent;

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight italic">
            FINAI ONG<span className="text-[#facc15] not-italic">Agente Financiero</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">
            Explorador de Consenso Hedera HCS
          </p>
        </div>
      </header>

      {/* KPIs Reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Ingresos Totales" value={totalIn} color="text-[#22c55e]" bg="bg-[#22c55e]/5" border="border-[#22c55e]/20" icon={<TrendingUp size={18}/>} />
        <KPICard label="Egresos Totales" value={totalOut} color="text-[#ef4444]" bg="bg-[#ef4444]/5" border="border-[#ef4444]/20" icon={<TrendingDown size={18}/>} />
        <KPICard label="Deuda" value={stats?.totalDebt || 0} color="text-[#f59e0b]" bg="bg-[#f59e0b]/5" border="border-[#f59e0b]/20" icon={<AlertCircle size={18}/>} />
        <KPICard label="Activos" value={stats?.totalAssets || 0} color="text-[#3b82f6]" bg="bg-[#3b82f6]/5" border="border-[#3b82f6]/20" icon={<ListChecks size={18}/>} />
      </div>

      {/* Barra de Balance Real */}
      <Card className="bg-[#121214] border-white/5 border shadow-2xl">
        <CardContent className="p-5">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
            <span className="text-[#22c55e]">Flujo Ingresos {inPercent}%</span>
            <span className="text-[#ef4444]">Flujo Gastos {outPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full flex overflow-hidden">
            <div className="h-full bg-[#22c55e] transition-all duration-700 ease-in-out" style={{ width: `${inPercent}%` }} />
            <div className="h-full bg-[#ef4444] transition-all duration-700 ease-in-out" style={{ width: `${outPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desglose por Categoría (Viene de tu endpoint /by-project) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-[#121214] border-white/5 border">
            <CardHeader className="py-4 px-6 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!projects?.length ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 text-xs italic">No hay categorías detectadas por la IA todavía.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {projects.map((p) => {
                    const percentage = totalIn > 0 ? Math.round(((p.income || 0) / totalIn) * 100) : 0;
                    return (
                      <div key={p.project} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                          <span className="text-white/80">{translateCategory(p.project)}</span>
                          <span className="text-gray-500 font-mono">${(p.income || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#facc15]" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movimientos Recientes Reales de Hedera */}
          <Card className="bg-[#0c0c0e] border-white/5 border overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-4 px-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <HistoryIcon size={14}/> Últimos Movimientos
              </CardTitle>
              <span className="text-[9px] font-mono text-gray-600">Sincronizado con Mirror Node</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-600 border-b border-white/5 font-mono bg-white/[0.01]">
                      <th className="p-4 font-medium uppercase text-[9px]">Concepto</th>
                      <th className="p-4 font-medium uppercase text-[9px]">Tipo</th>
                      <th className="p-4 font-medium uppercase text-[9px] text-right">Monto (ARS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history?.length === 0 && (
                      <tr><td colSpan={3} className="p-10 text-center text-gray-600 italic">Esperando transacciones...</td></tr>
                    )}
                    {history?.slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 font-bold text-white/90">
                          {tx.description || "Sin descripción"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase ${
                            tx.type === 'income' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#3b82f6]">
                          ${(tx.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Lateral: Estado de Red y Agente */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-[#22c55e]/5 border-[#22c55e]/20 border relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-[#22c55e] uppercase tracking-[0.2em]">Agente FINIA</CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-white/70 space-y-3 font-mono">
               <div className="flex justify-between"><span>Registros:</span> <span className="text-white">{history?.length || 0}</span></div>
               <div className="flex justify-between border-t border-white/5 pt-2">
                 <span>Balance Neto:</span> 
                 <span className={totalIn - totalOut >= 0 ? "text-[#22c55e] font-bold" : "text-[#ef4444] font-bold"}>
                   ${(totalIn - totalOut).toLocaleString()}
                 </span>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-[#6366f1]/5 border-[#6366f1]/20 border font-mono text-[10px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[9px] font-black text-[#818cf8] uppercase tracking-widest flex items-center justify-between">
                Estado Inmutabilidad <ShieldCheck size={12}/>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-500">
              <div className="flex justify-between"><span>Network</span><span className="text-white">Hedera Testnet</span></div>
              <div className="flex justify-between"><span>HCS Status</span><span className="text-[#22c55e]">Verified</span></div>
              <div className="pt-4 opacity-30">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#818cf8] animate-[shimmer_2s_infinite] w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, color, icon, bg, border }: any) {
  return (
    <Card className={`${bg} ${border} border shadow-xl transition-transform hover:scale-[1.02] cursor-default`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4">
        <span className="text-[9px] font-black opacity-50 uppercase tracking-widest text-white">{label}</span>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-heading font-bold text-white">
          ${(value || 0).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}