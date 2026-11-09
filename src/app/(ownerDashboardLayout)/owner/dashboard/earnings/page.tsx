"use client";

import { useEffect, useState } from "react";
import { bookingsService } from "@/services/bookings.service";
import { serviceRequestsService } from "@/services/services.service";
import { DollarSign, Truck, Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EarningsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, rental: 0, service: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingsService.getBookings().catch((err) => {
          console.warn("Failed to load rental bookings:", err?.message || err);
          return { data: [] };
        }),
        serviceRequestsService.getRequests().catch((err) => {
          console.warn("Failed to load service requests:", err?.message || err);
          return { data: [] };
        })
      ]);

      let rentalSum = 0;
      const rawBookings = bookingsRes?.data || (Array.isArray(bookingsRes) ? bookingsRes : []);
      const rentalTx = (Array.isArray(rawBookings) ? rawBookings : []).map((b: any) => {
        const amount = b.totalAmount || b.totalPrice || 0;
        if (b.status === 'COMPLETED' || b.status === 'ACCEPTED') rentalSum += amount;
        return {
          id: b.id || b._id,
          type: 'Rental',
          customer: b.customer?.fullName || b.customer?.name || b.user?.fullName || 'Customer',
          amount,
          status: b.status,
          date: new Date(b.createdAt || Date.now())
        };
      });

      let serviceSum = 0;
      const rawServices = servicesRes?.data || (Array.isArray(servicesRes) ? servicesRes : []);
      const serviceTx = (Array.isArray(rawServices) ? rawServices : []).map((s: any) => {
        const cost = s.totalAmount || s.estimatedCost || 0;
        if (s.status === 'COMPLETED' || s.status === 'DONE') serviceSum += cost;
        return {
          id: s.id || s._id,
          type: 'Service',
          customer: s.customer?.fullName || s.customer?.name || 'Customer',
          amount: cost,
          status: s.status,
          date: new Date(s.createdAt || Date.now())
        };
      });

      setSummary({ total: rentalSum + serviceSum, rental: rentalSum, service: serviceSum });

      const allTx = [...rentalTx, ...serviceTx].sort((a, b) => b.date.getTime() - a.date.getTime());
      setTransactions(allTx);
    } catch (error: any) {
      console.error("Failed to load earnings", error);
      setLoadError(error?.response?.data?.message || error?.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case "PENDING":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>PENDING</span>;
      case "ACCEPTED":
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>ACCEPTED</span>;
      case "IN_PROGRESS":
        return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>IN_PROGRESS</span>;
      case "COMPLETED_PENDING_REVIEW":
        return <span className={`${baseClasses} bg-amber-100 text-amber-700`}>PENDING REVIEW</span>;
      case "COMPLETED":
      case "DONE":
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>COMPLETED</span>;
      case "REASSIGNMENT_REQUIRED":
        return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>REWORK REQUIRED</span>;
      case "CANCELLED":
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>CANCELLED</span>;
      default:
        return <span className={`${baseClasses} bg-muted text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading earnings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Workshop & Fleet Earnings</h1>
          <p className="text-muted-foreground text-xs font-medium mt-1">Real-time revenue analytics across vehicle rentals and automotive services.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadData()}
          className="text-xs font-bold"
        >
          Refresh
        </Button>
      </div>

      {loadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-500">Failed to sync earnings records</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{loadError}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => loadData()}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-950/40 rounded-full text-green-600 dark:text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
              <p className="text-3xl font-black text-foreground mt-0.5">${summary.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 rounded-full text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rental Income</p>
              <p className="text-3xl font-black text-foreground mt-0.5">${summary.rental.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/40 rounded-full text-purple-600 dark:text-purple-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Service Income</p>
              <p className="text-3xl font-black text-foreground mt-0.5">${summary.service.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold text-foreground uppercase tracking-wider text-xs">Type</th>
              <th className="p-4 font-semibold text-foreground uppercase tracking-wider text-xs">Customer</th>
              <th className="p-4 font-semibold text-foreground uppercase tracking-wider text-xs">Amount</th>
              <th className="p-4 font-semibold text-foreground uppercase tracking-wider text-xs">Status</th>
              <th className="p-4 font-semibold text-foreground uppercase tracking-wider text-xs">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={`${tx.id}-${idx}`} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    {tx.type === 'Rental' ? (
                      <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">RENTAL</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">SERVICE</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium">{tx.customer}</td>
                  <td className="p-4 text-sm font-black">${tx.amount.toFixed(2)}</td>
                  <td className="p-4">{getStatusBadge(tx.status)}</td>
                  <td className="p-4 text-sm text-muted-foreground">{tx.date.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
