import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { QueryForm } from "@/components/query-form";
import { QueryHistoryTable } from "@/components/query-history-table";
import { OracleNodeCard } from "@/components/oracle-node-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  type Query, type OracleNode, type Proof, type Result,
  type QueryType, type PrivacyLevel, type AiModel,
} from "@shared/schema";
import {
  Activity, Shield, Zap, TrendingUp, Building2, FileText,
  Globe, Server, Clock, CheckCircle2, Circle, Copy, Download,
  Terminal, Eye, Lock, Brain, BarChart3, Cpu, Network, Check,
  ChevronRight, AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

// ── Type helpers ─────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  price_prediction: "Price Signal",
  sentiment_analysis: "Sentiment Analysis",
  risk_assessment: "Risk Assessment",
  rwa_valuation: "RWA Valuation",
  invoice_risk: "Invoice Risk Score",
  compliance_check: "Compliance Oracle",
};

const TYPE_ICONS: Record<string, typeof TrendingUp> = {
  price_prediction: TrendingUp,
  sentiment_analysis: Brain,
  risk_assessment: Shield,
  rwa_valuation: Building2,
  invoice_risk: FileText,
  compliance_check: Globe,
};

// ── Quick-Launch Templates ────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "eth-signal",
    icon: TrendingUp,
    label: "Crypto Signal",
    description: "ETH/USD 24h price prediction via multi-model consensus",
    borderClass: "border-blue-500/30 hover:border-blue-400/50",
    glowClass: "from-blue-500/15 to-blue-500/5",
    iconClass: "text-blue-400",
    values: {
      type: "price_prediction" as QueryType,
      target: "ETH/USD",
      privacyLevel: "public" as PrivacyLevel,
      aiModel: "default" as AiModel,
      queryModality: "text",
    },
  },
  {
    id: "rwa-value",
    icon: Building2,
    label: "Property Value",
    description: "ZK-attested commercial real estate valuation oracle",
    borderClass: "border-primary/30 hover:border-primary/60",
    glowClass: "from-primary/15 to-primary/5",
    iconClass: "text-primary",
    values: {
      type: "rwa_valuation" as QueryType,
      target: "Class A commercial office tower, Manhattan NY",
      privacyLevel: "private" as PrivacyLevel,
      aiModel: "default" as AiModel,
      queryModality: "text",
    },
  },
  {
    id: "invoice-risk",
    icon: FileText,
    label: "Invoice Risk",
    description: "AI-driven risk score for Net-30 healthcare invoice financing",
    borderClass: "border-orange-500/30 hover:border-orange-400/50",
    glowClass: "from-orange-500/15 to-orange-500/5",
    iconClass: "text-orange-400",
    values: {
      type: "invoice_risk" as QueryType,
      target: "Net-30 invoice, Healthcare sector, $2.5M, Fortune 500 buyer",
      privacyLevel: "private" as PrivacyLevel,
      aiModel: "default" as AiModel,
      queryModality: "text",
    },
  },
  {
    id: "compliance",
    icon: Globe,
    label: "Compliance Check",
    description: "Anonymous FATF / MiCA DeFi protocol compliance attestation",
    borderClass: "border-purple-500/30 hover:border-purple-400/50",
    glowClass: "from-purple-500/15 to-purple-500/5",
    iconClass: "text-purple-400",
    values: {
      type: "compliance_check" as QueryType,
      target: "DeFi lending protocol, MiCA/FATF jurisdiction compliance check",
      privacyLevel: "anonymous" as PrivacyLevel,
      aiModel: "default" as AiModel,
      queryModality: "text",
    },
  },
];

// ── ZK Processing Steps ───────────────────────────────────────────────────────
const ZK_STEPS = [
  { label: "Query Encrypted", desc: "AES-256 + RSA-2048 client-side encryption" },
  { label: "Broadcasting to Nodes", desc: "Dispatching to decentralised oracle network" },
  { label: "AI Model Computing", desc: "Multi-model consensus pipeline running" },
  { label: "Oracle Consensus", desc: "Byzantine fault-tolerant aggregation" },
  { label: "ZK Proof Generating", desc: "zk-SNARK circuit compiling on-chain" },
  { label: "Result Sealed", desc: "Immutably recorded on Robinhood Chain" },
];

function ZKProcessingSteps({ status }: { status: string }) {
  const done =
    status === "pending" ? 1 :
    status === "processing" ? 3 :
    status === "verifying" ? 4 :
    status === "completed" ? 6 : 0;

  return (
    <div className="space-y-1.5">
      {ZK_STEPS.map((step, i) => {
        const isDone = i < done;
        const isActive = i === done - 1 && status !== "completed";
        return (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-500 ${
              isDone || isActive ? "opacity-100" : "opacity-25"
            } ${isActive ? "bg-primary/8 border border-primary/20" : ""}`}
          >
            <div className="shrink-0 w-4">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : isActive ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-mono font-medium ${isDone || isActive ? "text-primary" : "text-muted-foreground/30"}`}>
                {step.label}
              </div>
              {(isDone || isActive) && (
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{step.desc}</div>
              )}
            </div>
            {isDone && <span className="text-[10px] font-mono text-primary/40 shrink-0">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied", description: label, className: "border-primary/30" });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <Button variant="ghost" size="icon" onClick={handle} className="h-7 w-7 shrink-0">
      {copied
        ? <Check className="h-3 w-3 text-primary" />
        : <Copy className="h-3 w-3 text-muted-foreground/60" />
      }
    </Button>
  );
}

// ── Oracle Intelligence Modal ─────────────────────────────────────────────────
function OracleIntelligenceModal({
  open, onClose, query, result, proof,
}: {
  open: boolean;
  onClose: () => void;
  query: Query | null;
  result: Result | null;
  proof: Proof | null;
}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("report");

  useEffect(() => { if (open) setActiveTab("report"); }, [open]);

  if (!query || !result) return null;

  const src = result.sourceData as Record<string, any>;
  const fullAnalysis = src?.fullAnalysis || src?.rawResponse || result.prediction;
  const verificationSteps = (proof?.verificationSteps as any[]) || [];
  const Icon = TYPE_ICONS[query.type] || Activity;

  const downloadReport = () => {
    const data = {
      query: { id: query.id, type: query.type, target: query.target, privacyLevel: query.privacyLevel, aiModel: query.aiModel, createdAt: query.createdAt },
      result: { prediction: result.prediction, confidence: result.confidence, blockNumber: result.blockNumber, transactionHash: result.transactionHash, createdAt: result.createdAt },
      proof: proof ? { hash: proof.proofHash, verified: proof.verified, consensusNodes: proof.consensusNodes, totalNodes: proof.totalNodes } : null,
      analysis: fullAnalysis,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oracle-report-${query.id.slice(0, 8)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report Downloaded", description: "Oracle intelligence report saved as JSON", className: "border-primary/30" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background border border-primary/30 p-0 gap-0">

        {/* ── Modal Header ── */}
        <div className="relative border-b border-primary/20 bg-gradient-to-r from-card/90 via-card/70 to-card/90 px-6 py-4 shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <DialogHeader className="relative">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-mono uppercase tracking-widest text-primary leading-none">
                  Oracle Intelligence Report
                </DialogTitle>
                <DialogDescription className="text-[11px] font-mono text-muted-foreground/60 mt-1 truncate">
                  {TYPE_LABELS[query.type] || query.type} · {query.target}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-[10px] font-mono gap-1 bg-primary/10 text-primary border border-primary/30 px-2">
                  <CheckCircle2 className="h-2.5 w-2.5" /> ZK Verified
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-muted-foreground/70 capitalize px-2">
                  {query.privacyLevel}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Tabs ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 pb-0 border-b border-primary/10 shrink-0">
              <TabsList className="bg-card/60 border border-primary/15 p-1 gap-1 h-auto">
                {[
                  { value: "report", label: "Intelligence Report" },
                  { value: "zkproof", label: "ZK Proof" },
                  { value: "onchain", label: "On-Chain Data" },
                ].map(t => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="font-mono text-xs py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Report Tab */}
            <TabsContent value="report" className="flex-1 overflow-y-auto px-6 py-4 mt-0 space-y-5">
              {/* Confidence banner */}
              <div className="flex items-center gap-5 p-4 rounded-xl border border-primary/20 bg-card/50">
                <div className="text-center shrink-0 space-y-0.5">
                  <div className="text-4xl font-bold text-primary font-mono leading-none">{result.confidence}%</div>
                  <div className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">Confidence</div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-semibold leading-snug">{result.prediction}</div>
                  <Progress value={result.confidence} className="h-1.5 bg-primary/10" />
                  <div className="flex gap-3 text-[10px] font-mono text-muted-foreground/50 flex-wrap">
                    <span>Model: {src?.modelUsed || query.aiModel}</span>
                    <span>Sources: {src?.sources?.length || 0}</span>
                    <span>{format(new Date(result.createdAt), "MMM dd yyyy, HH:mm:ss")}</span>
                  </div>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Query Type", val: TYPE_LABELS[query.type] || query.type },
                  { label: "Target Asset", val: query.target },
                  { label: "Privacy Level", val: query.privacyLevel },
                  { label: "AI Model", val: query.aiModel === "default" ? "Oracle Consensus" : query.aiModel },
                  { label: "Block Number", val: result.blockNumber ? `#${result.blockNumber}` : "Pending" },
                  { label: "Status", val: query.status },
                ].map(({ label, val }) => (
                  <div key={label} className="space-y-1">
                    <div className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">{label}</div>
                    <div className="text-xs font-mono capitalize truncate" title={val}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Full AI Analysis */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-primary/70 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5" /> Full AI Analysis
                </div>
                <div className="bg-black/50 border border-primary/15 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono break-words" data-testid="text-ai-analysis">
                    {fullAnalysis}
                  </pre>
                </div>
                {src?.modelUsed && (
                  <div className="text-[10px] font-mono text-muted-foreground/30 text-right">
                    Generated by {src.modelUsed}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ZK Proof Tab */}
            <TabsContent value="zkproof" className="flex-1 overflow-y-auto px-6 py-4 mt-0 space-y-4">
              {proof ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-mono font-bold text-primary">Zero-Knowledge Proof</span>
                    </div>
                    <Badge variant="outline" className={`gap-1 text-[10px] font-mono ${proof.verified ? "border-green-500/40 text-green-400" : "border-yellow-500/40 text-yellow-400"}`}>
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {proof.verified ? "Verified" : "Verifying..."}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-muted-foreground/40 uppercase">Proof Hash</div>
                    <div className="flex items-center gap-2 bg-black/50 border border-primary/15 rounded-md px-3 py-2">
                      <code className="text-[11px] font-mono text-primary/70 flex-1 truncate">{proof.proofHash}</code>
                      <CopyBtn text={proof.proofHash} label="Proof hash copied" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground/50">Oracle Consensus</span>
                      <span className="text-primary font-bold">{proof.consensusNodes}/{proof.totalNodes} nodes</span>
                    </div>
                    <Progress value={(proof.consensusNodes / proof.totalNodes) * 100} className="h-2 bg-primary/10" />
                    <div className="text-[10px] font-mono text-muted-foreground/40">
                      {proof.consensusNodes} of {proof.totalNodes} nodes confirmed computation
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">Verification Steps</div>
                    <div className="space-y-1.5">
                      {verificationSteps.map((step: any, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-card/50 border border-primary/8" data-testid={`modal-step-${i}`}>
                          {step.completed
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            : <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono">{step.name}</div>
                            <div className="text-[10px] text-muted-foreground/50 mt-0.5">{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground/30 font-mono text-sm">
                  <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  ZK proof not yet generated
                </div>
              )}
            </TabsContent>

            {/* On-Chain Tab */}
            <TabsContent value="onchain" className="flex-1 overflow-y-auto px-6 py-4 mt-0 space-y-4">
              {[
                { label: "Query Transaction Hash", value: query.transactionHash },
                { label: "Result Transaction Hash", value: result.transactionHash },
                { label: "IPFS Hash", value: result.ipfsHash },
                { label: "ZK Proof Hash", value: proof?.proofHash },
              ].filter(x => x.value).map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <div className="text-[10px] font-mono text-muted-foreground/40 uppercase">{label}</div>
                  <div className="flex items-center gap-2 bg-black/50 border border-primary/15 rounded-md px-3 py-2">
                    <code className="text-[11px] font-mono text-primary/70 flex-1 truncate">{value}</code>
                    <CopyBtn text={value!} label={`${label} copied`} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground/40 uppercase mb-1">Block Number</div>
                  <div className="font-mono text-sm">{result.blockNumber ? `#${result.blockNumber}` : "Pending"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground/40 uppercase mb-1">Sealed At</div>
                  <div className="font-mono text-sm">{format(new Date(result.createdAt), "MMM dd yyyy, HH:mm:ss")}</div>
                </div>
              </div>
              {!query.transactionHash && !result.transactionHash && !result.ipfsHash && (
                <div className="text-center py-8 text-muted-foreground/30 font-mono text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No on-chain data available yet
                </div>
              )}
              {result.transactionHash && (
                <div className="text-[10px] font-mono text-muted-foreground/30 pt-2 border-t border-primary/8">
                  View in terminal: <code className="text-primary/50">/txn {result.transactionHash.slice(0, 16)}...</code>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-primary/15 bg-card/40 px-6 py-3 flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={downloadReport}
            className="gap-1.5 font-mono text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
            data-testid="button-download-report"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
          {proof && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-mono text-xs border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/40"
              onClick={() => { localStorage.setItem("terminalCommand", `/txn ${proof.proofHash}`); setLocation("/terminal"); }}
              data-testid="button-open-terminal"
            >
              <Terminal className="h-3.5 w-3.5" />
              Open in Terminal
            </Button>
          )}
          <div className="ml-auto text-[10px] font-mono text-muted-foreground/25">
            ID: {query.id.slice(0, 12)}...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Result Signal Card (clickable row in the feed) ────────────────────────────
function ResultSignalCard({ query, onClick }: { query: Query; onClick: () => void }) {
  const Icon = TYPE_ICONS[query.type] || Activity;
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-primary/12 bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group"
      data-testid={`button-result-signal-${query.id}`}
    >
      <div className="h-8 w-8 rounded-md bg-primary/8 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">{TYPE_LABELS[query.type] || query.type}</span>
          <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/25 font-mono px-1.5 py-0 h-4 gap-0.5">
            <CheckCircle2 className="h-2 w-2" /> ZK
          </Badge>
          <span className="text-[10px] font-mono text-muted-foreground/40 capitalize">{query.privacyLevel}</span>
        </div>
        <div className="text-xs font-mono text-muted-foreground/70 truncate">{query.target}</div>
        <div className="text-[10px] font-mono text-muted-foreground/35">
          {format(new Date(query.createdAt), "MMM dd, HH:mm:ss")}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono text-primary/40 group-hover:text-primary/70 transition-colors">Read report</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary/60 transition-colors" />
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  const [formKey, setFormKey] = useState(0);
  const [formInitialValues, setFormInitialValues] = useState<any>(null);
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  const { data: queries = [], isLoading: queriesLoading } = useQuery<Query[]>({
    queryKey: ["/api/queries"],
    refetchInterval: 2000,
  });
  const { data: nodes = [], isLoading: nodesLoading } = useQuery<OracleNode[]>({
    queryKey: ["/api/nodes"],
  });

  const activeQuery = queries.find(q => q.id === activeQueryId) || null;
  const completedQueries = queries.filter(q => q.status === "completed");

  const { data: modalResult } = useQuery<Result>({
    queryKey: ["/api/results", selectedQueryId],
    queryFn: async () => {
      const res = await fetch(`/api/results/${selectedQueryId}`);
      if (!res.ok) throw new Error("No result");
      return res.json();
    },
    enabled: !!selectedQueryId && modalOpen,
  });
  const { data: modalProof } = useQuery<Proof>({
    queryKey: ["/api/proofs", selectedQueryId],
    queryFn: async () => {
      const res = await fetch(`/api/proofs/${selectedQueryId}`);
      if (!res.ok) throw new Error("No proof");
      return res.json();
    },
    enabled: !!selectedQueryId && modalOpen,
  });
  const { data: activeResult } = useQuery<Result>({
    queryKey: ["/api/results", activeQueryId],
    queryFn: async () => {
      const res = await fetch(`/api/results/${activeQueryId}`);
      if (!res.ok) throw new Error("No result");
      return res.json();
    },
    enabled: !!activeQueryId && activeQuery?.status === "completed",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/queries", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
      if (data?.id) setActiveQueryId(data.id);
      toast({ title: "Query Submitted", description: "Oracle network is processing your request...", className: "border-primary/30" });
    },
    onError: (err: Error) => {
      toast({ title: "Submission Error", description: err.message || "Failed to submit query", variant: "destructive" });
    },
  });

  const handleTemplateClick = useCallback((t: typeof TEMPLATES[0]) => {
    setFormInitialValues(t.values);
    setFormKey(k => k + 1);
    setActiveQueryId(null);
    document.getElementById("oracle-query-form")?.scrollIntoView({ behavior: "smooth" });
    toast({ title: `Template Loaded: ${t.label}`, description: "Form pre-filled — review and submit", className: "border-primary/30" });
  }, [toast]);

  const openModal = useCallback((queryId: string) => {
    setSelectedQueryId(queryId);
    setModalOpen(true);
  }, []);

  const activeNodes = nodes.filter(n => n.status === "active").length;
  const avgResponse = nodes.length ? Math.round(nodes.reduce((s, n) => s + n.responseTime, 0) / nodes.length) : 0;
  const successRate = queries.length ? ((completedQueries.length / queries.length) * 100).toFixed(0) : "0";

  return (
    <div className="relative min-h-[100svh]">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 space-y-5">

        {/* ── Header ── */}
        <div className="relative border border-primary/25 rounded-xl bg-gradient-to-br from-card/80 to-card/60 p-5 md:p-6 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Cpu className="h-5 w-5 text-primary" />
                <h1 className="font-mono text-xl md:text-2xl font-bold tracking-widest uppercase bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Oracle Command Center
                </h1>
              </div>
              <p className="text-xs font-mono text-muted-foreground/60">
                Privacy-preserving AI oracle · ZK-verified results · Multi-model consensus
              </p>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { label: "Nodes Online", val: activeNodes, icon: Server },
                { label: "Completed", val: completedQueries.length, icon: CheckCircle2 },
                { label: "Avg Latency", val: `${avgResponse}ms`, icon: Clock },
                { label: "Success Rate", val: `${successRate}%`, icon: BarChart3 },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Icon className="h-3 w-3 text-primary/50" />
                    <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-primary">{val}</div>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/25">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick-Launch Templates ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap className="h-3 w-3 text-primary/50" />
            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Quick-Launch Templates</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t)}
                className={`group text-left p-3 md:p-4 rounded-lg border bg-gradient-to-br ${t.glowClass} ${t.borderClass} transition-all duration-200`}
                data-testid={`button-template-${t.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <t.icon className={`h-4 w-4 ${t.iconClass} shrink-0`} />
                  <span className={`text-xs font-mono font-bold group-hover:${t.iconClass} transition-colors`}>{t.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/55 leading-relaxed">{t.description}</p>
                <div className={`mt-2.5 flex items-center gap-0.5 text-[10px] font-mono ${t.iconClass} opacity-50 group-hover:opacity-100 transition-opacity`}>
                  Launch <ChevronRight className="h-2.5 w-2.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main 2-col Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Form + Results + History */}
          <div className="lg:col-span-2 space-y-4">

            {/* Query Form */}
            <div id="oracle-query-form" className="border border-primary/20 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/15 bg-gradient-to-r from-card/80 to-card/40">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">Submit Oracle Query</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono text-muted-foreground/40">Ready</span>
                </div>
              </div>
              <div className="p-4 md:p-5">
                <QueryForm
                  key={formKey}
                  initialValues={formInitialValues}
                  onSubmit={data => submitMutation.mutate(data)}
                  isSubmitting={submitMutation.isPending}
                />
              </div>
            </div>

            {/* ZK Processing — shows while query is in-flight */}
            {activeQuery && activeQuery.status !== "completed" && activeQuery.status !== "failed" && (
              <div className="border border-primary/25 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/15">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  <span className="font-mono text-xs text-primary uppercase tracking-wider">ZK Oracle Processing</span>
                  <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border border-primary/25 font-mono capitalize">{activeQuery.status}</Badge>
                </div>
                <div className="p-4">
                  <div className="text-[10px] font-mono text-muted-foreground/50 mb-3 truncate">Target: {activeQuery.target}</div>
                  <ZKProcessingSteps status={activeQuery.status} />
                </div>
              </div>
            )}

            {/* Active Result — shows once current query is done */}
            {activeQuery?.status === "completed" && activeResult && (
              <div className="border border-primary/35 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/20 bg-primary/5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-mono text-xs text-primary uppercase tracking-wider">Oracle Result Ready</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-mono text-primary/60">ZK Sealed</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="text-sm font-bold leading-snug">{activeResult.prediction}</div>
                      <div className="text-[11px] font-mono text-muted-foreground/60 truncate">for {activeQuery.target}</div>
                      <div className="flex items-center gap-3">
                        <Progress value={activeResult.confidence} className="h-1.5 flex-1 bg-primary/10" />
                        <span className="font-mono text-sm font-bold text-primary shrink-0">{activeResult.confidence}%</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => openModal(activeQuery.id)}
                      className="gap-2 font-mono text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/35 shrink-0"
                      data-testid="button-open-active-result"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Full Report
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-primary/10">
                    <ZKProcessingSteps status="completed" />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Intelligence feed */}
            {completedQueries.length > 0 && (
              <div className="border border-primary/15 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary/60" />
                  <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">Recent Intelligence</span>
                  <span className="text-[10px] font-mono text-muted-foreground/30 ml-1">— click any row to open full report</span>
                  <div className="ml-auto text-[10px] font-mono text-muted-foreground/30">{completedQueries.length} signals</div>
                </div>
                <div className="p-3 space-y-1.5">
                  {completedQueries.slice(0, 8).map(q => (
                    <ResultSignalCard key={q.id} query={q} onClick={() => openModal(q.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Query History */}
            <div className="border border-primary/15 rounded-xl bg-card/50 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/10">
                <Activity className="h-4 w-4 text-primary/60" />
                <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">Query History</span>
                <div className="ml-auto font-mono text-xs text-muted-foreground/30">{queries.length} total</div>
              </div>
              <div className="p-3">
                {queriesLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  <QueryHistoryTable
                    queries={queries}
                    onQuerySelect={q => q.status === "completed" ? openModal(q.id) : setActiveQueryId(q.id)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">

            {/* Network Health tiles */}
            <div className="border border-primary/20 rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15">
                <Network className="h-4 w-4 text-primary/60" />
                <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">Network Health</span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono text-primary/50">Live</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Total Nodes", val: nodes.length, color: "text-primary" },
                  { label: "Online", val: activeNodes, color: "text-green-400" },
                  { label: "Queries", val: queries.length, color: "text-blue-400" },
                  { label: `${avgResponse}ms`, val: "Avg Resp", color: "text-orange-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="border border-primary/10 rounded-lg p-3 bg-black/20 space-y-1">
                    <div className="text-[10px] font-mono text-muted-foreground/40 uppercase">{val}</div>
                    <div className={`font-mono text-xl font-bold ${color}`}>{label}</div>
                  </div>
                ))}
              </div>
              {queries.length > 0 && (
                <div className="px-4 pb-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40">
                    <span>Success rate</span>
                    <span>{successRate}%</span>
                  </div>
                  <Progress value={Number(successRate)} className="h-1.5 bg-primary/10" />
                </div>
              )}
            </div>

            {/* Oracle Nodes */}
            <div className="border border-primary/15 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10">
                <Server className="h-4 w-4 text-primary/60" />
                <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">Oracle Nodes</span>
                <div className="ml-auto text-[10px] font-mono text-muted-foreground/30">{nodes.length} registered</div>
              </div>
              <div className="p-3 space-y-2">
                {nodesLoading ? (
                  [1,2,3].map(i => <Skeleton key={i} className="h-20" />)
                ) : nodes.length > 0 ? (
                  nodes.slice(0, 4).map(n => <OracleNodeCard key={n.id} node={n} />)
                ) : (
                  <div className="text-center py-6 text-muted-foreground/30 font-mono text-xs">No nodes registered</div>
                )}
              </div>
            </div>

            {/* AI Models status */}
            <div className="border border-primary/15 rounded-xl bg-card/50 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-primary/60" />
                <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">AI Models</span>
              </div>
              {[
                { name: "GPT-4o", dot: "bg-green-400" },
                { name: "Claude Opus 4.5", dot: "bg-orange-400" },
                { name: "Gemini 2.5 Pro", dot: "bg-blue-400" },
              ].map(({ name, dot }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse shrink-0`} />
                  <span className="text-xs font-mono text-muted-foreground/70 flex-1">{name}</span>
                  <span className="text-[10px] font-mono text-primary/50">Online</span>
                </div>
              ))}
            </div>

            {/* Privacy layer info */}
            <div className="border border-primary/20 rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">Privacy Layer</span>
              </div>
              {[
                "All computations verified via zk-SNARKs",
                "Private queries stay client-side only",
                "Anonymous mode: zero persistence",
                "Results sealed on Robinhood Chain",
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] font-mono text-muted-foreground/55">
                  <span className="text-primary/40 shrink-0 mt-px">›</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Modal */}
      <OracleIntelligenceModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedQueryId(null); }}
        query={queries.find(q => q.id === selectedQueryId) || null}
        result={modalResult || null}
        proof={modalProof || null}
      />
    </div>
  );
}
