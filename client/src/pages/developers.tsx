import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Key, BarChart, Shield, Copy, CheckCircle2, Lock, Zap, Activity, FileKey } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ModalType = "api-keys" | "rate-limiting" | "analytics" | "authentication" | null;

export default function DevelopersPage() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [keyName, setKeyName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // Fetch existing API keys (only when wallet connected)
  const { data: apiKeys, isLoading } = useQuery<any[]>({
    queryKey: ["/api/api-keys", walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      if (!walletAddress) return [];
      const demoSignature = `demo_sig_${walletAddress}_${Date.now()}`;
      const response = await fetch(`/api/api-keys/${walletAddress}`, {
        headers: { "x-wallet-signature": demoSignature },
      });
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return response.json();
    },
  });

  // Generate API key — free during launch, no wallet required
  const generateKeyMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; keyName: string; publicKey: string }) => {
      const demoSignature = `demo_sig_${data.walletAddress}_${Date.now()}`;
      const response = await apiRequest("POST", "/api/api-keys/generate", {
        ...data,
        signature: demoSignature,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKey(data.apiKey);
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys", walletAddress] });
      toast({
        title: "API Key Generated!",
        description: "Save your key securely — you won't be able to see it again.",
      });
      setKeyName("");
      setPublicKey("");
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!publicKey) {
      toast({
        title: "Public Key Required",
        description: "Please visit the Privacy page to generate encryption keys first",
        variant: "destructive",
      });
      return;
    }
    // Use connected wallet or anonymous identifier
    const identifier = walletAddress || `anon_${Date.now()}`;
    generateKeyMutation.mutate({
      walletAddress: identifier,
      keyName: keyName || "API Key",
      publicKey,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "API key copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer API</h1>
          <p className="text-muted-foreground">
            API key management, rate limiting, and usage analytics
          </p>
        </div>

        {/* API Key Generation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Generate API Key
            </CardTitle>
            <CardDescription>
              Create secure API keys for programmatic access to the oracle network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedKey && (
                <Alert className="border-green-500/50 bg-green-500/10" data-testid="alert-generated-key">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>API Key Generated Successfully!</AlertTitle>
                  <AlertDescription className="space-y-3 mt-2">
                    <p className="text-sm text-muted-foreground">
                      Save this key securely — you won't be able to see it again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-background rounded text-xs font-mono break-all" data-testid="text-generated-key">
                        {generatedKey}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCopy(generatedKey)}
                        data-testid="button-copy-key"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Alert data-testid="alert-privacy-requirement">
                <Lock className="h-4 w-4" />
                <AlertTitle>Privacy Keys Required</AlertTitle>
                <AlertDescription>
                  To generate an API key, generate encryption keys on the Privacy page first, then paste your public key below.
                </AlertDescription>
              </Alert>

              {walletAddress && (
                <div className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground">Wallet:</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} Connected
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label htmlFor="key-name">Key Name (Optional)</Label>
                  <Input
                    id="key-name"
                    placeholder="My API Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    data-testid="input-key-name"
                  />
                </div>

                <div>
                  <Label htmlFor="public-key">Public Key from Privacy Page *</Label>
                  <Input
                    id="public-key"
                    placeholder="Paste your RSA public key here..."
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    required
                    data-testid="input-public-key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Visit the Privacy page to generate and copy your public key
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!publicKey || generateKeyMutation.isPending}
                  className="w-full min-h-11 font-mono"
                  data-testid="button-generate-key"
                >
                  {generateKeyMutation.isPending ? "Generating..." : "Generate API Key — FREE"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your API Keys — shown when wallet connected */}
        {walletAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>Manage and monitor your existing API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading API keys...</p>
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className="space-y-3">
                  {apiKeys.map((key: any) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`card-api-key-${key.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium" data-testid={`text-key-name-${key.id}`}>{key.name}</p>
                          {key.isActive ? (
                            <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-500">Inactive</Badge>
                          )}
                        </div>
                        <code className="text-xs text-muted-foreground font-mono" data-testid={`text-key-preview-${key.id}`}>
                          {key.keyPreview}
                        </code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                          <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                          <span>Requests: {key.requestCount || 0}</span>
                          <span>Rate Limit: {key.rateLimit}/day</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No API keys yet. Generate your first key above.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card
            data-testid="card-api-keys"
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => setOpenModal("api-keys")}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModal("api-keys"); } }}
            aria-label="Open API Key Management information"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Key className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle>API Key Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, rotate, and revoke API keys for programmatic access to the oracle network.
                Configure permissions and rate limits per key.
              </p>
              <p className="text-xs text-purple-500 mt-3 font-medium">Click to learn more →</p>
            </CardContent>
          </Card>

          <Card
            data-testid="card-rate-limiting"
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => setOpenModal("rate-limiting")}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModal("rate-limiting"); } }}
            aria-label="Open Rate Limiting information"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>Rate Limiting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Protect your API with customizable rate limits. Monitor usage and prevent abuse
                with automatic throttling.
              </p>
              <p className="text-xs text-blue-500 mt-3 font-medium">Click to learn more →</p>
            </CardContent>
          </Card>

          <Card
            data-testid="card-analytics"
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => setOpenModal("analytics")}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModal("analytics"); } }}
            aria-label="Open Usage Analytics information"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <BarChart className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle>Usage Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track API usage, request patterns, and performance metrics. Optimize your
                integration with detailed analytics.
              </p>
              <p className="text-xs text-green-500 mt-3 font-medium">Click to learn more →</p>
            </CardContent>
          </Card>

          <Card
            data-testid="card-authentication"
            className="cursor-pointer hover-elevate active-elevate-2"
            onClick={() => setOpenModal("authentication")}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModal("authentication"); } }}
            aria-label="Open Authentication information"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Code className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle>Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure API authentication with bearer tokens. Support for multiple keys per
                account with granular permissions.
              </p>
              <p className="text-xs text-orange-500 mt-3 font-medium">Click to learn more →</p>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>RESTful API for oracle network interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div>
                <span className="text-green-600 dark:text-green-400 font-semibold">POST</span>{" "}
                <span className="text-muted-foreground">/api/queries</span>
                <p className="text-xs text-muted-foreground mt-1 ml-16">Submit new oracle query</p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">GET</span>{" "}
                <span className="text-muted-foreground">/api/queries/:id</span>
                <p className="text-xs text-muted-foreground mt-1 ml-16">Get query details and results</p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">GET</span>{" "}
                <span className="text-muted-foreground">/api/proofs/:queryId</span>
                <p className="text-xs text-muted-foreground mt-1 ml-16">Get ZK proof for query</p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">GET</span>{" "}
                <span className="text-muted-foreground">/api/nodes</span>
                <p className="text-xs text-muted-foreground mt-1 ml-16">List oracle nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Dialog open={openModal === "api-keys"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-api-keys">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Key className="h-6 w-6 text-purple-500" />
              API Key Management
            </DialogTitle>
            <DialogDescription>Cryptographic keys for secure oracle network access</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <FileKey className="h-5 w-5 text-purple-500" />
                Wallet-Bound Security
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                API keys can be optionally bound to your wallet address for enhanced security. Keys are generated using your RSA public key from the Privacy page, creating an unbreakable chain of custody from wallet to API access. Connecting a wallet is not required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Hash-Only Storage
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your API keys are stored as SHA-256 hashes — we never store the plaintext key. When you generate a key, save it immediately as it cannot be recovered. If lost, simply generate a new one.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                No Cost
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                API key generation requires no credits and no wallet connection to get started.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "rate-limiting"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-rate-limiting">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-blue-500" />
              Rate Limiting
            </DialogTitle>
            <DialogDescription>Protect the network with intelligent request throttling</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each API key comes with a configurable daily rate limit to ensure fair usage across the network.
            </p>
            <div className="space-y-2">
              {[
                { tier: "Standard", limit: "1,000 req/day", color: "text-blue-500" },
                { tier: "Pro", limit: "10,000 req/day", color: "text-purple-500" },
              ].map((t) => (
                <div key={t.tier} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{t.tier}</span>
                  <span className={`text-sm font-mono font-semibold ${t.color}`}>{t.limit}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "analytics"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-analytics">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <BarChart className="h-6 w-6 text-green-500" />
              Usage Analytics
            </DialogTitle>
            <DialogDescription>Monitor your API usage and performance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track request counts, latency, error rates, and query types through the dashboard. Analytics are tied to your API key and update in real time.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "authentication"} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-authentication">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Code className="h-6 w-6 text-orange-500" />
              Authentication
            </DialogTitle>
            <DialogDescription>Bearer token authentication for all API requests</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Include your API key as a bearer token in the Authorization header of every request.
            </p>
            <div className="p-4 bg-black/50 rounded-lg border border-border">
              <code className="text-xs font-mono text-accent whitespace-pre">{`Authorization: Bearer veil_your_api_key_here

// Example request
fetch("https://api.veilprotocol.io/api/queries", {
  method: "POST",
  headers: {
    "Authorization": "Bearer veil_...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: "BTC/USD price" })
})`}</code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

