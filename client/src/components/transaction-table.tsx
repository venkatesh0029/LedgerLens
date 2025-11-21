import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { type Transaction } from "@shared/schema";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewDetails?: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  onViewDetails,
}: TransactionTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-600 text-white dark:bg-green-500" data-testid={`badge-status-verified`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-red-600 text-white dark:bg-red-500" data-testid={`badge-status-flagged`}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600 text-white dark:bg-yellow-500" data-testid={`badge-status-pending`}>
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFraudScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600 dark:text-red-400 font-semibold";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400 font-medium";
    return "text-green-600 dark:text-green-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fraud Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(transaction.timestamp), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-xs" data-testid={`transaction-id-${transaction.id}`}>
                      {transaction.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <span className={getFraudScoreColor(parseFloat(transaction.fraudScore))} data-testid={`fraud-score-${transaction.id}`}>
                        {parseFloat(transaction.fraudScore).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails?.(transaction)}
                        data-testid={`button-view-transaction-${transaction.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
