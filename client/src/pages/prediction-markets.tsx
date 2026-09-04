import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Zap, Target, Brain, Lock } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PredictionMarket {
  id: string;
  question: string;
  description: string;
  category: string;
  resolutionDate: Date;
  status: "active" | "resolved" | "disputed";
  yesVotes: number;
  noVotes: number;
  totalStaked: number;
  aiConsensus: {
    prediction: "yes" | "no" | "uncertain";
    confidence: number;
    models: Array<{
      model: string;
      prediction: "yes" | "no" | "uncertain";
      confidence: number;
    }>;
  };
  zkProofVerified: boolean;
  createdBy: string;
  resolution?: "yes" | "no" | null;
}

export default function PredictionMarkets() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mock data - will be replaced with real API
  const mockMarkets: PredictionMarket[] = [
    {
      id: "1",
      question: "Will Bitcoin reach $100,000 by December 31, 2025?",
      description: "This market resolves YES if BTC/USD reaches or exceeds $100,000 on any major exchange before the resolution date.",
      category: "Cryptocurrency",
      resolutionDate: new Date("2025-12-31"),
      status: "active",
      yesVotes: 1250,
      noVotes: 890,
      totalStaked: 21400,
      aiConsensus: {
        prediction: "yes",
        confidence: 68,
        models: [
          { model: "GPT-4o", prediction: "yes", confidence: 72 },
          { model: "Claude Sonnet 4.5", prediction: "yes", confidence: 65 },
          { model: "Gemini 2.5 Flash", prediction: "no", confidence: 58 },
        ],
      },
      zkProofVerified: true,
      createdBy: "9xK...mP4",
    },
    {
      id: "2",
      question: "Will Ethereum complete the Pectra upgrade before Q2 2025?",
      description: "Market resolves YES if the Ethereum Pectra upgrade is successfully deployed to mainnet before April 1, 2025.",
      category: "Blockchain",
      resolutionDate: new Date("2025-04-01"),
      status: "active",
      yesVotes: 560,
      noVotes: 1120,
      totalStaked: 16800,
      aiConsensus: {
        prediction: "no",
        confidence: 61,
        models: [
          { model: "GPT-4o", prediction: "no", confidence: 63 },
          { model: "Claude Sonnet 4.5", prediction: "no", confidence: 67 },
          { model: "Gemini 2.5 Flash", prediction: "no", confidence: 54 },
        ],
      },
      zkProofVerified: true,
      createdBy: "7hN...qR2",
    },
    {
      id: "3",
      question: "Will SOL outperform ETH in 2025?",
      description: "Resolves YES if Solana (SOL) has a higher percentage gain than Ethereum (ETH) from Jan 1 to Dec 31, 2025.",
      category: "Cryptocurrency",
      resolutionDate: new Date("2025-12-31"),
      status: "active",
      yesVotes: 2100,
      noVotes: 780,
      totalStaked: 28800,
      aiConsensus: {
        prediction: "yes",
        confidence: 55,
        models: [
          { model: "GPT-4o", prediction: "yes", confidence: 58 },
          { model: "Claude Sonnet 4.5", prediction: "uncertain", confidence: 51 },
          { model: "Gemini 2.5 Flash", prediction: "yes", confidence: 62 },
        ],
      },
      zkProofVerified: true,
      createdBy: "3mK...xT9",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-[#14F195]";
      case "resolved": return "text-[#9945FF]";
      case "disputed": return "text-yellow-500";
      default: return "text-muted-foreground";
    }
  };

  const getConsensusIcon = (prediction: string) => {
    switch (prediction) {
      case "yes": return <TrendingUp className="w-4 h-4 text-[#14F195]" />;
      case "no": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent" data-testid="text-page-title">
            Prediction Market Oracle
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-description">
            AI-powered prediction markets with zero-knowledge proof verification
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-market">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Prediction Market</DialogTitle>
              <DialogDescription>
                Create a new prediction market with AI-verified resolution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="question">Market Question</Label>
                <Input
                  id="question"
                  placeholder="Will [event] happen by [date]?"
                  data-testid="input-market-question"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description & Resolution Criteria</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of how this market will be resolved..."
                  className="min-h-[100px]"
                  data-testid="input-market-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="politics">Politics</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolution-date">Resolution Date</Label>
                  <Input
                    id="resolution-date"
                    type="date"
                    data-testid="input-resolution-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stake">Initial Stake (Credits)</Label>
                <Input
                  id="stake"
                  type="number"
                  placeholder="100"
                  data-testid="input-initial-stake"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" data-testid="button-submit-market">
                  Create Market (100 Credits)
                </Button>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-create">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#9945FF]/20" data-testid="card-active-markets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#14F195]">3</div>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-total-staked">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9945FF]">67,000</div>
            <p className="text-xs text-muted-foreground">Credits</p>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-ai-consensus">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">61.3%</div>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-zk-verified">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ZK Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#14F195]" />
              <span className="text-2xl font-bold">100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-markets">Active Markets</TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved-markets">Resolved</TabsTrigger>
          <TabsTrigger value="my-markets" data-testid="tab-my-markets">My Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {mockMarkets.map((market) => (
            <Card key={market.id} className="border-[#9945FF]/20 hover-elevate" data-testid={`card-market-${market.id}`}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <CardTitle className="text-lg" data-testid={`text-market-question-${market.id}`}>
                        {market.question}
                      </CardTitle>
                      {market.zkProofVerified && (
                        <Lock className="w-4 h-4 text-[#9945FF] mt-1 flex-shrink-0" data-testid={`icon-zk-verified-${market.id}`} />
                      )}
                    </div>
                    <CardDescription data-testid={`text-market-description-${market.id}`}>
                      {market.description}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline" className="gap-1" data-testid={`badge-category-${market.id}`}>
                        <Target className="w-3 h-3" />
                        {market.category}
                      </Badge>
                      <Badge variant="outline" className="gap-1" data-testid={`badge-resolution-${market.id}`}>
                        <Clock className="w-3 h-3" />
                        Resolves: {new Date(market.resolutionDate).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="gap-1" data-testid={`badge-staked-${market.id}`}>
                        <Zap className="w-3 h-3" />
                        {market.totalStaked.toLocaleString()} Credits Staked
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voting Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#14F195]" data-testid={`text-yes-votes-${market.id}`}>
                      YES: {market.yesVotes} ({Math.round((market.yesVotes / (market.yesVotes + market.noVotes)) * 100)}%)
                    </span>
                    <span className="text-red-500" data-testid={`text-no-votes-${market.id}`}>
                      NO: {market.noVotes} ({Math.round((market.noVotes / (market.yesVotes + market.noVotes)) * 100)}%)
                    </span>
                  </div>
                  <Progress 
                    value={(market.yesVotes / (market.yesVotes + market.noVotes)) * 100}
                    className="h-2"
                    data-testid={`progress-votes-${market.id}`}
                  />
                </div>

                {/* AI Consensus */}
                <div className="p-4 rounded-lg border border-[#9945FF]/20 bg-card/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[#9945FF]" />
                      <span className="text-sm font-medium">AI Consensus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConsensusIcon(market.aiConsensus.prediction)}
                      <span className="text-sm font-bold uppercase" data-testid={`text-consensus-${market.id}`}>
                        {market.aiConsensus.prediction}
                      </span>
                      <Badge variant="secondary" data-testid={`badge-confidence-${market.id}`}>
                        {market.aiConsensus.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {market.aiConsensus.models.map((model) => (
                      <div key={model.model} className="text-xs p-2 rounded bg-background/50 border border-border" data-testid={`model-prediction-${market.id}-${model.model}`}>
                        <div className="font-medium text-[#9945FF]">{model.model}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {model.prediction === "yes" ? (
                            <TrendingUp className="w-3 h-3 text-[#14F195]" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className="uppercase">{model.prediction}</span>
                          <span className="text-muted-foreground">({model.confidence}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 bg-[#14F195] text-black hover:bg-[#14F195]/90" data-testid={`button-vote-yes-${market.id}`}>
                    Vote YES
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid={`button-vote-no-${market.id}`}>
                    Vote NO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-resolved">
            No resolved markets yet
          </div>
        </TabsContent>

        <TabsContent value="my-markets" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-my-markets">
            {walletAddress ? "You haven't created or voted in any markets yet" : "Connect your wallet to see your markets"}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

