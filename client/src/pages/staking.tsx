import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Shield, Cpu, TrendingUp, Clock, CheckCircle2, AlertCircle, Coins, Sparkles, Copy, ExternalLink, QrCode } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Phantom wallet types
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: any }>;
    };
  }
}

interface StakingPool {
  id: string;
  name: string;
  description: string;
  aprPercentage: number;
  totalStaked: number;
  minStake: number;
  maxStake: number;
  lockPeriodDays: number;
  isActive: number;
  depositWalletAddress?: string;
}

interface UserStake {
  id: string;
  walletAddress: string;
  poolId: string;
  amount: number;
  stakedAt: Date;
  unlockAt: Date;
  claimedRewards: number;
  isActive: number;
  unstakedAt: Date | null;
  pendingRewards: number;
  pool: StakingPool;
  transactionSignature?: string | null;
}

export default function Staking() {
  const { walletAddress, connectWallet } = useWallet();
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<"amount" | "transfer">("amount");
  const [transferPending, setTransferPending] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<string>("");

  // Fetch user's VEIL token balance
  const { data: tokenBalance } = useQuery({
    queryKey: ["/api/solana/balance", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const res = await fetch(`/api/solana/balance/${walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch balance');
      return res.json();
    },
    enabled: !!walletAddress,
    refetchInterval: 30000,
  });

  const { data: pools = [], isLoading: poolsLoading } = useQuery<StakingPool[]>({
    queryKey: ["/api/staking/pools"],
    queryFn: async () => {
      // Force fresh data with cache-busting query parameter and headers
      const timestamp = Date.now();
      const res = await fetch(`/api/staking/pools?cb=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pools');
      return res.json();
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Debug logging to verify pool data
  console.log("🔍 STAKING PAGE DEBUG:", {
    poolCount: pools.length,
    pools: pools.map(p => ({
      id: p.id,
      name: p.name,
      aprPercentage: p.aprPercentage,
      totalStakedRaw: p.totalStaked,
      totalStakedFormatted: (p.totalStaked / 1000000).toLocaleString()
    })),
    timestamp: new Date().toISOString()
  });

  const { data: userStakes = [], isLoading: stakesLoading, refetch: refetchStakes } = useQuery<UserStake[]>({
    queryKey: ["/api/staking/stakes", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const res = await fetch(`/api/staking/stakes/${walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch stakes');
      return res.json();
    },
    enabled: !!walletAddress,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 0, // Override global staleTime to ensure fresh data
    gcTime: 0, // Don't cache this data (v5 renamed from cacheTime)
  });

  const stakeMutation = useMutation({
    mutationFn: async (data: { poolId: string; amount: number }) => {
      const res = await apiRequest("POST", "/api/staking/stake", {
        walletAddress,
        poolId: data.poolId,
        amount: data.amount,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: "Your tokens have been staked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stakes", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      setStakeDialogOpen(false);
      setStakeAmount("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens",
      });
    },
  });

  const unstakeMutation = useMutation({
    mutationFn: async (stakeId: string) => {
      const res = await apiRequest("POST", "/api/staking/unstake", { stakeId });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Unstaking Successful",
        description: `Unstaked successfully! Rewards: ${data.rewards || 0} tokens`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stakes", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Unstaking Failed",
        description: error.message || "Failed to unstake tokens",
      });
    },
  });

  const handleStake = () => {
    if (!walletAddress) {
      connectWallet();
      return;
    }

    if (!selectedPool) return;

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount",
      });
      return;
    }

    // Move to transfer instructions step
    setDialogStep("transfer");
  };

  const handlePhantomTransfer = async () => {
    // Check if Phantom is available
    if (!window.solana || !window.solana.isPhantom) {
      toast({
        variant: "destructive",
        title: "Phantom Not Found",
        description: "Please install Phantom wallet extension to use this feature.",
      });
      return;
    }

    if (!walletAddress || !selectedPool?.depositWalletAddress) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "Wallet not connected or pool address missing",
      });
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      setTransferPending(true);
      
      // Import Solana web3 dynamically
      const { PublicKey, Transaction, TransactionInstruction, Connection } = await import("@solana/web3.js");
      const { 
        createTransferInstruction, 
        createAssociatedTokenAccountInstruction,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        getAssociatedTokenAddressSync
      } = await import("@solana/spl-token");

      const VEIL_MINT = "3BCF7bxM5aSjm4pNuoTLN3ww7PFjW321rypsgfNipump";
      const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      
      // Convert amount to raw units
      const rawAmount = toRawUnits(amount);
      
      const mintPubkey = new PublicKey(VEIL_MINT);
      const walletPubkey = new PublicKey(walletAddress!);
      const poolWalletPubkey = new PublicKey(selectedPool.depositWalletAddress!);
      
      // Get token accounts using Token-2022 program (VEIL is a Token-2022 token)
      const fromTokenAccount = getAssociatedTokenAddressSync(
        mintPubkey,
        walletPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const toTokenAccount = getAssociatedTokenAddressSync(
        mintPubkey,
        poolWalletPubkey,
        true, // allow off-curve for PDAs
        TOKEN_2022_PROGRAM_ID
      );

      console.log("Building transaction:", {
        from: fromTokenAccount.toBase58(),
        to: toTokenAccount.toBase58(),
        amount: rawAmount
      });

      // Build transaction
      const transaction = new Transaction();
      
      // Add memo instruction for transparency and security validation
      const memoText = `Veil Protocol: Stake ${amount} VEIL to ${selectedPool.name} (${selectedPool.aprPercentage}% APR)`;
      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: true }],
        data: Buffer.from(memoText, 'utf-8'),
        programId: MEMO_PROGRAM_ID
      });
      transaction.add(memoInstruction);
      
      // Check if destination token account exists, create if needed
      const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');
      const destAccountInfo = await connection.getAccountInfo(toTokenAccount);
      
      if (!destAccountInfo) {
        console.log("Pool token account doesn't exist yet - creating it first");
        // Add create ATA instruction for Token-2022
        transaction.add(
          createAssociatedTokenAccountInstruction(
            walletPubkey, // payer
            toTokenAccount, // ata
            poolWalletPubkey, // owner
            mintPubkey, // mint
            TOKEN_2022_PROGRAM_ID, // token program
            ASSOCIATED_TOKEN_PROGRAM_ID // associated token program
          )
        );
      } else {
        console.log("Pool token account exists - proceeding with transfer");
      }
      
      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          walletPubkey,
          rawAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      // Get blockhash from our backend (bypasses CORS issues)
      console.log("Fetching blockhash from backend proxy...");
      const blockhashResponse = await fetch('/api/solana/blockhash', {
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!blockhashResponse.ok) {
        const errorText = await blockhashResponse.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch blockhash: ${blockhashResponse.statusText} - ${errorText}`);
      }
      
      const { blockhash } = await blockhashResponse.json();
      console.log("Got blockhash successfully from backend");

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Sending transaction to Phantom for signing...");

      // Send transaction via Phantom
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      
      const sigString = signature.toString();
      console.log("✅ Transaction signature:", sigString);
      setTransactionSignature(sigString);
      
      toast({
        title: "Transfer Submitted",
        description: `Transaction signature: ${sigString.substring(0, 8)}... Your VEIL tokens are being transferred.`,
      });

      // Poll for stake creation
      pollForStake(signature.toString());

    } catch (error: any) {
      console.error("Transfer error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });
      
      // Reset state on error so user can retry
      setTransactionSignature("");
      
      // Better error message based on error type
      let errorMessage = error.message || "Failed to send VEIL tokens. Please try again.";
      
      // Check for specific error types
      if (error.name === 'AbortError' || errorMessage.includes('timeout')) {
        errorMessage = "Connection timeout. The blockchain RPC is slow. Please wait a moment and try again.";
      } else if (errorMessage.includes('blockhash')) {
        errorMessage = "Failed to connect to Solana network. Please check your connection and try again.";
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        errorMessage = "Network connection error. Please check your internet connection and try again.";
      } else if (errorMessage.includes('account')) {
        errorMessage = "Failed to retrieve account information. Please ensure your wallet has VEIL tokens and try again.";
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = "Transaction was cancelled.";
      }
      
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: errorMessage,
      });
    } finally {
      setTransferPending(false);
    }
  };

  const pollForStake = async (signature: string) => {
    const maxAttempts = 60; // Poll for up to 10 minutes
    let attempts = 0;

    const checkStake = setInterval(async () => {
      attempts++;
      
      // Refetch user stakes
      const result = await refetchStakes();
      
      // Check if a new stake with this signature exists
      const newStake = result.data?.find(stake => 
        stake.transactionSignature === signature
      );

      if (newStake) {
        clearInterval(checkStake);
        toast({
          title: "Stake Created!",
          description: `Your stake of ${formatNumber(toTokenAmount(newStake.amount))} VEIL is now active and earning ${selectedPool?.aprPercentage}% APR!`,
        });
        setStakeDialogOpen(false);
        setDialogStep("amount");
        setStakeAmount("");
        setTransactionSignature("");
      } else if (attempts >= maxAttempts) {
        clearInterval(checkStake);
        toast({
          variant: "destructive",
          title: "Stake Creation Delayed",
          description: "Your transaction is confirmed but the stake hasn't appeared yet. Please check back in a few minutes.",
        });
      }
    }, 10000); // Poll every 10 seconds
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const openStakeDialog = (pool: StakingPool) => {
    setSelectedPool(pool);
    setStakeDialogOpen(true);
    setDialogStep("amount");
    setStakeAmount("");
    setTransactionSignature("");
  };

  const handleUnstake = (stakeId: string) => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    unstakeMutation.mutate(stakeId);
  };

  const getPoolIcon = (poolName: string) => {
    if (poolName.includes("CipherVault")) return Shield;
    if (poolName.includes("QuantumShield")) return Cpu;
    if (poolName.includes("ShadowNode")) return Lock;
    return Sparkles;
  };

  // VEIL token has 6 decimals
  const VEIL_DECIMALS = 6;
  
  // Convert raw units to token amount
  const toTokenAmount = (rawUnits: number) => {
    return rawUnits / Math.pow(10, VEIL_DECIMALS);
  };
  
  // Convert token amount to raw units
  const toRawUnits = (tokens: number) => {
    return Math.floor(tokens * Math.pow(10, VEIL_DECIMALS));
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(num);
  };

  const calculateDaysRemaining = (unlockAt: Date) => {
    const now = new Date();
    const unlock = new Date(unlockAt);
    const diff = unlock.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isUnlocked = (unlockAt: Date) => {
    return new Date() >= new Date(unlockAt);
  };

  return (
    <>
      <div className="relative min-h-screen bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Privacy Staking Pools
                </h1>
                <p className="text-lg text-muted-foreground font-mono">
                  &gt; Earn high APR with privacy-preserving staking protocols
                </p>
              </div>
            </div>
          </div>

          {/* Total Staked Across All Pools */}
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm">
            <CardContent className="py-6">
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 blur-xl animate-pulse" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-mono text-muted-foreground mb-1">
                      Total Staked Across All Pools
                    </h3>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      {formatNumber(toTokenAmount(pools.reduce((sum, pool) => sum + pool.totalStaked, 0)))} VEIL
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  {walletAddress && (
                    <div className="text-center">
                      <p className="text-muted-foreground font-mono mb-1">Wallet Balance</p>
                      <p className="text-xl font-bold text-accent">
                        {tokenBalance ? formatNumber(tokenBalance.uiAmount || 0) : '...'} VEIL
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-muted-foreground font-mono mb-1">Active Pools</p>
                    <p className="text-xl font-bold text-foreground">{pools.filter(p => p.isActive === 1).length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground font-mono mb-1">Total Stakers</p>
                    <p className="text-xl font-bold text-foreground">{new Set(userStakes.map(s => s.walletAddress)).size || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="pools" className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/20">
              <TabsTrigger value="pools" data-testid="tab-pools">
                <Sparkles className="w-4 h-4 mr-2" />
                Available Pools
              </TabsTrigger>
              <TabsTrigger value="mystakes" disabled data-testid="tab-mystakes">
                <Coins className="w-4 h-4 mr-2" />
                My Stakes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pools" className="space-y-6">
              {poolsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card/80 backdrop-blur-sm border-primary/20 animate-pulse">
                      <CardHeader className="space-y-3">
                        <div className="h-6 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pools.map((pool) => {
                    const Icon = getPoolIcon(pool.name);
                    
                    // Unique theme for each pool
                    const poolTheme = pool.name.includes('Phantom') 
                      ? {
                          gradient: 'from-purple-500/20 via-violet-500/10 to-fuchsia-500/20',
                          glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
                          iconBg: 'from-purple-500/20 to-violet-500/20',
                          iconColor: 'text-purple-400',
                          borderGlow: 'group-hover:border-purple-500/50',
                          badge: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/40',
                          feature: 'Phantom Privacy',
                          featureIcon: '👻',
                        }
                      : pool.name.includes('Shadow')
                      ? {
                          gradient: 'from-cyan-500/20 via-teal-500/10 to-blue-500/20',
                          glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]',
                          iconBg: 'from-cyan-500/20 to-teal-500/20',
                          iconColor: 'text-cyan-400',
                          borderGlow: 'group-hover:border-cyan-500/50',
                          badge: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40',
                          feature: 'Quantum Shield',
                          featureIcon: '🛡️',
                        }
                      : {
                          gradient: 'from-orange-500/20 via-red-500/10 to-rose-500/20',
                          glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
                          iconBg: 'from-orange-500/20 to-red-500/20',
                          iconColor: 'text-orange-400',
                          borderGlow: 'group-hover:border-orange-500/50',
                          badge: 'from-orange-500/20 to-rose-500/20 border-orange-500/40',
                          feature: 'Obsidian Power',
                          featureIcon: '🔥',
                        };

                    return (
                      <Card 
                        key={pool.id} 
                        className={`group relative bg-card/90 backdrop-blur-md border-2 border-primary/20 ${poolTheme.borderGlow} overflow-hidden transition-all duration-500 ${poolTheme.glow}`}
                        data-testid={`card-pool-${pool.id}`}
                      >
                        {/* Animated gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${poolTheme.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className={`absolute inset-0 bg-gradient-to-r ${poolTheme.gradient} blur-xl`} />
                        </div>
                        
                        {/* Particle effect overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
                          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-100" />
                          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-200" />
                        </div>
                        
                        <CardHeader className="relative space-y-3 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${poolTheme.iconBg} border border-primary/30 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-6 h-6 ${poolTheme.iconColor}`} />
                              </div>
                              <div className="flex flex-col">
                                <Badge variant="outline" className={`bg-gradient-to-r ${poolTheme.badge} text-xs font-bold px-2 py-0.5`}>
                                  {poolTheme.featureIcon} {poolTheme.feature}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-primary font-bold text-lg px-3 py-1 animate-pulse">
                                {pool.aprPercentage}%
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">APR</span>
                            </div>
                          </div>
                          
                          <div>
                            <CardTitle className={`text-2xl font-bold text-foreground group-hover:${poolTheme.iconColor} transition-colors duration-300`}>
                              {pool.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {pool.description}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent className="relative space-y-4">
                          {/* Stats Grid */}
                          <div className="space-y-3 bg-background/40 rounded-lg p-3 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5" />
                                Total Staked
                              </span>
                              <span className={`${poolTheme.iconColor} font-bold text-base`}>
                                {formatNumber(toTokenAmount(pool.totalStaked))} 
                                <span className="text-xs text-muted-foreground ml-1">VEIL</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Lock Period
                              </span>
                              <span className="text-foreground font-bold">{pool.lockPeriodDays} {pool.lockPeriodDays === 1 ? 'day' : 'days'}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Min Stake
                              </span>
                              <span className="text-foreground font-medium">
                                {formatNumber(toTokenAmount(pool.minStake))}
                                <span className="text-xs text-muted-foreground ml-1">VEIL</span>
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Daily Rewards
                              </span>
                              <span className={`${poolTheme.iconColor} font-bold`}>
                                ~{((pool.aprPercentage / 365)).toFixed(3)}%
                              </span>
                            </div>
                          </div>

                          {/* Pool Activity Indicator */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-mono">Pool Activity</span>
                              <span className={`${poolTheme.iconColor} font-bold animate-pulse`}>
                                LIVE
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                              {/* Animated wave effect */}
                              <div className="absolute inset-0 flex">
                                <div 
                                  className={`h-full bg-gradient-to-r ${poolTheme.gradient} animate-pulse`}
                                  style={{ 
                                    width: '100%',
                                    animation: 'wave 2s ease-in-out infinite'
                                  }}
                                />
                              </div>
                              {/* Moving shine effect */}
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                style={{
                                  animation: 'shimmer 3s linear infinite',
                                  transform: 'translateX(-100%)'
                                }}
                              />
                            </div>
                          </div>
                          <style>{`
                            @keyframes wave {
                              0%, 100% { opacity: 0.5; }
                              50% { opacity: 1; }
                            }
                            @keyframes shimmer {
                              0% { transform: translateX(-100%); }
                              100% { transform: translateX(100%); }
                            }
                          `}</style>
                        </CardContent>

                        <CardFooter className="relative pt-4">
                          <Button
                            className="w-full font-mono font-bold"
                            disabled
                            variant="outline"
                            data-testid={`button-stake-${pool.id}`}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mystakes" className="space-y-6">
              {stakesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card/80 backdrop-blur-sm border-primary/20 animate-pulse">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-muted rounded w-1/2" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userStakes.length === 0 ? (
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center py-12 space-y-4">
                      <div className="inline-block p-4 rounded-full bg-muted">
                        <Coins className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">No Active Stakes</h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          &gt; Start staking to earn rewards
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userStakes.map((stake) => {
                    const Icon = getPoolIcon(stake.pool?.name || "");
                    const daysRemaining = calculateDaysRemaining(stake.unlockAt);
                    const canUnstake = isUnlocked(stake.unlockAt) && stake.isActive === 1;

                    return (
                      <Card 
                        key={stake.id} 
                        className="bg-card/80 backdrop-blur-sm border-primary/20 overflow-hidden"
                        data-testid={`card-stake-${stake.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-md bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold text-foreground">
                                  {stake.pool?.name || "Unknown Pool"}
                                </CardTitle>
                                <CardDescription className="text-sm font-mono">
                                  {stake.pool?.aprPercentage}% APR
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {stake.isActive === 1 ? (
                                canUnstake ? (
                                  <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Unlocked
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {daysRemaining}d locked
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="bg-muted border-muted-foreground/30 text-muted-foreground">
                                  Unstaked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground font-mono">Staked Amount</div>
                              <div className="text-lg font-bold text-foreground">{formatNumber(toTokenAmount(stake.amount))} VEIL</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground font-mono">Pending Rewards</div>
                              <div className="text-lg font-bold text-accent">{formatNumber(toTokenAmount(stake.pendingRewards || 0))} VEIL</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground font-mono">Staked Date</div>
                              <div className="text-sm font-medium text-foreground">
                                {new Date(stake.stakedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground font-mono">Unlock Date</div>
                              <div className="text-sm font-medium text-foreground">
                                {new Date(stake.unlockAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {stake.isActive === 1 && !canUnstake && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                <span>Unlocking progress</span>
                                <span>{((7 - daysRemaining) / 7 * 100).toFixed(0)}%</span>
                              </div>
                              <Progress value={(7 - daysRemaining) / 7 * 100} className="h-2" />
                            </div>
                          )}

                          {stake.isActive === 1 && (
                            <Button
                              variant={canUnstake ? "default" : "outline"}
                              className="w-full font-mono"
                              disabled={!canUnstake || unstakeMutation.isPending}
                              onClick={() => handleUnstake(stake.id)}
                              data-testid={`button-unstake-${stake.id}`}
                            >
                              {canUnstake ? (
                                <>
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Unstake & Claim Rewards
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Locked for {daysRemaining} days
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={stakeDialogOpen} onOpenChange={(open) => {
        setStakeDialogOpen(open);
        if (!open) {
          setDialogStep("amount");
          setStakeAmount("");
          setTransactionSignature("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {dialogStep === "amount" ? "Choose Amount" : "Transfer VEIL Tokens"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {dialogStep === "amount" 
                ? selectedPool?.description
                : "Send VEIL tokens to the pool address to activate your stake"
              }
            </DialogDescription>
          </DialogHeader>

          {dialogStep === "amount" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Pool</span>
                  <span className="text-foreground font-bold">{selectedPool?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">APR</span>
                  <span className="text-lg font-bold text-primary">{selectedPool?.aprPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Lock Period</span>
                  <span className="text-foreground font-medium">{selectedPool?.lockPeriodDays} {selectedPool?.lockPeriodDays === 1 ? 'day' : 'days'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stake-amount" className="font-mono">Amount to Stake (VEIL)</Label>
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="font-mono text-lg"
                  data-testid="input-stake-amount"
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your tokens will be locked for {selectedPool?.lockPeriodDays} {selectedPool?.lockPeriodDays === 1 ? 'day' : 'days'}. You won't be able to unstake until the lock period ends.
                </p>
              </div>

              <Button
                className="w-full font-mono"
                onClick={handleStake}
                disabled={!stakeAmount}
                data-testid="button-next-transfer"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Next: Transfer Instructions
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Amount to Send</span>
                  <span className="text-xl font-bold text-accent">{stakeAmount} VEIL</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">Expected APR</span>
                  <span className="text-lg font-bold text-primary">{selectedPool?.aprPercentage}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-sm">Pool Deposit Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedPool?.depositWalletAddress || ""}
                    readOnly
                    className="font-mono text-xs flex-1"
                    data-testid="text-deposit-address"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedPool?.depositWalletAddress || "")}
                    data-testid="button-copy-address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send exactly <span className="font-bold text-foreground">{stakeAmount} VEIL</span> to this address
                </p>
              </div>

              {transactionSignature && (
                <div className="space-y-2 p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-mono text-sm font-bold">Transaction Submitted</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your stake will be activated automatically once the transaction is confirmed on-chain. This may take 30-60 seconds.
                  </p>
                  <a
                    href={`https://solscan.io/tx/${transactionSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View on Solscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  className="w-full font-mono"
                  onClick={handlePhantomTransfer}
                  disabled={transferPending || !!transactionSignature}
                  data-testid="button-phantom-transfer"
                >
                  {transferPending ? (
                    "Sending..."
                  ) : transactionSignature ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Awaiting Confirmation...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Send with Phantom
                    </>
                  )}
                </Button>
                
                <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                  <p className="text-xs text-muted-foreground text-center">
                    Or send VEIL tokens manually to the address above
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full font-mono"
                  onClick={() => setDialogStep("amount")}
                  disabled={transferPending || !!transactionSignature}
                  data-testid="button-back"
                >
                  Back
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">How it works:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Send VEIL tokens to the pool address</li>
                    <li>Our system detects your deposit on-chain</li>
                    <li>Your stake is created automatically (30-60s)</li>
                    <li>Start earning {selectedPool?.aprPercentage}% APR immediately</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

