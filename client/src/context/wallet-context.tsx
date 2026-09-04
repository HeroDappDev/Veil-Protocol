import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  walletAddress: string | null;
  isPhantomInstalled: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkPhantom = () => {
      if (typeof window !== "undefined" && (window as any).phantom?.solana) {
        setIsPhantomInstalled(true);
      }
    };

    checkPhantom();
    window.addEventListener("load", checkPhantom);

    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }

    return () => window.removeEventListener("load", checkPhantom);
  }, []);

  const connectWallet = async () => {
    if (!isPhantomInstalled) {
      toast({
        title: "Phantom Wallet Not Found",
        description: "Please install Phantom wallet extension to continue.",
        variant: "destructive",
      });
      window.open("https://phantom.app/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const phantom = (window as any).phantom?.solana;
      const response = await phantom.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const phantom = (window as any).phantom?.solana;
      await phantom.disconnect();
      setWalletAddress(null);
      localStorage.removeItem("walletAddress");

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isPhantomInstalled,
        isConnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

