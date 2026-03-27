import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHistoryByType, type Transaction } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const filters = ["all", "income", "expense", "debt", "asset"] as const;

const rowColorClasses: Record<string, string> = {
  income: "border-l-4 border-l-income",
  expense: "border-l-4 border-l-expense",
  debt: "border-l-4 border-l-debt",
  asset: "border-l-4 border-l-asset",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all");

  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["history", filter],
    queryFn: () => fetchHistoryByType(filter),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold">Transaction History</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-heading">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground text-center py-8">Failed to load transactions.</p>
          ) : !transactions?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Description</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className={`${rowColorClasses[tx.type] ?? ""} hover:bg-muted/30 transition-colors`}>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 capitalize font-medium">{tx.type}</td>
                      <td className="py-3 pr-4">{tx.description}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{tx.category}</td>
                      <td className="py-3 text-right font-mono font-medium">${formatCurrency(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
