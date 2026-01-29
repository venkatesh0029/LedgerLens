import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { insertTransactionSchema } from "@shared/schema";
import { Send, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";

const transactionFormSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  fraudScore: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "Fraud score must be between 0 and 100",
  }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormValues) => void;
  isPending?: boolean;
}

export function TransactionForm({ onSubmit, isPending }: TransactionFormProps) {
  const { isConnected, address } = useWallet();
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      userId: "",
      amount: "",
      recipient: "",
      isFraudulent: false,
      fraudScore: "0",
      status: "verified",
      description: "",
    },
  });

  useEffect(() => {
    if (isConnected && address) {
      form.setValue("userId", address);
    }
  }, [isConnected, address, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Record New Transaction
          {isConnected && (
            <Badge variant="outline" className="ml-2 gap-1">
              <Wallet className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? "Submit a transaction from your connected wallet" 
            : "Connect your wallet or enter a wallet address manually"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID / Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      className="font-mono"
                      data-testid="input-user-id"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        className="font-mono"
                        data-testid="input-recipient"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Transaction details..."
                      className="resize-none"
                      data-testid="input-description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isFraudulent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Mark as Fraudulent</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Flag this transaction
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-fraudulent"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fraudScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fraud Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        data-testid="input-fraud-score"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              data-testid="button-submit-transaction"
            >
              {isPending ? "Submitting..." : "Submit Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
