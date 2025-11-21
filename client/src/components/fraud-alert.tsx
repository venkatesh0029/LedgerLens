import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { type FraudAlert as FraudAlertType } from "@shared/schema";

interface FraudAlertProps {
  alert: FraudAlertType;
  onDismiss: (id: string) => void;
}

export function FraudAlert({ alert, onDismiss }: FraudAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 dark:border-red-400";
      case "medium":
        return "border-yellow-500 dark:border-yellow-400";
      case "low":
        return "border-blue-500 dark:border-blue-400";
      default:
        return "border-red-500 dark:border-red-400";
    }
  };

  return (
    <Alert className={`border-l-4 ${getSeverityColor(alert.severity)}`} data-testid={`fraud-alert-${alert.id}`}>
      <AlertTriangle className="h-5 w-5" data-testid={`icon-alert-${alert.id}`} />
      <div className="flex-1">
        <AlertTitle className="font-semibold" data-testid={`text-alert-title-${alert.id}`}>
          Fraud Alert - {alert.severity.toUpperCase()} Priority
        </AlertTitle>
        <AlertDescription className="mt-1" data-testid={`text-alert-message-${alert.id}`}>
          {alert.message}
          <span className="block text-xs text-muted-foreground mt-1">
            Transaction ID: <span className="font-mono" data-testid={`text-alert-transaction-id-${alert.id}`}>{alert.transactionId}</span>
          </span>
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDismiss(alert.id)}
        className="ml-auto"
        data-testid={`button-dismiss-alert-${alert.id}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
