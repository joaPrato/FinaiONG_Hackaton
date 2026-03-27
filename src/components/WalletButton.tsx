import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export function WalletButton() {
  const { accountId, isConnecting, connect, disconnect } = useWallet();

  if (isConnecting) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting…
      </Button>
    );
  }

  if (accountId) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
          <Wallet className="h-4 w-4 text-secondary" />
          <span className="font-mono text-xs text-foreground">
            {accountId.slice(0, 6)}…{accountId.slice(-4)}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
