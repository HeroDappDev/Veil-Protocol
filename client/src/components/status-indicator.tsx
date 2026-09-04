import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2, XCircle, Shield } from "lucide-react";
import { QueryStatus } from "@shared/schema";

interface StatusIndicatorProps {
  status: QueryStatus;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const variants: Record<
    QueryStatus,
    { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    pending: {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Pending",
      variant: "secondary",
    },
    processing: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Processing",
      variant: "default",
    },
    verifying: {
      icon: <Shield className="h-3.5 w-3.5" />,
      label: "Verifying",
      variant: "default",
    },
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Completed",
      variant: "outline",
    },
    failed: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Failed",
      variant: "destructive",
    },
  };

  const config = variants[status];

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 font-medium ${className}`}
      data-testid={`status-${status}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

