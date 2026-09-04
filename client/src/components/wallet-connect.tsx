import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useWallet } from "@/context/wallet-context";

export function WalletConnect() {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();

  if (!walletAddress) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 sm:gap-2 min-h-11 px-3 sm:px-4 opacity-40 cursor-not-allowed pointer-events-none"
        disabled
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 sm:gap-2 min-h-11 px-3 sm:px-4"
          data-testid="button-wallet-menu"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="hidden sm:inline font-mono">
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Solana Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="flex flex-col gap-1" data-testid="text-wallet-address">
            <span className="text-xs text-muted-foreground">Address</span>
            <span className="font-mono text-xs">{walletAddress}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
            data-testid="link-explorer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="text-destructive focus:text-destructive"
          data-testid="button-disconnect-wallet"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

