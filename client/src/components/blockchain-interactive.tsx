import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWallet } from "@/context/wallet-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  Send, 
  CheckCircle, 
  Clock, 
  Copy, 
  ExternalLink,
  TrendingUp,
  Shield,
  Terminal,
  Star,
  Award,
  DollarSign,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
import type { OracleRegistry, BlockchainTransaction } from "@shared/schema";

export function BlockchainInteractive() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConnected = !!walletAddress;
  const QUERY_FEE = 100; // Fixed credit fee per query

  // Fetch oracle registry
  const { data: oracleNodes = [], isLoading: loadingRegistry } = useQuery<OracleRegistry[]>({
    queryKey: ["/api/blockchain/registry"],
    enabled: true,
  });

  // Fetch transactions for connected wallet
  const { data: transactions = [], isLoading: loadingTxs } = useQuery<BlockchainTransaction[]>({
    queryKey: ["/api/blockchain/transactions", walletAddress],
    enabled: isConnected && !!walletAddress,
  });

  // Fetch balance
  const { data: balanceData } = useQuery<{
    balance: number;
    totalSpent: number;
    totalEarned: number;
    transactionCount: number;
  }>({
    queryKey: ["/api/blockchain/balance", walletAddress],
    enabled: isConnected && !!walletAddress,
  });

  // Submit transaction mutation
  const submitTransaction = useMutation({
    mutationFn: async (data: { type: string; amount: number }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      
      // Simulate transaction signature from Phantom wallet
      const signature = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const res = await apiRequest(
        "POST",
        "/api/blockchain/transaction",
        {
          walletAddress,
          transactionType: data.type,
          signature,
          amount: data.amount,
          metadata: {
            timestamp: new Date().toISOString(),
            network: "mainnet",
          }
        }
      );
      
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blockchain/transactions", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/blockchain/balance", walletAddress] });
      
      toast({
        title: "✓ Transaction Submitted",
        description: `Terminal command: ${data.terminalCommand}`,
        duration: 4000,
      });

      copyToClipboard(data.terminalCommand);
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Terminal command copied to clipboard",
      duration: 2000,
    });
  };

  const handleSubmitQuery = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Phantom wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTransaction.mutateAsync({
        type: "query_submission",
        amount: QUERY_FEE,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Card */}
      {isConnected && balanceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-primary" />
                  <CardTitle>Credit Balance</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1" data-testid="badge-network">
                  <Shield className="h-3 w-3" />
                  Mainnet Privacy Network
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-balance">
                    {balanceData.balance.toLocaleString()} credits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-lg font-semibold" data-testid="text-spent">
                    {balanceData.totalSpent.toLocaleString()} credits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                  <p className="text-lg font-semibold text-green-500" data-testid="text-earned">
                    {balanceData.totalEarned.toLocaleString()} credits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                  <p className="text-lg font-semibold" data-testid="text-tx-count">
                    {balanceData.transactionCount}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => copyToClipboard("blockchain balance")}
                data-testid="button-view-terminal"
              >
                <Terminal className="h-4 w-4" />
                View in Terminal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transaction Signing Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-primary" />
              <CardTitle>Submit Query Transaction</CardTitle>
            </div>
            <CardDescription>
              Submit an oracle query on the privacy network (100 credits per query)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-4 border border-primary/30 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Query Fee:</span>
                  <span className="text-2xl font-bold text-primary">100 credits</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard fee for privacy-preserving oracle queries on mainnet
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmitQuery}
              disabled={!isConnected || isSubmitting}
              className="w-full gap-2 min-h-11"
              data-testid="button-submit-query"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : isConnected ? "Submit Query (100 credits)" : "Connect Wallet First"}
            </Button>

            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your Phantom wallet to submit blockchain transactions
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Oracle Node Registry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>On-Chain Oracle Registry</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 min-h-11"
                onClick={() => copyToClipboard("blockchain registry")}
                data-testid="button-view-registry-terminal"
              >
                <Terminal className="h-4 w-4" />
                Terminal View
              </Button>
            </div>
            <CardDescription>
              Verified oracle nodes with reputation and stake
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRegistry ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading oracle registry...
              </div>
            ) : oracleNodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No oracle nodes registered
              </div>
            ) : (
              <div className="space-y-3">
                {oracleNodes.map((node) => {
                  const successRate = node.totalQueries > 0 
                    ? Math.round((node.successfulQueries / node.totalQueries) * 100)
                    : 100;
                  const reputation = Math.min(5, Math.floor(node.reputation / 200));

                  return (
                    <div
                      key={node.id}
                      className="border border-border/40 rounded-lg p-4 hover-elevate transition-all"
                      data-testid={`card-oracle-node-${node.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold" data-testid={`text-node-name-${node.id}`}>
                              {node.nodeName}
                            </h4>
                            <div className="flex gap-0.5" data-testid={`stars-reputation-${node.id}`}>
                              {[...Array(reputation)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-node-address-${node.id}`}>
                            {node.nodeAddress}
                          </p>
                        </div>
                        <Badge 
                          variant={node.status === "active" ? "default" : "secondary"}
                          data-testid={`badge-node-status-${node.id}`}
                        >
                          {node.status === "active" ? "✓ Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Region</p>
                          <p className="font-medium" data-testid={`text-node-region-${node.id}`}>
                            {node.region}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Stake</p>
                          <p className="font-medium text-primary" data-testid={`text-node-stake-${node.id}`}>
                            {node.stake.toLocaleString()} credits
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Success Rate</p>
                          <p className="font-medium text-green-500" data-testid={`text-node-success-rate-${node.id}`}>
                            {successRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Rewards</p>
                          <p className="font-medium" data-testid={`text-node-rewards-${node.id}`}>
                            {node.totalRewards.toLocaleString()} credits
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction History */}
      {isConnected && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Transaction History</CardTitle>
              </div>
              <CardDescription>
                Your recent blockchain transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover-elevate"
                    data-testid={`row-transaction-${tx.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {tx.status === "confirmed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium" data-testid={`text-tx-type-${tx.id}`}>
                          {tx.transactionType.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-tx-time-${tx.id}`}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-tx-amount-${tx.id}`}>
                          {tx.amount.toLocaleString()} credits
                        </p>
                        <Badge variant="outline" className="text-xs" data-testid={`badge-tx-status-${tx.id}`}>
                          {tx.status}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(tx.terminalCommand)}
                        data-testid={`button-copy-tx-${tx.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

