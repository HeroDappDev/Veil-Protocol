import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelPlayground } from "@/components/ai-model-playground";
import { Network, Shield, Database, TrendingUp, Sparkles } from "lucide-react";

export default function FederatedPage() {
  return (
    <div className="overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 font-mono text-sm text-accent mb-4">
              <span className="opacity-70">&gt;&gt;&gt;</span>
              <span className="uppercase tracking-wider">AI_Model_Playground</span>
              <span className="opacity-70">&lt;&lt;&lt;</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              <span className="mx-2">Interactive AI Model Testing</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              &gt; Test AI models with privacy preservation • Generate unique terminal commands • View results securely
            </p>
          </div>

          {/* AI Model Playground */}
          <div className="mb-12">
            <AIModelPlayground />
          </div>

          {/* Divider */}
          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground font-mono">
                <Sparkles className="inline h-4 w-4 mr-2" />
                Privacy Technology Background
              </span>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Network className="h-5 w-5 text-primary" />
                <CardTitle>What is Federated Learning?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Federated Learning enables collaborative model training without sharing raw data. Each oracle
                node trains on its local data, then shares only model updates (gradients) which are aggregated
                into a global model. This preserves data privacy while improving prediction accuracy.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Privacy-Preserving</h4>
                    <p className="text-xs text-muted-foreground">
                      Raw data never leaves oracle nodes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Distributed</h4>
                    <p className="text-xs text-muted-foreground">
                      Training across decentralized network
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Improved Accuracy</h4>
                    <p className="text-xs text-muted-foreground">
                      Learn from diverse data sources
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Workflow</CardTitle>
              <CardDescription>How federated learning works in the ZK Oracle Network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Initialize Global Model</h4>
                    <p className="text-sm text-muted-foreground">
                      Start with a base model distributed to all participating oracle nodes
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Local Training</h4>
                    <p className="text-sm text-muted-foreground">
                      Each node trains the model on its local data (historical queries, results)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Share Model Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Nodes submit encrypted gradients/weights to central aggregator
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Aggregate & Distribute</h4>
                    <p className="text-sm text-muted-foreground">
                      Combine updates into improved global model, distribute back to nodes
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Repeat</h4>
                    <p className="text-sm text-muted-foreground">
                      Continue for multiple rounds until model converges
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

