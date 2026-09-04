import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type OracleNode } from "@shared/schema";
import { Activity, Clock, CheckCircle } from "lucide-react";

interface OracleNodeCardProps {
  node: OracleNode;
}

export function OracleNodeCard({ node }: OracleNodeCardProps) {
  const isActive = node.status === "active";

  return (
    <Card
      className="hover-elevate transition-shadow"
      data-testid={`card-node-${node.id}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Activity className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-green-500" : "text-muted-foreground"}`} />
              <h4 className="text-sm font-medium truncate">
                Node {node.address.slice(0, 8)}
              </h4>
            </div>
            <p className="text-xs font-mono text-muted-foreground truncate">
              {node.address}
            </p>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-xs flex-shrink-0"
          >
            {node.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Response</span>
            </div>
            <p className="text-sm font-semibold font-mono">
              {node.responseTime}ms
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Success</span>
            </div>
            <p className="text-sm font-semibold">
              {node.successRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

