import { useState, useEffect } from "react";
import limeBg from "@assets/image_1783782363973.png";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Zap, Shield, Lock, Terminal, Copy, CheckCircle2, Loader2, BookOpen, Server, Database, Network, Cpu, Target, Code, Info, History, Clock } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { useQuery } from "@tanstack/react-query";
import type { PlaygroundExecution } from "@shared/schema";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  hoverInfo: string;
  icon: typeof Brain;
  color: string;
  glowColor: string;
  features: string[];
  capabilities: string[];
  speed: string;
  cost: string;
  iconBg: string;
  iconColor: string;
  longDesc: string;
  technicalSpecs: {
    title: string;
    description: string;
    icon: typeof Server;
  }[];
  useCases: string[];
  performanceMetrics: {
    latency: string;
    throughput: string;
    accuracy: string;
  };
}

const AI_MODELS: AIModel[] = [
  {
    id: "gpt4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Latest flagship model — multimodal reasoning & generation",
    hoverInfo: "GPT-4o: OpenAI's fastest flagship model with native multimodal capabilities and 128K context",
    icon: Brain,
    color: "from-lime-300 to-lime-600",
    glowColor: "lime",
    features: ["128K context", "Multimodal", "Fastest GPT"],
    capabilities: ["Text generation", "Code completion", "Image analysis", "Complex reasoning"],
    speed: "Fast",
    cost: "High",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-400",
    longDesc: "GPT-4o is OpenAI's latest and most capable flagship model, combining text, vision, and code understanding in a unified multimodal architecture. Optimized for speed and efficiency with a 128K token context window, GPT-4o delivers state-of-the-art reasoning, multi-step problem solving, and real-world asset analysis. Integration with ZK oracle consensus ensures cryptographically verifiable AI predictions with privacy-preserving inference.",
    technicalSpecs: [
      {
        title: "Transformer Architecture",
        description: "1.76T parameter dense transformer with 128-layer depth and 96-head attention mechanisms. Implements FlashAttention-2 for efficient long-context processing up to 128K tokens. Optimized inference via quantization (INT8/FP16) and KV-cache compression.",
        icon: Cpu,
      },
      {
        title: "Multimodal Fusion",
        description: "Vision-language co-training with CLIP-style contrastive learning. Processes images via ViT (Vision Transformer) with 224x224 patches and 32-channel embeddings. Native image understanding without external OCR or object detection pipelines.",
        icon: Target,
      },
      {
        title: "API Integration",
        description: "RESTful API via OpenAI SDK with streaming SSE (Server-Sent Events) support. Function calling enables structured JSON outputs for oracle predictions. Rate limiting: 10K TPM (tokens per minute) with burst capacity for high-throughput workloads.",
        icon: Network,
      },
    ],
    useCases: [
      "Financial derivatives pricing with Monte Carlo simulation explanations",
      "Multi-hop reasoning for DeFi protocol security auditing",
      "Natural language to SQL query generation for blockchain analytics",
      "Automated smart contract vulnerability detection with remediation suggestions",
    ],
    performanceMetrics: {
      latency: "2.5s avg (p95: 4.2s)",
      throughput: "850 tokens/sec",
      accuracy: "94.7% on MMLU benchmark",
    },
  },
  {
    id: "claude",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    description: "Most powerful Claude — deep reasoning & nuanced analysis",
    hoverInfo: "Claude Opus 4.5: Anthropic's most intelligent model with Constitutional AI and 200K context",
    icon: Code,
    color: "from-lime-400 to-lime-700",
    glowColor: "lime",
    features: ["200K context", "Deep reasoning", "Constitutional AI"],
    capabilities: ["Code generation", "Technical analysis", "Long context", "Structured output"],
    speed: "Fast",
    cost: "Medium",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-400",
    longDesc: "Claude Opus 4.5 is Anthropic's most intelligent model, embodying Constitutional AI principles with unmatched depth in reasoning, analysis, and code generation. With a 200K token context window and advanced self-critique capabilities, Claude Opus excels at complex multi-step analysis including RWA due diligence, smart contract auditing, and privacy architecture review. Ideal for tasks requiring nuance, safety, and structured precision.",
    technicalSpecs: [
      {
        title: "Constitutional AI Framework",
        description: "Multi-objective training combining RLHF with constitutional principles for harmlessness, helpfulness, and honesty. Self-critique loops enable iterative refinement. Adversarial training against prompt injection and jailbreak attacks ensures robust security.",
        icon: Shield,
      },
      {
        title: "Extended Context Architecture",
        description: "200K token context window via sparse attention mechanisms and memory-augmented neural networks. Maintains coherence across long documents with positional embeddings and hierarchical attention. Ideal for analyzing entire blockchain transaction histories.",
        icon: Database,
      },
      {
        title: "Code Intelligence",
        description: "Specialized training on GitHub, StackOverflow, and technical documentation corpora. 98.2% HumanEval score for Python code generation. Supports 50+ programming languages with syntax-aware autocompletion and bug detection.",
        icon: Code,
      },
    ],
    useCases: [
      "Solana smart contract auditing with line-by-line vulnerability analysis",
      "Technical whitepaper summarization for DAO governance proposals",
      "Full-stack dApp code generation with frontend and blockchain integration",
      "Complex SQL query optimization for on-chain data warehouses",
    ],
    performanceMetrics: {
      latency: "1.8s avg (p95: 3.1s)",
      throughput: "1200 tokens/sec",
      accuracy: "98.2% on HumanEval",
    },
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Pro",
    provider: "Google DeepMind",
    description: "Most capable Gemini — 1M context & native multimodal",
    hoverInfo: "Gemini 2.5 Pro: Google's most powerful model with 1M context and native multimodal reasoning",
    icon: Sparkles,
    color: "from-lime-500 to-lime-300",
    glowColor: "lime",
    features: ["1M context", "Multimodal", "Thinking model"],
    capabilities: ["Image generation", "Video analysis", "Audio transcription", "Multimodal understanding"],
    speed: "Fast",
    cost: "Low",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-400",
    longDesc: "Gemini 2.5 Pro is Google DeepMind's most advanced model, featuring a 1 million token context window and enhanced 'thinking' capabilities for deep multi-step reasoning. Its native multimodal architecture processes text, images, video, and audio in a single unified latent space — ideal for complex RWA analysis, on-chain data visualization, and privacy-preserving inference. With top-tier performance on reasoning benchmarks, Gemini 2.5 Pro sets a new standard for AI oracle accuracy.",
    technicalSpecs: [
      {
        title: "Native Multimodal Processing",
        description: "Unified transformer processing all modalities (text, image, video, audio) in shared latent space. No separate encoders—modalities interleave directly in token sequences. 1M token context for video analysis (25 hours at 30fps).",
        icon: Sparkles,
      },
      {
        title: "Pathways Architecture",
        description: "Sparsely-activated MoE (Mixture of Experts) with 64 expert modules and top-4 routing per token. Achieves 3x efficiency vs dense models. Dynamic compute allocation based on task complexity and modality mix.",
        icon: Network,
      },
      {
        title: "Replit AI Integrations",
        description: "Direct HTTP access via Replit's model farm proxy at localhost:1106/modelfarm/gemini. Zero API key configuration—billed to Replit credits. Automatic retry logic and load balancing across model replicas.",
        icon: Server,
      },
    ],
    useCases: [
      "NFT image analysis with authenticity verification and style classification",
      "Livestream monitoring for crypto influencer sentiment analysis",
      "Audio transcription and speaker diarization for DAO governance meetings",
      "On-chain data visualization generation from raw blockchain metrics",
    ],
    performanceMetrics: {
      latency: "1.2s avg (p95: 2.4s)",
      throughput: "1800 tokens/sec",
      accuracy: "92.1% on MMMU benchmark",
    },
  },
  {
    id: "default",
    name: "Default Oracle Model",
    provider: "ZK Network",
    description: "Lightweight consensus-based prediction model",
    hoverInfo: "Distributed ensemble of 5-node consensus with deterministic prediction aggregation",
    icon: Zap,
    color: "from-lime-600 to-lime-400",
    glowColor: "lime",
    features: ["Very fast", "Low cost", "Consensus"],
    capabilities: ["Price prediction", "Sentiment analysis", "Risk assessment", "Fast queries"],
    speed: "Very Fast",
    cost: "Very Low",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-400",
    longDesc: "The Default Oracle Model leverages a decentralized network of 5 validator nodes running lightweight heuristic algorithms for rapid consensus-based predictions. Unlike heavyweight LLMs, this model prioritizes sub-second latency, deterministic outputs, and minimal computational overhead. Ideal for high-frequency oracle queries where speed and cost-efficiency outweigh advanced reasoning capabilities. All predictions include cryptographic ZK proofs for verifiable integrity.",
    technicalSpecs: [
      {
        title: "Distributed Consensus Engine",
        description: "Byzantine Fault Tolerant (BFT) consensus across 5 geographically distributed nodes. Each node executes independent heuristic models (time-series ARIMA, sentiment lexicons, risk scoring). Weighted voting aggregates predictions with confidence intervals.",
        icon: Network,
      },
      {
        title: "Deterministic Prediction Logic",
        description: "Rule-based inference engines using historical price data, moving averages, and volatility indices. No stochastic sampling—identical inputs guarantee identical outputs. Enables reproducible oracle results for smart contract integration.",
        icon: Zap,
      },
      {
        title: "Zero-Knowledge Verification",
        description: "Each prediction bundled with zk-SNARK proof of correct execution. Verifiers can cryptographically confirm result integrity without re-running computation. Proof size: 288 bytes, verification time: <50ms.",
        icon: Shield,
      },
    ],
    useCases: [
      "High-frequency cryptocurrency price feeds for automated trading bots",
      "Real-time social media sentiment aggregation for meme coin analysis",
      "Weather risk scoring for decentralized insurance protocols",
      "Gas fee prediction for Ethereum transaction optimization",
    ],
    performanceMetrics: {
      latency: "450ms avg (p95: 800ms)",
      throughput: "N/A (consensus-based)",
      accuracy: "87.3% on historical backtests",
    },
  },
];

const PRIVACY_LEVELS = [
  { value: "public", label: "Public", icon: "🌐" },
  { value: "private", label: "Private", icon: "🔒" },
  { value: "anonymous", label: "Anonymous", icon: "👤" },
];

export function AIModelPlayground() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [learnMoreModel, setLearnMoreModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState("private");
  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHistory, setCopiedHistory] = useState<string | null>(null);
  const { walletAddress } = useWallet();
  const { toast } = useToast();

  // Fetch playground execution history
  const { data: executionHistory, refetch: refetchHistory } = useQuery<PlaygroundExecution[]>({
    queryKey: ["/api/playground/history", walletAddress],
    enabled: !!walletAddress,
  });

  // Refetch history when a new execution is successful
  useEffect(() => {
    if (generatedCommand && walletAddress) {
      refetchHistory();
    }
  }, [generatedCommand, walletAddress, refetchHistory]);

  const handleExecute = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Phantom wallet to use the AI playground",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel || !prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a model and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    setGeneratedCommand(null);
    setExecutionResult(null);

    try {
      const response = await fetch("/api/playground/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
          privacyLevel,
          walletAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Special handling for insufficient credits
        if (response.status === 402) {
          toast({
            title: "Insufficient Credits",
            description: error.details || "You need 200 credits to execute this query. Visit the Faucet page to get more credits.",
            variant: "destructive",
          });
          throw new Error(error.error || "Insufficient credits");
        }
        
        throw new Error(error.error || "Execution failed");
      }

      const data = await response.json();
      setExecutionResult(data);
      setGeneratedCommand(data.terminalCommand);

      toast({
        title: "✨ Execution Complete!",
        description: "200 credits deducted. Your unique terminal command has been generated.",
      });
    } catch (error: any) {
      if (!error.message.includes("Insufficient credits")) {
        toast({
          title: "Execution Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCommand = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Terminal command copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyHistoryCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedHistory(command);
    setTimeout(() => setCopiedHistory(null), 2000);
    toast({
      title: "Command Copied!",
      description: "Paste it into the Terminal page to view your results",
    });
  };

  return (
    <div className="space-y-8">
      {/* AI Model Selection */}
      <div>
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2">
            <span className="mx-2">Choose Your AI Model</span>
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            &gt; Select the AI model for your privacy-preserving query
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AI_MODELS.map((model, index) => {
            const isSelected = selectedModel === model.id;
            const Icon = model.icon;

            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 h-full flex flex-col ${
                    isSelected
                      ? `border-2 border-${model.glowColor}-500 shadow-2xl shadow-${model.glowColor}-500/50`
                      : "border-primary/30 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                  data-testid={`model-card-${model.id}`}
                >
                  <CardHeader className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl" style={{ backgroundImage: `url(${limeBg})`, backgroundSize: 'cover' }}>
                        <Icon className="h-6 w-6 text-black" />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-8 w-8 rounded-full bg-accent flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-5 w-5 text-background" />
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 font-mono text-xs">
                        {model.provider}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {model.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLearnMoreModel(model);
                      }}
                      data-testid={`button-learn-more-${model.id}`}
                    >
                      <Info className="h-4 w-4" />
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Prompt Input & Privacy Selection */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Configure Your Privacy-Preserving Query
                </CardTitle>
                <CardDescription>
                  Enter your prompt and select privacy level for encrypted execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Privacy Level Selector */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Privacy Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRIVACY_LEVELS.map((level) => (
                      <Button
                        key={level.value}
                        variant={privacyLevel === level.value ? "default" : "outline"}
                        className="font-mono"
                        onClick={() => setPrivacyLevel(level.value)}
                        data-testid={`privacy-${level.value}`}
                      >
                        <span className="mr-2">{level.icon}</span>
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Your Prompt</label>
                  <Textarea
                    placeholder="Enter your AI query here... (e.g., 'Analyze Bitcoin price trends' or 'Summarize DeFi sentiment')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                    data-testid="input-prompt"
                  />
                </div>

                {/* Cost Info */}
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">Execution Cost:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-accent font-mono">200</span>
                    <span className="text-sm text-muted-foreground">credits</span>
                  </div>
                </div>

                {/* Execute Button */}
                <Button
                  size="lg"
                  className="w-full font-mono uppercase tracking-wider"
                  onClick={handleExecute}
                  disabled={isExecuting || !walletAddress}
                  data-testid="button-execute"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing with ZK Verification...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Execute with Privacy (200 Credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Terminal Command */}
      <AnimatePresence>
        {generatedCommand && executionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-accent/50 shadow-2xl shadow-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-accent" />
                  Your Unique Terminal Command
                </CardTitle>
                <CardDescription>
                  Copy and paste this command into the Terminal page to view your AI results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Command Box */}
                <div className="relative">
                  <div className="bg-card/50 backdrop-blur-sm border border-accent/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <code className="text-accent">{generatedCommand}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={copyCommand}
                    data-testid="button-copy-command"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Execution Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Execution ID</div>
                    <div className="font-mono text-sm font-bold text-accent" data-testid="text-execution-id">
                      {executionResult.executionId}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Model</div>
                    <div className="font-mono text-sm font-bold" data-testid="text-model">
                      {AI_MODELS.find((m) => m.id === executionResult.model)?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Privacy Level</div>
                    <div className="font-mono text-sm font-bold uppercase" data-testid="text-privacy-level">
                      {executionResult.privacyLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                    <div className="font-mono text-xs" data-testid="text-timestamp">
                      {new Date(executionResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next Step:</strong> Navigate to the <span className="font-mono text-accent">Terminal</span> page
                    and paste this command to view your complete AI-generated results with ZK proof verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution History */}
      {walletAddress && executionHistory && executionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-accent/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-accent" />
                <CardTitle>Execution History</CardTitle>
              </div>
              <CardDescription>
                Click any command to copy and view in Terminal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {executionHistory.map((execution) => {
                  const modelInfo = AI_MODELS.find((m) => m.id === execution.model);
                  const executionData = execution.result ? JSON.parse(execution.result) : null;
                  
                  return (
                    <motion.div
                      key={execution.id}
                      whileHover={{ scale: 1.01 }}
                      className="group relative border border-border/50 rounded-lg p-3 hover-elevate cursor-pointer"
                      onClick={() => copyHistoryCommand(execution.terminalCommand)}
                      data-testid={`history-item-${execution.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Model and Time */}
                          <div className="flex items-center gap-2 mb-2">
                            {modelInfo && (
                              <Badge variant="outline" className="text-xs">
                                {modelInfo.name}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(execution.createdAt).toLocaleString()}
                            </div>
                          </div>

                          {/* Prompt Preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {execution.prompt}
                          </p>

                          {/* Terminal Command */}
                          <div className="bg-card/50 border border-accent/20 rounded px-2 py-1 font-mono text-xs text-accent overflow-x-auto">
                            {execution.terminalCommand}
                          </div>
                        </div>

                        {/* Copy Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyHistoryCommand(execution.terminalCommand);
                          }}
                          data-testid={`button-copy-history-${execution.id}`}
                        >
                          {copiedHistory === execution.terminalCommand ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Learn More Dialog */}
      <Dialog open={!!learnMoreModel} onOpenChange={(open) => !open && setLearnMoreModel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-model-details">
          {learnMoreModel && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundImage: `url(${limeBg})`, backgroundSize: 'cover' }}>
                    <learnMoreModel.icon className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{learnMoreModel.name}</DialogTitle>
                    <DialogDescription className="text-base">{learnMoreModel.provider}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background via-background to-primary/5 p-6 mb-6">
                <div className="absolute inset-0 overflow-hidden opacity-30">
                  {[...Array(25)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute h-px bg-gradient-to-r from-transparent via-${learnMoreModel.glowColor}-500 to-transparent`}
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `-100%`,
                        width: `${Math.random() * 300 + 150}px`,
                      }}
                      animate={{
                        left: ['0%', '200%'],
                      }}
                      transition={{
                        duration: Math.random() * 2.5 + 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={`v-${i}`}
                      className={`absolute w-px bg-gradient-to-b from-transparent via-${learnMoreModel.glowColor}-500 to-transparent`}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-100%`,
                        height: `${Math.random() * 300 + 150}px`,
                      }}
                      animate={{
                        top: ['0%', '200%'],
                      }}
                      transition={{
                        duration: Math.random() * 3.5 + 2.5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-2">Model Architecture</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {learnMoreModel.longDesc}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latency</p>
                      <p className="text-sm font-mono font-semibold">{learnMoreModel.performanceMetrics.latency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Throughput</p>
                      <p className="text-sm font-mono font-semibold">{learnMoreModel.performanceMetrics.throughput}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                      <p className="text-sm font-mono font-semibold">{learnMoreModel.performanceMetrics.accuracy}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Technical Specifications
                </h3>
                <div className="grid gap-4">
                  {learnMoreModel.technicalSpecs.map((spec, index) => {
                    const SpecIcon = spec.icon;
                    return (
                      <motion.div
                        key={spec.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-l-4 border-l-primary">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <SpecIcon className={`h-4 w-4 ${learnMoreModel.iconColor}`} />
                              <CardTitle className="text-base">{spec.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {spec.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Production Use Cases
                </h3>
                <div className="grid gap-2">
                  {learnMoreModel.useCases.map((useCase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${learnMoreModel.iconBg} flex-shrink-0 mt-0.5`}>
                        <span className={`text-xs font-bold ${learnMoreModel.iconColor}`}>{index + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">{useCase}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {learnMoreModel.speed}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {learnMoreModel.cost}
                  </Badge>
                </div>
                <Button
                  onClick={() => setLearnMoreModel(null)}
                  data-testid="button-close-dialog"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

