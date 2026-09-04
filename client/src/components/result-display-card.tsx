import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Result, type Query } from "@shared/schema";
import { TrendingUp, Share2, Eye, Database, Copy, Check, Hash } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ResultDisplayCardProps {
  result: Result;
  query: Query;
}

function HashDisplay({ hash, label }: { hash: string | null | undefined; label: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`,
        className: "border-accent/30",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!hash) return <span className="text-xs text-muted-foreground">Not available</span>;

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono bg-card border border-primary/20 px-2 py-1 rounded flex-1 truncate" data-testid={`text-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {hash}
      </code>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5 min-h-8"
        data-testid={`button-copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="text-xs">Copy</span>
          </>
        )}
      </Button>
    </div>
  );
}

export function ResultDisplayCard({ result, query }: ResultDisplayCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const sourceData = result.sourceData as Record<string, any>;

  return (
    <>
      <Card data-testid="card-result">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base md:text-lg">Prediction Result</CardTitle>
            <Badge variant="outline" className="gap-1 sm:gap-1.5 text-xs whitespace-nowrap">
              <Database className="h-3 w-3" />
              <span className="hidden xs:inline">Block #</span>{result.blockNumber || "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="text-center py-3 sm:py-4 space-y-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
              <p className="text-2xl md:text-3xl font-bold leading-tight break-all" data-testid="text-prediction">
                {result.prediction}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              for {query.target}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Confidence Score</span>
              <span className="font-mono font-semibold text-sm" data-testid="text-confidence">
                {result.confidence}%
              </span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>

          {result.transactionHash && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">Transaction Hash</span>
              </div>
              <HashDisplay hash={result.transactionHash} label="Transaction Hash" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Data Sources</p>
              <p className="text-sm font-medium">
                {sourceData.sources?.length || 0} sources
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Timestamp</p>
              <p className="text-sm font-medium">
                {format(new Date(result.createdAt), "MMM dd, HH:mm")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 flex-1 min-h-9 sm:min-h-10"
              data-testid="button-share-result"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 flex-1 min-h-9 sm:min-h-10"
              onClick={() => setShowDetailsModal(true)}
              data-testid="button-view-details"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm">View Details</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto terminal-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              <DialogTitle className="text-lg uppercase">Query Details</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Complete query and result information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Query Metadata */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase text-accent border-b border-primary/20 pb-2">Query Metadata</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Query Type</span>
                  <p className="font-medium capitalize">{query.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Target</span>
                  <p className="font-medium">{query.target}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Privacy Level</span>
                  <Badge variant="outline" className="text-xs capitalize">{query.privacyLevel}</Badge>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs capitalize">{query.status}</Badge>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">AI Model</span>
                  <p className="text-xs">{query.aiModel}</p>
                </div>
              </div>
            </div>

            {/* Prediction Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase text-accent border-b border-primary/20 pb-2">Prediction Metrics</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Prediction</span>
                  <p className="text-2xl font-bold text-primary">{result.prediction}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Confidence Score</span>
                  <div className="flex items-center gap-3">
                    <Progress value={result.confidence} className="h-2 flex-1" />
                    <span className="font-mono font-semibold text-sm">{result.confidence}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Data Sources</span>
                  <p className="font-medium text-sm">{sourceData.sources?.length || 0} sources analyzed</p>
                </div>
              </div>
            </div>

            {/* AI Analysis & Outlook */}
            {(sourceData.fullAnalysis || sourceData.rawResponse) && (
              <div className="space-y-3">
                <h3 className="text-sm uppercase text-accent border-b border-primary/20 pb-2">AI Analysis & Outlook</h3>
                <div className="bg-card/50 border border-primary/10 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-ai-analysis">
                    {sourceData.fullAnalysis || sourceData.rawResponse}
                  </p>
                  {sourceData.modelUsed && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <Badge variant="outline" className="text-xs">
                        Model: {sourceData.modelUsed}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Details */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase text-accent border-b border-primary/20 pb-2">Transaction Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Query Transaction Hash</span>
                  <HashDisplay hash={query.transactionHash} label="Query Hash" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Result Transaction Hash</span>
                  <HashDisplay hash={result.transactionHash} label="Result Hash" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Block Number</span>
                    <p className="font-mono text-sm">{result.blockNumber || "Pending"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Created</span>
                    <p className="font-mono text-sm">{format(new Date(result.createdAt), "MMM dd, yyyy HH:mm:ss")}</p>
                  </div>
                </div>
              </div>
            </div>

            {result.ipfsHash && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">IPFS Hash</span>
                <HashDisplay hash={result.ipfsHash} label="IPFS Hash" />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              Use transaction hash in terminal: <code className="text-accent">/txn &lt;hash&gt;</code>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

