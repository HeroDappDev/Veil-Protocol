import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, FileCheck, Sparkles } from "lucide-react";
import { BlockchainInteractive } from "@/components/blockchain-interactive";
import { CreditFaucet } from "@/components/credit-faucet";

export default function BlockchainPage() {
  return (
    <div className="overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Blockchain Integration</h1>
            <p className="text-muted-foreground">
              On-chain verification via Robinhood Chain (EVM Layer 2)
            </p>
          </div>

          <CreditFaucet />

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <CardTitle>On-Chain Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                ZK proofs and oracle results are anchored on-chain for
                immutable transparency and trustless validation.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Proof Anchoring</h4>
                  <p className="text-sm text-muted-foreground">
                    ZK proof hashes written on-chain for immutable verification
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Transaction History</h4>
                  <p className="text-sm text-muted-foreground">
                    All oracle interactions recorded on-chain for audit trails
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground font-mono">
                <Sparkles className="inline h-4 w-4 mr-2" />
                Interactive Blockchain Features
              </span>
            </div>
          </div>

          {/* Interactive Blockchain Component */}
          <BlockchainInteractive />
        </div>
    </div>
  );
}

