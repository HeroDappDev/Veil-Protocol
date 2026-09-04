import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/context/wallet-context";
import { withMainLayout } from "@/components/main-layout";
import { MatrixRain } from "@/components/matrix-rain";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Staking from "@/pages/staking";
import SmartEvents from "@/pages/smart-events";
import DocsPage from "@/pages/docs";
import PrivacyPage from "@/pages/privacy";
import RealtimePage from "@/pages/realtime";
import FederatedPage from "@/pages/federated";
import BlockchainPage from "@/pages/blockchain";
import DevelopersPage from "@/pages/developers";
import TerminalPage from "@/pages/terminal";
import RWAPage from "@/pages/rwa";
import NotFound from "@/pages/not-found";

const HomeWithLayout = withMainLayout(Home);
const DashboardWithLayout = withMainLayout(Dashboard);
const StakingWithLayout = withMainLayout(Staking);
const TerminalWithLayout = withMainLayout(TerminalPage);
const PrivacyWithLayout = withMainLayout(PrivacyPage);
const RealtimeWithLayout = withMainLayout(RealtimePage);
const FederatedWithLayout = withMainLayout(FederatedPage);
const BlockchainWithLayout = withMainLayout(BlockchainPage);
const DevelopersWithLayout = withMainLayout(DevelopersPage);
const DocsWithLayout = withMainLayout(DocsPage);
const RWAWithLayout = withMainLayout(RWAPage);

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeWithLayout} />
      <Route path="/dashboard" component={DashboardWithLayout} />
      <Route path="/oracle" component={DashboardWithLayout} />
      <Route path="/staking" component={StakingWithLayout} />
      <Route path="/terminal" component={TerminalWithLayout} />
      <Route path="/privacy" component={PrivacyWithLayout} />
      <Route path="/realtime" component={RealtimeWithLayout} />
      <Route path="/federated" component={FederatedWithLayout} />
      <Route path="/blockchain" component={BlockchainWithLayout} />
      <Route path="/developers" component={DevelopersWithLayout} />
      <Route path="/docs" component={DocsWithLayout} />
      <Route path="/rwa" component={RWAWithLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <TooltipProvider>
            <MatrixRain />
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

