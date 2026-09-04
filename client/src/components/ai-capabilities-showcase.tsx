import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, MessageSquare, AlertTriangle, Shield, Zap, Lock, BarChart3, Brain, Activity, X, Database, Cpu, Network, Clock, CheckCircle2, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Capability {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  features: string[];
  metrics: { label: string; value: string; icon: typeof Zap }[];
  detailedSpecs: {
    architecture: string[];
    models: string[];
    dataProcessing: string[];
    performance: { metric: string; value: string }[];
    useCases: string[];
  };
}

interface Particle {
  id: number;
  path: number; // 0, 1, or 2 for the three connection paths
  progress: number;
  color: string;
}

export function AICapabilitiesShowcase() {
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const capabilities: Capability[] = [
    {
      icon: TrendingUp,
      title: "Price Prediction",
      description: "Advanced AI forecasting for cryptocurrency markets with real-time analysis and trend detection",
      color: "from-purple-500 via-violet-500 to-blue-500",
      iconColor: "text-purple-400",
      borderColor: "border-purple-400/40",
      bgColor: "bg-purple-400/5",
      features: [
        "Multi-asset price forecasting",
        "Historical pattern recognition",
        "Sentiment-weighted predictions",
        "Risk-adjusted confidence scores"
      ],
      metrics: [
        { label: "Accuracy", value: "94.2%", icon: BarChart3 },
        { label: "Assets", value: "100+", icon: Activity },
        { label: "Speed", value: "~2.5s", icon: Zap }
      ],
      detailedSpecs: {
        architecture: [
          "Hybrid LSTM-Transformer neural network with attention mechanisms",
          "Ensemble of 3 AI models: GPT-4o, Gemini 2.5 Flash, Claude Sonnet 4.5",
          "Real-time CoinGecko API integration with 60-second TTL caching",
          "Multi-layer consensus aggregation with weighted voting"
        ],
        models: [
          "GPT-4o: OpenAI's flagship model for market analysis",
          "Gemini 2.5 Flash: Google's optimized prediction engine",
          "Claude Sonnet 4.5: Anthropic's reasoning model for trend detection"
        ],
        dataProcessing: [
          "Historical price data with 1-year lookback window",
          "Technical indicators: RSI, MACD, Bollinger Bands, Moving Averages",
          "On-chain metrics: Transaction volume, wallet activity, exchange flows",
          "Market sentiment integration from social media and news sources"
        ],
        performance: [
          { metric: "Prediction Accuracy", value: "94.2% on 24h forecasts" },
          { metric: "Response Time", value: "2.5s average (including ZK proof)" },
          { metric: "Supported Assets", value: "100+ cryptocurrencies" },
          { metric: "Data Freshness", value: "Real-time updates every 60s" }
        ],
        useCases: [
          "Automated trading signal generation for DeFi protocols",
          "Portfolio rebalancing recommendations based on AI forecasts",
          "Risk management for crypto hedge funds and market makers",
          "Price alert systems with predictive confidence intervals"
        ]
      }
    },
    {
      icon: MessageSquare,
      title: "Sentiment Analysis",
      description: "Real-time social intelligence across multiple platforms with emotion detection and trend forecasting",
      color: "from-emerald-500 via-green-500 to-teal-500",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-400/40",
      bgColor: "bg-emerald-400/5",
      features: [
        "Multi-platform aggregation",
        "Emotion detection engine",
        "Viral trend prediction",
        "Influencer impact analysis"
      ],
      metrics: [
        { label: "Sources", value: "5+", icon: Activity },
        { label: "Updates", value: "Real-time", icon: Zap },
        { label: "Coverage", value: "Global", icon: BarChart3 }
      ],
      detailedSpecs: {
        architecture: [
          "Natural Language Processing pipeline with transformer-based sentiment scoring",
          "Multi-source aggregation engine with duplicate detection",
          "Emotion classification using fine-tuned BERT models",
          "Viral trend prediction with graph neural networks"
        ],
        models: [
          "GPT-4o: Advanced context understanding for nuanced sentiment",
          "Gemini 2.5 Flash: Real-time social media stream processing",
          "Claude Sonnet 4.5: Emotion detection and sarcasm recognition"
        ],
        dataProcessing: [
          "Twitter/X API integration for crypto influencer tracking",
          "Reddit scraping with subreddit-specific weighting",
          "Discord and Telegram community sentiment monitoring",
          "News aggregation from 50+ crypto media sources",
          "Influencer impact scoring based on follower engagement"
        ],
        performance: [
          { metric: "Data Sources", value: "5+ platforms (Twitter, Reddit, Discord, Telegram, News)" },
          { metric: "Processing Speed", value: "Real-time stream analysis" },
          { metric: "Sentiment Accuracy", value: "91.7% on labeled test set" },
          { metric: "Coverage", value: "Global multi-language support" }
        ],
        useCases: [
          "Community sentiment tracking for new token launches",
          "Influencer impact analysis for marketing campaigns",
          "Early detection of viral trends and meme coin momentum",
          "Reputation monitoring for DeFi protocols and DAOs",
          "Social trading signals based on collective sentiment shifts"
        ]
      }
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: "Multi-factor risk modeling for DeFi protocols, smart contracts, and portfolio management",
      color: "from-orange-500 via-red-500 to-pink-500",
      iconColor: "text-orange-400",
      borderColor: "border-orange-400/40",
      bgColor: "bg-orange-400/5",
      features: [
        "Smart contract vulnerability scanning",
        "Liquidity risk assessment",
        "Portfolio correlation analysis",
        "Real-time risk score updates"
      ],
      metrics: [
        { label: "Protocols", value: "500+", icon: Activity },
        { label: "Precision", value: "96.8%", icon: BarChart3 },
        { label: "Monitoring", value: "24/7", icon: Zap }
      ],
      detailedSpecs: {
        architecture: [
          "Multi-factor risk scoring engine with probabilistic modeling",
          "Smart contract static analysis using formal verification",
          "Real-time liquidity monitoring across 20+ DEXes",
          "Portfolio correlation matrix with Monte Carlo simulations"
        ],
        models: [
          "GPT-4o: Smart contract vulnerability pattern detection",
          "Gemini 2.5 Flash: Real-time protocol health monitoring",
          "Claude Sonnet 4.5: Risk narrative generation and mitigation strategies"
        ],
        dataProcessing: [
          "Smart contract bytecode analysis and decompilation",
          "Historical exploit database with 10,000+ incidents",
          "TVL (Total Value Locked) monitoring across DeFi protocols",
          "Liquidity depth analysis and slippage modeling",
          "Wallet concentration risk for rug pull detection",
          "Audit report aggregation from major security firms"
        ],
        performance: [
          { metric: "Protocols Monitored", value: "500+ DeFi protocols across 10 chains" },
          { metric: "Risk Precision", value: "96.8% accuracy on historical exploits" },
          { metric: "Alert Latency", value: "<5s for critical vulnerabilities" },
          { metric: "Coverage", value: "24/7 continuous monitoring" }
        ],
        useCases: [
          "Pre-investment due diligence for venture capital funds",
          "Portfolio risk assessment for institutional investors",
          "Smart contract audit prioritization for security firms",
          "Insurance underwriting for DeFi coverage protocols",
          "Treasury management risk analysis for DAOs",
          "Automated circuit breakers for high-risk exposure events"
        ]
      }
    }
  ];

  // Initialize particles for animation
  useEffect(() => {
    const initialParticles: Particle[] = [];
    const colors = ['rgb(168, 85, 247)', 'rgb(52, 211, 153)', 'rgb(251, 146, 60)'];
    
    // Create 15 particles across 3 paths (5 per path)
    for (let pathIdx = 0; pathIdx < 3; pathIdx++) {
      for (let i = 0; i < 5; i++) {
        initialParticles.push({
          id: pathIdx * 5 + i,
          path: pathIdx,
          progress: i * 0.2, // Evenly space them along the path
          color: colors[pathIdx]
        });
      }
    }
    
    setParticles(initialParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        progress: (p.progress + 0.005) % 1 // Move particles along path
      })));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  // Calculate positions for circular layout
  const centerX = 400;
  const centerY = 300;
  const radius = 180;
  
  const getNodePosition = (index: number) => {
    // Position nodes in a circle (starting from top, going clockwise)
    const angle = (index * 120 - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Get curved path between two nodes
  const getCurvedPath = (from: number, to: number) => {
    const start = getNodePosition(from);
    const end = getNodePosition(to);
    
    // Control point for curved path (pulled toward center)
    const controlX = centerX;
    const controlY = centerY;
    
    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
  };

  // Get particle position along path
  const getParticlePosition = (pathIdx: number, progress: number) => {
    const from = pathIdx;
    const to = (pathIdx + 1) % 3;
    const start = getNodePosition(from);
    const end = getNodePosition(to);
    const control = { x: centerX, y: centerY };
    
    // Quadratic Bezier curve calculation
    const t = progress;
    const x = (1-t)*(1-t)*start.x + 2*(1-t)*t*control.x + t*t*end.x;
    const y = (1-t)*(1-t)*start.y + 2*(1-t)*t*control.y + t*t*end.y;
    
    return { x, y };
  };

  return (
    <div className="space-y-8">
      {/* Interactive Instructions Banner */}
      <div className="mb-4 p-4 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-lg animate-pulse" />
            <div className="relative w-10 h-10 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center">
              <span className="text-xl">☝️</span>
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Interactive Network Visualization
            </h4>
            <p className="text-xs text-muted-foreground">
              Click on any oracle node to view detailed technical specifications, AI models, and real-world use cases
            </p>
          </div>
        </div>
      </div>

      {/* Orbital Network Graph */}
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-accent/30 bg-gradient-to-br from-black via-purple-950/20 to-black backdrop-blur-sm" style={{ height: '600px' }}>
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(0, 217, 255)" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <motion.rect 
              width="100%" 
              height="100%" 
              fill="url(#grid)"
              animate={{ x: [0, 40], y: [0, 40] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        {/* Floating ambient particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-accent/40"
              initial={{ 
                x: Math.random() * 800, 
                y: Math.random() * 600,
                opacity: 0.2
              }}
              animate={{
                x: [null, Math.random() * 800],
                y: [null, Math.random() * 600],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />

        <svg className="relative w-full h-full" viewBox="0 0 800 600">
          <defs>
            {/* Glowing gradients for paths */}
            <linearGradient id="path-gradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="path-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="path-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0.4" />
            </linearGradient>
            
            {/* Node gradients */}
            <radialGradient id="node-gradient-purple">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="rgb(109, 40, 217)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(88, 28, 135)" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="node-gradient-green">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(5, 150, 105)" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="node-gradient-orange">
              <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="rgb(249, 115, 22)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(234, 88, 12)" stopOpacity="0.1" />
            </radialGradient>
            
            {/* Glow filters */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Central consensus hub with better design */}
          <circle
            cx={centerX}
            cy={centerY}
            r="50"
            fill="url(#node-gradient-purple)"
            opacity="0.3"
            filter="url(#glow-strong)"
          />
          <motion.circle
            cx={centerX}
            cy={centerY}
            r="45"
            fill="none"
            stroke="rgb(0, 217, 255)"
            strokeWidth="2"
            strokeDasharray="8 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            opacity="0.6"
          />
          <motion.circle
            cx={centerX}
            cy={centerY}
            r="35"
            fill="none"
            stroke="rgb(255, 0, 128)"
            strokeWidth="2"
            strokeDasharray="5 3"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            opacity="0.6"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="25"
            fill="rgba(0, 0, 0, 0.5)"
            stroke="rgb(0, 217, 255)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          
          {/* Central text */}
          <text x={centerX} y={centerY - 5} textAnchor="middle" className="text-xs font-mono font-bold" fill="rgb(0, 217, 255)">
            CONSENSUS
          </text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" className="text-[10px] font-mono" fill="rgb(255, 0, 128)">
            Multi-AI
          </text>

          {/* Connection paths */}
          {[0, 1, 2].map(pathIdx => (
            <motion.path
              key={pathIdx}
              d={getCurvedPath(pathIdx, (pathIdx + 1) % 3)}
              fill="none"
              stroke={`url(#path-gradient-${pathIdx})`}
              strokeWidth="3"
              opacity={0.4}
              filter="url(#glow)"
              animate={{
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: pathIdx * 0.5
              }}
            />
          ))}

          {/* Animated particles */}
          {particles.map(particle => {
            const pos = getParticlePosition(particle.path, particle.progress);
            return (
              <circle
                key={particle.id}
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill={particle.color}
                filter="url(#glow)"
                opacity="0.9"
              />
            );
          })}

          {/* Oracle nodes */}
          {capabilities.map((capability, index) => {
            const pos = getNodePosition(index);
            const Icon = capability.icon;
            const isHovered = hoveredNode === index;
            const gradientId = index === 0 ? 'node-gradient-purple' : index === 1 ? 'node-gradient-green' : 'node-gradient-orange';
            const primaryColor = index === 0 ? 'rgb(168, 85, 247)' : index === 1 ? 'rgb(52, 211, 153)' : 'rgb(251, 146, 60)';
            const secondaryColor = index === 0 ? 'rgb(139, 92, 246)' : index === 1 ? 'rgb(16, 185, 129)' : 'rgb(249, 115, 22)';
            
            return (
              <g
                key={index}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredNode(index)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedCapability(capability)}
              >
                {/* Outer pulsing glow ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="65"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="1"
                  opacity="0"
                  animate={{
                    opacity: isHovered ? [0, 0.5, 0] : [0, 0.2, 0],
                    r: isHovered ? [65, 75, 65] : [65, 70, 65]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  filter="url(#glow-strong)"
                />
                
                {/* Large gradient background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="55"
                  fill={`url(#${gradientId})`}
                  filter="url(#glow-strong)"
                />
                
                {/* Main node circle with gradient border */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="50"
                  fill="rgba(0, 0, 0, 0.6)"
                  stroke={primaryColor}
                  strokeWidth="3"
                  filter="url(#glow)"
                  animate={{
                    scale: isHovered ? 1.08 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                />
                
                {/* Inner decorative ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="42"
                  fill="none"
                  stroke={secondaryColor}
                  strokeWidth="1"
                  opacity="0.4"
                  strokeDasharray="4 2"
                />
                
                {/* Icon background circle with gradient */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="28"
                  fill={`url(#${gradientId})`}
                  stroke={primaryColor}
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                
                {/* We'll add the icon as foreignObject for proper rendering */}
                <foreignObject
                  x={pos.x - 12}
                  y={pos.y - 12}
                  width="24"
                  height="24"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <Icon className={`h-6 w-6 ${capability.iconColor}`} />
                  </div>
                </foreignObject>
                
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 70}
                  textAnchor="middle"
                  className={`text-sm font-bold ${capability.iconColor} fill-current`}
                  style={{ pointerEvents: 'none' }}
                >
                  {capability.title}
                </text>
                
                {/* Click indicator with animation */}
                <motion.g
                  animate={{
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ pointerEvents: 'none' }}
                >
                  <rect
                    x={pos.x - 40}
                    y={pos.y + 78}
                    width="80"
                    height="18"
                    rx="9"
                    fill="rgba(0, 0, 0, 0.7)"
                    stroke={primaryColor}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 90}
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill={primaryColor}
                  >
                    ⊙ CLICK TO EXPLORE
                  </text>
                </motion.g>
                
                {/* Processing indicator */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="52"
                  fill="none"
                  stroke={capability.iconColor.replace('text-', '')}
                  strokeWidth="1"
                  strokeDasharray="8 4"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10 - index * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  opacity="0.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-accent/30 rounded-lg p-3 space-y-2">
          <div className="text-xs font-bold text-accent mb-2">Data Flow Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-xs text-muted-foreground">Price Data Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Sentiment Data Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-xs text-muted-foreground">Risk Data Stream</span>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-accent/30 rounded-lg p-3">
          <div className="text-xs font-bold text-accent mb-2">Network Status</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Active Oracles</span>
              <span className="text-xs font-bold text-primary">3/3</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Data Streams</span>
              <span className="text-xs font-bold text-accent">{particles.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Consensus</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 border-accent/30 bg-accent/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse" />
                  <div className="relative w-12 h-12 rounded-lg border-2 border-accent/40 bg-accent/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    Privacy-Preserving AI Processing
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    All queries encrypted end-to-end • Zero-knowledge proof verification • Decentralized consensus
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">AI Models</div>
                  <div className="text-lg font-bold text-primary">3</div>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-card/50 border border-accent/20">
                  <div className="text-xs text-muted-foreground mb-1">Consensus</div>
                  <div className="text-lg font-bold text-accent">Multi-AI</div>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-card/50 border border-blue-400/20">
                  <div className="text-xs text-muted-foreground mb-1">Privacy</div>
                  <div className="text-lg font-bold text-blue-400">256-bit</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Specs Modal */}
      <Dialog open={!!selectedCapability} onOpenChange={() => setSelectedCapability(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCapability && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className={`w-12 h-12 rounded-lg border-2 ${selectedCapability.borderColor} ${selectedCapability.bgColor} flex items-center justify-center`}>
                    <selectedCapability.icon className={`h-6 w-6 ${selectedCapability.iconColor}`} />
                  </div>
                  <span>{selectedCapability.title} Oracle</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedCapability.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Architecture */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Server className={`h-5 w-5 ${selectedCapability.iconColor}`} />
                    <h3 className="text-lg font-bold">System Architecture</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    {selectedCapability.detailedSpecs.architecture.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 ${selectedCapability.iconColor} flex-shrink-0`} />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Models */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className={`h-5 w-5 ${selectedCapability.iconColor}`} />
                    <h3 className="text-lg font-bold">AI Models Ensemble</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    {selectedCapability.detailedSpecs.models.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Cpu className={`h-4 w-4 mt-0.5 ${selectedCapability.iconColor} flex-shrink-0`} />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Processing */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className={`h-5 w-5 ${selectedCapability.iconColor}`} />
                    <h3 className="text-lg font-bold">Data Processing Pipeline</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    {selectedCapability.detailedSpecs.dataProcessing.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Network className={`h-4 w-4 mt-0.5 ${selectedCapability.iconColor} flex-shrink-0`} />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className={`h-5 w-5 ${selectedCapability.iconColor}`} />
                    <h3 className="text-lg font-bold">Performance Metrics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    {selectedCapability.detailedSpecs.performance.map((item, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${selectedCapability.borderColor} ${selectedCapability.bgColor}`}>
                        <div className="text-xs text-muted-foreground mb-1">{item.metric}</div>
                        <div className={`text-xl font-bold ${selectedCapability.iconColor}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-5 w-5 ${selectedCapability.iconColor}`} />
                    <h3 className="text-lg font-bold">Real-World Use Cases</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    {selectedCapability.detailedSpecs.useCases.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Activity className={`h-4 w-4 mt-0.5 ${selectedCapability.iconColor} flex-shrink-0`} />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Badge */}
                <div className={`p-4 rounded-lg border-2 ${selectedCapability.borderColor} ${selectedCapability.bgColor} flex items-center gap-3`}>
                  <Lock className={`h-6 w-6 ${selectedCapability.iconColor}`} />
                  <div>
                    <div className="font-bold text-sm">Zero-Knowledge Proof Verified</div>
                    <div className="text-xs text-muted-foreground">All computations are cryptographically verified without revealing private data</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

