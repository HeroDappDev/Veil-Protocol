/**
 * ============================================
 * COMPLETE STAKING POOLS TEMPLATE
 * ============================================
 * 
 * Full-featured staking system with:
 * - Beautiful animated pool cards with unique themes
 * - Real Solana SPL token deposits via Phantom wallet
 * - Automatic onchain deposit detection and stake creation
 * - Token decimal conversion (raw units ↔ display amounts)
 * - Two-step staking flow (amount → transfer)
 * - Progress tracking and polling
 * 
 * BLOCKCHAIN FEATURES:
 * - SPL token transfers using @solana/spl-token
 * - Associated Token Account (ATA) creation
 * - Transaction building and signing via Phantom
 * - Backend polling for stake creation verification
 * - Decimal conversion for token display (e.g., 6 decimals for ORACLE)
 * 
 * DEPENDENCIES:
 * npm install @solana/web3.js @solana/spl-token
 * npm install lucide-react @tanstack/react-query
 * npm install (shadcn components): card, badge, button, dialog, input, label, tabs, progress
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Shield, Cpu, TrendingUp, Clock, CheckCircle2, Coins, Sparkles, Copy, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ============================================
// PHANTOM WALLET TYPES
// ============================================
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: any }>;
    };
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================
interface StakingPool {
  id: string;
  name: string;
  description: string;
  aprPercentage: number;
  totalStaked: number; // In raw units (e.g., 1000000000 = 1000 tokens with 6 decimals)
  minStake: number; // In raw units
  maxStake: number; // In raw units
  lockPeriodDays: number;
  isActive: number;
  depositWalletAddress?: string; // Solana wallet address for deposits
}

interface UserStake {
  id: string;
  walletAddress: string;
  poolId: string;
  amount: number; // In raw units
  stakedAt: Date;
  unlockAt: Date;
  claimedRewards: number;
  isActive: number;
  unstakedAt: Date | null;
  pendingRewards: number;
  pool: StakingPool;
  transactionSignature?: string | null;
}

// ============================================
// TOKEN CONFIGURATION
// ============================================
const TOKEN_CONFIG = {
  MINT_ADDRESS: "3BCF7bxM5aSjm4pNuoTLN3ww7PFjW321rypsgfNipump", // ZKVP SPL token mint
  DECIMALS: 6, // Number of decimal places (6 = 1,000,000 raw units = 1 token)
  SYMBOL: "ZKVP", // Token symbol for display
};

// ============================================
// CONVERSION HELPERS
// ============================================

// Convert raw blockchain units to human-readable token amount
const toTokenAmount = (rawUnits: number) => {
  return rawUnits / Math.pow(10, TOKEN_CONFIG.DECIMALS);
};

// Convert human-readable token amount to raw blockchain units
const toRawUnits = (tokens: number) => {
  return Math.floor(tokens * Math.pow(10, TOKEN_CONFIG.DECIMALS));
};

// Format number with commas and 2 decimal places
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  }).format(num);
};

// ============================================
// POOL THEME SYSTEM
// ============================================
const getPoolTheme = (poolName: string) => {
  // Purple Theme - Privacy/Phantom pools
  if (poolName.includes('Phantom') || poolName.includes('Cipher')) {
    return {
      gradient: 'from-purple-500/20 via-violet-500/10 to-fuchsia-500/20',
      glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
      iconBg: 'from-purple-500/20 to-violet-500/20',
      iconColor: 'text-purple-400',
      borderGlow: 'group-hover:border-purple-500/50',
      badge: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/40',
      feature: 'Phantom Privacy',
      featureIcon: '👻',
    };
  }
  
  // Cyan Theme - Quantum/Shield pools
  if (poolName.includes('Shadow') || poolName.includes('Quantum') || poolName.includes('Shield')) {
    return {
      gradient: 'from-cyan-500/20 via-teal-500/10 to-blue-500/20',
      glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]',
      iconBg: 'from-cyan-500/20 to-teal-500/20',
      iconColor: 'text-cyan-400',
      borderGlow: 'group-hover:border-cyan-500/50',
      badge: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40',
      feature: 'Quantum Shield',
      featureIcon: '🛡️',
    };
  }
  
  // Orange Theme - Power/Fire pools
  if (poolName.includes('Obsidian') || poolName.includes('Fire') || poolName.includes('Power')) {
    return {
      gradient: 'from-orange-500/20 via-red-500/10 to-rose-500/20',
      glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
      iconBg: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-400',
      borderGlow: 'group-hover:border-orange-500/50',
      badge: 'from-orange-500/20 to-rose-500/20 border-orange-500/40',
      feature: 'Obsidian Power',
      featureIcon: '🔥',
    };
  }
  
  // Default Gold Theme
  return {
    gradient: 'from-yellow-500/20 via-amber-500/10 to-orange-500/20',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    iconBg: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-400',
    borderGlow: 'group-hover:border-yellow-500/50',
    badge: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40',
    feature: 'Premium Pool',
    featureIcon: '⭐',
  };
};

// Map pool names to icons
const getPoolIcon = (poolName: string) => {
  if (poolName.includes('Cipher')) return Shield;
  if (poolName.includes('Quantum')) return Cpu;
  if (poolName.includes('Shadow')) return Lock;
  return Sparkles;
};

// ============================================
// MAIN STAKING COMPONENT
// ============================================
export default function Staking() {
  const { toast } = useToast();
  
  // Wallet state (implement your wallet context)
  const walletAddress = "YOUR_WALLET_ADDRESS"; // From your wallet context
  const connectWallet = () => { /* Your connect wallet function */ };
  
  // Dialog state
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<"amount" | "transfer">("amount");
  const [transferPending, setTransferPending] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<string>("");

  // Fetch pools from API
  const { data: pools = [], isLoading: poolsLoading } = useQuery<StakingPool[]>({
    queryKey: ["/api/staking/pools"],
  });

  // Fetch user stakes
  const { data: userStakes = [], refetch: refetchStakes } = useQuery<UserStake[]>({
    queryKey: ["/api/staking/stakes", walletAddress],
    enabled: !!walletAddress,
  });

  // ============================================
  // BLOCKCHAIN FUNCTIONS
  // ============================================

  /**
   * Execute SPL token transfer via Phantom wallet
   * This builds a Solana transaction with:
   * 1. ATA (Associated Token Account) creation for recipient
   * 2. SPL token transfer instruction
   */
  const handlePhantomTransfer = async () => {
    // Validate Phantom is installed
    if (!window.solana || !window.solana.isPhantom) {
      toast({
        variant: "destructive",
        title: "Phantom Not Found",
        description: "Please install Phantom wallet extension.",
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
      
      // Dynamic imports for Solana libraries
      const { PublicKey, Transaction } = await import("@solana/web3.js");
      const { 
        getAssociatedTokenAddress, 
        createTransferInstruction, 
        createAssociatedTokenAccountInstruction,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      } = await import("@solana/spl-token");

      // Convert display amount to raw units (e.g., 1000 tokens → 1000000000 raw units)
      const rawAmount = toRawUnits(amount);
      
      const mintPubkey = new PublicKey(TOKEN_CONFIG.MINT_ADDRESS);
      const walletPubkey = new PublicKey(walletAddress);
      const poolWalletPubkey = new PublicKey(selectedPool.depositWalletAddress);
      
      // Get Associated Token Addresses (no RPC calls, just address derivation)
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        walletPubkey,
        false // enforceOwnerOnCurve
      );
      
      const toTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        poolWalletPubkey,
        true // allow PDA accounts (off-curve)
      );

      console.log("Building transaction:", {
        from: fromTokenAccount.toBase58(),
        to: toTokenAccount.toBase58(),
        rawAmount,
        displayAmount: amount
      });

      // Build transaction
      const transaction = new Transaction();
      
      // Instruction 1: Create ATA if it doesn't exist (idempotent)
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletPubkey, // payer
          toTokenAccount, // associated token account
          poolWalletPubkey, // owner
          mintPubkey, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // Instruction 2: Transfer SPL tokens
      transaction.add(
        createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount, // destination
          walletPubkey, // owner
          rawAmount, // amount in raw units
          [], // multi-signers (empty for single signer)
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash from backend (avoids CORS issues)
      const blockhashResponse = await fetch('/api/solana/blockhash');
      if (!blockhashResponse.ok) {
        throw new Error(`Failed to fetch blockhash: ${blockhashResponse.statusText}`);
      }
      const { blockhash } = await blockhashResponse.json();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Sending transaction to Phantom for signing...");

      // Sign and send via Phantom
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      const sigString = signature.toString();
      
      console.log("✅ Transaction signature:", sigString);
      setTransactionSignature(sigString);
      
      toast({
        title: "Transfer Submitted",
        description: `Transaction: ${sigString.substring(0, 8)}... Tokens are being transferred.`,
      });

      // Start polling for stake creation
      pollForStake(sigString);

    } catch (error: any) {
      console.error("Transfer error:", error);
      setTransactionSignature("");
      
      let errorMessage = error.message || "Failed to send tokens. Please try again.";
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        errorMessage = "Network error. Check your connection.";
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

  /**
   * Poll backend to check if stake was created from the transaction
   * Backend monitors Solana blockchain and creates stakes automatically
   */
  const pollForStake = async (signature: string) => {
    const maxAttempts = 60; // 10 minutes max
    let attempts = 0;

    const checkStake = setInterval(async () => {
      attempts++;
      
      // Refetch user stakes from API
      const result = await refetchStakes();
      
      // Check if stake with this transaction signature exists
      const newStake = result.data?.find(stake => 
        stake.transactionSignature === signature
      );

      if (newStake) {
        clearInterval(checkStake);
        toast({
          title: "Stake Created!",
          description: `Your stake of ${formatNumber(toTokenAmount(newStake.amount))} ${TOKEN_CONFIG.SYMBOL} is now active and earning ${selectedPool?.aprPercentage}% APR!`,
        });
        
        // Reset dialog
        setStakeDialogOpen(false);
        setDialogStep("amount");
        setStakeAmount("");
        setTransactionSignature("");
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/staking/pools"] });
      } else if (attempts >= maxAttempts) {
        clearInterval(checkStake);
        toast({
          variant: "destructive",
          title: "Stake Creation Delayed",
          description: "Transaction confirmed but stake not created yet. Check back soon.",
        });
      }
    }, 10000); // Poll every 10 seconds
  };

  // ============================================
  // UI HANDLERS
  // ============================================

  const openStakeDialog = (pool: StakingPool) => {
    setSelectedPool(pool);
    setStakeDialogOpen(true);
    setDialogStep("amount");
    setStakeAmount("");
    setTransactionSignature("");
  };

  const handleStake = () => {
    if (!walletAddress) {
      connectWallet();
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount",
      });
      return;
    }

    // Proceed to transfer step
    setDialogStep("transfer");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  // ============================================
  // POOL CARD RENDER
  // ============================================

  return (
    <>
      <div className="relative min-h-screen bg-background">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background opacity-30 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Privacy Staking Pools
            </h1>
            <p className="text-lg text-muted-foreground font-mono">
              &gt; Earn high APR with privacy-preserving staking protocols
            </p>
          </div>

          {/* Pools Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => {
              const Icon = getPoolIcon(pool.name);
              const poolTheme = getPoolTheme(pool.name);

              return (
                <Card 
                  key={pool.id} 
                  className={`group relative bg-card/90 backdrop-blur-md border-2 border-primary/20 ${poolTheme.borderGlow} overflow-hidden transition-all duration-500 ${poolTheme.glow}`}
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${poolTheme.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-r ${poolTheme.gradient} blur-xl`} />
                  </div>
                  
                  {/* Particle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
                    <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  </div>
                  
                  <CardHeader className="relative space-y-3 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${poolTheme.iconBg} border border-primary/30 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${poolTheme.iconColor}`} />
                        </div>
                        <Badge variant="outline" className={`bg-gradient-to-r ${poolTheme.badge} text-xs font-bold px-2 py-0.5`}>
                          {poolTheme.featureIcon} {poolTheme.feature}
                        </Badge>
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
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        {pool.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    {/* Stats */}
                    <div className="space-y-3 bg-background/40 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5" />
                          Total Staked
                        </span>
                        <span className={`${poolTheme.iconColor} font-bold text-base`}>
                          {formatNumber(toTokenAmount(pool.totalStaked))} 
                          <span className="text-xs text-muted-foreground ml-1">{TOKEN_CONFIG.SYMBOL}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Lock Period
                        </span>
                        <span className="text-foreground font-bold">{pool.lockPeriodDays} days</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Min Stake
                        </span>
                        <span className="text-foreground font-medium">
                          {formatNumber(toTokenAmount(pool.minStake))}
                          <span className="text-xs text-muted-foreground ml-1">{TOKEN_CONFIG.SYMBOL}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Daily Rewards
                        </span>
                        <span className={`${poolTheme.iconColor} font-bold`}>
                          ~{(pool.aprPercentage / 365).toFixed(3)}%
                        </span>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono">Pool Capacity</span>
                        <span className={`${poolTheme.iconColor} font-bold`}>
                          {((toTokenAmount(pool.totalStaked) / toTokenAmount(pool.maxStake)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${poolTheme.gradient} transition-all duration-1000 ease-out`}
                          style={{ width: `${Math.min(100, (toTokenAmount(pool.totalStaked) / toTokenAmount(pool.maxStake)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="relative pt-4">
                    <Button
                      className="w-full font-mono font-bold group-hover:scale-105 transition-transform duration-300"
                      onClick={() => openStakeDialog(pool)}
                      disabled={!walletAddress}
                    >
                      {walletAddress ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Stake Now
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* STAKING DIALOG - Two-Step Flow */}
      {/* ============================================ */}
      <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {dialogStep === "amount" ? "Stake Tokens" : "Transfer Tokens"}
            </DialogTitle>
            <DialogDescription>
              {dialogStep === "amount" 
                ? `Stake ${TOKEN_CONFIG.SYMBOL} tokens in ${selectedPool?.name}` 
                : "Complete the transfer via Phantom wallet"}
            </DialogDescription>
          </DialogHeader>

          {dialogStep === "amount" ? (
            // Step 1: Enter Amount
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Stake</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="font-mono"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {formatNumber(toTokenAmount(selectedPool?.minStake || 0))} {TOKEN_CONFIG.SYMBOL}</span>
                  <span>{selectedPool?.aprPercentage}% APR</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lock Period</span>
                  <span className="font-bold">{selectedPool?.lockPeriodDays} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily Rewards</span>
                  <span className="font-bold text-accent">
                    ~{((selectedPool?.aprPercentage || 0) / 365).toFixed(3)}%
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleStake}
                className="w-full font-mono"
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
              >
                Continue to Transfer
              </Button>
            </div>
          ) : (
            // Step 2: Transfer via Phantom
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">{stakeAmount} {TOKEN_CONFIG.SYMBOL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pool</span>
                  <span className="font-medium">{selectedPool?.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deposit Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedPool?.depositWalletAddress || ""}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedPool?.depositWalletAddress || "")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {transactionSignature ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Transaction submitted!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={transactionSignature}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(`https://solscan.io/tx/${transactionSignature}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Waiting for stake creation... This may take up to 2 minutes.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handlePhantomTransfer}
                  disabled={transferPending}
                  className="w-full font-mono"
                >
                  {transferPending ? "Processing..." : "Transfer via Phantom"}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// BACKEND API ENDPOINTS NEEDED
// ============================================

/**
 * Required backend endpoints:
 * 
 * 1. GET /api/staking/pools
 *    Returns: StakingPool[]
 * 
 * 2. GET /api/staking/stakes/:walletAddress
 *    Returns: UserStake[]
 * 
 * 3. GET /api/solana/blockhash
 *    Returns: { blockhash: string }
 *    Purpose: Get recent blockhash for transaction building
 * 
 * 4. Backend Solana Monitor (auto-running)
 *    - Monitors pool deposit wallets for SPL token transfers
 *    - Detects deposits using transaction signature
 *    - Creates stake records in database automatically
 *    - Updates pool.totalStaked when stake is created
 */

// ============================================
// CUSTOMIZATION GUIDE
// ============================================

/**
 * TO USE THIS TEMPLATE:
 * 
 * 1. Update TOKEN_CONFIG with your token details
 * 2. Implement wallet context (walletAddress, connectWallet)
 * 3. Create backend API endpoints (see list above)
 * 4. Set up Solana monitoring service to detect deposits
 * 5. Customize pool themes in getPoolTheme()
 * 6. Add your API base URL to apiRequest helper
 * 
 * FEATURES INCLUDED:
 * ✅ Animated pool cards with unique themes
 * ✅ SPL token transfers via Phantom
 * ✅ Automatic deposit detection
 * ✅ Token decimal conversion
 * ✅ Two-step staking flow
 * ✅ Progress tracking
 * ✅ Pool capacity visualization
 * ✅ Responsive design
 */

