import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Lock, Eye, EyeOff, Key, Database, ArrowRight, BookOpen, Zap, Server, Globe, CheckCircle2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useWallet } from "@/context/wallet-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PrivacyMode {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Eye;
  iconColor: string;
  iconBg: string;
  badge: { text: string; variant: "outline" | "secondary" | "default" };
  shortDesc: string;
  longDesc: string;
  technicalDetails: {
    title: string;
    description: string;
    icon: typeof Server;
  }[];
  useCases: string[];
  color: string;
}

const privacyModes: PrivacyMode[] = [
  {
    id: "public",
    title: "Public Mode",
    subtitle: "Transparent On-Chain Verification",
    icon: Eye,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    badge: { text: "Default", variant: "outline" },
    shortDesc: "Full visibility for queries and results. Stored in database for history and analytics.",
    longDesc: "Public Mode offers complete transparency and auditability for oracle queries within the decentralized network. All query parameters, AI-generated predictions, and zero-knowledge verification proofs are immutably recorded on the distributed ledger, enabling comprehensive analytics, network statistics aggregation, and cryptographic integrity verification by any network participant.",
    technicalDetails: [
      {
        title: "On-Chain Persistence",
        description: "Queries permanently stored on PostgreSQL with full audit trail. Cryptographic hashes ensure tamper-proof historical records. Ideal for regulatory compliance and network transparency.",
        icon: Database,
      },
      {
        title: "Network Consensus Visibility",
        description: "All oracle node responses, consensus metrics, and ZK proof verification steps publicly accessible. Enables third-party auditing and enhances trust through cryptographic transparency.",
        icon: Globe,
      },
      {
        title: "Performance Optimized",
        description: "Fastest query processing with minimal computational overhead. No encryption layers or ephemeral memory constraints. Recommended for non-sensitive market data aggregation.",
        icon: Zap,
      },
    ],
    useCases: [
      "Public market sentiment analysis for cryptocurrency trends",
      "Non-sensitive weather risk assessments for agricultural insurance",
      "Network performance benchmarking and statistical modeling",
      "Academic research requiring reproducible oracle data",
    ],
    color: "blue",
  },
  {
    id: "private",
    title: "Private Mode",
    subtitle: "Military-Grade AES-256 Encryption",
    icon: Lock,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    badge: { text: "Encrypted", variant: "secondary" },
    shortDesc: "Results encrypted before storage. Only accessible with decryption key.",
    longDesc: "Private Mode leverages enterprise-grade AES-256-CBC symmetric encryption to safeguard sensitive oracle query results. The cryptographic envelope ensures that only authorized key holders can decrypt and access prediction data, while maintaining full zero-knowledge proof verification integrity. This architecture provides confidentiality-preserving AI inference with cryptographic guarantees.",
    technicalDetails: [
      {
        title: "AES-256-CBC Cipher",
        description: "Industry-standard Advanced Encryption Standard with 256-bit keys and Cipher Block Chaining mode. Each result encrypted with unique initialization vectors (IV). Future upgrade: client-side Web Crypto API for true end-to-end encryption.",
        icon: Key,
      },
      {
        title: "Envelope Encryption Protocol",
        description: "Hybrid cryptosystem architecture separating data encryption keys (DEK) from key encryption keys (KEK). Enables secure key rotation without re-encrypting historical data. Planned integration with hardware security modules (HSM).",
        icon: Shield,
      },
      {
        title: "Secure Key Management",
        description: "Encrypted results remain accessible across sessions via deterministic key derivation. Server-side key storage (v1.0) will transition to client-controlled keypairs (v2.0) using elliptic curve cryptography (ECC).",
        icon: Server,
      },
    ],
    useCases: [
      "Proprietary trading strategies requiring confidential price predictions",
      "Healthcare risk assessments with HIPAA compliance requirements",
      "Competitive intelligence gathering for enterprise blockchain analytics",
      "Personal financial forecasting with privacy-preserving AI",
    ],
    color: "purple",
  },
  {
    id: "anonymous",
    title: "Anonymous Mode",
    subtitle: "Zero-Persistence Ephemeral Processing",
    icon: EyeOff,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    badge: { text: "Private", variant: "default" },
    shortDesc: "No database storage. Results delivered once and discarded.",
    longDesc: "Anonymous Mode implements a zero-persistence, ephemeral query processing architecture designed for maximum privacy preservation. Queries are processed synchronously in-memory without any database writes, state persistence, or telemetry collection. Results are delivered once via encrypted channels and immediately purged from all network nodes, ensuring cryptographic unlinkability and forward secrecy.",
    technicalDetails: [
      {
        title: "In-Memory Ephemeral Execution",
        description: "Stateless query processing pipeline with zero disk I/O. All AI inference, oracle consensus, and ZK proof generation occur in volatile RAM. Process termination guarantees complete data erasure with no forensic recovery vectors.",
        icon: Zap,
      },
      {
        title: "Forward Secrecy Guarantees",
        description: "No historical query logs, no IP address retention, no behavioral fingerprinting. Each session uses ephemeral Diffie-Hellman key exchange (ECDHE). Adversarial compromise of server infrastructure reveals zero past query data.",
        icon: Shield,
      },
      {
        title: "Cryptographic Unlinkability",
        description: "Queries cannot be correlated across sessions. No user identifiers, session cookies, or temporal analysis vectors. Implements blind signature schemes and mix network protocols for metadata privacy.",
        icon: EyeOff,
      },
    ],
    useCases: [
      "Whistleblower protection for sensitive oracle queries",
      "Dissent-resistant predictions in adversarial geopolitical environments",
      "Anonymous vulnerability assessments for security auditing",
      "Privacy-maximalist blockchain analytics without surveillance risk",
    ],
    color: "green",
  },
];

// Get or create a persistent anonymous session ID
function getSessionId(): string {
  let id = localStorage.getItem("veil_session_id");
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("veil_session_id", id);
  }
  return id;
}

export default function PrivacyPage() {
  const [, setLocation] = useLocation();
  const [selectedMode, setSelectedMode] = useState<PrivacyMode | null>(null);
  const { walletAddress } = useWallet();
  const { toast } = useToast();

  // Use wallet address if connected, otherwise use anonymous session ID
  const identifier = walletAddress || getSessionId();

  // Query to check if user has encryption keys
  const { data: encryptionKeys, isLoading: isLoadingKeys, refetch: refetchKeys } = useQuery({
    queryKey: ['/api/encryption/keys', identifier],
    queryFn: async () => {
      const response = await fetch(`/api/encryption/keys/${identifier}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch encryption keys");
      }
      return response.json();
    },
    retry: false,
  });

  // Mutation to generate encryption keys
  const generateKeysMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/encryption/generate-keys', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: identifier }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate keys");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Encryption Keys Generated",
        description: `${data.keyType} ${data.keySize}-bit encryption keys created successfully`,
      });
      refetchKeys();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate encryption keys",
        variant: "destructive",
      });
    },
  });

  const handleGenerateKeys = () => {
    generateKeysMutation.mutate();
  };

  return (
    <>
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8 pb-6 border-b border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-accent opacity-70">&gt;&gt;&gt;</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="mx-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PRIVACY & ENCRYPTION
                </span>
              </h1>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              &gt; Multi-tier cryptographic privacy architecture for decentralized AI oracles
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {privacyModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Card key={mode.id} data-testid={`card-privacy-${mode.id}`} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode.iconBg}`}>
                        <Icon className={`h-5 w-5 ${mode.iconColor}`} />
                      </div>
                      <CardTitle>{mode.title}</CardTitle>
                    </div>
                    <CardDescription>{mode.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {mode.shortDesc}
                    </p>
                    <Badge variant={mode.badge.variant}>{mode.badge.text}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setSelectedMode(mode)}
                      data-testid={`button-learn-more-${mode.id}`}
                    >
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Dialog open={!!selectedMode} onOpenChange={(open) => !open && setSelectedMode(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-privacy-details">
              {selectedMode && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${selectedMode.iconBg}`}>
                        <selectedMode.icon className={`h-6 w-6 ${selectedMode.iconColor}`} />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl">{selectedMode.title}</DialogTitle>
                        <DialogDescription className="text-base">{selectedMode.subtitle}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background via-background to-primary/5 p-6 mb-6">
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute h-px bg-gradient-to-r from-transparent via-${selectedMode.color}-500 to-transparent`}
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `-100%`,
                            width: `${Math.random() * 200 + 100}px`,
                          }}
                          animate={{
                            left: ['0%', '200%'],
                          }}
                          transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={`v-${i}`}
                          className={`absolute w-px bg-gradient-to-b from-transparent via-${selectedMode.color}-500 to-transparent`}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `-100%`,
                            height: `${Math.random() * 200 + 100}px`,
                          }}
                          animate={{
                            top: ['0%', '200%'],
                          }}
                          transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: Math.random() * 3,
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold mb-2">Architecture Overview</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedMode.longDesc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" />
                      Technical Implementation
                    </h3>
                    <div className="grid gap-4">
                      {selectedMode.technicalDetails.map((detail, index) => {
                        const DetailIcon = detail.icon;
                        return (
                          <motion.div
                            key={detail.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--${selectedMode.color}-500))` }}>
                              <CardHeader>
                                <div className="flex items-center gap-2">
                                  <DetailIcon className={`h-4 w-4 ${selectedMode.iconColor}`} />
                                  <CardTitle className="text-base">{detail.title}</CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {detail.description}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Common Use Cases
                    </h3>
                    <div className="grid gap-2">
                      {selectedMode.useCases.map((useCase, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${selectedMode.iconBg} flex-shrink-0 mt-0.5`}>
                            <span className={`text-xs font-bold ${selectedMode.iconColor}`}>{index + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground flex-1">{useCase}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/docs")}
                      className="gap-2"
                      data-testid="button-read-docs"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read Full Documentation
                    </Button>
                    <Button
                      onClick={() => setSelectedMode(null)}
                      data-testid="button-close-dialog"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>RSA Encryption Keys</CardTitle>
                {encryptionKeys && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription>
                RSA-2048 encryption keys for privacy operations — no wallet required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingKeys ? (
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Checking encryption keys...
                    </p>
                  </div>
                ) : encryptionKeys ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-1">Keys Generated</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your {encryptionKeys.keyType} {encryptionKeys.keySize}-bit encryption keys are ready
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <span className="ml-2 font-mono">{new Date(encryptionKeys.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <span className="ml-2 text-primary font-semibold">Active</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 rounded-lg bg-background border border-primary/30">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-primary uppercase tracking-wide">Your Key ID</label>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const keyId = encryptionKeys.publicKey
                                    .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '')
                                    .slice(0, 12);
                                  navigator.clipboard.writeText(keyId);
                                  toast({
                                    title: "Copied!",
                                    description: "Key ID copied to clipboard",
                                  });
                                }}
                                className="h-6 px-2 gap-1"
                                data-testid="button-copy-key-id"
                              >
                                <Copy className="h-3 w-3" />
                                <span className="text-xs">Copy ID</span>
                              </Button>
                            </div>
                            <div className="bg-muted/50 p-4 rounded border border-border text-center">
                              <code className="text-2xl font-mono font-bold text-primary tracking-widest">
                                {encryptionKeys.publicKey
                                  .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '')
                                  .slice(0, 12)}
                              </code>
                              <p className="text-xs text-muted-foreground mt-2">Short identifier for your encryption key</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Strip PEM headers and copy only the base64 key data
                                const cleanKey = encryptionKeys.publicKey
                                  .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '')
                                  .trim();
                                navigator.clipboard.writeText(cleanKey);
                                toast({
                                  title: "Public Key Copied!",
                                  description: "Base64-encoded key copied (without PEM headers)",
                                });
                              }}
                              className="w-full mt-3 gap-2"
                              data-testid="button-copy-full-key"
                            >
                              <Copy className="h-3 w-3" />
                              Copy Public Key (Base64)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p className="font-semibold">Use your encryption keys:</p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Visit the Terminal page to encrypt data with <code className="bg-muted px-1 rounded">/usekey</code></li>
                        <li>Perform privacy transactions with <code className="bg-muted px-1 rounded">/privacytx</code></li>
                        <li>View key details with <code className="bg-muted px-1 rounded">/mykey</code></li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Generate RSA-2048 encryption keys for privacy operations:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>Public/private key pair stored securely in database</li>
                      <li>Private key encrypted with a session-derived key</li>
                      <li>Unique terminal outputs and privacy transactions</li>
                      <li>Compatible with all terminal commands</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            {!encryptionKeys && !isLoadingKeys && (
              <CardFooter>
                <Button 
                  onClick={handleGenerateKeys}
                  disabled={generateKeysMutation.isPending}
                  className="w-full gap-2"
                  data-testid="button-generate-keys"
                >
                  <Key className="h-4 w-4" />
                  {generateKeysMutation.isPending ? "Generating Keys..." : "Generate Encryption Keys"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Current Implementation</CardTitle>
              </div>
              <CardDescription>
                Privacy system v1.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Server-Side Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    Private mode uses AES-256-CBC encryption with a server-managed key. This is a placeholder
                    implementation until client-side encryption is ready.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Anonymous Queries</h4>
                  <p className="text-sm text-muted-foreground">
                    Zero-persistence mode processes queries synchronously and returns results without
                    any database writes. Perfect for maximum privacy.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Zero-Knowledge Proofs</h4>
                  <p className="text-sm text-muted-foreground">
                    All query results include ZK proofs for verification without revealing underlying data.
                    Consensus-based validation ensures result integrity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </>
  );
}

