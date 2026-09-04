import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Building2, FileText, Landmark, Shield, Globe, TrendingUp,
  Lock, CheckCircle, AlertTriangle, Zap, Eye, EyeOff,
  ArrowRight, RefreshCw, Activity, DollarSign, BarChart3,
  Clock, Star, ChevronRight, Loader2
} from "lucide-react";

// ─── Animated counter hook ──────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Static RWA data ─────────────────────────────────────────────────
const realEstateAssets = [
  {
    id: "RE-001",
    type: "Commercial Office Tower",
    location: "New York, NY",
    totalValue: 48_500_000,
    tokenSupply: 48500,
    availableTokens: 12340,
    yieldPercent: 7.2,
    zkVerified: true,
    privacyLevel: "Maximum",
    occupancy: 94,
    rating: "AAA",
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "RE-002",
    type: "Luxury Residential Complex",
    location: "Miami Beach, FL",
    totalValue: 32_200_000,
    tokenSupply: 32200,
    availableTokens: 8910,
    yieldPercent: 5.8,
    zkVerified: true,
    privacyLevel: "High",
    occupancy: 97,
    rating: "AA+",
    color: "from-blue-500/15 to-blue-500/5",
  },
  {
    id: "RE-003",
    type: "Industrial Logistics Hub",
    location: "Dallas, TX",
    totalValue: 21_750_000,
    tokenSupply: 21750,
    availableTokens: 5420,
    yieldPercent: 8.4,
    zkVerified: true,
    privacyLevel: "Maximum",
    occupancy: 100,
    rating: "AA",
    color: "from-purple-500/15 to-purple-500/5",
  },
  {
    id: "RE-004",
    type: "Mixed-Use Development",
    location: "Austin, TX",
    totalValue: 17_300_000,
    tokenSupply: 17300,
    availableTokens: 3210,
    yieldPercent: 6.5,
    zkVerified: true,
    privacyLevel: "Standard",
    occupancy: 89,
    rating: "AA",
    color: "from-orange-500/15 to-orange-500/5",
  },
  {
    id: "RE-005",
    type: "Data Center Facility",
    location: "Seattle, WA",
    totalValue: 94_000_000,
    tokenSupply: 94000,
    availableTokens: 22100,
    yieldPercent: 9.1,
    zkVerified: true,
    privacyLevel: "Maximum",
    occupancy: 100,
    rating: "AAA",
    color: "from-cyan-500/15 to-cyan-500/5",
  },
  {
    id: "RE-006",
    type: "Medical Office Park",
    location: "Chicago, IL",
    totalValue: 28_600_000,
    tokenSupply: 28600,
    availableTokens: 7800,
    yieldPercent: 6.9,
    zkVerified: true,
    privacyLevel: "High",
    occupancy: 96,
    rating: "AA+",
    color: "from-emerald-500/15 to-emerald-500/5",
  },
];

const invoices = [
  { id: "INV-7X4K2", industry: "Manufacturing", faceValue: 4_200_000, discountRate: 2.8, daysRemaining: 28, zkVerified: true, risk: "Low", buyer: "Fortune 500" },
  { id: "INV-9M1P5", industry: "Technology", faceValue: 1_850_000, discountRate: 3.1, daysRemaining: 42, zkVerified: true, risk: "Low", buyer: "Listed Corp" },
  { id: "INV-3R8T7", industry: "Healthcare", faceValue: 7_600_000, discountRate: 2.4, daysRemaining: 15, zkVerified: true, risk: "Very Low", buyer: "Gov Entity" },
  { id: "INV-5K2L9", industry: "Logistics", faceValue: 980_000, discountRate: 3.8, daysRemaining: 60, zkVerified: true, risk: "Medium", buyer: "Mid-Market" },
  { id: "INV-2W6X3", industry: "Retail", faceValue: 2_450_000, discountRate: 3.3, daysRemaining: 35, zkVerified: true, risk: "Low", buyer: "Listed Corp" },
  { id: "INV-8J4V1", industry: "Energy", faceValue: 12_100_000, discountRate: 2.1, daysRemaining: 90, zkVerified: true, risk: "Very Low", buyer: "Gov Entity" },
];

const bonds = [
  { id: "BND-001", issuer: "Sovereign AAA", type: "Treasury Bond", coupon: 4.75, maturity: "2029-12-31", minInvestment: 100_000, yieldToMaturity: 4.82, rating: "AAA", zkVerified: true },
  { id: "BND-002", issuer: "Municipal AA+", type: "Municipal Bond", coupon: 5.20, maturity: "2031-06-15", minInvestment: 50_000, yieldToMaturity: 5.31, rating: "AA+", zkVerified: true },
  { id: "BND-003", issuer: "Corporate AA", type: "Corporate Bond", coupon: 6.10, maturity: "2030-03-20", minInvestment: 250_000, yieldToMaturity: 6.24, rating: "AA", zkVerified: true },
  { id: "BND-004", issuer: "Sovereign AAA", type: "Inflation-Linked", coupon: 3.90, maturity: "2034-09-01", minInvestment: 100_000, yieldToMaturity: 4.05, rating: "AAA", zkVerified: true },
  { id: "BND-005", issuer: "Supranational", type: "Green Bond", coupon: 4.45, maturity: "2032-11-15", minInvestment: 150_000, yieldToMaturity: 4.58, rating: "AAA", zkVerified: true },
];

// ─── Dark Pool Order (for animation) ──────────────────────────────────
interface DarkOrder {
  id: string;
  side: "buy" | "sell";
  x: number;
  y: number;
  matched: boolean;
  settled: boolean;
  opacity: number;
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ─── Dark Pool Visualizer ──────────────────────────────────────────────
function DarkPoolVisualizer() {
  const [orders, setOrders] = useState<DarkOrder[]>([]);
  const [matches, setMatches] = useState(0);
  const [volume, setVolume] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      const tick = tickRef.current;

      // Spawn new orders
      if (tick % 2 === 0) {
        const side = Math.random() > 0.5 ? "buy" : "sell";
        const newOrder: DarkOrder = {
          id: `o-${tick}-${Math.random()}`,
          side,
          x: side === "buy" ? 5 + Math.random() * 35 : 60 + Math.random() * 35,
          y: 15 + Math.random() * 70,
          matched: false,
          settled: false,
          opacity: 1,
        };
        setOrders(prev => [...prev.slice(-18), newOrder]);
      }

      // Try to match orders every 4 ticks
      if (tick % 4 === 0) {
        setOrders(prev => {
          const buys = prev.filter(o => o.side === "buy" && !o.matched);
          const sells = prev.filter(o => o.side === "sell" && !o.matched);
          if (buys.length > 0 && sells.length > 0) {
            const buyId = buys[0].id;
            const sellId = sells[0].id;
            setMatches(m => m + 1);
            setVolume(v => v + Math.floor(Math.random() * 5_000_000 + 1_000_000));
            return prev.map(o =>
              o.id === buyId || o.id === sellId ? { ...o, matched: true } : o
            );
          }
          return prev;
        });
      }

      // Fade out matched orders
      if (tick % 6 === 0) {
        setOrders(prev => prev
          .map(o => o.matched ? { ...o, opacity: o.opacity - 0.3, settled: o.opacity < 0.3 } : o)
          .filter(o => !o.settled)
        );
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-80 bg-black/60 border border-primary/20 rounded-lg overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(200,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Labels */}
      <div className="absolute top-3 left-3 text-xs font-mono text-primary/50 uppercase tracking-wider">Buy Side</div>
      <div className="absolute top-3 right-3 text-xs font-mono text-primary/50 uppercase tracking-wider">Sell Side</div>

      {/* Divider */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-black border border-primary/30 rounded-full px-3 py-1 text-[10px] font-mono text-primary uppercase tracking-wider">
          ZK Matching Engine
        </div>
      </div>

      {/* Orders */}
      {orders.map(order => (
        <div
          key={order.id}
          className="absolute transition-all duration-300"
          style={{ left: `${order.x}%`, top: `${order.y}%`, opacity: order.opacity }}
        >
          <div className={`
            w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold
            ${order.matched
              ? "border-primary bg-primary/30 text-primary animate-pulse"
              : order.side === "buy"
                ? "border-green-500/60 bg-green-500/10 text-green-400"
                : "border-red-500/60 bg-red-500/10 text-red-400"
            }
          `}>
            {order.matched ? "✓" : order.side === "buy" ? "B" : "S"}
          </div>
          {order.matched && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary whitespace-nowrap">
              ZK SETTLED
            </div>
          )}
        </div>
      ))}

      {/* Bottom stats */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs font-mono">
        <span className="text-primary/60">Matches: <span className="text-primary font-bold">{matches}</span></span>
        <span className="text-primary/60">Volume: <span className="text-primary font-bold">{formatCurrency(volume)}</span></span>
        <span className="text-primary/60">MEV Risk: <span className="text-green-400 font-bold">ZERO</span></span>
        <span className="text-primary/60">Visibility: <span className="text-primary font-bold">PRIVATE</span></span>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-mono text-primary/60 uppercase">Live</span>
      </div>
    </div>
  );
}

// ─── ZK Compliance Oracle Demo ────────────────────────────────────────
function ComplianceOracleDemo() {
  const [address, setAddress] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<null | { status: "cleared" | "review"; proofHash: string; checks: string[]; timestamp: string }>(null);

  const runCheck = async () => {
    if (!address.trim()) return;
    setChecking(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2400));
    const isCleared = Math.random() > 0.15;
    const hash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setResult({
      status: isCleared ? "cleared" : "review",
      proofHash: `0x${hash}`,
      checks: isCleared
        ? ["OFAC/SDN Screening", "FATF Travel Rule", "AML Risk Scoring", "Jurisdiction Compliance", "PEP Database Check"]
        : ["OFAC/SDN Screening", "FATF Travel Rule", "AML Risk Scoring"],
      timestamp: new Date().toISOString(),
    });
    setChecking(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter wallet address (0x... or any address)"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="font-mono text-sm bg-black/40 border-primary/30 focus:border-primary/60 text-primary placeholder:text-muted-foreground/50"
          data-testid="input-compliance-address"
          onKeyDown={e => e.key === "Enter" && runCheck()}
        />
        <Button
          onClick={runCheck}
          disabled={checking || !address.trim()}
          className="gap-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono shrink-0"
          data-testid="button-run-compliance"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {checking ? "Running..." : "Run ZK Check"}
        </Button>
      </div>

      {checking && (
        <div className="border border-primary/20 rounded-lg p-4 bg-black/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-mono text-primary/70">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Generating zero-knowledge proof...
          </div>
          {["Screening OFAC/SDN database", "Checking FATF Travel Rule", "Computing AML risk score", "Verifying jurisdiction compliance", "Generating ZK attestation proof"].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              {step}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className={`border rounded-lg p-4 space-y-3 ${result.status === "cleared" ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {result.status === "cleared"
                ? <CheckCircle className="h-5 w-5 text-green-400" />
                : <AlertTriangle className="h-5 w-5 text-yellow-400" />
              }
              <span className={`font-mono font-bold text-sm uppercase tracking-wider ${result.status === "cleared" ? "text-green-400" : "text-yellow-400"}`}>
                {result.status === "cleared" ? "ZK Compliance Cleared" : "Manual Review Required"}
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary/70">
              ZK Proof Generated
            </Badge>
          </div>

          <div className="space-y-1.5">
            {result.checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-400 shrink-0" />
                {check} — <span className="text-primary/60">PASSED</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-primary/10 space-y-1">
            <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">ZK Proof Hash (no identity disclosed)</div>
            <div className="text-[11px] font-mono text-primary/50 break-all">{result.proofHash}</div>
            <div className="text-[10px] font-mono text-muted-foreground/40">{result.timestamp}</div>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground/50 italic">
            This proof verifies compliance without revealing the subject's identity, transaction history, or personal data.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function RWAPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const tvl = useCounter(2_847_000_000, 2500, statsVisible);
  const tokenizations = useCounter(1247, 2000, statsVisible);
  const attestations = useCounter(48_392, 2200, statsVisible);
  const darkPoolVol = useCounter(892_000_000, 2300, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-8">
        <div className="absolute inset-0 bg-gradient-radial from-primary/6 via-transparent to-transparent blur-3xl pointer-events-none" />
        <div className="relative text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">RWA Infrastructure — Live</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Real-World Asset
            </span>
            <br />
            <span className="text-foreground">Privacy Infrastructure</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Tokenize, trade, and finance real-world assets with institutional-grade cryptographic privacy. Zero-knowledge proofs ensure compliance without exposure.
          </p>
        </div>

        {/* Live Stats */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          {[
            { label: "Total Value Locked", value: `$${(tvl / 1_000_000_000).toFixed(2)}B`, icon: DollarSign, sub: "Across all asset classes" },
            { label: "Active Tokenizations", value: tokenizations.toLocaleString(), icon: Building2, sub: "Properties, invoices, bonds" },
            { label: "ZK Attestations", value: attestations.toLocaleString(), icon: Shield, sub: "Compliance proofs issued" },
            { label: "Dark Pool Volume", value: `$${(darkPoolVol / 1_000_000).toFixed(0)}M`, icon: EyeOff, sub: "Private block trades" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/50 border-primary/20 backdrop-blur-sm hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mt-1" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary font-mono">{stat.value}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{stat.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Asset Explorer */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <div className="mb-6 space-y-1">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Asset Explorer
          </h2>
          <p className="text-sm text-muted-foreground font-mono">Browse ZK-verified tokenized assets across all categories</p>
        </div>

        <Tabs defaultValue="real-estate" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 border border-primary/20 bg-card/60 p-1 sm:grid-cols-3">
            <TabsTrigger value="real-estate" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary" data-testid="tab-real-estate">
              <Building2 className="h-3.5 w-3.5" /> Real Estate
            </TabsTrigger>
            <TabsTrigger value="invoices" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary" data-testid="tab-invoices">
              <FileText className="h-3.5 w-3.5" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="bonds" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary" data-testid="tab-bonds">
              <Landmark className="h-3.5 w-3.5" /> Treasury Bonds
            </TabsTrigger>
          </TabsList>

          {/* Real Estate Tab */}
          <TabsContent value="real-estate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {realEstateAssets.map(asset => (
                <Card key={asset.id} className="bg-card/60 border-primary/15 backdrop-blur-sm hover-elevate group overflow-hidden">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${asset.color}`} />
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{asset.id}</div>
                        <CardTitle className="text-sm font-bold mt-0.5">{asset.type}</CardTitle>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{asset.location}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {asset.zkVerified && (
                          <Badge className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/30 font-mono">
                            <Shield className="h-2.5 w-2.5" /> ZK Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary/60">
                          {asset.rating}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Total Value</div>
                        <div className="font-bold text-foreground font-mono">{formatCurrency(asset.totalValue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Annual Yield</div>
                        <div className="font-bold text-primary font-mono">{asset.yieldPercent}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Occupancy</div>
                        <div className="font-bold text-foreground font-mono">{asset.occupancy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Privacy</div>
                        <div className="font-bold text-primary/80 font-mono text-[11px]">{asset.privacyLevel}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
                        <span>Token Availability</span>
                        <span>{((asset.availableTokens / asset.tokenSupply) * 100).toFixed(0)}% available</span>
                      </div>
                      <Progress
                        value={((asset.tokenSupply - asset.availableTokens) / asset.tokenSupply) * 100}
                        className="h-1.5 bg-primary/10"
                      />
                    </div>

                    <Button
                      size="sm"
                      className="w-full gap-2 font-mono text-xs border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary"
                      data-testid={`button-request-access-${asset.id}`}
                    >
                      <Lock className="h-3 w-3" />
                      Request Private Access
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="border border-primary/15 rounded-lg overflow-hidden bg-card/40">
              <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Invoice IDs are cryptographically masked — buyer/seller identity never disclosed
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/25 text-primary/60 gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Live Marketplace
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-primary/10 text-muted-foreground/60 uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-2.5 text-left">Invoice ID</th>
                      <th className="px-4 py-2.5 text-left">Industry</th>
                      <th className="px-4 py-2.5 text-right">Face Value</th>
                      <th className="px-4 py-2.5 text-right">Discount</th>
                      <th className="px-4 py-2.5 text-right">Days Left</th>
                      <th className="px-4 py-2.5 text-left">Risk</th>
                      <th className="px-4 py-2.5 text-left">ZK Status</th>
                      <th className="px-4 py-2.5 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-primary/3 transition-colors group">
                        <td className="px-4 py-3 text-primary font-bold">{inv.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{inv.industry}</td>
                        <td className="px-4 py-3 text-right text-foreground font-bold">{formatCurrency(inv.faceValue)}</td>
                        <td className="px-4 py-3 text-right text-primary">{inv.discountRate}%</td>
                        <td className="px-4 py-3 text-right">
                          <span className={inv.daysRemaining <= 30 ? "text-yellow-400" : "text-muted-foreground"}>{inv.daysRemaining}d</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] border-primary/20 ${inv.risk === "Very Low" ? "text-green-400 border-green-500/30" : inv.risk === "Low" ? "text-primary/80" : "text-yellow-400 border-yellow-500/30"}`}>
                            {inv.risk}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/30">
                            <CheckCircle className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-primary/60 hover:text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            Finance <ArrowRight className="h-2.5 w-2.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bonds.map(bond => (
                <Card key={bond.id} className="bg-card/60 border-primary/15 backdrop-blur-sm hover-elevate">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{bond.id}</div>
                        <CardTitle className="text-sm font-bold mt-0.5">{bond.type}</CardTitle>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{bond.issuer}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30 font-mono">{bond.rating}</Badge>
                        {bond.zkVerified && (
                          <Badge variant="outline" className="text-[10px] gap-1 font-mono border-green-500/30 text-green-400">
                            <Shield className="h-2.5 w-2.5" /> ZK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Coupon Rate</div>
                        <div className="font-bold text-foreground font-mono">{bond.coupon}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">YTM</div>
                        <div className="font-bold text-primary font-mono">{bond.yieldToMaturity}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Maturity</div>
                        <div className="font-bold text-foreground font-mono text-[11px]">{bond.maturity}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground/60 font-mono text-[10px] uppercase">Min. Investment</div>
                        <div className="font-bold text-foreground font-mono">{formatCurrency(bond.minInvestment)}</div>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-primary/10 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
                      <Lock className="h-3 w-3 text-primary/40" />
                      Private subscription — holder count masked by ZK proof
                    </div>

                    <Button
                      size="sm"
                      className="w-full gap-2 font-mono text-xs border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary"
                      data-testid={`button-subscribe-${bond.id}`}
                    >
                      <Landmark className="h-3 w-3" />
                      Private Subscribe
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* ZK Compliance Oracle */}
      <section className="relative border-y border-primary/15 bg-card/20 backdrop-blur-sm py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider">
                <Shield className="h-4 w-4" />
                ZK Compliance Oracle
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Prove Compliance.<br />
                <span className="text-primary">Reveal Nothing.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Veil Protocol's Compliance Oracle screens any wallet address against OFAC/SDN lists, FATF Travel Rule requirements, AML risk models, and jurisdiction-specific regulations — then generates a cryptographic zero-knowledge proof of clearance.
              </p>
              <div className="space-y-2">
                {[
                  "No identity data ever leaves the ZK circuit",
                  "Proof verifiable on-chain by any smart contract",
                  "Satisfies MiCA, FATF, and SEC reporting requirements",
                  "Results in milliseconds — not days",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">Live Demo — Enter any wallet address</div>
              <ComplianceOracleDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Pool */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider">
              <EyeOff className="h-4 w-4" />
              Dark Pool DEX
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Institutional Block Trading.<br />
              <span className="text-primary">Zero Front-Running.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our dark pool matches buy and sell orders for tokenized real-world assets using zero-knowledge cryptography. No one sees your order size, direction, or target price until settlement is complete.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "MEV Protection", value: "100%", icon: Shield },
                { label: "Order Privacy", value: "Maximum", icon: Lock },
                { label: "Settlement", value: "~2 sec", icon: Zap },
                { label: "Slippage", value: "Near Zero", icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="border border-primary/15 rounded-md p-3 bg-card/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">{stat.label}</span>
                  </div>
                  <div className="text-sm font-bold text-primary font-mono">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">Live Order Flow Visualization</div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/60 inline-block" />Buy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/60 inline-block" />Sell</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Matched</span>
              </div>
            </div>
            <DarkPoolVisualizer />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-primary/15 bg-card/10 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to Access Private RWA Infrastructure?</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Submit an AI oracle query to get ZK-attested valuations on any real-world asset — instantly, privately, verifiably.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              className="gap-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono"
              onClick={() => window.location.href = "/dashboard"}
              data-testid="button-rwa-launch-oracle"
            >
              <Zap className="h-4 w-4" />
              Launch Oracle Query
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-primary/25 text-primary/70 hover:text-primary hover:border-primary/50 font-mono"
              onClick={() => window.location.href = "/docs"}
              data-testid="button-rwa-docs"
            >
              <Activity className="h-4 w-4" />
              View RWA Docs
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
