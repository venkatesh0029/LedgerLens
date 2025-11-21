import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type BlockchainBlock } from "@shared/schema";
import { format } from "date-fns";
import { Blocks } from "lucide-react";

interface BlockchainVisualizationProps {
  blocks: BlockchainBlock[];
  isLoading?: boolean;
}

export function BlockchainVisualization({ blocks, isLoading }: BlockchainVisualizationProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Blockchain Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 min-w-48 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="h-5 w-5" />
          Blockchain Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {blocks.map((block, index) => {
              const isLatest = index === blocks.length - 1;
              return (
                <div key={block.id} className="flex items-center gap-4">
                  <div
                    className={`min-w-56 p-4 rounded-md border-2 transition-all ${
                      isLatest
                        ? "border-primary bg-primary/5 shadow-md animate-pulse"
                        : "border-border bg-card"
                    }`}
                    data-testid={`blockchain-block-${block.blockNumber}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Block #{block.blockNumber}
                        </span>
                        {isLatest && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hash</div>
                        <div className="font-mono text-xs truncate" title={block.blockHash}>
                          {block.blockHash.substring(0, 16)}...
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">Transactions</div>
                          <div className="text-lg font-bold">{block.transactionCount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Time</div>
                          <div className="text-xs font-medium">
                            {format(new Date(block.timestamp), "HH:mm:ss")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < blocks.length - 1 && (
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-border" />
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
