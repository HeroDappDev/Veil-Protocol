import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/context/wallet-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Terminal as TerminalIcon, Send, Trash2, Shield, Zap, Lock, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserCode } from "@shared/schema";

interface TerminalLine {
  id: string;
  text: string;
  timestamp: Date;
  isCommand: boolean;
}

const ANON_STORAGE_KEY = "terminal_history_anon";
const ANON_WELCOME_KEY = "terminal_welcome_anon";

export default function TerminalPage() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [command, setCommand] = useState("");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [hasShownWalletInfo, setHasShownWalletInfo] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousWalletRef = useRef<string | null>(null);

  const getStorageKey = () => walletAddress ? `terminal_history_${walletAddress}` : ANON_STORAGE_KEY;
  const getWelcomeKey = () => walletAddress ? `terminal_welcome_${walletAddress}` : ANON_WELCOME_KEY;

  const { data: userCode } = useQuery<UserCode>({
    queryKey: ["/api/user-code", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");
      const response = await fetch(`/api/user-code/${walletAddress}`);
      if (!response.ok) throw new Error("Failed to fetch user code");
      return response.json();
    },
    enabled: !!walletAddress,
  });

  const executeCommand = useMutation({
    mutationFn: async (cmd: string) => {
      const response = await apiRequest("POST", "/api/terminal/execute", {
        command: cmd,
        walletAddress: walletAddress || null,
      });
      return response.json() as Promise<{ output: string; metadata?: Record<string, any> }>;
    },
    onSuccess: (data) => {
      addTerminalOutput(data.output);
    },
    onError: (error: any) => {
      addTerminalOutput(`ERROR: ${error.message || "Command execution failed"}`);
    },
  });

  // Load terminal history from localStorage on mount / wallet change
  useEffect(() => {
    const storageKey = getStorageKey();
    const welcomeKey = getWelcomeKey();

    setTerminalLines([]);
    setHasShownWelcome(false);
    setHasShownWalletInfo(false);

    try {
      const savedHistory = localStorage.getItem(storageKey);
      const savedWelcome = localStorage.getItem(welcomeKey);

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setTerminalLines(parsed.map((line: any) => ({ ...line, timestamp: new Date(line.timestamp) })));
      }

      if (savedWelcome === "true") {
        setHasShownWelcome(true);
        setHasShownWalletInfo(true);
      }
    } catch (e) {
      console.error("Failed to load terminal history:", e);
    }

    setIsHistoryLoaded(true);
  }, [walletAddress]);

  // Save terminal history to localStorage
  useEffect(() => {
    const storageKey = getStorageKey();
    if (terminalLines.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(terminalLines));
      } catch (e) {
        console.error("Failed to save terminal history:", e);
      }
    }
  }, [terminalLines, walletAddress]);

  // Show wallet info when connected (once per session)
  useEffect(() => {
    if (walletAddress && userCode && !hasShownWalletInfo) {
      setTimeout(() => {
        addTerminalOutput(
          `✓ Wallet Connected:    ${walletAddress}\n✓ Terminal Code:       ${userCode.code}\n✓ Session:             AUTHENTICATED\n\nType /help to see available commands.`,
          false
        );
        setHasShownWalletInfo(true);
        const welcomeKey = getWelcomeKey();
        if (welcomeKey) localStorage.setItem(welcomeKey, "true");
      }, 300);
    }
  }, [walletAddress, userCode, hasShownWalletInfo]);

  // Show initial welcome once
  useEffect(() => {
    if (isHistoryLoaded && terminalLines.length === 0 && !hasShownWelcome) {
      addTerminalOutput(
        `VEIL PROTOCOL TERMINAL v2.0\nPrivacy Operations Interface\nRobinhood Chain (EVM L2) • Zero-Knowledge • Decentralized\n\nTerminal ready. Type /help to see available commands.`,
        false
      );
      setHasShownWelcome(true);
    }
  }, [isHistoryLoaded, terminalLines.length, hasShownWelcome]);

  // Auto-execute saved command
  useEffect(() => {
    if (isHistoryLoaded) {
      const savedCommand = localStorage.getItem("terminalCommand");
      if (savedCommand) {
        localStorage.removeItem("terminalCommand");
        setTerminalLines(prev => [...prev, {
          id: Date.now().toString(),
          text: savedCommand,
          timestamp: new Date(),
          isCommand: true,
        }]);
        setTimeout(() => executeCommand.mutate(savedCommand), 500);
      }
    }
  }, [isHistoryLoaded]);

  const addTerminalOutput = (text: string, isCommand: boolean = false) => {
    const lines = text.split("\n");
    let currentIndex = 0;
    setIsTyping(true);

    const typeLine = () => {
      if (currentIndex < lines.length) {
        setTerminalLines(prev => [...prev, {
          id: `${Date.now()}-${currentIndex}`,
          text: lines[currentIndex],
          timestamp: new Date(),
          isCommand,
        }]);
        currentIndex++;
        setTimeout(typeLine, 10);
      } else {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    typeLine();
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isTyping || executeCommand.isPending) return;
    addTerminalOutput(`> ${command}`, true);
    executeCommand.mutate(command);
    setCommand("");
  };

  const handleClearTerminal = () => {
    setTerminalLines([]);
    setHasShownWelcome(false);
    setHasShownWalletInfo(false);
    setIsHistoryLoaded(true);
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem(getWelcomeKey());
    toast({ title: "Terminal Cleared", description: "All terminal history has been reset" });
  };

  return (
    <>
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 scan-lines opacity-10 pointer-events-none" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-accent opacity-70">&gt;&gt;&gt;</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="mx-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TERMINAL
                </span>
              </h1>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              &gt; Privacy operations command interface
            </p>
          </div>

          {/* Status Bar */}
          <Card className="terminal-card border-accent/30 mb-6">
            <CardContent className="py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="terminal-header text-xs">SESSION_STATUS</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Connection</span>
                      <Badge variant={walletAddress ? "default" : "outline"} className="font-mono text-xs">
                        {walletAddress ? "WALLET ACTIVE" : "ANONYMOUS"}
                      </Badge>
                    </div>
                    {walletAddress && userCode && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">Code</span>
                        <span className="font-mono text-xs text-accent">{userCode.code}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Lines</span>
                      <span className="font-mono text-xs text-foreground">{terminalLines.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="terminal-header text-xs">SECURITY_FEATURES</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-accent" />
                      <span className="text-muted-foreground">ZK-Private</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-accent" />
                      <span className="text-muted-foreground">Deterministic</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-accent" />
                      <span className="text-muted-foreground">Session Persistence</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terminal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-5 w-5 text-primary" />
                <span className="font-mono text-sm text-accent">
                  {walletAddress ? `user@zkOracle:~$` : `anonymous@zkOracle:~$`}
                </span>
              </div>

              {terminalLines.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearTerminal}
                  className="gap-2 font-mono text-xs border-accent/30 hover:border-accent/60"
                  data-testid="button-clear-terminal"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            <Card className="relative terminal-card border-primary/30 bg-black/90 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" style={{ animationDuration: "2s" }} />
              </div>

              <CardContent className="p-0">
                <div
                  className="relative bg-black/95 font-mono text-xs sm:text-sm h-[350px] sm:h-[450px] overflow-y-auto terminal-scrollbar"
                  data-testid="div-terminal-output"
                >
                  <div className="p-3 sm:p-6">
                    {terminalLines.length === 0 ? (
                      <div className="space-y-3">
                        <div className="text-primary mb-4">
                          <span className="text-accent">&gt;</span> ZK Oracle Terminal Ready
                        </div>
                        <div className="text-muted-foreground text-xs mb-4">Quick commands:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { cmd: "/help", desc: "Show all available commands" },
                            { cmd: "/code", desc: "Display your terminal code" },
                            { cmd: "/privacy private", desc: "Set privacy level" },
                            { cmd: "/keys generate", desc: "Generate encryption keys" },
                            { cmd: "/status", desc: "View encryption status" },
                          ].map((item) => (
                            <button
                              key={item.cmd}
                              onClick={() => setCommand(item.cmd)}
                              className="text-left p-2 rounded border border-primary/20 hover:border-accent/50 hover:bg-primary/5 transition-colors min-h-12"
                              data-testid={`button-quick-${item.cmd.split(" ")[0].replace("/", "")}`}
                            >
                              <div className="text-accent text-xs font-mono">{item.cmd}</div>
                              <div className="text-muted-foreground text-xs mt-1">{item.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      terminalLines.map((line) => (
                        <div
                          key={line.id}
                          className={line.isCommand ? "text-accent mb-1 flex items-center gap-2" : "text-gray-300 mb-1 whitespace-pre-wrap"}
                          data-testid={line.isCommand ? "text-command" : "text-output"}
                        >
                          {line.isCommand && <span className="text-accent opacity-70">&gt;</span>}
                          {line.text}
                        </div>
                      ))
                    )}

                    {isTyping && <span className="inline-block w-2 h-4 bg-accent animate-pulse" />}
                    <div ref={terminalEndRef} />
                  </div>
                </div>

                {/* Command Input */}
                <div className="border-t border-primary/20 bg-black/95 p-3 sm:p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-accent font-mono text-xs sm:text-sm pointer-events-none">
                        $
                      </div>
                      <Input
                        ref={inputRef}
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Type a command... (e.g., /help)"
                        disabled={isTyping || executeCommand.isPending}
                        className="font-mono text-xs sm:text-sm bg-black/50 border-primary/30 pl-6 sm:pl-8 min-h-10 sm:min-h-11 text-accent placeholder:text-muted-foreground/50 focus:border-accent/50"
                        data-testid="input-command"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!command.trim() || isTyping || executeCommand.isPending}
                      className="gap-1.5 sm:gap-2 font-mono border border-primary/30 min-h-10 sm:min-h-11 px-3 sm:px-4"
                      data-testid="button-execute"
                    >
                      <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Execute</span>
                      <span className="sm:hidden">Run</span>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .terminal-scrollbar::-webkit-scrollbar { width: 6px; }
        .terminal-scrollbar::-webkit-scrollbar-track { background: #000; }
        .terminal-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--accent) / 0.3); border-radius: 3px; }
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--accent) / 0.5); }
      `}</style>
    </>
  );
}

