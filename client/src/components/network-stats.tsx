import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, CheckCircle, Clock } from "lucide-react";

interface NetworkStatsProps {
  totalNodes: number;
  activeNodes: number;
  totalQueries: number;
  averageResponseTime: number;
}

export function NetworkStats({
  totalNodes,
  activeNodes,
  totalQueries,
  averageResponseTime,
}: NetworkStatsProps) {
  const stats = [
    {
      label: "Total Nodes",
      value: totalNodes,
      icon: Server,
      color: "text-primary",
    },
    {
      label: "Active Nodes",
      value: activeNodes,
      icon: Activity,
      color: "text-green-500",
    },
    {
      label: "Total Queries",
      value: totalQueries,
      icon: CheckCircle,
      color: "text-blue-500",
    },
    {
      label: "Avg Response",
      value: `${averageResponseTime}ms`,
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Network Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold font-mono">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

