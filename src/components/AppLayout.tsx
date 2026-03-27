import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletButton } from "@/components/WalletButton";
import { FloatingInput } from "./FloatingInput";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0a0c]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
          <header className="h-16 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 shrink-0 z-40 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-400 hover:text-white" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em]">FINAI ONG</span>
                <span className="text-[9px] text-gray-500 font-mono">Blockchain Finance Hub</span>
              </div>
            </div>
            <WalletButton />
          </header>
          
          {/* Scrollable area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-40 scroll-smooth">
            <Outlet />
          </main>

          {/* El input ahora está absolutamente posicionado respecto al contenedor principal */}
          <FloatingInput />
        </div>
      </div>
    </SidebarProvider>
  );
}