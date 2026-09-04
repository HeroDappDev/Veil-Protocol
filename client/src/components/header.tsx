import { Wallet, Home, BookOpen, BarChart3, Brain, Shield, Radio, Code, Link2, Terminal, Coins, Menu, Landmark } from "lucide-react";
import { SiX, SiGithub } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { WalletConnect } from "./wallet-connect";
import { useWallet } from "@/context/wallet-context";
import { useQuery } from "@tanstack/react-query";
import logoImage from "@assets/image_1788489627822.png";
import type { CreditBalance } from "@shared/schema";
import { useState } from "react";

const SHOW_GITHUB_LINK = true;

export function Header() {
  const [location, setLocation] = useLocation();
  const { walletAddress } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: creditData } = useQuery<CreditBalance>({
    queryKey: ["/api/credits", walletAddress],
    enabled: !!walletAddress,
  });

  const creditBalance = walletAddress ? (creditData?.balance || 0) : 0;

  const navItems = [
    { path: "/", label: "HOME", icon: Home, tooltip: "Return to home page" },
    { path: "/staking", label: "STAKING", icon: Coins, tooltip: "VEIL token staking pools" },
    { path: "/terminal", label: "TERMINAL", icon: Terminal, tooltip: "Wallet-authenticated privacy terminal" },
    { path: "/oracle", label: "ORACLE", icon: BarChart3, tooltip: "Oracle command center" },
    { path: "/federated", label: "AI_MODELS", icon: Brain, tooltip: "Interactive AI model playground" },
    { path: "/privacy", label: "PRIVACY", icon: Shield, tooltip: "End-to-end encryption tools" },
    { path: "/blockchain", label: "CREDITS", icon: Link2, tooltip: "Claim free credits" },
    { path: "/realtime", label: "LIVE", icon: Radio, tooltip: "Real-time updates" },
    { path: "/developers", label: "API", icon: Code, tooltip: "Developer API keys" },
    { path: "/rwa", label: "RWA", icon: Landmark, tooltip: "Real-world asset infrastructure" },
    { path: "/docs", label: "DOCS", icon: BookOpen, tooltip: "Documentation" },
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/25 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85 scan-lines">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/4 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2 sm:min-h-20 sm:gap-4 sm:py-3">

          {/* Tablet/Mobile Navigation — anchored left */}
          <div className="flex flex-shrink-0 items-center lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary border border-primary/30 hover:bg-primary/10"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[380px] bg-background/98 backdrop-blur-xl border-r border-primary/25 flex flex-col">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle className="text-left font-mono text-lg text-primary uppercase tracking-wider">
                    Navigation
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto mt-6 space-y-2 pr-2">
                  {navItems.map((item) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant="ghost"
                        size="lg"
                        className={`
                          w-full !justify-start !items-start gap-3 font-mono text-sm tracking-wider px-4 py-4
                          h-auto min-h-[4rem] !whitespace-normal
                          transition-all duration-300 rounded-md
                          ${isActive
                            ? 'text-primary bg-primary/10 border border-primary/35'
                            : 'text-primary/60 hover:text-primary hover:bg-primary/5 border border-primary/15 hover:border-primary/30'
                          }
                        `}
                        onClick={() => handleNavClick(item.path)}
                        data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0 mt-1" />
                        <div className="flex flex-col items-start gap-1 min-w-0 flex-1 overflow-hidden">
                          <span className="font-bold leading-tight break-words w-full">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight break-words w-full">{item.tooltip}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo Section */}
          <div className="flex min-w-0 flex-shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/15 blur-xl group-hover:bg-primary/30 transition-all duration-300 rounded-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-primary/35 bg-black sm:h-14 sm:w-14">
                <img
                  src={logoImage}
                  alt="Veil Protocol Logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="whitespace-nowrap bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-sm font-bold uppercase tracking-widest text-transparent sm:text-xl">
                VEIL<span className="hidden sm:inline"> PROTOCOL</span>
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground leading-none hidden sm:block tracking-wider uppercase">
                Privacy • RWA • Zero-Knowledge
              </p>
            </div>
          </div>

          {/* Laptop/Desktop Navigation — 2 rows */}
          <nav className="hidden lg:flex flex-col gap-1 justify-center">
            <div className="flex items-center gap-1 justify-center">
              {navItems.slice(0, 5).map((item) => {
                const isActive = location === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`
                          relative font-mono text-[11px] xl:text-xs tracking-wider px-2 xl:px-3 py-1.5 min-h-8
                          transition-all duration-300 rounded-md
                          ${isActive
                            ? 'text-primary bg-primary/10 border border-primary/40 shadow-[0_0_12px_rgba(200,255,0,0.2)]'
                            : 'text-primary/60 hover:text-primary hover:bg-primary/5 border border-primary/15 hover:border-primary/35'
                          }
                        `}
                        onClick={() => setLocation(item.path)}
                        data-testid={`button-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-mono text-xs bg-card border-primary/25">
                      <p className="text-primary">&gt; {item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            <div className="flex items-center gap-1 justify-center">
              {navItems.slice(5).map((item) => {
                const isActive = location === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`
                          relative font-mono text-[11px] xl:text-xs tracking-wider px-2 xl:px-3 py-1.5 min-h-8
                          transition-all duration-300 rounded-md
                          ${isActive
                            ? 'text-primary bg-primary/10 border border-primary/40 shadow-[0_0_12px_rgba(200,255,0,0.2)]'
                            : 'text-primary/60 hover:text-primary hover:bg-primary/5 border border-primary/15 hover:border-primary/35'
                          }
                        `}
                        onClick={() => setLocation(item.path)}
                        data-testid={`button-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-mono text-xs bg-card border-primary/25">
                      <p className="text-primary">&gt; {item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </nav>

          {/* Right — Social Links + Credits + Wallet */}
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {SHOW_GITHUB_LINK && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/HeroDappDev/Veil-Protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group transition-all duration-300"
                    data-testid="link-github"
                  >
                    <SiGithub className="h-5 w-5 sm:h-6 sm:w-6 text-primary/70 hover:text-primary transition-colors" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-mono text-xs bg-card border-primary/25">
                  <p className="text-primary">&gt; GitHub Repository</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://x.com/VeilProtocolRH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition-all duration-300"
                  data-testid="link-twitter"
                >
                  <SiX className="h-5 w-5 sm:h-6 sm:w-6 text-primary/70 hover:text-primary transition-colors" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs bg-card border-primary/25">
                <p className="text-primary">&gt; Coming soon</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex flex-col gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div data-testid="text-oracle-credits" className="hidden sm:block">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/8 blur-md group-hover:bg-primary/16 transition-all duration-300" />
                      <Badge
                        variant="outline"
                        className="relative gap-1.5 sm:gap-2 font-mono px-2 sm:px-3 py-1 sm:py-1.5 border-primary/30 bg-card/60 backdrop-blur-sm text-xs"
                      >
                        <Wallet className="h-3 w-3 text-primary" />
                        <span className="text-xs sm:text-sm text-primary font-bold">
                          {creditBalance.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground hidden md:inline">credits</span>
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-mono text-xs bg-card border-primary/25">
                  <p className="text-primary">&gt; {walletAddress ? "Available oracle query credits" : "Connect wallet to access credits"}</p>
                </TooltipContent>
              </Tooltip>

              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

