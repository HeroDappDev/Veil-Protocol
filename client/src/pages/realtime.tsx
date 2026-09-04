import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { 
  Radio, Activity, Wifi, Bell, Zap, Shield, Network, 
  Terminal, CheckCircle2, Clock, TrendingUp, Users, Database 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkEvent {
  type: "query_submitted" | "query_processing" | "proof_generated" | "query_completed" | 
        "terminal_command" | "network_stats" | "node_activity" | "privacy_operation";
  timestamp: number;
  data: any;
  walletAddress?: string;
}

interface NetworkStats {
  activeQueries: number;
  totalProofs: number;
  networkLoad: number;
  avgLatency: number;
  activeNodes: number;
  connectedClients: number;
}

export default function RealtimePage() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    activeQueries: 0,
    totalProofs: 0,
    networkLoad: 0,
    avgLatency: 0,
    activeNodes: 5,
    connectedClients: 0
  });
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // WebSocket connection management
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected to real-time feed");
        setIsConnected(true);
        
        // Authenticate with wallet if available
        if (walletAddress) {
          ws.send(JSON.stringify({
            type: "authenticate",
            walletAddress
          }));
        }

        toast({
          title: "Real-Time Feed Connected",
          description: "You're now receiving live network updates",
          duration: 2000,
        });
      };

      ws.onmessage = (event) => {
        try {
          const networkEvent: NetworkEvent = JSON.parse(event.data);
          
          // Update network stats
          if (networkEvent.type === "network_stats" && networkEvent.data) {
            if (networkEvent.data.activeQueries !== undefined) {
              setNetworkStats(prev => ({
                ...prev,
                ...networkEvent.data
              }));
            }
          }

          // Add to event feed
          setEvents(prev => [networkEvent, ...prev].slice(0, 50));
        } catch (error) {
          console.error("[WebSocket] Message parse error:", error);
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected from real-time feed");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Connection error:", error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [walletAddress, toast]);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "terminal_command":
        return <Terminal className="h-4 w-4 text-accent" />;
      case "query_submitted":
      case "query_processing":
        return <Activity className="h-4 w-4 text-primary" />;
      case "proof_generated":
      case "query_completed":
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case "privacy_operation":
        return <Shield className="h-4 w-4 text-primary" />;
      case "node_activity":
        return <Network className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "terminal_command":
      case "query_completed":
        return "border-accent/30 bg-accent/5";
      case "privacy_operation":
      case "query_processing":
        return "border-primary/30 bg-primary/5";
      default:
        return "border-border bg-card";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 scan-lines opacity-10 pointer-events-none" />
      
      <div className="relative">
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 md:px-6">
          
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-primary/30">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-accent opacity-70">&gt;&gt;&gt;</span>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    <span className="mx-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      REAL-TIME FEED
                    </span>
                  </h1>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-sm text-muted-foreground">
                    &gt; Live WebSocket connection for instant network updates
                  </p>
                  <p className="font-mono text-xs text-muted-foreground opacity-70">
                    ⚠️ Demo mode: All events are publicly broadcast for educational purposes
                  </p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="font-mono text-xs text-muted-foreground">
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
            </div>
          </div>

          {/* Network Statistics Grid */}
          <div className="mb-6 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="terminal-card border-primary/30 relative overflow-hidden" data-testid="card-stat-queries">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    <Activity className="h-3 w-3 text-primary" />
                    Active Queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {networkStats.activeQueries}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="terminal-card border-accent/30 relative overflow-hidden" data-testid="card-stat-proofs">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Total Proofs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-accent">
                    {networkStats.totalProofs.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="terminal-card border-primary/30 relative overflow-hidden" data-testid="card-stat-load">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    Network Load
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {networkStats.networkLoad}%
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="terminal-card border-accent/30 relative overflow-hidden" data-testid="card-stat-latency">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    <Zap className="h-3 w-3 text-accent" />
                    Avg Latency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-accent">
                    {networkStats.avgLatency}ms
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            
            {/* Live Activity Feed */}
            <div className="min-w-0 lg:col-span-2">
              <Card className="terminal-card min-w-0 max-w-full border-accent/30" data-testid="card-activity-feed">
                <CardHeader>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Radio className="h-5 w-5 text-accent" />
                      <span className="terminal-header break-words">LIVE_ACTIVITY_FEED</span>
                    </div>
                    <Badge variant="outline" className="max-w-full shrink-0 border-accent/30 font-mono text-xs">
                      {events.length} events
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    &gt; Real-time network events and terminal commands
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                    <AnimatePresence mode="popLayout">
                      {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center">
                          <Radio className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                          <p className="font-mono text-sm text-muted-foreground">
                            Waiting for network events...
                          </p>
                          <p className="font-mono text-xs text-muted-foreground mt-2">
                            {isConnected ? 'Connected and listening' : 'Connecting...'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {events.map((event, index) => (
                            <motion.div
                              key={`${event.timestamp}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className={`p-3 rounded-md border ${getEventColor(event.type)} hover-elevate`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wide">
                                      {event.type.replace(/_/g, ' ')}
                                    </span>
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {formatTimestamp(event.timestamp)}
                                    </span>
                                  </div>
                                  <p className="font-mono text-xs text-muted-foreground">
                                    {event.data.message || JSON.stringify(event.data, null, 2)}
                                  </p>
                                  {event.data.command && (
                                    <Badge variant="outline" className="mt-2 font-mono text-xs">
                                      {event.data.command}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Network Info Sidebar */}
            <div className="min-w-0 space-y-6">
              
              {/* Oracle Nodes */}
              <Card className="terminal-card min-w-0 max-w-full border-primary/30" data-testid="card-nodes">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <span className="terminal-header text-sm">ORACLE_NODES</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((nodeId) => (
                      <div key={nodeId} className="flex items-center justify-between p-2 rounded bg-card/50 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          <span className="font-mono text-xs">oracle-{nodeId}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          ACTIVE
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Connection Info */}
              <Card className="terminal-card min-w-0 max-w-full border-accent/30" data-testid="card-connection">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-accent" />
                    <span className="terminal-header text-sm">CONNECTION</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={isConnected ? 'text-accent' : 'text-muted-foreground'}>
                        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="text-foreground">WebSocket</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clients</span>
                      <span className="text-foreground">{networkStats.connectedClients}</span>
                    </div>
                    {walletAddress && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wallet</span>
                        <span className="text-accent">
                          {walletAddress.slice(0, 6)}...
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Operations */}
              <Card className="terminal-card border-primary/30" data-testid="card-privacy">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="terminal-header text-sm">PRIVACY_OPS</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xs text-muted-foreground mb-3">
                    Terminal commands appear here in real-time
                  </p>
                  {walletAddress ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full font-mono text-xs border-primary/30"
                      onClick={() => window.location.href = '/terminal'}
                      data-testid="button-go-terminal"
                    >
                      <Terminal className="h-3 w-3 mr-2" />
                      Open Terminal
                    </Button>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground text-center p-4 border border-dashed border-primary/30 rounded">
                      Connect wallet to use privacy features
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

