"use client";

import { useEffect, useState } from "react";
import { walletService } from "@/services/wallet.service";
import { Wallet as WalletType, WalletTransaction } from "@/types/jatra";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Car, 
  Wrench, 
  Calendar, 
  Receipt,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await walletService.getMyWallet();
      const data = res?.data || res;
      if (data?.wallet) {
        setWallet(data.wallet);
      }
      if (data?.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const totalCredits = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunds = transactions
    .filter((t) => t.reason === "REFUND")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Wallet & Ledger...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Customer Wallet & Ledger
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            View your balance, instant cancellation refunds, and complete transactional ledger.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWalletData}
          className="text-xs font-bold uppercase tracking-wider rounded-xl gap-2 self-start sm:self-auto h-9"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
          <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
            <WalletIcon className="h-32 w-32" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                Active Balance
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight font-mono">
              ${(wallet?.balance || 0).toFixed(2)}
            </h2>
          </div>

          <p className="text-xs opacity-90 font-medium">
            Ready to apply instantly toward upcoming vehicle rentals and workshop appointments.
          </p>
        </div>

        {/* Total Refund Credits Card */}
        <div className="bg-card border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-48">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Total Refunds Credited
            </span>
            <h3 className="text-3xl font-black mt-3 tracking-tight font-mono text-foreground">
              ${totalRefunds.toFixed(2)}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Automatically credited under the tiered 3-day cancellation policy.
          </p>
        </div>

        {/* Policy Guarantee Card */}
        <div className="bg-card border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-1.5 text-foreground font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Refund Protection</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mt-3 font-medium">
              <p>&bull; &ge; 3 days prior: <strong className="text-foreground">100% Refund (0% fee)</strong></p>
              <p>&bull; 1 to 3 days prior: <strong className="text-foreground">90% Refund (10% fee)</strong></p>
              <p>&bull; &lt; 24h prior: <strong className="text-foreground">70% Refund (30% fee)</strong></p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            Atomic transactions guarantee your wallet is never credited twice.
          </p>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-foreground">
              Transaction History
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Audit ledger of all credits, deductions, and booking refunds.
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-muted-foreground">
            {transactions.length} record{transactions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">No Transactions Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When you book or cancel services, refunds and payments will automatically populate this audit ledger.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";
              const isRefund = tx.reason === "REFUND";

              return (
                <div 
                  key={tx.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-xl transition-colors"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      isCredit
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {tx.description}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          isRefund
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {tx.reason}
                        </span>
                      </div>

                      {/* Associated Rental Details */}
                      {tx.rentalBooking?.vehicle && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Car className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Vehicle: <strong>{tx.rentalBooking.vehicle.make} {tx.rentalBooking.vehicle.model}</strong> ({tx.rentalBooking.vehicle.year})
                          </span>
                        </div>
                      )}

                      {/* Associated Service Request */}
                      {tx.serviceRequest && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Wrench className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            Service: <strong>{tx.serviceRequest.serviceName || tx.serviceRequest.serviceType}</strong>
                          </span>
                        </div>
                      )}

                      {/* Fee and Refund Breakdown if recorded */}
                      {(tx.cancellationFee !== undefined || tx.refundAmount !== undefined) && (
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                          {tx.cancellationFee !== undefined && (
                            <span>Fee: <strong>${tx.cancellationFee.toFixed(2)}</strong></span>
                          )}
                          {tx.refundAmount !== undefined && (
                            <span>Refund: <strong className="text-emerald-600">${tx.refundAmount.toFixed(2)}</strong></span>
                          )}
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(tx.createdAt).toLocaleString()} &bull; Ref #{tx.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right sm:self-center shrink-0">
                    <span className={`font-mono text-base sm:text-lg font-black ${
                      isCredit
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}>
                      {isCredit ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
