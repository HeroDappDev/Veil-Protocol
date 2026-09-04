import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWallet } from "@/context/wallet-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sparkles, Gift, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import type { CreditBalance } from "@shared/schema";

export function CreditFaucet() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);
  
  const isConnected = !!walletAddress;
  
  // Fetch credit balance
  const { data: creditData, isLoading } = useQuery<CreditBalance>({
    queryKey: ["/api/credits", walletAddress],
    enabled: isConnected && !!walletAddress,
  });
  
  const currentBalance = creditData?.balance || 0;
  const totalClaimed = creditData?.totalClaimed || 0;
  const maxBalance = 2000;
  const progressPercent = (currentBalance / maxBalance) * 100;
  
  // Claim faucet mutation
  const claimFaucet = useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Wallet not connected");
      
      const res = await apiRequest(
        "POST",
        "/api/credits/faucet",
        { walletAddress }
      );
      
      return res.json();
    },
    onSuccess: (data: any) => {
      // Invalidate both credit endpoints for live updates across all pages
      queryClient.invalidateQueries({ queryKey: ["/api/credits", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/blockchain/balance", walletAddress] });
      
      toast({
        title: "✨ Credits Claimed!",
        description: `+100 credits added. New balance: ${data.balance}`,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorData = error.message ? JSON.parse(error.message) : {};
      
      toast({
        title: errorData.maxReached ? "Maximum Reached" : "Claim Failed",
        description: errorData.error || error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });
  
  const handleClaimCredits = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim credits",
        variant: "destructive",
      });
      return;
    }
    
    setIsClaiming(true);
    try {
      await claimFaucet.mutateAsync();
    } finally {
      setIsClaiming(false);
    }
  };
  
  const isMaxed = currentBalance >= maxBalance;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card className="border-accent/30 bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-lg animate-pulse" />
                <Gift className="h-6 w-6 text-accent relative" />
              </div>
              <div>
                <CardTitle className="text-xl">Credit Faucet</CardTitle>
                <CardDescription>Claim free credits for oracle queries</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative">
          {/* Credit Balance Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current Balance</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-accent font-mono" data-testid="text-credit-balance">
                  {isConnected ? (isLoading ? "..." : currentBalance.toLocaleString()) : "0"}
                </span>
                <span className="text-sm text-muted-foreground ml-2">credits</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <Progress 
                value={progressPercent} 
                className="h-2"
                data-testid="progress-credits"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentBalance} / {maxBalance} credits</span>
                <span>{progressPercent.toFixed(1)}% filled</span>
              </div>
            </div>
          </div>
          
          {/* Claim Button */}
          <div className="space-y-3">
            <Button
              onClick={handleClaimCredits}
              disabled={!isConnected || isClaiming || isMaxed}
              className="w-full gap-2 relative overflow-hidden min-h-11"
              size="lg"
              data-testid="button-claim-credits"
            >
              {!isConnected ? (
                <>
                  <Gift className="h-4 w-4" />
                  Connect Wallet to Claim
                </>
              ) : isMaxed ? (
                <>
                  <Award className="h-4 w-4" />
                  Maximum Credits Reached
                </>
              ) : isClaiming ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Claim 100 Free Credits
                </>
              )}
            </Button>
            
            {isConnected && !isMaxed && (
              <p className="text-xs text-center text-muted-foreground">
                Click to receive 100 credits. Max {maxBalance} per wallet.
              </p>
            )}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-muted-foreground">Total Claimed</span>
              </div>
              <p className="text-lg font-semibold font-mono" data-testid="text-total-claimed">
                {isConnected ? (isLoading ? "..." : totalClaimed.toLocaleString()) : "0"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-muted-foreground">Per Click</span>
              </div>
              <p className="text-lg font-semibold font-mono">100</p>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">How it works</p>
                <p className="text-xs text-muted-foreground">
                  Each wallet can claim up to {maxBalance} credits in 100-credit increments. Use them to submit AI oracle queries on the network.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

