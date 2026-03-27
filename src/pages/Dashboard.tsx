import { useQuery } from "@tanstack/react-query";
import { 
  fetchStats, fetchHistory, fetchStatsByProject, 
  fetchAgentLiquidez, fetchAgentAuditoria, fetchAgentSostenibilidad,
  type Stats, type Transaction, type ProjectStat 
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, ListChecks, ShieldCheck, History as HistoryIcon, BrainCircuit } from "lucide-react";
import { translateCategory } from "@/lib/utils";

export default function Dashboard() {
  // Polling cada 3 segundos para asegurar que el front vea el cambio del back
  const pollConfig = { refetchInterval: 3000 };

  const { data: stats, isLoading: loadingStats } = useQuery<Stats>({ queryKey: ["stats"], queryFn: fetchStats, ...pollConfig });
  const { data: history } = useQuery<Transaction[]>({ queryKey: ["history"], queryFn: fetchHistory, ...pollConfig });
  const { data: projects } = useQuery<ProjectStat[]>({ queryKey: ["stats-by-project"], queryFn: fetchStatsByProject, ...pollConfig });

  const { data: aiLiquidez } = useQuery({ queryKey: ["agent-liquidez"], queryFn: fetchAgentLiquidez, ...pollConfig });
  const { data: aiAuditoria } = useQuery({ queryKey: ["agent-auditoria"], queryFn: fetchAgentAuditoria, ...pollConfig });
  const { data: aiSostenibilidad } = useQuery({ queryKey: ["agent-sostenibilidad"], queryFn: fetchAgentSostenibilidad, ...pollConfig });

  if (loadingStats && !stats) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-[#facc15] w-10 h-10" /></div>;
  }

  // Extraemos variables con nombres claros para evitar confusiones
  const displayIncome = stats?.totalIncome || 0;
  const displayExpense = stats?.totalExpense || 0;
  const displayDebt = stats?.totalDebt || 0;
  const displayAssets = stats?.totalAssets || 0;

  const totalSum = displayIncome + displayExpense || 1;
  const inPercent = Math.round((displayIncome / totalSum) * 100);
  const outPercent = 100 - inPercent;

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight italic uppercase">
          FINAI <span className="text-[#facc15] not-italic">ONG</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">
          Panel Sincronizado | Registros: {history?.length || 0}
        </p>
      </header>

      {/* TARJETAS KPI - Aquí verás los montos reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Ingresos" value={displayIncome} color="text-[#22c55e]" bg="bg-[#22c55e]/5" border="border-[#22c55e]/20" icon={<TrendingUp size={18}/>} />
        <KPICard label="Egresos" value={displayExpense} color="text-[#ef4444]" bg="bg-[#ef4444]/5" border="border-[#ef4444]/20" icon={<TrendingDown size={18}/>} />
        <KPICard label="Deuda" value={displayDebt} color="text-[#f59e0b]" bg="bg-[#f59e0b]/5" border="border-[#f59e0b]/20" icon={<AlertCircle size={18}/>} />
        <KPICard label="Activos" value={displayAssets} color="text-[#3b82f6]" bg="bg-[#3b82f6]/5" border="border-[#3b82f6]/20" icon={<ListChecks size={18}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Barra de Balance Real */}
          <Card className="bg-[#121214] border-white/5">
            <CardContent className="p-5">
              <div className="flex justify-between text-[10px] font-black uppercase mb-3 opacity-60">
                <span className="text-[#22c55e]">Ingresos {inPercent}%</span>
                <span className="text-[#ef4444]">Gastos {outPercent}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full flex overflow-hidden">
                <div className="h-full bg-[#22c55e]" style={{ width: `${inPercent}%` }} />
                <div className="h-full bg-[#ef4444]" style={{ width: `${outPercent}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Movimientos Reales con el nuevo arriba (reverse) */}
          <Card className="bg-[#0c0c0e] border-white/5 border overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-4 px-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <HistoryIcon size={14}/> Libro Diario Hedera
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-600 border-b border-white/5 font-mono">
                      <th className="p-4 font-medium uppercase text-[9px]">Concepto</th>
                      <th className="p-4 font-medium uppercase text-[9px]">Tipo</th>
                      <th className="p-4 font-medium uppercase text-[9px] text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history?.slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white/90">{tx.description}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            tx.type === 'income' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 
                            tx.type === 'expense' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                            'bg-white/5 text-gray-400'
                          }`}>
                            {translateCategory(tx.type)}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#3b82f6]">
                          ${tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AGENTES - Los logs del back se verán aquí */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-[#1c1c1f] border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5"><BrainCircuit size={60}/></div>
            <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em]">AGENTES FINAI ONG</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <AgentMessage 
                title="Guardian de Liquidez" 
                message={aiLiquidez?.data?.mensaje}
                status={aiLiquidez?.data?.estado}
              />
              <AgentMessage 
                title="Auditor de Anomalías" 
                message={aiAuditoria?.data?.mensaje}
                status={aiAuditoria?.data?.estado}
              />
              <AgentMessage 
                title="Estratega de Sostenibilidad" 
                message={aiSostenibilidad?.data?.recomendacion || aiSostenibilidad?.data?.mensaje}
                status={aiSostenibilidad?.data?.estado}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, color, icon, bg, border }: any) {
  return (
    <Card className={`${bg} ${border} border shadow-xl`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4">
        <span className="text-[9px] font-black opacity-50 uppercase tracking-widest text-white">{label}</span>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-heading font-bold text-white">
          ${(Number(value) || 0).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentMessage({ title, message, status }: any) {
  const isAlert = status === "CRITICO" || status === "ALERTA" || message?.includes("ANOMALÍA");
  return (
    <div className="space-y-1.5 border-l border-white/5 pl-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase text-gray-500">{title}</span>
        <div className={`h-1.5 w-1.5 rounded-full ${isAlert ? "bg-[#ef4444] animate-ping" : "bg-[#22c55e]"}`} />
      </div>
      <p className={`text-[11px] leading-relaxed ${isAlert ? "text-[#ef4444] font-bold" : "text-white/80"}`}>
        {message || "Procesando..."}
      </p>
    </div>
  );
}