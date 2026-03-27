import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hashgraph/sdk";

// 👇 Conseguí el tuyo gratis en https://cloud.walletconnect.com
const PROJECT_ID = "ef823a9c6099b2a0f248e45cb33b15c2";

const APP_METADATA = {
  name: "FINAI ONG",
  description: "Gestión financiera para ONGs",
  url: window.location.origin,
  icons: [`${window.location.origin}/logo.png`],
};

interface WalletContextType {
  accountId: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

let dAppConnector: DAppConnector | null = null;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        dAppConnector = new DAppConnector(
          APP_METADATA,
          LedgerId.TESTNET,
          PROJECT_ID,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Testnet]
        );

        await dAppConnector.init({ logger: "error" });

        // Recuperar sesión existente si la hay
        const sessions =
          dAppConnector.walletConnectClient?.session.getAll() ?? [];
        if (sessions.length > 0) {
          const lastSession = sessions[sessions.length - 1];
          const account =
            lastSession.namespaces?.hedera?.accounts?.[0];
          if (account) {
            setAccountId(account.split(":")[2]);
          }
        }
      } catch (e) {
        console.error("Error al inicializar WalletConnect:", e);
      }
    };

    init();
  }, []);

  const connect = useCallback(async () => {
    if (!dAppConnector) {
      console.error("Conector no inicializado todavía");
      return;
    }
    setIsConnecting(true);
    try {
      await dAppConnector.openModal();

      const sessions =
        dAppConnector.walletConnectClient?.session.getAll() ?? [];
      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        const account =
          lastSession.namespaces?.hedera?.accounts?.[0];
        if (account) {
          setAccountId(account.split(":")[2]);
        }
      }
    } catch (e) {
      console.error("Error al conectar wallet:", e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!dAppConnector) return;
    try {
      await dAppConnector.disconnectAll();
    } catch (e) {
      console.error("Error al desconectar:", e);
    } finally {
      setAccountId(null);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ accountId, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}