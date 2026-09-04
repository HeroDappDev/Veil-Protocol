import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { type Proof } from "@shared/schema";
import { Shield, Copy, Download, CheckCircle2, Circle, Terminal } from "lucide-react";
import { InfoTooltip } from "./info-tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProofVerificationPanelProps {
  proof: Proof;
}

export function ProofVerificationPanel({ proof }: ProofVerificationPanelProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const consensusPercentage = (proof.consensusNodes / proof.totalNodes) * 100;
  const verificationSteps = proof.verificationSteps as any[];

  const copyProofHash = () => {
    navigator.clipboard.writeText(proof.proofHash);
    toast({
      title: "Copied to clipboard",
      description: "Proof hash copied successfully",
    });
  };

  const downloadProof = () => {
    const proofData = {
      hash: proof.proofHash,
      verified: Boolean(proof.verified),
      consensusNodes: proof.consensusNodes,
      totalNodes: proof.totalNodes,
      verificationSteps: proof.verificationSteps,
      createdAt: proof.createdAt,
    };
    
    const blob = new Blob([JSON.stringify(proofData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zk-proof-${proof.proofHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Proof downloaded",
      description: "Zero-knowledge proof saved successfully",
    });
  };

  const viewInTerminal = () => {
    // Store the proof hash to pre-fill terminal
    localStorage.setItem('terminalCommand', `/txn ${proof.proofHash}`);
    setLocation('/terminal');
    
    toast({
      title: "Terminal Redirect",
      description: "Opening terminal with proof verification...",
      className: "border-accent/30",
    });
  };

  return (
    <Card data-testid="card-proof-verification">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Zero-Knowledge Proof</CardTitle>
            <InfoTooltip content="ZK proofs verify AI computations without revealing the underlying data or models. This ensures privacy while maintaining trust in oracle results." />
          </div>
          {proof.verified ? (
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary">Verifying...</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Proof Hash</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyProofHash}
              className="h-8 w-8"
              data-testid="button-copy-hash"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs font-mono break-all" data-testid="text-proof-hash">
              {proof.proofHash}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Oracle Node Consensus</span>
            <span className="font-mono font-semibold" data-testid="text-consensus">
              {proof.consensusNodes}/{proof.totalNodes}
            </span>
          </div>
          <Progress value={consensusPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {proof.consensusNodes} out of {proof.totalNodes} nodes have verified this computation
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="verification-steps" className="border-0">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              Verification Steps ({verificationSteps.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {verificationSteps.map((step: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`step-${index}`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1"
            onClick={downloadProof}
            data-testid="button-download-proof"
          >
            <Download className="h-3.5 w-3.5" />
            Download Proof
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1"
            onClick={viewInTerminal}
            data-testid="button-view-terminal"
          >
            <Terminal className="h-3.5 w-3.5" />
            View in Terminal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

