import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, MessageSquare, AlertTriangle, Cpu, X, Shield, Lock, Eye, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataStream {
  id: string;
  targetCase: number;
  progress: number;
}

interface UseCase {
  icon: typeof TrendingUp;
  title: string;
  shortDesc: string;
  color: string;
  borderColor: string;
  iconColor: string;
  angle: number;
  detailedTitle: string;
  detailedDescription: string;
  features: string[];
  zkBenefits: string[];
}

export function UseCasesVisualization() {
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [activeCase, setActiveCase] = useState<number | null>(null);
  const [selectedCase, setSelectedCase] = useState<UseCase | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeoutIds: NodeJS.Timeout[] = [];

    // Generate data streams to each use case
    const streamInterval = setInterval(() => {
      const targetCase = Math.floor(Math.random() * 3);
      const newStream: DataStream = {
        id: Math.random().toString(36).substr(2, 9),
        targetCase,
        progress: 0
      };
      
      setStreams(prev => [...prev.slice(-8), newStream]);
    }, 800);

    // Animate stream progress
    const progressInterval = setInterval(() => {
      setStreams(prev => prev.map(stream => ({
        ...stream,
        progress: Math.min(stream.progress + 1.2, 100)
      })).filter(s => s.progress < 100));
    }, 25);

    // Pulse active use cases
    const pulseInterval = setInterval(() => {
      setActiveCase(Math.floor(Math.random() * 3));
      const timeoutId = setTimeout(() => setActiveCase(null), 1000);
      timeoutIds.push(timeoutId);
    }, 2000);

    return () => {
      clearInterval(streamInterval);
      clearInterval(progressInterval);
      clearInterval(pulseInterval);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [prefersReducedMotion]);

  const useCases = useMemo<UseCase[]>(() => [
    {
      icon: TrendingUp,
      title: "Price Prediction",
      shortDesc: "Crypto Market Forecasts",
      color: "from-purple-500 via-violet-500 to-blue-500",
      borderColor: "border-purple-500/50",
      iconColor: "text-purple-400",
      angle: 0,
      detailedTitle: "Private Price Prediction Engine",
      detailedDescription: "Leverage AI-powered market analysis while maintaining complete privacy through zero-knowledge proofs. Our decentralized oracle network processes cryptocurrency price data without exposing your trading strategies or portfolio positions.",
      features: [
        "Real-time multi-asset price forecasting using advanced neural networks",
        "Historical pattern recognition across 100+ cryptocurrency pairs",
        "Sentiment-weighted price predictions from social and on-chain data",
        "Autonomous trading signals for DeFi protocols and smart contracts",
        "Risk-adjusted confidence scores for each prediction"
      ],
      zkBenefits: [
        "Query encryption ensures your trading interests remain private",
        "Zero-knowledge proofs verify AI computations without revealing model weights",
        "Decentralized consensus prevents single-point manipulation",
        "Cryptographic commitments protect proprietary trading algorithms"
      ]
    },
    {
      icon: MessageSquare,
      title: "Sentiment Analysis",
      shortDesc: "Social Trend Intelligence",
      color: "from-emerald-500 via-green-500 to-teal-500",
      borderColor: "border-emerald-500/50",
      iconColor: "text-emerald-400",
      angle: 120,
      detailedTitle: "Privacy-Preserving Sentiment Analysis",
      detailedDescription: "Harness the power of social intelligence without compromising user privacy. Our ZK-enabled sentiment engine analyzes millions of data points across platforms while keeping individual queries and results completely confidential.",
      features: [
        "Multi-platform sentiment aggregation (Twitter, Reddit, Discord, Telegram)",
        "AI-powered emotion detection and trend forecasting",
        "Real-time community sentiment shifts and viral prediction",
        "Token-specific social metrics and influencer impact analysis",
        "Automated narrative tracking for market-moving events"
      ],
      zkBenefits: [
        "Anonymous query submission protects your research interests",
        "Encrypted result delivery ensures competitors can't track your insights",
        "Zero-knowledge proofs verify data authenticity without revealing sources",
        "Privacy-first architecture prevents tracking of sentiment queries"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      shortDesc: "Multi-Factor Risk Engine",
      color: "from-orange-500 via-red-500 to-pink-500",
      borderColor: "border-orange-500/50",
      iconColor: "text-orange-400",
      angle: 240,
      detailedTitle: "Confidential Risk Assessment Protocol",
      detailedDescription: "Advanced multi-factor risk modeling that preserves privacy while delivering institutional-grade analysis. Perfect for DeFi lending platforms, insurance protocols, and portfolio management that require confidential risk evaluation.",
      features: [
        "Smart contract vulnerability scanning and exploit prediction",
        "Liquidity risk assessment for DeFi pools and lending protocols",
        "Counterparty credit analysis using on-chain behavior patterns",
        "Portfolio correlation analysis and tail-risk modeling",
        "Real-time risk score updates based on market volatility"
      ],
      zkBenefits: [
        "Risk queries remain confidential to protect strategic positions",
        "Zero-knowledge proofs verify risk models without exposing algorithms",
        "Private portfolio analysis prevents information leakage",
        "Encrypted results ensure competitive intelligence stays secure"
      ]
    },
  ], []);

  const getUseCasePosition = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const radius = 32;
    return {
      x: 50 + radius * Math.cos(rad - Math.PI / 2),
      y: 50 + radius * Math.sin(rad - Math.PI / 2)
    };
  };

  return (
    <>
      <div 
        className="relative w-full h-[600px] bg-gradient-to-br from-card/60 via-background/90 to-card/60 rounded-xl border-2 border-primary/40 overflow-hidden backdrop-blur-md shadow-2xl"
        role="application"
        aria-label="Interactive visualization showing AI oracle data flowing from central processing engine to three use cases"
      >
        {/* Enhanced Background */}
        <div className="absolute inset-0 cyber-grid opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 scan-lines opacity-15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9945FF" stopOpacity="0.8">
                <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#14F195" stopOpacity="0.8">
                <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {useCases.map((useCase, index) => {
            const pos = getUseCasePosition(useCase.angle);
            return (
              <g key={index}>
                <line
                  x1="50"
                  y1="50"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#lineGradient1)"
                  strokeWidth="0.3"
                  filter="url(#glow)"
                  className="opacity-60"
                />
              </g>
            );
          })}
        </svg>

        {/* Central AI Engine */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.08, 1],
              rotate: [0, 360]
            }}
            transition={{
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
            className="relative"
          >
            {/* Multi-layer glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 blur-3xl rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/40 to-primary/40 blur-2xl rounded-full animate-pulse" />
            
            {/* Central Node */}
            <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 backdrop-blur-md border-4 border-primary/60 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-background/80 to-card/80 backdrop-blur-sm" />
              <Cpu className="relative h-14 w-14 text-primary drop-shadow-lg" />
            </div>
          </motion.div>
          
          {/* Enhanced Label */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-4 py-1.5 rounded-full bg-card/90 backdrop-blur-md border-2 border-primary/50 shadow-lg">
              <div className="font-mono text-xs text-primary flex items-center gap-2 font-bold">
                <Zap className="h-3 w-3" />
                <span className="opacity-70">[</span>
                <span className="uppercase tracking-wider">AI_ORACLE_ENGINE</span>
                <span className="opacity-70">]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Data Streams */}
        <AnimatePresence>
          {streams.map((stream) => {
            const targetPos = getUseCasePosition(useCases[stream.targetCase].angle);
            const startX = 50;
            const startY = 50;
            const currentX = startX + (targetPos.x - startX) * (stream.progress / 100);
            const currentY = startY + (targetPos.y - startY) * (stream.progress / 100);
            
            return (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ opacity: { duration: 1, repeat: Infinity }, scale: { duration: 0.8, repeat: Infinity } }}
                style={{
                  position: 'absolute',
                  left: `${currentX}%`,
                  top: `${currentY}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-2xl shadow-primary/50" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Use Case Nodes */}
        {useCases.map((useCase, index) => {
          const pos = getUseCasePosition(useCase.angle);
          const isActive = activeCase === index;
          
          return (
            <div
              key={index}
              className="absolute cursor-pointer group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setSelectedCase(useCase)}
              data-testid={`button-usecase-${useCase.title.toLowerCase()}`}
            >
              <motion.div
                animate={prefersReducedMotion ? {} : {
                  scale: isActive ? 1.15 : 1,
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Enhanced Multi-layer Glow */}
                <div className={`absolute -inset-6 bg-gradient-to-r ${useCase.color} blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${isActive ? 'opacity-60 animate-pulse' : ''}`} />
                <div className={`absolute -inset-4 bg-gradient-to-r ${useCase.color} blur-xl opacity-20 group-hover:opacity-50 transition-opacity ${isActive ? 'opacity-40' : ''}`} />
                
                {/* Node Container */}
                <div className={`relative h-32 w-32 rounded-2xl bg-gradient-to-br ${useCase.color} opacity-95 backdrop-blur-sm border-3 ${useCase.borderColor} shadow-2xl flex flex-col items-center justify-center p-4 transition-all group-hover:border-opacity-100 group-hover:shadow-primary/50`}>
                  <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-background/40 to-card/40 backdrop-blur-sm" />
                  
                  {/* Icon with enhanced styling */}
                  <div className="relative mb-2">
                    <div className={`absolute inset-0 ${useCase.iconColor} blur-md opacity-50`} />
                    <useCase.icon className={`relative h-10 w-10 ${useCase.iconColor} drop-shadow-lg`} />
                  </div>
                  
                  {/* Title */}
                  <div className="relative font-mono text-[10px] text-accent font-bold text-center uppercase tracking-wider leading-tight mb-1">
                    {useCase.title}
                  </div>
                  
                  {/* Description */}
                  <div className="relative font-mono text-[9px] text-muted-foreground text-center leading-tight mb-2">
                    {useCase.shortDesc}
                  </div>
                  
                  {/* Details Button */}
                  <div className="relative mt-auto">
                    <div className="px-2 py-1 rounded-md bg-accent/20 border border-accent/40 text-[9px] font-mono text-accent whitespace-nowrap font-bold uppercase tracking-wider hover:bg-accent/30 transition-all">
                      [DETAILS]
                    </div>
                  </div>
                  
                  {/* Click hint */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-2 py-0.5 rounded-full bg-accent/90 text-[8px] font-mono text-background whitespace-nowrap font-semibold">
                      CLICK_TO_LEARN
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Enhanced Legend */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-4 rounded-full bg-card/90 backdrop-blur-md border-2 border-primary/30 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/50" />
            <span className="font-mono text-xs text-muted-foreground font-semibold">Data Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground font-semibold">AI Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-lg shadow-accent/50" />
            <span className="font-mono text-xs text-muted-foreground font-semibold">Use Case</span>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-background to-card border-2 border-primary/50">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${selectedCase?.color} opacity-90 flex items-center justify-center border-2 ${selectedCase?.borderColor} shadow-xl`}>
                {selectedCase && <selectedCase.icon className={`h-8 w-8 ${selectedCase.iconColor}`} />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {selectedCase?.detailedTitle}
                </DialogTitle>
                <div className="font-mono text-xs text-accent uppercase tracking-wider mt-1">
                  {selectedCase?.title}
                </div>
              </div>
            </div>
            <DialogDescription className="text-base text-foreground leading-relaxed">
              {selectedCase?.detailedDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Features Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-mono text-sm font-bold text-accent uppercase tracking-wider">
                  Core Features
                </h3>
              </div>
              <ul className="space-y-2 pl-7">
                {selectedCase?.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ZK Benefits Section */}
            <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-mono text-sm font-bold text-primary uppercase tracking-wider">
                  Zero-Knowledge Privacy Benefits
                </h3>
              </div>
              <ul className="space-y-2 pl-7">
                {selectedCase?.zkBenefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Lock className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Call to Action */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-accent/30">
              <Eye className="h-5 w-5 text-accent flex-shrink-0" />
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-accent font-bold">PRIVACY_FIRST:</span> All queries are encrypted end-to-end, verified with zero-knowledge proofs, and processed by our decentralized oracle network.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

