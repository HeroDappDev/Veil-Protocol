import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield, Lock, Network, Cpu, Database, Zap, CheckCircle2, Wallet,
  Terminal, Code, Radio, Key, Building2, FileText, Scale, Eye,
  Layers, Globe, TrendingUp, ShieldCheck, BookOpen, GitBranch,
  Hexagon, BarChart3, AlertTriangle, ArrowRight, Brain, Server,
  MousePointerClick, Download, ChevronRight, LayoutDashboard,
} from "lucide-react";

export default function DocsPage() {
  return (
    <>
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 scan-lines opacity-10 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-12">

        {/* Header */}
        <div className="space-y-4 mb-12 pb-8 border-b border-primary/30">
          <Badge variant="outline" className="gap-2 border-accent/30 font-mono text-accent">
            <Shield className="h-3 w-3" />
            Technical_Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              VEIL PROTOCOL
            </span>
          </h1>
          <div className="terminal-header text-sm">
            DOCUMENTATION • V5.0 — PRIVACY LAYER FOR TOKENIZED REAL-WORLD ASSETS
          </div>
          <p className="text-base text-muted-foreground font-mono">
            &gt; Privacy-preserving oracle network built on Robinhood Chain (EVM Layer 2)<br />
            &gt; Zero-Knowledge Proofs • Real-World Assets • Multi-AI Consensus • VEIL Token
          </p>
        </div>

        <div className="space-y-8">

          {/* Table of Contents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2 text-sm font-mono">
                {[
                  "01 — Executive Summary",
                  "02 — Robinhood Chain Integration",
                  "03 — Zero-Knowledge Architecture",
                  "04 — Three-Tier Privacy System",
                  "05 — Real-World Asset (RWA) Layer",
                  "06 — Multi-Model AI Engine",
                  "07 — VEIL Token & Staking",
                  "08 — Privacy Terminal",
                  "09 — Developer API Reference",
                  "10 — Real-Time Monitoring",
                  "11 — Oracle Consensus Network",
                  "12 — Security Architecture",
                  "13 — Oracle Command Center",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1">
                    <ArrowRight className="h-3 w-3 text-accent flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 01 Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                01 — Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>
                Veil Protocol is the leading privacy infrastructure layer for tokenized real-world assets (RWAs) and AI-driven oracle predictions. Built natively on <span className="text-primary font-semibold">Robinhood Chain</span> — an EVM-compatible Layer 2 network — our protocol enables institutions, developers, and individuals to interact with AI models and on-chain assets while maintaining cryptographic privacy guarantees at every layer.
              </p>
              <p>
                The platform combines <span className="text-accent font-medium">zero-knowledge proof (ZK-SNARK) verification</span> with a multi-model AI consensus engine to produce verifiable, tamper-proof oracle outputs. This means any query result — whether a real estate valuation, invoice credit score, or treasury bond yield — can be independently verified on-chain without revealing the underlying data or AI model parameters.
              </p>
              <p>
                Veil Protocol is purpose-built for the next generation of tokenized finance: private real estate tokenization, confidential invoice financing, ZK compliance oracles, and dark pool asset exchange — all secured by the VEIL token and enforced by smart contracts on Robinhood Chain.
              </p>
              <div className="grid md:grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Privacy Levels", value: "3 Tiers", desc: "Public · Private · Anonymous" },
                  { label: "AI Models", value: "4 Models", desc: "GPT-4o · Claude · Gemini · Oracle" },
                  { label: "RWA Verticals", value: "6 Sectors", desc: "Real Estate · Invoices · Bonds · More" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-muted rounded-md text-center">
                    <p className="text-primary font-bold text-xl">{stat.value}</p>
                    <p className="font-medium text-xs mt-0.5">{stat.label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 02 Robinhood Chain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                02 — Robinhood Chain Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Veil Protocol is deployed on <span className="text-primary font-semibold">Robinhood Chain</span>, an EVM Layer 2 network engineered for high-throughput financial applications. Its full EVM compatibility means any Ethereum tooling — Hardhat, Foundry, ethers.js, wagmi — works natively with Veil Protocol smart contracts.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "EVM Compatibility",
                    desc: "Full Ethereum Virtual Machine compatibility. Deploy Solidity/Vyper smart contracts, interact with existing ERC-20/ERC-721/ERC-1155 token standards, and use familiar development toolchains.",
                    icon: Code,
                  },
                  {
                    title: "Layer 2 Throughput",
                    desc: "Robinhood Chain batches transactions off-chain and settles proofs on the base layer, enabling high-frequency oracle updates with near-instant finality and dramatically lower gas costs.",
                    icon: Zap,
                  },
                  {
                    title: "Wallet Authentication",
                    desc: "All Veil Protocol interactions are authenticated via EVM-compatible wallets. Each wallet receives a unique 10-character ID code and a dedicated RSA encryption key pair for privacy operations.",
                    icon: Wallet,
                  },
                  {
                    title: "On-Chain Settlement",
                    desc: "ZK proof verification, oracle consensus results, VEIL staking, and RWA compliance attestations are all settled on-chain via audited smart contracts on Robinhood Chain.",
                    icon: ShieldCheck,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 border border-primary/20 rounded-md">
                    <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-3">Smart Contract Architecture</h3>
                <div className="space-y-2 text-xs font-mono bg-muted p-4 rounded-md">
                  <p><span className="text-accent">VeilOracle.sol</span> — Core oracle query submission, proof verification, and result storage</p>
                  <p><span className="text-accent">VeilStaking.sol</span> — Token staking pools with time-locked rewards and slashing logic</p>
                  <p><span className="text-accent">RWARegistry.sol</span> — On-chain registry for tokenized real-world asset metadata and compliance proofs</p>
                  <p><span className="text-accent">ZKCompliance.sol</span> — Zero-knowledge compliance oracle for KYC/AML attestations without data exposure</p>
                  <p><span className="text-accent">DarkPoolDEX.sol</span> — Privacy-preserving asset exchange using ZK order commitments</p>
                  <p><span className="text-accent">CreditBalance.sol</span> — On-chain credit management and faucet disbursement</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 03 ZK Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                03 — Zero-Knowledge Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Every prediction and oracle result produced by Veil Protocol is accompanied by a cryptographic zero-knowledge proof. These proofs allow any party to verify that a computation was executed correctly — without learning anything about the input data, the AI model weights, or the user's identity.
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "ZK-SNARK Proof Generation",
                    desc: "Each AI inference is wrapped in a zk-SNARK circuit that proves the output was computed faithfully. Proof size is 288 bytes; verification time is under 50ms on-chain. Uses Groth16 proving system with BN254 curve.",
                  },
                  {
                    title: "RSA-2048 Client-Side Encryption",
                    desc: "Key pairs are generated in-browser via Web Crypto API. Your private key is encrypted with an AES-256 key derived from your wallet signature and never transmitted to any server.",
                  },
                  {
                    title: "AES-256-CBC Result Encryption",
                    desc: "Private query results are encrypted server-side with your public key before any database write. Decryption requires your wallet-bound private key — zero server-side access.",
                  },
                  {
                    title: "Nullifier-Based Anonymity",
                    desc: "Anonymous mode queries use one-time nullifiers derived from wallet keypairs. This prevents linkability across queries while maintaining on-chain verifiability.",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-muted rounded-md">
                    <p className="font-medium mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 04 Privacy Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                04 — Three-Tier Privacy System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Every oracle query on Veil Protocol is submitted with an explicit privacy level. Choose the tier that matches your operational requirements — from full on-chain transparency to ephemeral zero-trace queries.
              </p>

              <div className="space-y-4">
                <div className="p-4 border border-primary/40 rounded-md bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-mono border-primary/50 text-primary">PUBLIC</Badge>
                    <span className="font-semibold">Full Transparency Mode</span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-3">
                    Query content and results are visible on-chain. Contributes to oracle node reputation scoring and network-wide statistics. Optimal for research, benchmarking, and non-sensitive market analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">On-chain results</Badge>
                    <Badge variant="secondary" className="text-xs">Network contribution</Badge>
                    <Badge variant="secondary" className="text-xs">100 credits / query</Badge>
                  </div>
                </div>

                <div className="p-4 border border-accent/40 rounded-md bg-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-mono border-accent/50 text-accent">PRIVATE</Badge>
                    <span className="font-semibold">End-to-End Encrypted Mode</span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-3">
                    Results are encrypted with your RSA public key before being written to the database. Only your wallet-bound private key can decrypt them. Query metadata is visible; content is fully protected. Ideal for proprietary RWA analysis, trading strategies, and confidential due diligence.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">RSA-2048 encrypted</Badge>
                    <Badge variant="secondary" className="text-xs">Persistent storage</Badge>
                    <Badge variant="secondary" className="text-xs">100 credits / query</Badge>
                  </div>
                </div>

                <div className="p-4 border border-orange-500/30 rounded-md bg-orange-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-mono border-orange-500/50 text-orange-400">ANONYMOUS</Badge>
                    <span className="font-semibold">Zero Data Retention Mode</span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-3">
                    No database writes. No persistent logs. Results are delivered once via encrypted WebSocket and permanently purged. Nullifier-based query ID prevents identity linkability. Maximum operational security for ultra-sensitive RWA transactions or compliance-sensitive queries.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Zero persistence</Badge>
                    <Badge variant="secondary" className="text-xs">Nullifier anonymity</Badge>
                    <Badge variant="secondary" className="text-xs">One-time delivery</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 05 RWA Layer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                05 — Real-World Asset (RWA) Privacy Layer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Veil Protocol is purpose-built to be the privacy backbone of tokenized real-world finance. As institutional capital flows into on-chain RWAs, the need for confidential valuation, private compliance, and dark-pool liquidity becomes critical. Our ZK oracle layer solves this without compromising verifiability.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Building2,
                    title: "Private Real Estate Tokenization",
                    desc: "Submit confidential property valuations, rental yield projections, and LTV ratios to the ZK oracle. Receive verifiable on-chain attestations without disclosing the underlying appraisal data to competitors or adversarial actors.",
                    tags: ["Appraisal privacy", "LTV attestation", "ZK valuation"],
                  },
                  {
                    icon: FileText,
                    title: "Confidential Invoice Financing",
                    desc: "SMEs and factoring desks can submit invoice metadata for AI-powered credit scoring without exposing counterparty identities or invoice amounts on-chain. ZK proofs certify creditworthiness privately.",
                    tags: ["Credit scoring", "Counterparty privacy", "DeFi lending"],
                  },
                  {
                    icon: TrendingUp,
                    title: "Private Treasury Bonds",
                    desc: "Institutional managers can query yield curves, duration risk, and credit spreads for tokenized bond portfolios while keeping position sizes and strategy parameters fully private.",
                    tags: ["Yield analytics", "Duration risk", "Portfolio privacy"],
                  },
                  {
                    icon: Scale,
                    title: "ZK Compliance Oracle",
                    desc: "Generate on-chain KYC/AML compliance attestations using zero-knowledge proofs. Prove regulatory compliance to counterparties and protocols without revealing identity documents, screening results, or jurisdiction data.",
                    tags: ["KYC/AML ZK", "Regulatory proofs", "Privacy-first compliance"],
                  },
                  {
                    icon: Globe,
                    title: "Dark Pool Asset Exchange",
                    desc: "Large block trades of tokenized RWAs routed through the Veil Protocol dark pool. Orders are committed as hash digests; matching occurs off-chain; settlement proofs are verified on Robinhood Chain.",
                    tags: ["Block trading", "ZK order book", "No front-running"],
                  },
                  {
                    icon: BarChart3,
                    title: "Private Portfolio Management",
                    desc: "AI-powered portfolio analysis across tokenized equities, real estate, commodities, and bonds — all processed inside ZK circuits. Holdings and performance data remain fully encrypted end-to-end.",
                    tags: ["Multi-asset analytics", "Encrypted reporting", "Institutional grade"],
                  },
                ].map((item) => (
                  <div key={item.title} className="p-4 border border-primary/20 rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="font-semibold text-sm">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs border-primary/30 text-primary/70">{t}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-3">RWA Query Types</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { type: "Valuation Oracle", desc: "AI-driven asset pricing with ZK attestation" },
                    { type: "Compliance Oracle", desc: "Private KYC/AML proofs for regulated assets" },
                    { type: "Yield Oracle", desc: "Real-time yield curve data for tokenized bonds" },
                    { type: "Credit Oracle", desc: "Confidential credit scoring for invoice financing" },
                    { type: "Liquidity Oracle", desc: "Dark pool depth and matching for block trades" },
                    { type: "Risk Oracle", desc: "Portfolio VaR and stress-test analysis privately" },
                  ].map((q) => (
                    <div key={q.type} className="p-3 bg-muted rounded-md">
                      <p className="font-medium text-xs mb-1">{q.type}</p>
                      <p className="text-xs text-muted-foreground">{q.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 06 AI Engine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                06 — Multi-Model AI Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Veil Protocol routes oracle queries through a consensus engine that aggregates predictions from multiple frontier AI models. This multi-model approach reduces single-model bias and produces more robust, verifiable outputs for high-stakes RWA decisions.
              </p>

              <div className="grid gap-4">
                {[
                  {
                    name: "OpenAI GPT-4o",
                    badge: "128K Context",
                    desc: "Flagship multimodal reasoning model. Excels at complex RWA analysis integrating macroeconomic data, technical indicators, property market fundamentals, and cross-asset correlations. Native vision capability enables analysis of physical asset documentation.",
                    tags: ["128K context", "Multimodal", "Fastest GPT", "Structured output"],
                  },
                  {
                    name: "Anthropic Claude Opus 4.5",
                    badge: "200K Context",
                    desc: "Most powerful Claude model built on Constitutional AI principles. Best suited for deep legal document analysis, contract risk assessment, regulatory compliance review, and long-form due diligence on tokenized real-world assets.",
                    tags: ["200K context", "Constitutional AI", "Deep reasoning", "Legal analysis"],
                  },
                  {
                    name: "Google Gemini 2.5 Pro",
                    badge: "1M Context",
                    desc: "Google DeepMind's most capable model with a 1 million token context window and native thinking mode. Ideal for analyzing entire property portfolios, large invoice ledgers, or regulatory filing archives in a single prompt.",
                    tags: ["1M context", "Thinking model", "Multimodal", "Largest context"],
                  },
                  {
                    name: "ZK Network Default Oracle",
                    badge: "Ultra Fast",
                    desc: "Lightweight Byzantine Fault Tolerant consensus across 5 independent nodes using deterministic heuristic models. Prioritizes sub-second latency for high-frequency oracle updates and real-time price feeds.",
                    tags: ["5-node BFT", "Sub-second", "Deterministic", "Low cost"],
                  },
                ].map((model) => (
                  <div key={model.name} className="p-4 border border-primary/20 rounded-md">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-semibold">{model.name}</h3>
                      <Badge variant="secondary" className="text-xs">{model.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{model.desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      {model.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-3">Consensus Aggregation</h3>
                <p className="text-muted-foreground mb-3">
                  When multiple models are engaged, the oracle consensus engine applies weighted voting with confidence interval normalization. Outlier predictions are flagged via IQR deviation analysis. The final result includes a consensus score (0–100) representing agreement strength across the AI ensemble.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { label: "Weighted Voting", desc: "Model confidence scores weight the final prediction aggregation" },
                    { label: "IQR Outlier Filter", desc: "Statistically extreme predictions are flagged before consensus" },
                    { label: "ZK Proof Bundle", desc: "Single proof attests to the entire consensus computation" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-muted rounded-md">
                      <p className="font-medium text-xs mb-1">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 07 VEIL Staking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hexagon className="h-5 w-5 text-primary" />
                07 — VEIL Token & Staking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                VEIL is the native utility token of Veil Protocol. It powers oracle node security, aligns incentives across the network, and grants stakers access to premium privacy tiers and enhanced query throughput on Robinhood Chain.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Phantom CipherVault",
                    apr: "560% APR",
                    lock: "1-Day Lock",
                    desc: "Entry-level privacy staking pool. Ideal for users exploring the ZK oracle ecosystem with flexible 1-day lock periods.",
                  },
                  {
                    name: "Shadow QuantumShield",
                    apr: "630% APR",
                    lock: "1-Day Lock",
                    desc: "Mid-tier privacy pool with enhanced oracle query allocation and priority processing for private RWA queries.",
                  },
                  {
                    name: "Obsidian ShadowNode",
                    apr: "700% APR",
                    lock: "1-Day Lock",
                    desc: "Maximum yield pool for committed protocol participants. Full access to anonymous query mode and dark pool DEX features.",
                  },
                ].map((pool) => (
                  <div key={pool.name} className="p-4 border border-primary/30 rounded-md space-y-2">
                    <p className="font-semibold text-sm">{pool.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-primary/20 text-primary border-0">{pool.apr}</Badge>
                      <Badge variant="outline" className="text-xs">{pool.lock}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{pool.desc}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-3">Token Utility</h3>
                <div className="space-y-2">
                  {[
                    "Stake VEIL to secure oracle nodes and earn staking rewards",
                    "Stakers receive priority access to private and anonymous query tiers",
                    "Node operators must stake minimum VEIL to join the consensus network",
                    "Slashing mechanism penalises nodes that submit provably incorrect oracle outputs",
                    "Governance voting on protocol upgrades, fee parameters, and RWA oracle additions",
                    "Dark pool DEX fee discounts for VEIL stakers",
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground text-xs">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 08 Terminal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                08 — Privacy Terminal Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The Veil Protocol Privacy Terminal is a wallet-authenticated command-line interface for advanced privacy operations. Every command is cryptographically bound to your connected wallet address on Robinhood Chain.
              </p>

              <div className="space-y-3">
                {[
                  { cmd: "/help", desc: "List all available terminal commands and their descriptions" },
                  { cmd: "/api generate", desc: "Generate a new API key bound to your wallet — requires wallet signature" },
                  { cmd: "/api list", desc: "List all API keys associated with your wallet with creation dates and status" },
                  { cmd: "/api validate <key>", desc: "Validate an API key and display permissions, rate limits, and remaining quota" },
                  { cmd: "/api info <key>", desc: "Detailed API key analytics — request history, performance metrics, error rates" },
                  { cmd: "/encrypt <data>", desc: "Encrypt arbitrary data using your wallet-bound RSA public key" },
                  { cmd: "/decrypt <ciphertext>", desc: "Decrypt data encrypted with your RSA public key using your private key" },
                  { cmd: "/oracle status", desc: "View live oracle network health, node count, and consensus metrics" },
                  { cmd: "/rwa register", desc: "Register a new RWA asset in the on-chain oracle registry" },
                  { cmd: "/credits balance", desc: "Check your current credit balance and query history" },
                ].map((item) => (
                  <div key={item.cmd} className="p-3 border-l-2 border-accent/50 bg-muted rounded-r-md">
                    <p className="font-mono text-xs text-accent mb-1">&gt; {item.cmd}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 09 Developer API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                09 — Developer API Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Integrate Veil Protocol oracle predictions directly into your DeFi protocol, RWA platform, or financial application. All API endpoints require a wallet-generated API key with SHA-256 hash-only server storage — the plaintext key is shown once at generation.
              </p>

              <div>
                <h3 className="font-semibold text-base mb-3">Authentication</h3>
                <div className="space-y-2 font-mono text-xs bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground"># Include in every request header:</p>
                  <p><span className="text-accent">Authorization:</span> Bearer {'<your-api-key>'}</p>
                  <p><span className="text-accent">X-Wallet-Address:</span> {'<your-evm-wallet-address>'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-3">Endpoints</h3>
                <div className="space-y-2 text-xs font-mono bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground mb-2"># Oracle Queries</p>
                  <p><span className="text-primary">POST</span>   /api/queries               — Submit an oracle query</p>
                  <p><span className="text-accent">GET</span>    /api/queries/:id            — Retrieve query result</p>
                  <p><span className="text-accent">GET</span>    /api/queries                — List all queries for wallet</p>
                  <p><span className="text-red-400">DELETE</span> /api/queries               — Clear all query history</p>
                  <p className="text-muted-foreground mt-3 mb-2"># ZK Proofs</p>
                  <p><span className="text-accent">GET</span>    /api/proofs/:id             — Fetch ZK proof for query</p>
                  <p className="text-muted-foreground mt-3 mb-2"># Oracle Network</p>
                  <p><span className="text-accent">GET</span>    /api/nodes                  — List active oracle nodes</p>
                  <p><span className="text-accent">GET</span>    /api/blockchain/registry    — On-chain oracle registry</p>
                  <p className="text-muted-foreground mt-3 mb-2"># RWA Registry</p>
                  <p><span className="text-primary">POST</span>   /api/rwa/register           — Register a new RWA asset</p>
                  <p><span className="text-accent">GET</span>    /api/rwa/:id                — Fetch RWA oracle data</p>
                  <p className="text-muted-foreground mt-3 mb-2"># Credits & Auth</p>
                  <p><span className="text-accent">GET</span>    /api/credits/:wallet        — Check credit balance</p>
                  <p><span className="text-primary">POST</span>   /api/credits/faucet         — Claim free credits</p>
                  <p><span className="text-primary">POST</span>   /api/keys/generate          — Generate API key</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-3">Example: Submit a Private RWA Query</h3>
                <div className="text-xs font-mono bg-muted p-4 rounded-md space-y-1 overflow-x-auto">
                  <p className="text-muted-foreground">// POST /api/queries</p>
                  <p>{"{"}</p>
                  <p>{"  "}<span className="text-accent">"queryType"</span>: <span className="text-primary">"risk_assessment"</span>,</p>
                  <p>{"  "}<span className="text-accent">"target"</span>: <span className="text-primary">"Commercial Real Estate Portfolio — Manhattan"</span>,</p>
                  <p>{"  "}<span className="text-accent">"privacyLevel"</span>: <span className="text-primary">"private"</span>,</p>
                  <p>{"  "}<span className="text-accent">"aiModel"</span>: <span className="text-primary">"claude"</span>,</p>
                  <p>{"  "}<span className="text-accent">"walletAddress"</span>: <span className="text-primary">"0x..."</span></p>
                  <p>{"}"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10 Real-Time Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                10 — Real-Time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Veil Protocol provides a live WebSocket data feed at <span className="font-mono text-accent">/ws</span> for real-time oracle network monitoring, query lifecycle tracking, and on-chain event streaming from Robinhood Chain.
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: "Query Lifecycle Events", desc: "Track queries from submission → oracle processing → ZK proof generation → consensus verification → result delivery." },
                  { title: "Network Health Metrics", desc: "Live node count, active query throughput, consensus success rates, average response latency, and proof generation times." },
                  { title: "RWA Oracle Feeds", desc: "Real-time price attestations and valuation updates for registered tokenized assets on Robinhood Chain." },
                  { title: "VEIL Staking Events", desc: "Live staking deposits, reward accruals, unstake requests, and slashing events across all three privacy pools." },
                  { title: "On-Chain Settlements", desc: "Robinhood Chain transaction confirmations for proof verifications, credit transfers, and oracle registry updates." },
                  { title: "Dark Pool Activity", desc: "Anonymised order match events and settlement confirmations from the ZK dark pool DEX." },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-muted rounded-md">
                    <p className="font-medium mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 11 Oracle Consensus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                11 — Oracle Consensus Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The Veil Protocol oracle network is a permissioned-entry, stake-secured mesh of independent node operators. Each node independently runs the AI inference pipeline and submits a signed prediction commitment on-chain. Byzantine Fault Tolerant (BFT) consensus then aggregates these into a final verifiable result.
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "Node Requirements",
                    desc: "Node operators must stake a minimum VEIL threshold, maintain ≥99% uptime SLA, and pass a one-time cryptographic registration on Robinhood Chain. Nodes are geographically distributed across at least 3 regions.",
                  },
                  {
                    title: "Stake-Weighted Reputation",
                    desc: "Each node accumulates a reputation score based on prediction accuracy, response latency, and uptime. Higher-reputation nodes receive higher weighting in consensus aggregation and larger share of query fees.",
                  },
                  {
                    title: "Slashing & Incentives",
                    desc: "Nodes submitting provably incorrect predictions — detectable via ZK fraud proofs — are slashed a percentage of their staked VEIL. Correct nodes share the query fee pool proportional to reputation weight.",
                  },
                  {
                    title: "Cryptographic Commitments",
                    desc: "Nodes commit to predictions using hash commitments before revealing, preventing front-running and copy-trading attacks. The reveal phase is enforced by the VeilOracle smart contract.",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-muted rounded-md">
                    <p className="font-medium mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 12 Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                12 — Security Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                Veil Protocol is designed with a defence-in-depth security model. Cryptographic guarantees are layered at the client, network, and contract levels so that no single point of compromise can expose user data or oracle integrity.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Key,
                    title: "Client-Side Key Custody",
                    desc: "Private keys are generated and stored exclusively in the user's browser. They are never transmitted to any server, never stored in cookies, and are encrypted at rest using wallet-derived AES keys.",
                  },
                  {
                    icon: Lock,
                    title: "Zero Server Key Access",
                    desc: "The Veil Protocol backend can encrypt data with your public key but can never decrypt it. Even a fully compromised server cannot read private query results.",
                  },
                  {
                    icon: Database,
                    title: "SHA-256 API Key Hashing",
                    desc: "API keys are hashed using SHA-256 before database storage. Plaintext keys exist only at generation time and are never stored or logged.",
                  },
                  {
                    icon: GitBranch,
                    title: "On-Chain Proof Verification",
                    desc: "Every oracle result includes a ZK-SNARK proof verified on Robinhood Chain. Tampered results are cryptographically detectable and nodes are slashed automatically.",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Anonymous Query Purge",
                    desc: "Anonymous mode results are never written to disk. They exist only in-memory during transmission and are permanently purged after WebSocket delivery to the client.",
                  },
                  {
                    icon: Shield,
                    title: "Smart Contract Audits",
                    desc: "All Veil Protocol smart contracts on Robinhood Chain undergo third-party security audits before deployment. Upgrade mechanisms use time-locked governance multisig.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 border border-primary/20 rounded-md">
                    <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border border-primary/40 rounded-md bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">Security Disclosure</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you discover a security vulnerability in Veil Protocol, please disclose responsibly via our secure bug bounty channel. Do not publish vulnerabilities publicly before coordinating with the core team. Critical disclosures are eligible for VEIL token bounty rewards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 13 Oracle Command Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                13 — Oracle Command Center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">

              {/* Overview */}
              <div className="p-4 border border-primary/30 rounded-md bg-primary/5">
                <p className="font-semibold mb-2 text-primary">What Is the Oracle Command Center?</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The Oracle Command Center is Veil Protocol's primary user interface for submitting, tracking, and analysing AI oracle queries. It replaces a generic dashboard with a purpose-built intelligence terminal — purpose-designed around the three pillars of the protocol: privacy-preserving queries, real-world asset intelligence, and ZK-verified results. Every interaction is surfaced through a live, reactive interface that shows the exact state of your query as it moves through the decentralised oracle pipeline.
                </p>
              </div>

              <Separator />

              {/* Why it matters */}
              <div>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Why the Oracle Command Center Matters for Veil Protocol
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Eye,
                      title: "Proof-of-Intelligence UX",
                      desc: "Every result card shows the full AI analysis, confidence score, ZK proof hash, oracle consensus count, and on-chain transaction data — in a single click. Users never have to dig through block explorers or API responses to verify their oracle output.",
                    },
                    {
                      icon: Building2,
                      title: "RWA Intelligence Hub",
                      desc: "Purpose-built query categories cover Crypto Signals, RWA Valuations, Invoice Risk Scores, and Compliance Attestations — the four pillars of the Veil Protocol RWA layer. Quick-launch templates mean institutional users can run standard due-diligence queries in seconds, not minutes.",
                    },
                    {
                      icon: Shield,
                      title: "Live Privacy Transparency",
                      desc: "The Command Center surfaces the privacy level, model used, and ZK seal status for every query result. Users understand exactly what was encrypted, what was public, and where their data is or is not stored — building trust in the ZK privacy architecture.",
                    },
                    {
                      icon: Network,
                      title: "Real-Time Network Intelligence",
                      desc: "The sidebar shows live oracle node count, query success rate, average response latency, and AI model health — all updating in real time. This gives users and node operators a continuous pulse on network integrity without leaving the query interface.",
                    },
                    {
                      icon: Brain,
                      title: "Multi-Model Consensus Visibility",
                      desc: "Users can observe which AI models (GPT-4o, Claude Opus 4.5, Gemini 2.5 Pro, or Oracle Network Default) produced each result. This transparency is a key differentiator for institutional clients who need to audit the AI source of their RWA intelligence.",
                    },
                    {
                      icon: Server,
                      title: "Decentralisation Proof",
                      desc: "The Oracle Nodes panel shows live node addresses, response times, and success rates. This is critical for demonstrating to auditors and counterparties that oracle results are not produced by a single centralised service — they emerge from a BFT consensus across independent nodes.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-4 border border-primary/15 rounded-md">
                      <item.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1 text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Key Features */}
              <div>
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Key Features — Detailed Breakdown
                </h3>
                <div className="space-y-4">

                  {/* Quick Launch */}
                  <div className="p-4 border border-primary/20 rounded-md space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Quick-Launch Templates</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Four one-click template cards pre-fill the query form with production-ready oracle request parameters. Templates are designed around the most common institutional use cases on the protocol:
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        { label: "Crypto Signal", desc: "ETH/USD 24h price prediction — multi-model consensus, public privacy level. Use for benchmarking and market monitoring." },
                        { label: "Property Value", desc: "Class A commercial office tower — RWA valuation oracle, private privacy level. ZK-attested appraisal without disclosing property details." },
                        { label: "Invoice Risk", desc: "Net-30 invoice, Healthcare sector — AI credit scoring for invoice financing, private mode. Generates a risk-adjusted score for DeFi lending collateral." },
                        { label: "Compliance Check", desc: "DeFi protocol MiCA/FATF check — anonymous mode. Zero data retention, nullifier-based anonymity for regulatory attestation." },
                      ].map((t) => (
                        <div key={t.label} className="p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-1.5 mb-1">
                            <ChevronRight className="h-3 w-3 text-primary" />
                            <p className="font-medium text-xs">{t.label}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/70 italic">
                      Clicking a template smoothly scrolls to the query form with all fields pre-populated. Users can modify any parameter before submitting.
                    </p>
                  </div>

                  {/* ZK Processing Steps */}
                  <div className="p-4 border border-primary/20 rounded-md space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Live ZK Processing Pipeline</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When a query is submitted, the Command Center renders an animated 6-step ZK verification pipeline in real-time. Each step reflects the actual query status from the backend and advances as the oracle network progresses:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { step: "01", label: "Query Encrypted", desc: "AES-256 + RSA-2048 client-side encryption applied before transmission" },
                        { step: "02", label: "Broadcasting to Nodes", desc: "Query dispatched to the decentralised oracle node network" },
                        { step: "03", label: "AI Model Computing", desc: "Selected AI model(s) running the inference pipeline in parallel" },
                        { step: "04", label: "Oracle Consensus", desc: "Byzantine fault-tolerant aggregation of node predictions" },
                        { step: "05", label: "ZK Proof Generating", desc: "zk-SNARK circuit compiled; proof hash computed for the computation" },
                        { step: "06", label: "Result Sealed", desc: "Final result and proof permanently recorded on Robinhood Chain" },
                      ].map((s) => (
                        <div key={s.step} className="flex items-start gap-3 px-3 py-2 bg-muted rounded-md">
                          <span className="text-xs font-mono text-primary shrink-0 mt-0.5">{s.step}</span>
                          <div>
                            <span className="text-xs font-medium">{s.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">— {s.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intelligence Modal */}
                  <div className="p-4 border border-primary/20 rounded-md space-y-3">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Oracle Intelligence Report Modal</p>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">Click any result to open</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every completed query result is clickable — either from the "Recent Intelligence" feed or directly from the Query History table. Clicking opens a full-screen modal with three tabs of structured oracle intelligence:
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        {
                          tab: "Intelligence Report",
                          items: [
                            "Confidence score (%) with visual progress bar",
                            "Full AI analysis — complete model output, untruncated",
                            "Query metadata: type, target, privacy level, AI model, block number",
                            "Model attribution — which AI produced this result",
                            "Source count — number of data sources analysed",
                          ],
                        },
                        {
                          tab: "ZK Proof",
                          items: [
                            "ZK-SNARK proof hash (copyable)",
                            "Verified / Verifying status badge",
                            "Oracle consensus bar — N of M nodes confirmed",
                            "All verification steps with pass/fail status",
                            "Proof generation timestamp",
                          ],
                        },
                        {
                          tab: "On-Chain Data",
                          items: [
                            "Query transaction hash (copyable)",
                            "Result transaction hash (copyable)",
                            "IPFS content hash for result archive",
                            "Block number of on-chain settlement",
                            "Terminal shortcut: /txn <hash> command",
                          ],
                        },
                      ].map((tab) => (
                        <div key={tab.tab} className="p-3 border border-primary/20 rounded-md space-y-2">
                          <p className="font-medium text-xs text-primary">{tab.tab}</p>
                          <ul className="space-y-1">
                            {tab.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                      <Download className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Download Report</span> — Every intelligence report can be exported as a structured JSON file containing the full query parameters, AI analysis, confidence metrics, ZK proof, and on-chain references. Use this for audit trails, institutional reporting, or integration into downstream risk systems.
                      </p>
                    </div>
                  </div>

                  {/* Recent Intelligence Feed */}
                  <div className="p-4 border border-primary/20 rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <p className="font-semibold">Recent Intelligence Feed</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All completed queries are surfaced as clickable signal cards in the "Recent Intelligence" feed. Each card shows the query type icon, target asset, privacy level, ZK-sealed badge, and timestamp. Clicking any card opens the full Oracle Intelligence Report modal for that result. The feed is the primary post-query interaction pattern — no need to search query history to find completed results.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* How to use */}
              <div>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  How to Use the Oracle Command Center
                </h3>
                <div className="space-y-2">
                  {[
                    { n: "1", title: "Navigate to ORACLE in the top navigation bar", desc: "The Oracle Command Center is accessible from any page via the ORACLE nav link. It requires no wallet connection to browse, but submitting queries requires an active wallet and sufficient credit balance." },
                    { n: "2", title: "Choose a Quick-Launch Template or build a custom query", desc: "Click any of the four template cards to pre-fill the query form with a standard institutional use case. Templates auto-scroll to the form. Alternatively, manually select a Query Type from the dropdown (Price Prediction, Sentiment Analysis, Risk Assessment, RWA Valuation, Invoice Risk, or Compliance Check) and enter a Target asset." },
                    { n: "3", title: "Set your Privacy Level", desc: "Select Public (on-chain visible), Private (RSA-2048 encrypted result), or Anonymous (zero persistence, one-time delivery). Your privacy selection is reflected in the ZK proof and on-chain settlement — it is cryptographically enforced, not just a UI label." },
                    { n: "4", title: "Submit and watch the ZK processing pipeline", desc: "After clicking 'Submit Oracle Query', the 6-step ZK Processing Pipeline appears and animates in real time, reflecting the actual backend state. You can see exactly when the AI model is computing, when consensus forms, and when the ZK proof seals the result." },
                    { n: "5", title: "Click 'Full Report' or any signal card to read the result", desc: "Once your query completes, click 'Full Report' on the result panel or click the signal card in the Recent Intelligence feed. The Oracle Intelligence Report modal opens with three tabs: Intelligence Report, ZK Proof, and On-Chain Data." },
                    { n: "6", title: "Download the report or verify in Terminal", desc: "From the modal footer, download the full JSON report for audit purposes, or click 'Open in Terminal' to jump directly to the Privacy Terminal with the proof hash pre-loaded for on-chain verification via the /txn command." },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start gap-4 p-4 border border-primary/15 rounded-md">
                      <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-mono font-bold text-primary">{step.n}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{step.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Project benefits */}
              <div>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Strategic Benefits for Veil Protocol
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { label: "User Retention", value: "↑", desc: "Completed queries surface as permanent, clickable intelligence cards. Users return to review historical oracle data, building long-term engagement with the platform." },
                    { label: "Institutional Credibility", value: "↑", desc: "The ZK proof tab and downloadable JSON reports give institutional users the audit trail they need to use Veil Protocol oracle outputs in regulated workflows." },
                    { label: "RWA Adoption", value: "↑", desc: "One-click templates for Property Value, Invoice Risk, and Compliance Check lower the barrier for financial institutions discovering RWA oracle use cases for the first time." },
                    { label: "Protocol Transparency", value: "↑", desc: "Live oracle node health, consensus data, and processing steps are visible to all users — demonstrating decentralisation in real time rather than asking users to trust a white paper." },
                    { label: "Query Volume", value: "↑", desc: "Template pre-filling reduces query submission friction from multiple minutes to a single click, directly increasing the number of oracle queries submitted per session." },
                    { label: "Developer Trust", value: "↑", desc: "The on-chain data tab shows raw transaction hashes and the terminal shortcut, bridging the UI experience to the underlying Robinhood Chain smart contract layer that developers care about." },
                  ].map((b) => (
                    <div key={b.label} className="p-3 bg-muted rounded-md text-center">
                      <p className="text-primary font-bold text-2xl">{b.value}</p>
                      <p className="font-medium text-xs mt-0.5 mb-1">{b.label}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pb-8 pt-4 border-t border-primary/20 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              VEIL PROTOCOL — DOCUMENTATION V5.0 — BUILT ON ROBINHOOD CHAIN (EVM L2)
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Privacy-Preserving • Verifiable • Decentralized • RWA-Native
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

