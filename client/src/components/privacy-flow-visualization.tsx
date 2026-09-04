import { motion } from "framer-motion";
import { Lock, Cpu, Shield, CheckCircle, ArrowRight, Sparkles, Key, Database, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PrivacyFlowVisualization() {
  const steps = [
    {
      icon: Lock,
      title: "Private Query",
      description: "User submits encrypted request",
      color: "from-primary to-primary/60",
      iconColor: "text-primary",
      borderColor: "border-primary/40",
      bgColor: "bg-primary/5",
      metrics: ["Client-Side Encryption", "RSA-2048 Keys", "AES-256-CBC"]
    },
    {
      icon: Cpu,
      title: "AI Processing",
      description: "Multi-model consensus analysis",
      color: "from-accent to-accent/60",
      iconColor: "text-accent",
      borderColor: "border-accent/40",
      bgColor: "bg-accent/5",
      metrics: ["GPT-4o + Gemini + Claude", "Decentralized Nodes", "Byzantine Fault Tolerance"]
    },
    {
      icon: Shield,
      title: "ZK Verification",
      description: "Zero-knowledge proof generation",
      color: "from-blue-500 to-purple-500",
      iconColor: "text-blue-400",
      borderColor: "border-blue-400/40",
      bgColor: "bg-blue-400/5",
      metrics: ["zk-SNARKs Protocol", "On-Chain Validation", "Trustless Verification"]
    },
    {
      icon: CheckCircle,
      title: "Encrypted Result",
      description: "Verified output delivered securely",
      color: "from-accent to-primary",
      iconColor: "text-accent",
      borderColor: "border-accent/40",
      bgColor: "bg-accent/5",
      metrics: ["End-to-End Encrypted", "Tamper-Proof", "99.9% Accuracy"]
    }
  ];

  return (
    <div className="relative w-full">
      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector Line - Desktop Only */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 z-10">
                <motion.div
                  className={`h-full bg-gradient-to-r ${step.color}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1,
                    delay: index * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 right-0"
                  animate={{
                    x: [0, 8, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <ArrowRight className={`h-3 w-3 ${step.iconColor}`} />
                </motion.div>
              </div>
            )}

            {/* Step Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className={`relative overflow-hidden border-2 ${step.borderColor} ${step.bgColor} hover:border-opacity-60 transition-all duration-300 group h-full`}>
                <CardContent className="p-6 space-y-4">
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 ${step.borderColor} ${step.bgColor}`}>
                      <span className={`text-sm font-bold ${step.iconColor}`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Animated Icon */}
                    <motion.div
                      className="relative"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
                      <div className={`relative w-12 h-12 rounded-lg border-2 ${step.borderColor} ${step.bgColor} flex items-center justify-center backdrop-blur-sm`}>
                        <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className={`font-bold text-lg ${step.iconColor}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1.5 pt-2">
                    {step.metrics.map((metric, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + i * 0.1 }}
                      >
                        <div className={`w-1 h-1 rounded-full ${step.iconColor === 'text-primary' ? 'bg-primary' : step.iconColor === 'text-accent' ? 'bg-accent' : 'bg-blue-400'}`} />
                        <span className="text-muted-foreground">{metric}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated Pulse Effect */}
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom Stats Bar */}
      <motion.div
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-center p-4 rounded-lg bg-card/50 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Latency</span>
          </div>
          <p className="text-2xl font-bold text-primary">~3.5s</p>
        </div>

        <div className="text-center p-4 rounded-lg bg-card/50 border border-accent/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Database className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Nodes</span>
          </div>
          <p className="text-2xl font-bold text-accent">24/7</p>
        </div>

        <div className="text-center p-4 rounded-lg bg-card/50 border border-blue-400/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Security</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">256-bit</p>
        </div>

        <div className="text-center p-4 rounded-lg bg-card/50 border border-accent/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-accent">99.9%</p>
        </div>
      </motion.div>
    </div>
  );
}

