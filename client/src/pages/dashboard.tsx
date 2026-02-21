import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, AlertCircle, CheckCircle2, DollarSign, Filter } from "lucide-react";
import { type Transaction, type DashboardStats, type FraudAlert as FraudAlertType, type BlockchainBlock } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { connectWallet } from "@/lib/web3";
import { useWallet } from "@/contexts/wallet-context";
import { Contract, parseEther } from "ethers";
import { TransactionRegistryABI, REGISTRY_ADDRESS } from "@/lib/contracts";

export default function Dashboard() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertType[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const { toast } = useToast();
  const { isConnected, address } = useWallet();

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
  const { data: trustScore, isLoading: trustScoreLoading } = useQuery<{
    trustScore: string;
    address: string;
    transactionCount: number;
    flaggedCount: number;
  }>({
    queryKey: ["/api/trust-score", address],
    queryFn: async () => {
      const url = address ? `/api/trust-score?address=${address}` : "/api/trust-score";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch trust score");
      return res.json();
    }
  });

  // Fetch blockchain blocks
  const { data: blocks = [], isLoading: blocksLoading } = useQuery<BlockchainBlock[]>({
    queryKey: ["/api/blockchain/blocks"],
  });

  // Fetch chart data
  const { data: chartData = [], isLoading: chartLoading } = useQuery<Array<{
    date: string;
    verified: number;
    flagged: number;
    pending: number;
  }>>({
    queryKey: ["/api/analytics/fraud-stats"],
  });

  // Fetch trust score trend
  const { data: trendData = [], isLoading: trendLoading } = useQuery<Array<{
    timestamp: string;
    score: number;
  }>>({
    queryKey: ["/api/analytics/trust-trend", address],
    queryFn: async () => {
      const url = address ? `/api/analytics/trust-trend?address=${address}` : "/api/analytics/trust-trend";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch trust score trend");
      return res.json();
    }
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        // 1. Get ML Prediction from Flask Phase 1 Backend
        const mlResponse = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(data.amount) })
        });
        const mlResult = await mlResponse.json();
        const isFraudulent = mlResult.isFraudulent;
        const fraudScore = isFraudulent ? "85.0" : "5.0"; // Placeholder score based on boolean

        // 2. Transact with Blockchain
        const { signer } = await connectWallet();
        const registryContract = new Contract(REGISTRY_ADDRESS, TransactionRegistryABI.abi, signer);

        const tx = await registryContract.addTransaction(
          parseEther(data.amount.toString()),
          mlResult.timestamp,
          isFraudulent,
          mlResult.predictionHash
        );
        const receipt = await tx.wait();

        // 3. Save to Dashboard local display db with the actual hash
        const fullData = {
          ...data,
          isFraudulent,
          fraudScore,
          transactionHash: receipt.hash || tx.hash
        };
        const response = await apiRequest("POST", "/api/transactions", fullData);
        return await response.json();
      } catch (error: any) {
        throw new Error(error.message || "Failed to process transaction securely.");
      }
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
      console.error("Transaction Error:", error);
      toast({
        title: "Transaction Failed",
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

  const handleExportData = () => {
    if (!transactions.length) {
      toast({ title: "No Data", description: "There are no transactions to export.", variant: "destructive" });
      return;
    }

    // Create CSV content
    const headers = ["ID", "Amount", "Status", "Fraud Score", "Timestamp", "User ID", "Recipient", "Transaction Hash"];
    const rows = transactions.map(t => [
      t.id,
      t.amount,
      t.status,
      t.fraudScore,
      new Date(t.timestamp).toISOString(),
      t.userId,
      t.recipient,
      t.transactionHash
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaction_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "Your transaction data has been successfully downloaded." });
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

                <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-view-reports">
                      View Fraud Reports
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Comprehensive Fraud Analysis</DialogTitle>
                      <DialogDescription>Overview of flagged transactions and algorithmic predictions</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FraudDetectionChart data={chartData} isLoading={chartLoading} />
                        <TrustScoreTrend data={trendData} isLoading={trendLoading} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start" data-testid="button-export-data" onClick={handleExportData}>
                  Export Data
                </Button>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-settings">
                      System Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Admin Configuration</DialogTitle>
                      <DialogDescription>Modify global rules for the ML evaluation engine.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="auto-block">Auto-Block Flagged Transactions</Label>
                        <Switch id="auto-block" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-alerts">Email Alerts for High Fraud Score</Label>
                        <Switch id="email-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="strict-mode">Strict ML Evaluation Mode</Label>
                        <Switch id="strict-mode" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

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
