import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Bell, CheckCircle2, Code, Play, Plus, Zap, TrendingUp, AlertTriangle, Clock, Lock, Database } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventMonitor {
  id: string;
  name: string;
  description: string;
  eventType: "price" | "weather" | "sports" | "news" | "custom";
  condition: string;
  status: "active" | "triggered" | "paused";
  triggerCount: number;
  lastTriggered?: Date;
  aiVerification: {
    required: boolean;
    consensusThreshold: number;
    models: string[];
  };
  zkProofVerified: boolean;
  webhookUrl?: string;
  createdBy: string;
  createdAt: Date;
}

interface EventLog {
  id: string;
  monitorId: string;
  timestamp: Date;
  eventData: any;
  aiConsensus: {
    verified: boolean;
    confidence: number;
    modelResults: Array<{
      model: string;
      result: boolean;
      confidence: number;
    }>;
  };
  zkProofHash: string;
  actionsTaken: string[];
}

export default function SmartEvents() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<EventMonitor | null>(null);

  // Mock data - will be replaced with real API
  const mockMonitors: EventMonitor[] = [
    {
      id: "1",
      name: "BTC Price Alert $100k",
      description: "Trigger when Bitcoin reaches $100,000 on any major exchange",
      eventType: "price",
      condition: "BTC/USD >= 100000",
      status: "active",
      triggerCount: 0,
      aiVerification: {
        required: true,
        consensusThreshold: 75,
        models: ["GPT-4o", "Claude Sonnet 4.5", "Gemini 2.5 Flash"],
      },
      zkProofVerified: true,
      webhookUrl: "https://api.example.com/webhook",
      createdBy: "9xK...mP4",
      createdAt: new Date("2024-12-01"),
    },
    {
      id: "2",
      name: "ETH Gas Price Monitor",
      description: "Alert when Ethereum gas prices drop below 20 gwei",
      eventType: "price",
      condition: "ETH_GAS < 20",
      status: "active",
      triggerCount: 12,
      lastTriggered: new Date("2024-12-10"),
      aiVerification: {
        required: true,
        consensusThreshold: 66,
        models: ["GPT-4o", "Gemini 2.5 Flash"],
      },
      zkProofVerified: true,
      createdBy: "7hN...qR2",
      createdAt: new Date("2024-11-15"),
    },
    {
      id: "3",
      name: "SOL Network Congestion",
      description: "Monitor Solana TPS and trigger when it drops below 2000",
      eventType: "custom",
      condition: "SOL_TPS < 2000",
      status: "active",
      triggerCount: 3,
      lastTriggered: new Date("2024-12-08"),
      aiVerification: {
        required: true,
        consensusThreshold: 75,
        models: ["GPT-4o", "Claude Sonnet 4.5"],
      },
      zkProofVerified: true,
      createdBy: "3mK...xT9",
      createdAt: new Date("2024-11-20"),
    },
  ];

  const mockEventLogs: EventLog[] = [
    {
      id: "1",
      monitorId: "2",
      timestamp: new Date("2024-12-10T14:30:00"),
      eventData: {
        gasPrice: 18.5,
        source: "Etherscan",
      },
      aiConsensus: {
        verified: true,
        confidence: 94,
        modelResults: [
          { model: "GPT-4o", result: true, confidence: 96 },
          { model: "Gemini 2.5 Flash", result: true, confidence: 92 },
        ],
      },
      zkProofHash: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
      actionsTaken: ["Webhook triggered", "On-chain event logged"],
    },
    {
      id: "2",
      monitorId: "3",
      timestamp: new Date("2024-12-08T09:15:00"),
      eventData: {
        tps: 1847,
        blockHeight: 234567890,
      },
      aiConsensus: {
        verified: true,
        confidence: 88,
        modelResults: [
          { model: "GPT-4o", result: true, confidence: 91 },
          { model: "Claude Sonnet 4.5", result: true, confidence: 85 },
        ],
      },
      zkProofHash: "0x3c2c2eb7b11a91385fade1c0d57a7af66ab4ead7f9fade1c0d57a7af66ab4ead7",
      actionsTaken: ["Alert sent", "Data archived"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-[#14F195]";
      case "triggered": return "text-[#9945FF]";
      case "paused": return "text-yellow-500";
      default: return "text-muted-foreground";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "price": return <TrendingUp className="w-4 h-4" />;
      case "custom": return <Code className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
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
            Smart Contract Event Monitoring
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-description">
            Real-world event monitoring with multi-AI verification and ZK proofs
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-monitor">
              <Plus className="w-4 h-4" />
              Create Monitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Event Monitor</DialogTitle>
              <DialogDescription>
                Set up automated monitoring with AI verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="monitor-name">Monitor Name</Label>
                <Input
                  id="monitor-name"
                  placeholder="My Event Monitor"
                  data-testid="input-monitor-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-description">Description</Label>
                <Textarea
                  id="monitor-description"
                  placeholder="Describe what this monitor tracks..."
                  className="min-h-[80px]"
                  data-testid="input-monitor-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select>
                    <SelectTrigger id="event-type" data-testid="select-event-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price/Market Data</SelectItem>
                      <SelectItem value="weather">Weather</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="news">News/Events</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consensus">AI Consensus Threshold</Label>
                  <Select>
                    <SelectTrigger id="consensus" data-testid="select-consensus">
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50% (Majority)</SelectItem>
                      <SelectItem value="66">66% (Supermajority)</SelectItem>
                      <SelectItem value="75">75% (High Confidence)</SelectItem>
                      <SelectItem value="100">100% (Unanimous)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Trigger Condition</Label>
                <Input
                  id="condition"
                  placeholder="e.g., BTC/USD >= 100000"
                  data-testid="input-condition"
                />
                <p className="text-xs text-muted-foreground">
                  Define the condition that will trigger this event
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL (Optional)</Label>
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://your-api.com/webhook"
                  data-testid="input-webhook"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" data-testid="button-submit-monitor">
                  Create Monitor (50 Credits)
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
        <Card className="border-[#9945FF]/20" data-testid="card-active-monitors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Monitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#14F195]">3</div>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-total-triggers">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9945FF]">15</div>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-ai-verified">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#14F195]" />
              <span className="text-2xl font-bold">100%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9945FF]/20" data-testid="card-avg-confidence">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="monitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitors" data-testid="tab-monitors">Event Monitors</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-event-logs">Event Logs</TabsTrigger>
          <TabsTrigger value="my-monitors" data-testid="tab-my-monitors">My Monitors</TabsTrigger>
        </TabsList>

        <TabsContent value="monitors" className="space-y-4">
          {mockMonitors.map((monitor) => (
            <Card key={monitor.id} className="border-[#9945FF]/20 hover-elevate" data-testid={`card-monitor-${monitor.id}`}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <CardTitle className="text-lg" data-testid={`text-monitor-name-${monitor.id}`}>
                        {monitor.name}
                      </CardTitle>
                      {monitor.zkProofVerified && (
                        <Lock className="w-4 h-4 text-[#9945FF] mt-1 flex-shrink-0" data-testid={`icon-zk-verified-${monitor.id}`} />
                      )}
                    </div>
                    <CardDescription data-testid={`text-monitor-description-${monitor.id}`}>
                      {monitor.description}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline" className="gap-1" data-testid={`badge-event-type-${monitor.id}`}>
                        {getEventTypeIcon(monitor.eventType)}
                        {monitor.eventType}
                      </Badge>
                      <Badge className={`gap-1 ${getStatusColor(monitor.status)}`} data-testid={`badge-status-${monitor.id}`}>
                        <Activity className="w-3 h-3" />
                        {monitor.status}
                      </Badge>
                      <Badge variant="outline" className="gap-1" data-testid={`badge-triggers-${monitor.id}`}>
                        <Zap className="w-3 h-3" />
                        {monitor.triggerCount} Triggers
                      </Badge>
                      {monitor.lastTriggered && (
                        <Badge variant="outline" className="gap-1" data-testid={`badge-last-triggered-${monitor.id}`}>
                          <Clock className="w-3 h-3" />
                          Last: {new Date(monitor.lastTriggered).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Condition Display */}
                <div className="p-3 rounded-lg bg-muted font-mono text-sm" data-testid={`text-condition-${monitor.id}`}>
                  {monitor.condition}
                </div>

                {/* AI Verification Settings */}
                <div className="p-4 rounded-lg border border-[#9945FF]/20 bg-card/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Verification</span>
                    <Badge variant="secondary" data-testid={`badge-threshold-${monitor.id}`}>
                      {monitor.aiVerification.consensusThreshold}% Consensus Required
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {monitor.aiVerification.models.map((model) => (
                      <Badge key={model} variant="outline" className="text-xs" data-testid={`badge-model-${monitor.id}-${model}`}>
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="gap-1" data-testid={`button-test-${monitor.id}`}>
                    <Play className="w-3 h-3" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-pause-${monitor.id}`}>
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-edit-${monitor.id}`}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {mockEventLogs.map((log) => (
            <Card key={log.id} className="border-[#9945FF]/20" data-testid={`card-log-${log.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base" data-testid={`text-log-monitor-${log.id}`}>
                      Monitor: {mockMonitors.find(m => m.id === log.monitorId)?.name}
                    </CardTitle>
                    <CardDescription data-testid={`text-log-timestamp-${log.id}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-[#14F195] text-black" data-testid={`badge-verified-${log.id}`}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted space-y-1">
                    <div className="text-xs text-muted-foreground">Event Data</div>
                    <pre className="text-xs font-mono" data-testid={`text-event-data-${log.id}`}>
                      {JSON.stringify(log.eventData, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="text-xs text-muted-foreground">AI Consensus</div>
                    <div className="space-y-1">
                      {log.aiConsensus.modelResults.map((result) => (
                        <div key={result.model} className="flex justify-between text-xs" data-testid={`model-result-${log.id}-${result.model}`}>
                          <span className="text-[#9945FF]">{result.model}</span>
                          <span>{result.result ? '✓' : '✗'} {result.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">ZK Proof Hash</div>
                  <div className="font-mono text-xs break-all text-[#14F195]" data-testid={`text-proof-hash-${log.id}`}>
                    {log.zkProofHash}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {log.actionsTaken.map((action, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs" data-testid={`badge-action-${log.id}-${idx}`}>
                      {action}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="my-monitors" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-my-monitors">
            {walletAddress ? "You haven't created any monitors yet" : "Connect your wallet to see your monitors"}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

