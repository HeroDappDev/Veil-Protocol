import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PrivacyFlowVisualization } from "@/components/privacy-flow-visualization";
import { AICapabilitiesShowcase } from "@/components/ai-capabilities-showcase";
import {
  Shield,
  Network,
  Cpu,
  ArrowRight,
  CheckCircle,
  Zap,
  Lock,
  Sparkles,
  Building2,
  FileText,
  Landmark,
  Eye,
  Globe,
  TrendingUp,
  Key,
  Code,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/image_1788489627822.png";

export default function Home() {
  const { toast } = useToast();
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [typingPhase, setTypingPhase] = useState<"title" | "subtitle" | "tagline" | "done">("title");
  const [caCopied, setCaCopied] = useState(false);

  const fullTitle = "VEIL PROTOCOL";
  const fullSubtitle = "Privacy-First Oracle for Real-World Assets";
  const fullTagline = "Zero-knowledge proofs securing AI predictions and tokenized real-world assets on-chain";
  const contractAddress = "COMING SOON";

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = contractAddress;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2000);
    }

    toast({
      title: "Copied!",
      description: `${contractAddress} copied to clipboard`,
      className: "border-primary/30",
    });
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (typingPhase === "title") {
      if (displayedTitle.length < fullTitle.length) {
        timeout = setTimeout(() => {
          setDisplayedTitle(fullTitle.slice(0, displayedTitle.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setTypingPhase("subtitle"), 300);
      }
    } else if (typingPhase === "subtitle") {
      if (displayedSubtitle.length < fullSubtitle.length) {
        timeout = setTimeout(() => {
          setDisplayedSubtitle(fullSubtitle.slice(0, displayedSubtitle.length + 1));
        }, 38);
      } else {
        timeout = setTimeout(() => setTypingPhase("tagline"), 200);
      }
    } else if (typingPhase === "tagline") {
      if (displayedTagline.length < fullTagline.length) {
        timeout = setTimeout(() => {
          setDisplayedTagline(fullTagline.slice(0, displayedTagline.length + 1));
        }, 22);
      } else {
        setTypingPhase("done");
        setTimeout(() => setShowCursor(false), 1000);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedTitle, displayedSubtitle, displayedTagline, typingPhase]);

  const coreFeatures = [
    {
      icon: Shield,
      title: "Zero-Knowledge Proofs",
      description: "Verify AI computations without revealing underlying data using zk-SNARKs and zk-STARKs — trustless privacy at every layer.",
    },
    {
      icon: Network,
      title: "Decentralized Oracle Network",
      description: "Multiple independent nodes provide predictions with Byzantine fault-tolerant consensus and on-chain verification.",
    },
    {
      icon: Cpu,
      title: "Multi-AI Consensus",
      description: "GPT-4o, Claude Opus 4.5, and Gemini 2.5 Pro work in consensus to deliver auditable, accurate predictions.",
    },
  ];

  const rwaFeatures = [
    {
      icon: Building2,
      title: "Private Real Estate Tokenization",
      description: "Fractional ownership of tokenized property with ZK-verified deed transfers. Prove ownership without exposing holdings.",
      badge: "RWA",
    },
    {
      icon: FileText,
      title: "Confidential Invoice Financing",
      description: "Businesses prove invoice validity to lenders via ZK proofs without exposing client relationships or financial details.",
      badge: "DeFi",
    },
    {
      icon: Landmark,
      title: "Private Treasury Bonds",
      description: "Hold tokenized T-bills and government securities on-chain with ZK proof of ownership — fully private, fully auditable.",
      badge: "RWA",
    },
    {
      icon: Eye,
      title: "ZK Compliance Oracle",
      description: "Prove regulatory compliance to smart contracts without revealing transaction details — selective disclosure for institutions.",
      badge: "Oracle",
    },
    {
      icon: Globe,
      title: "Dark Pool Asset Exchange",
      description: "Institutional-grade private swaps for tokenized securities. Trade real-world assets without front-running exposure.",
      badge: "DEX",
    },
    {
      icon: TrendingUp,
      title: "Private Portfolio Tracking",
      description: "Monitor tokenized equities, real estate, and bonds on-chain — ZK-masked balances, fully under your control.",
      badge: "Privacy",
    },
  ];

  return (
    <>
      {/* Background Grid */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 scan-lines opacity-15 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-10 md:px-6 md:py-12">
        <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto mb-6 max-w-4xl space-y-4 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/35 transition-all duration-500 rounded-full scale-75" />
              <img
                src={logoImage}
                alt="Veil Protocol"
                className="relative h-28 w-28 object-contain drop-shadow-[0_0_30px_rgba(200,255,0,0.5)] md:h-32 md:w-32"
                data-testid="img-hero-logo"
              />
            </div>
          </div>

          {/* Typewriter Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="inline-block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {displayedTitle}
                {typingPhase === "title" && showCursor && (
                  <span className="inline-block w-[3px] h-[0.9em] bg-primary ml-1 animate-pulse" />
                )}
              </span>
              <br />
              <span className="text-2xl md:text-4xl lg:text-5xl">
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-primary/30" />
                  <span className="relative text-primary/90">
                    {displayedSubtitle}
                    {typingPhase === "subtitle" && showCursor && (
                      <span className="inline-block w-[2px] h-[0.85em] bg-primary ml-1 animate-pulse" />
                    )}
                  </span>
                </span>
              </span>
            </h1>
          </div>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto min-h-[3rem]">
            {displayedTagline}
            {(typingPhase === "tagline" || typingPhase === "done") && showCursor && (
              <span className="inline-block w-[2px] h-[1em] bg-primary ml-1 animate-pulse" />
            )}
            {typingPhase === "done" && (
              <>
                <br />
                <span className="opacity-0 animate-fade-in text-primary/70 font-mono text-sm tracking-widest" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
                  Trustless • Private • Decentralized
                </span>
              </>
            )}
          </p>

        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* CA Priority Beacon */}
          <div className="flex justify-center px-3">
            <button
              type="button"
              onClick={handleCopyCA}
              className="group relative w-full max-w-2xl overflow-hidden rounded-xl border-2 border-primary bg-black/90 px-5 py-5 shadow-[0_0_18px_hsl(var(--primary)/0.55),0_0_55px_hsl(var(--primary)/0.2),inset_0_0_24px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-[0_0_28px_hsl(var(--primary)/0.75),0_0_80px_hsl(var(--primary)/0.3),inset_0_0_30px_hsl(var(--primary)/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black active:translate-y-0 sm:px-8 sm:py-6"
              title="Click to copy contract address"
              data-testid="badge-ca-copy"
            >
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,hsl(var(--primary)/0.035)_4px)]" />
              <div className="pointer-events-none absolute inset-1 rounded-lg border border-primary/25" />
              <div className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-white" />
              <div className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-white" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white" />

              <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/60 bg-primary/10 shadow-[0_0_18px_hsl(var(--primary)/0.45)] sm:h-14 sm:w-14">
                  <span className="absolute h-4 w-4 rounded-full bg-primary/50 motion-safe:animate-ping" />
                  <span className="relative h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))] sm:h-4 sm:w-4" />
                </div>

                <span className="min-w-0 text-left font-mono">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.34em] text-primary/75 sm:text-xs">
                    Contract Address
                  </span>
                  <span className="block break-words text-2xl font-black uppercase tracking-[0.08em] text-primary [text-shadow:0_0_16px_hsl(var(--primary)/0.9)] sm:text-4xl sm:tracking-[0.12em]">
                    {contractAddress}
                  </span>
                  <span className="mt-1.5 block text-[9px] uppercase tracking-[0.2em] text-primary/55 sm:text-[10px]">
                    Official launch status
                  </span>
                </span>

                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-14 sm:w-14">
                  {caCopied ? (
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Copy className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </span>
              </div>
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group relative gap-2 h-12 md:h-14 px-8 uppercase tracking-wider overflow-hidden border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary"
                data-testid="button-get-started"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="h-4 w-4" />
                Initialize System
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="h-12 md:h-14 px-8 uppercase tracking-wider border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/80"
              >
                View Documentation
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* RWA Stats Ticker */}
      <div className="relative border-y border-primary/20 bg-gradient-to-r from-card/30 via-primary/5 to-card/30 overflow-hidden">
        <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center md:justify-between">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">RWA Network Live</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {[
                { label: "RWA Locked", value: "$2.85B" },
                { label: "Tokenizations", value: "1,247" },
                { label: "ZK Attestations", value: "48,392" },
                { label: "Dark Pool Vol", value: "$892M" },
                { label: "Asset Classes", value: "5" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-muted-foreground/50">{stat.label}:</span>
                  <span className="text-primary font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
            <Link href="/rwa">
              <Button
                size="sm"
                className="font-mono text-[10px] gap-1 h-7 px-3 border border-primary/35 bg-primary/8 hover:bg-primary/15 text-primary uppercase tracking-wider flex-shrink-0"
                data-testid="button-rwa-ticker-link"
              >
                Explore RWA <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Flow Visualization */}
      <section className="relative border-y border-primary/20 bg-card/20 backdrop-blur-sm py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/4 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-sm text-primary">
              <Shield className="h-4 w-4" />
              <span className="uppercase tracking-wider font-mono">Privacy-First Architecture</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              How Veil Protocol Works
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Four-step secure process from encrypted query to verified result<br />
              Zero-knowledge proofs ensure privacy at every stage
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-primary/25 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary uppercase tracking-wider font-mono">
                Live System Active
              </span>
            </div>
          </div>

          <PrivacyFlowVisualization />
        </div>
      </section>

      {/* Core Features */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-primary font-mono">
              <Lock className="h-4 w-4" />
              <span className="uppercase tracking-wider">Core Technology</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Built with Advanced ZK Technology
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Combining AI • Blockchain • Zero-Knowledge Proofs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card
                key={index}
                className="terminal-card group hover:border-primary/45 transition-all duration-300"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/15 blur-xl group-hover:bg-primary/30 transition-all" />
                    <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/25">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="terminal-header text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RWA Section */}
      <section className="relative border-y border-primary/20 bg-card/15 backdrop-blur-sm py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary uppercase tracking-widest font-mono">
                Real-World Asset Privacy
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Bringing Wall Street Assets to Web3
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base">
              The first privacy layer for tokenized real-world assets —<br className="hidden sm:block" />
              own anything, prove nothing, trade everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rwaFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-primary/18 bg-card/60 hover:border-primary/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 space-y-3 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/10 blur-lg group-hover:bg-primary/25 transition-all" />
                      <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/20">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary/80 bg-primary/5 text-[10px] font-mono flex-shrink-0">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground leading-snug">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center space-y-4">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Own anything. Prove nothing. Trade everything.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["ZK Identity Proofs", "Selective Disclosure", "Dark Pool DEX", "Private Cap Tables", "Tokenized Securities"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full border border-primary/20 text-primary/70 text-xs font-mono bg-primary/5">
                  {tag}
                </span>
              ))}
            </div>
            <div className="pt-2">
              <Link href="/rwa">
                <Button
                  size="lg"
                  className="group gap-2 px-8 uppercase tracking-wider border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-mono"
                  data-testid="button-explore-rwa"
                >
                  <Building2 className="h-4 w-4" />
                  Explore RWA Infrastructure
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-primary font-mono">
              <Cpu className="h-4 w-4" />
              <span className="uppercase tracking-wider">AI Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Three Powerful AI Oracles
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm">
              GPT-4o • Claude Opus 4.5 • Gemini 2.5 Pro — working in consensus<br />
              Privacy-preserving • Multi-AI verification • Real-time analysis
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/90 backdrop-blur-md border-2 border-primary/45 shadow-2xl shadow-primary/15">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-sm text-primary font-bold uppercase tracking-wider font-mono">
                Live AI Consensus
              </span>
            </div>
          </div>

          <AICapabilitiesShowcase />
        </div>
      </section>

      {/* Get Started in 3 Steps */}
      <section className="relative border-y border-primary/20 bg-card/20 backdrop-blur-sm py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/4 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-primary font-mono">
              <Zap className="h-4 w-4" />
              <span className="uppercase tracking-wider">Quick Start</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Get Started in 3 Steps</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              No wallet required to begin. Generate your keys, get an API key, and start querying the oracle network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />

            {[
              {
                step: "01",
                icon: Key,
                title: "Generate RSA Keys",
                desc: "Create your RSA-2048 encryption key pair on the Privacy page. No wallet needed — keys are tied to your session.",
                note: "No wallet required",
                href: "/privacy",
                cta: "Go to Privacy →",
              },
              {
                step: "02",
                icon: Code,
                title: "Get an API Key",
                desc: "Use your RSA public key to generate a free API key on the Developer API page. No wallet required to get started.",
                note: "No wallet required",
                href: "/developers",
                cta: "Go to API →",
              },
              {
                step: "03",
                icon: Terminal,
                title: "Submit Queries",
                desc: "Use the dashboard or terminal to submit AI oracle queries. Results are ZK-verified on Robinhood Chain (EVM L2).",
                note: "ZK-verified on-chain",
                href: "/dashboard",
                cta: "Go to Dashboard →",
              },
            ].map(({ step, icon: Icon, title, desc, note, href, cta }) => (
              <Card key={step} className="terminal-card group hover:border-primary/45 transition-all duration-300 relative">
                <CardContent className="p-6 space-y-4">
                  {/* Step number */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-4xl font-bold text-primary/20 leading-none">{step}</span>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-base terminal-header">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>

                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {note}
                  </Badge>

                  <Link href={href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1 font-mono text-xs text-primary hover:text-primary border border-primary/20 hover:border-primary/50 mt-2"
                    >
                      {cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Card className="terminal-card border-gradient-animated">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25">
                <div className="absolute inset-0 bg-primary/15 blur-xl animate-pulse rounded-full" />
                <CheckCircle className="relative h-8 w-8 text-primary" />
              </div>

              <h2 className="text-2xl md:text-4xl font-bold">
                Ready to Build with Veil Protocol?
              </h2>

              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Start submitting queries and experience privacy-preserving AI<br />
                verified on-chain with zero-knowledge proofs
              </p>

              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group gap-2 h-12 md:h-14 px-8 uppercase tracking-wider border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Zap className="h-4 w-4" />
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-primary/20 bg-card/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="Veil Protocol Logo"
                className="h-10 w-10 rounded-md object-cover"
                data-testid="img-footer-logo"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm uppercase tracking-wider text-primary">Veil Protocol</span>
                <span className="text-[10px] text-muted-foreground font-mono">Privacy • RWA • Zero-Knowledge</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Veil Protocol • Decentralized AI Oracle Network • Robinhood Chain
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

