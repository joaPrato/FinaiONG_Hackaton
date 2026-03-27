import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordTransaction } from "@/lib/api";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FloatingInput() {
  const { accountId } = useWallet();
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (val: string) => recordTransaction(val, accountId || "0.0.user-default"),
    onSuccess: (data) => {
      toast.success(`Registrado con éxito en Hedera`);
      setText("");
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["stats-by-project"] });
    },
    onError: () => toast.error("Error: ¿Está el backend encendido?"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || mutation.isPending) return;
    mutation.mutate(text);
  };

  return (
    // Aumentamos z-index a 100 y nos aseguramos que no haya clipping
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-[100] pointer-events-auto">
      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-3 bg-[#18181b] border border-[#facc15]/30 rounded-2xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 pl-4 text-[#22c55e]">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">IA Activa</span>
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí aquí el movimiento (ej: Recibí donación de $50000)"
          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-600 italic h-12 text-sm"
          disabled={mutation.isPending}
        />
        <Button 
          type="submit"
          disabled={!text.trim() || mutation.isPending}
          className="bg-[#facc15] hover:bg-[#eab308] text-black rounded-xl px-6 h-11 font-bold transition-transform active:scale-95 shadow-lg shadow-yellow-500/20"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
}