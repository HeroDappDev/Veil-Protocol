export function ContractBanner() {
  return (
    <div className="border-b border-primary/20 bg-primary/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
        <div className="flex items-center gap-2" data-testid="text-contract-address">
          <span className="text-xs font-mono text-muted-foreground">CA:</span>
          <code className="text-xs font-mono text-primary font-semibold">coming soon</code>
        </div>
      </div>
    </div>
  );
}

