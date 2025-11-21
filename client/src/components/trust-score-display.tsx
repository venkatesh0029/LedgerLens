import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

interface TrustScoreDisplayProps {
  score: number;
  address: string;
  transactionCount: number;
  flaggedCount: number;
  isLoading?: boolean;
}

export function TrustScoreDisplay({
  score,
  address,
  transactionCount,
  flaggedCount,
  isLoading,
}: TrustScoreDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trust Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <Skeleton className="h-40 w-40 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Trust";
    if (score >= 50) return "Medium Trust";
    return "Low Trust";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Trust Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative h-40 w-40 mb-4">
            <svg className="transform -rotate-90 h-40 w-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                className={`transition-all duration-500 ${
                  score >= 80
                    ? "text-green-600 dark:text-green-400"
                    : score >= 50
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)}`} data-testid="trust-score-value">
                  {score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </div>
          <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1" data-testid="trust-score-address">
            {address}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Transactions</span>
            <span className="text-sm font-semibold" data-testid="trust-score-transaction-count">{transactionCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Flagged Transactions</span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400" data-testid="trust-score-flagged-count">
              {flaggedCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-sm font-semibold">
              {transactionCount > 0
                ? ((transactionCount - flaggedCount) / transactionCount * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
