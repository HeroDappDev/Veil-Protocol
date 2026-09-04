import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Query } from "@shared/schema";
import { StatusIndicator } from "./status-indicator";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QueryHistoryTableProps {
  queries: Query[];
  onQuerySelect?: (query: Query) => void;
}

export function QueryHistoryTable({ queries, onQuerySelect }: QueryHistoryTableProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredQueries = queries.filter(
    (query) => statusFilters.length === 0 || statusFilters.includes(query.status)
  );

  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const paginatedQueries = filteredQueries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Query History</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 min-h-11"
                data-testid="button-filter"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {statusFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {statusFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["pending", "processing", "verifying", "completed", "failed"].map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] sm:w-[140px] text-xs sm:text-sm">Timestamp</TableHead>
                <TableHead className="text-xs sm:text-sm">Type</TableHead>
                <TableHead className="text-xs sm:text-sm">Target</TableHead>
                <TableHead className="text-center text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQueries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No queries found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQueries.map((query) => (
                  <TableRow
                    key={query.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => onQuerySelect?.(query)}
                    data-testid={`row-query-${query.id}`}
                  >
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {format(new Date(query.createdAt), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium capitalize text-xs sm:text-sm whitespace-nowrap">
                      {query.type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm">
                      {query.target}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIndicator status={query.status as any} />
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-xs sm:text-sm whitespace-nowrap">
                      {query.fee}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredQueries.length)} of{" "}
              {filteredQueries.length} queries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

