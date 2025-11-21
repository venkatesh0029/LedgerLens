import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { TrustScoreDisplay } from "@/components/trust-score-display";
import { FraudAlert } from "@/components/fraud-alert";
import { BlockchainVisualization } from "@/components/blockchain-visualization";
import { FraudDetectionChart } from "@/components/fraud-detection-chart";
import { TrustScoreTrend } from "@/components/trust-score-trend";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Activity, AlertCircle, CheckCircle2, DollarSign, Filter } from "lucide-react";
import { type Transaction, type DashboardStats, type FraudAlert as FraudAlertType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertType[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" 
        ? "/api/transactions" 
        : `/api/transactions?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // Fetch trust score
  const { data: trustScore, isLoading: trustScoreLoading } = useQuery({
    queryKey: ["/api/trust-score"],
  });

  // Fetch blockchain blocks
  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ["/api/blockchain/blocks"],
  });

  // Fetch chart data
  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ["/api/analytics/fraud-stats"],
  });

  // Fetch trust score trend
  const { data: trendData = [], isLoading: trendLoading } = useQuery({
    queryKey: ["/api/analytics/trust-trend"],
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/transactions", data);
      return await response.json();
    },
    onSuccess: (newTransaction: Transaction) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trust-score"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blockchain/blocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/fraud-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/trust-trend"] });

      // Show success toast
      toast({
        title: "Transaction submitted",
        description: `Transaction ${newTransaction.id.substring(0, 8)}... has been recorded on the blockchain.`,
      });

      // If flagged, show fraud alert
      if (newTransaction.status === "flagged") {
        const alert: FraudAlertType = {
          id: newTransaction.id,
          transactionId: newTransaction.id,
          message: `High-risk transaction detected with fraud score of ${parseFloat(newTransaction.fraudScore).toFixed(1)}%`,
          timestamp: new Date(),
          severity: parseFloat(newTransaction.fraudScore) >= 85 ? "high" : "medium",
        };
        setFraudAlerts((prev) => [alert, ...prev]);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit transaction",
        variant: "destructive",
      });
    },
  });

  const handleDismissAlert = (id: string) => {
    setFraudAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleTransactionSubmit = (data: any) => {
    createTransactionMutation.mutate(data);
  };

  const filteredTransactions = statusFilter === "all"
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <div className="space-y-4">
            {fraudAlerts.map((alert) => (
              <FraudAlert key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
            ))}
          </div>
        )}

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Transactions"
            value={stats?.totalTransactions ?? 0}
            icon={DollarSign}
            isLoading={statsLoading}
          />
          <StatCard
            title="Flagged Cases"
            value={stats?.flaggedCases ?? 0}
            icon={AlertCircle}
            isLoading={statsLoading}
          />
          <StatCard
            title="Average Trust Score"
            value={stats?.averageTrustScore ? `${stats.averageTrustScore.toFixed(1)}%` : "0%"}
            icon={CheckCircle2}
            isLoading={statsLoading}
          />
          <StatCard
            title="Active Alerts"
            value={stats?.activeAlerts ?? 0}
            icon={Activity}
            isLoading={statsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Form */}
            <TransactionForm
              onSubmit={handleTransactionSubmit}
              isPending={createTransactionMutation.isPending}
            />

            {/* Transactions Table with Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <TransactionTable
                transactions={filteredTransactions}
                isLoading={transactionsLoading}
                onViewDetails={setSelectedTransaction}
              />
            </div>

            {/* Fraud Detection Chart */}
            <FraudDetectionChart data={chartData} isLoading={chartLoading} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Trust Score Display */}
            <TrustScoreDisplay
              score={trustScore?.trustScore ? parseFloat(trustScore.trustScore) : 100}
              address={trustScore?.address ?? "0x0000...0000"}
              transactionCount={trustScore?.transactionCount ?? 0}
              flaggedCount={trustScore?.flaggedCount ?? 0}
              isLoading={trustScoreLoading}
            />

            {/* Trust Score Trend */}
            <TrustScoreTrend data={trendData} isLoading={trendLoading} />

            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold mb-4" data-testid="text-quick-actions-title">Quick Actions</h3>
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-reports">
                  View Fraud Reports
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-export-data">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-settings">
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blockchain Visualization */}
        <BlockchainVisualization blocks={blocks} isLoading={blocksLoading} />

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information about this transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Transaction ID</div>
                    <div className="font-mono text-sm">{selectedTransaction.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                    <div className="font-mono text-sm truncate">{selectedTransaction.transactionHash}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Amount</div>
                    <div className="text-lg font-bold">${parseFloat(selectedTransaction.amount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Fraud Score</div>
                    <div className="text-lg font-bold">{parseFloat(selectedTransaction.fraudScore).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">User ID</div>
                    <div className="font-mono text-sm">{selectedTransaction.userId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Recipient</div>
                    <div className="font-mono text-sm">{selectedTransaction.recipient}</div>
                  </div>
                </div>
                {selectedTransaction.description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{selectedTransaction.description}</div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
