import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Unlock, CheckCircle, Network, Cpu, Database, Key } from "lucide-react";

interface DataPacket {
  id: string;
  x: number;
  y: number;
  stage: 'input' | 'processing' | 'verification' | 'output';
  progress: number;
}

export function NetworkVisualization() {
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
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
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) return;
    // Generate flowing data packets (constrained to middle area)
    const packetInterval = setInterval(() => {
      const newPacket: DataPacket = {
        id: Math.random().toString(36).substr(2, 9),
        x: 0,
        y: 30 + Math.random() * 40, // Constrain to 30-70% (middle area)
        stage: 'input',
        progress: 0,
      };
      
      setPackets(prev => [...prev.slice(-8), newPacket]);
    }, 1500);

    // Animate packet progress
    const progressInterval = setInterval(() => {
      setPackets(prev => prev.map(packet => {
        const newProgress = Math.min(packet.progress + 0.8, 100);
        const newStage: DataPacket['stage'] = 
          newProgress < 25 ? 'input' : 
          newProgress < 60 ? 'processing' :
          newProgress < 85 ? 'verification' : 'output';
        
        return {
          ...packet,
          progress: newProgress,
          stage: newStage
        };
      }).filter(p => p.progress < 100));
    }, 50);

    // Pulse oracle nodes
    const nodeInterval = setInterval(() => {
      const randomNodes = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6));
      setActiveNodes(randomNodes);
    }, 2000);

    return () => {
      clearInterval(packetInterval);
      clearInterval(progressInterval);
      clearInterval(nodeInterval);
    };
  }, []);

  const oracleNodes = [
    { x: 45, y: 35, name: "Oracle-1" },
    { x: 55, y: 35, name: "Oracle-2" },
    { x: 50, y: 42, name: "Oracle-3" },
    { x: 45, y: 50, name: "Oracle-4" },
    { x: 55, y: 50, name: "Oracle-5" },
    { x: 50, y: 56, name: "Oracle-6" },
  ];

  return (
    <div 
      className="relative w-full h-[500px] bg-gradient-to-br from-card/50 via-background/80 to-card/50 rounded-xl border border-primary/30 overflow-hidden backdrop-blur-sm"
      role="img"
      aria-label="Animated network visualization showing encrypted data flowing from private user queries through decentralized oracle nodes with zero-knowledge proof verification to verified encrypted results"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 scan-lines opacity-10" aria-hidden="true" />
      
      {/* SVG Network Diagram */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection Lines */}
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(153, 69, 255)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="rgb(20, 241, 149)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(153, 69, 255)" stopOpacity="0.2" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Input to Oracle Network Lines */}
        {oracleNodes.map((node, i) => (
          <motion.line
            key={`input-${i}`}
            x1="10"
            y1="45"
            x2={node.x}
            y2={node.y}
            stroke="url(#lineGradient1)"
            strokeWidth="0.2"
            strokeDasharray="2,1"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: activeNodes.includes(i) ? 0.8 : 0.3,
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2
            }}
          />
        ))}

        {/* Inter-Oracle Network Lines */}
        {oracleNodes.map((node, i) => 
          oracleNodes.slice(i + 1).map((targetNode, j) => (
            <motion.line
              key={`oracle-${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="rgb(153, 69, 255)"
              strokeWidth="0.15"
              strokeOpacity="0.3"
              strokeDasharray="1,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          ))
        )}

        {/* Oracle to Output Lines */}
        {oracleNodes.map((node, i) => (
          <motion.line
            key={`output-${i}`}
            x1={node.x}
            y1={node.y}
            x2="90"
            y2="45"
            stroke="url(#lineGradient1)"
            strokeWidth="0.2"
            strokeDasharray="2,1"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: activeNodes.includes(i) ? 0.6 : 0.2,
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2 + 1
            }}
          />
        ))}
      </svg>

      {/* Animated Data Packets */}
      <AnimatePresence>
        {packets.map((packet) => {
          const x = packet.progress;
          const y = packet.y;
          
          return (
            <motion.div
              key={packet.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: packet.stage === 'input' ? 'rgb(153, 69, 255)' :
                           packet.stage === 'processing' ? 'rgb(20, 241, 149)' :
                           packet.stage === 'verification' ? 'rgb(59, 130, 246)' :
                           'rgb(20, 241, 149)',
                boxShadow: `0 0 10px ${
                  packet.stage === 'input' ? 'rgb(153, 69, 255)' :
                  packet.stage === 'processing' ? 'rgb(20, 241, 149)' :
                  packet.stage === 'verification' ? 'rgb(59, 130, 246)' :
                  'rgb(20, 241, 149)'
                }`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            />
          );
        })}
      </AnimatePresence>

      {/* Privacy Start Point (Left) */}
      <motion.div
        className="absolute left-[8%] top-[45%] -translate-y-1/2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-2xl animate-pulse" />
          <div className="relative bg-card/90 backdrop-blur-sm border border-primary/50 rounded-xl p-4 w-32">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-primary/20 blur-lg"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Lock className="relative h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-mono text-xs font-bold text-primary">PRIVATE</div>
                <div className="font-mono text-[10px] text-muted-foreground">User Query</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Oracle Network Nodes (Center) */}
      {oracleNodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="relative group">
            <motion.div
              className="absolute inset-0 blur-xl"
              animate={{
                background: activeNodes.includes(i)
                  ? 'rgba(20, 241, 149, 0.4)'
                  : 'rgba(153, 69, 255, 0.2)',
                scale: activeNodes.includes(i) ? 1.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
            <div className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              activeNodes.includes(i) 
                ? 'border-accent bg-accent/20 shadow-lg shadow-accent/50' 
                : 'border-primary/30 bg-card/80'
            }`}>
              <Cpu className={`h-4 w-4 ${activeNodes.includes(i) ? 'text-accent' : 'text-primary/70'}`} />
            </div>
          </div>
        </motion.div>
      ))}

      {/* ZK Verification Layer (Top Position - Centered) */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative">
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-accent/20 blur-2xl animate-pulse" />
            <div className="relative bg-accent/10 backdrop-blur-md border-2 border-accent/60 rounded-lg px-5 py-3 shadow-xl shadow-accent/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-accent/30 blur-md"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Shield className="relative h-5 w-5 text-accent" />
                </div>
                <span className="font-mono text-sm text-accent font-bold tracking-wider">ZK-PROOF VERIFICATION</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Privacy End Point (Right) */}
      <motion.div
        className="absolute right-[8%] top-[45%] -translate-y-1/2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-accent/30 blur-2xl animate-pulse" />
          <div className="relative bg-card/90 backdrop-blur-sm border border-accent/50 rounded-xl p-4 w-32">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-accent/20 blur-lg"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <CheckCircle className="relative h-6 w-6 text-accent" />
              </div>
              <div className="text-center">
                <div className="font-mono text-xs font-bold text-accent">VERIFIED</div>
                <div className="font-mono text-[10px] text-muted-foreground">Encrypted Result</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Labels with Platform Values */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Query Input</span>
          </div>
          <span className="font-mono text-xs text-primary font-bold">~250ms</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">AI Processing</span>
          </div>
          <span className="font-mono text-xs text-accent font-bold">~2.5s</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">ZK Verification</span>
          </div>
          <span className="font-mono text-xs text-blue-400 font-bold">~800ms</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Encrypted Output</span>
          </div>
          <span className="font-mono text-xs text-accent font-bold">99.9%</span>
        </div>
      </div>
    </div>
  );
}

