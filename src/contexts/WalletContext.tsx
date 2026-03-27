import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WalletContextType {
  accountId: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    // Simulate HashConnect pairing delay
    await new Promise((r) => setTimeout(r, 1500));
    setAccountId("0.0.4856732");
    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setAccountId(null);
  }, []);

  return (
    <WalletContext.Provider value={{ accountId, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
