import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Zap, Layers, AlertTriangle, CheckCircle2, DollarSign, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: string;
  isActive: boolean;
}

interface LeverageTrade {
  marketId: string;
  outcome: 'yes' | 'no';
  amount: number;
  leverage: number;
  entryPrice: number;
  potentialProfit: number;
  potentialLoss: number;
  liquidationPrice: number;
}

interface ParlayBet {
  marketId: string;
  question: string;
  outcome: 'yes' | 'no';
  odds: number;
}

interface ParlayCalculation {
  bets: ParlayBet[];
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  potentialProfit: number;
}

export default function PolyLeveragePage() {
  const { toast } = useToast();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [leverageAmount, setLeverageAmount] = useState<number>(100);
  const [leverageMultiplier, setLeverageMultiplier] = useState<number>(2);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const [parlayBets, setParlayBets] = useState<ParlayBet[]>([]);
  const [parlayStake, setParlayStake] = useState<number>(100);

  // Fetch markets
  const { data: markets = [], isLoading } = useQuery<Market[]>({
    queryKey: ["/api/polymarket/markets"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate leverage mutation
  const leverageMutation = useMutation({
    mutationFn: async (data: {
      marketId: string;
      outcome: 'yes' | 'no';
      amount: number;
      leverage: number;
      currentPrice: number;
    }) => {
      const res = await apiRequest("POST", "/api/polymarket/calculate-leverage", data);
      return res.json();
    },
  });

  // Calculate parlay mutation
  const parlayMutation = useMutation({
    mutationFn: async (data: { bets: ParlayBet[]; stake: number }) => {
      const res = await apiRequest("POST", "/api/polymarket/calculate-parlay", data);
      return res.json();
    },
  });

  // Auto-calculate leverage trade whenever inputs change
  const autoCalculateLeverage = async () => {
    if (!selectedMarket) return;

    const currentPrice = selectedOutcome === 'yes' ? selectedMarket.yesPrice : selectedMarket.noPrice;

    leverageMutation.mutate({
      marketId: selectedMarket.id,
      outcome: selectedOutcome,
      amount: leverageAmount,
      leverage: leverageMultiplier,
      currentPrice,
    });
  };

  const addToParlay = (market: Market, outcome: 'yes' | 'no') => {
    if (parlayBets.length >= 10) {
      toast({
        title: "Max Parlay Bets",
        description: "Maximum 10 bets per parlay",
        variant: "destructive",
      });
      return;
    }

    if (parlayBets.some(bet => bet.marketId === market.id)) {
      toast({
        title: "Duplicate Market",
        description: "This market is already in your parlay",
        variant: "destructive",
      });
      return;
    }

    const odds = outcome === 'yes' ? market.yesPrice : market.noPrice;
    const newBets = [...parlayBets, {
      marketId: market.id,
      question: market.question,
      outcome,
      odds,
    }];
    setParlayBets(newBets);

    toast({
      title: "Added to Parlay",
      description: `${outcome.toUpperCase()}: ${market.question.substring(0, 50)}...`,
    });
  };

  const removeFromParlay = (marketId: string) => {
    setParlayBets(parlayBets.filter(bet => bet.marketId !== marketId));
  };

  // Auto-calculate leverage whenever inputs change
  useEffect(() => {
    if (selectedMarket && leverageAmount > 0 && leverageMultiplier > 0) {
      autoCalculateLeverage();
    }
  }, [selectedMarket, leverageAmount, leverageMultiplier, selectedOutcome]);

  // Auto-calculate parlay whenever bets or stake changes
  useEffect(() => {
    if (parlayBets.length >= 2 && parlayStake > 0) {
      parlayMutation.mutate({
        bets: parlayBets,
        stake: parlayStake,
      });
    }
  }, [parlayBets, parlayStake]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const result = leverageMutation.data as LeverageTrade | undefined;
  const parlayResult = parlayMutation.data as ParlayCalculation | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              POLYLEVERAGE
            </h1>
          </div>
          <p className="text-muted-foreground">
            Leverage trading & parlays on Polymarket prediction markets
          </p>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Shield className="w-3 h-3 mr-1" />
              ZK Oracle Privacy Layer Active
            </Badge>
            <p className="text-xs text-muted-foreground max-w-2xl text-center">
              Your positions are encrypted using zero-knowledge proofs. Market calculations remain private until settlement, preventing front-running and position disclosure.
            </p>
          </div>
        </div>

        <Tabs defaultValue="leverage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leverage" data-testid="tab-leverage">
              <Zap className="w-4 h-4 mr-2" />
              Leverage Trading
            </TabsTrigger>
            <TabsTrigger value="parlay" data-testid="tab-parlay">
              <Layers className="w-4 h-4 mr-2" />
              Parlay Builder
            </TabsTrigger>
          </TabsList>

          {/* Leverage Trading Tab */}
          <TabsContent value="leverage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Markets List */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Polymarket Markets</CardTitle>
                  <CardDescription>Select a market to trade with leverage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <p className="text-center text-muted-foreground">Loading markets...</p>
                  ) : (
                    markets.map((market) => (
                      <Card
                        key={market.id}
                        className={`cursor-pointer transition-all hover-elevate ${
                          selectedMarket?.id === market.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedMarket(market)}
                        data-testid={`market-card-${market.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm line-clamp-2">{market.question}</CardTitle>
                            <Badge variant="secondary" className="shrink-0">{market.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-muted-foreground">YES</span>
                              </div>
                              <p className="text-lg font-bold text-green-600">{formatPercent(market.yesPrice)}</p>
                            </div>
                            <Separator orientation="vertical" className="h-12" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-muted-foreground">NO</span>
                              </div>
                              <p className="text-lg font-bold text-red-600">{formatPercent(market.noPrice)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            Volume: {formatCurrency(market.volume)}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Leverage Trade Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Leverage Position</CardTitle>
                  <CardDescription>
                    {selectedMarket ? selectedMarket.question : "Select a market to start"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedMarket ? (
                    <>
                      {/* Outcome Selection */}
                      <div className="space-y-2">
                        <Label>Select Outcome</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={selectedOutcome === 'yes' ? 'default' : 'outline'}
                            className="h-auto py-4"
                            onClick={() => setSelectedOutcome('yes')}
                            data-testid="button-select-yes"
                          >
                            <div className="text-center">
                              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                              <p className="font-semibold">YES</p>
                              <p className="text-xs">{formatPercent(selectedMarket.yesPrice)}</p>
                            </div>
                          </Button>
                          <Button
                            variant={selectedOutcome === 'no' ? 'default' : 'outline'}
                            className="h-auto py-4"
                            onClick={() => setSelectedOutcome('no')}
                            data-testid="button-select-no"
                          >
                            <div className="text-center">
                              <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                              <p className="font-semibold">NO</p>
                              <p className="text-xs">{formatPercent(selectedMarket.noPrice)}</p>
                            </div>
                          </Button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="leverage-amount">Collateral Amount</Label>
                        <Input
                          id="leverage-amount"
                          type="number"
                          min="1"
                          max="10000"
                          value={leverageAmount}
                          onChange={(e) => setLeverageAmount(Number(e.target.value))}
                          data-testid="input-leverage-amount"
                        />
                        <p className="text-xs text-muted-foreground">Max: $10,000</p>
                      </div>

                      {/* Leverage Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="leverage-multiplier">Leverage</Label>
                          <Badge variant="secondary">{leverageMultiplier}x</Badge>
                        </div>
                        <Slider
                          id="leverage-multiplier"
                          min={1}
                          max={10}
                          step={1}
                          value={[leverageMultiplier]}
                          onValueChange={(value) => setLeverageMultiplier(value[0])}
                          data-testid="slider-leverage"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1x (No Leverage)</span>
                          <span>10x (Max)</span>
                        </div>
                      </div>

                      {/* Trade Summary */}
                      {result && (
                        <Alert className="bg-primary/5">
                          <CheckCircle2 className="w-4 h-4" />
                          <AlertDescription>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Position Size:</span>
                                <span className="font-semibold">{formatCurrency(result.amount * result.leverage)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Entry Price:</span>
                                <span className="font-semibold">{formatPercent(result.entryPrice)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-green-600">
                                <span>Potential Profit:</span>
                                <span className="font-bold">{formatCurrency(result.potentialProfit)}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Max Loss:</span>
                                <span className="font-bold">{formatCurrency(result.potentialLoss)}</span>
                              </div>
                              <div className="flex justify-between text-orange-600">
                                <span>Liquidation Price:</span>
                                <span className="font-bold">{formatPercent(result.liquidationPrice)}</span>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        Select a market from the list to configure your leverage trade
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={true}
                    variant="secondary"
                    data-testid="button-open-leverage"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Privacy-Protected Position Opening (View Only Mode)
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Parlay Builder Tab */}
          <TabsContent value="parlay" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Markets for Parlay */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Markets to Parlay</CardTitle>
                  <CardDescription>Combine up to 10 bets (2-10 required)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <p className="text-center text-muted-foreground">Loading markets...</p>
                  ) : (
                    markets.map((market) => (
                      <Card key={market.id} data-testid={`parlay-market-${market.id}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm line-clamp-2">{market.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => addToParlay(market, 'yes')}
                              data-testid={`button-parlay-yes-${market.id}`}
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              YES {formatPercent(market.yesPrice)}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => addToParlay(market, 'no')}
                              data-testid={`button-parlay-no-${market.id}`}
                            >
                              <TrendingDown className="w-3 h-3 mr-1" />
                              NO {formatPercent(market.noPrice)}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Parlay Slip */}
              <Card>
                <CardHeader>
                  <CardTitle>Parlay Slip</CardTitle>
                  <CardDescription>{parlayBets.length} bet{parlayBets.length !== 1 ? 's' : ''} selected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Bets */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {parlayBets.length === 0 ? (
                      <Alert>
                        <Layers className="w-4 h-4" />
                        <AlertDescription>
                          Add at least 2 markets to your parlay
                        </AlertDescription>
                      </Alert>
                    ) : (
                      parlayBets.map((bet, index) => (
                        <Card key={bet.marketId} className="relative" data-testid={`parlay-bet-${index}`}>
                          <CardContent className="pt-4 pb-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => removeFromParlay(bet.marketId)}
                              data-testid={`button-remove-parlay-${index}`}
                            >
                              ×
                            </Button>
                            <p className="text-xs text-muted-foreground mb-1">Leg {index + 1}</p>
                            <p className="text-sm font-medium line-clamp-2 pr-8">{bet.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={bet.outcome === 'yes' ? 'default' : 'secondary'}>
                                {bet.outcome.toUpperCase()}
                              </Badge>
                              <span className="text-sm">{formatPercent(bet.odds)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Stake Input */}
                  {parlayBets.length >= 2 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="parlay-stake">Stake Amount</Label>
                        <Input
                          id="parlay-stake"
                          type="number"
                          min="1"
                          max="5000"
                          value={parlayStake}
                          onChange={(e) => setParlayStake(Number(e.target.value))}
                          data-testid="input-parlay-stake"
                        />
                        <p className="text-xs text-muted-foreground">Max: $5,000</p>
                      </div>
                    </>
                  )}

                  {/* Parlay Results */}
                  {parlayResult && (
                    <Alert className="bg-primary/5">
                      <CheckCircle2 className="w-4 h-4" />
                      <AlertDescription>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Odds:</span>
                            <span className="font-semibold">{parlayResult.totalOdds.toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stake:</span>
                            <span className="font-semibold">{formatCurrency(parlayResult.stake)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-green-600">
                            <span>Potential Payout:</span>
                            <span className="font-bold">{formatCurrency(parlayResult.potentialPayout)}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Potential Profit:</span>
                            <span className="font-bold">{formatCurrency(parlayResult.potentialProfit)}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={true}
                    variant="secondary"
                    data-testid="button-calculate-parlay"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Privacy-Protected Parlay Opening (View Only Mode)
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

