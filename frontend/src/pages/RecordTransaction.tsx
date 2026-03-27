import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { recordTransaction, type RecordResult } from "@/lib/api";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

export default function RecordTransaction() {
  const { accountId } = useWallet();
  const [text, setText] = useState("");
  const [result, setResult] = useState<RecordResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => recordTransaction(text, accountId!),
    onSuccess: (data) => {
      setResult(data);
      setText("");
    },
  });

  if (!accountId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Connect your HashPack wallet to record transactions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold">Record Transaction</h1>
      <p className="text-muted-foreground text-sm">
        Describe your transaction in natural language and we'll parse and record it on Hedera.
      </p>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder='e.g. "Received $5,000 donation from UNICEF for education project"'
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && text.trim() && !mutation.isPending && mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={() => mutation.mutate()}
              disabled={!text.trim() || mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.isError && (
        <Card className="border-destructive/30 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">Failed to record. Is the API running?</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-secondary/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              Transaction Recorded
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize font-medium">{result.parsed.type}</span>
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono font-medium">${result.parsed.amount.toLocaleString()}</span>
              <span className="text-muted-foreground">Description</span>
              <span>{result.parsed.description}</span>
              <span className="text-muted-foreground">Category</span>
              <span>{result.parsed.category}</span>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Hedera Sequence Number</p>
              <p className="font-mono text-sm font-medium text-primary">{result.hederaSequenceNumber}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
