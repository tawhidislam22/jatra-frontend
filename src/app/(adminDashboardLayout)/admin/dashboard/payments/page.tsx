"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Building2, 
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await adminService.getAllPayments(params);
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setPayments(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const filtered = payments.filter((p) => {
    const matchesSearch = 
      (p.user?.fullName || p.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transactionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalVolume = payments
    .filter(p => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const platformTake = totalVolume * 0.10;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Transactions & Revenue
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {payments.length} Records
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Financial transactions ledger, Stripe processing logs, and platform take-rate calculations.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transaction ID, customer..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
            {["ALL", "SUCCESS", "PENDING", "FAILED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {st === "ALL" ? "All" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Total Settled Volume</span>
          <h3 className="text-3xl font-black text-emerald-400 tracking-tight mt-2">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Successful customer payments</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Platform Take Rate (10%)</span>
          <h3 className="text-3xl font-black text-white tracking-tight mt-2">
            ${platformTake.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Net platform revenue commission</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Completed Payments</span>
          <h3 className="text-3xl font-black text-blue-400 tracking-tight mt-2">
            {payments.filter(p => p.status === "SUCCESS").length} of {payments.length}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Success conversion rate</p>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Transactions Ledger...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Transactions Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No payment records matched the filter.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Service Reference</th>
                  <th className="p-4">Paid Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filtered.map((p) => {
                  const isSuccess = p.status === "SUCCESS";
                  const serviceType = 
                    p.rentalBooking ? "Car Rental Booking" :
                    p.serviceRequest ? `Workshop Service (${p.serviceRequest.serviceType || 'Inspection'})` :
                    "Direct Service Deposit";

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{p.user?.fullName || p.user?.name || "Customer"}</p>
                        <p className="text-[11px] text-zinc-500">{p.user?.email}</p>
                      </td>

                      {/* Transaction ID */}
                      <td className="p-4 font-mono text-[11px] text-zinc-300">
                        {p.transactionId ? (
                          <span title={p.transactionId}>{p.transactionId.slice(0, 18)}...</span>
                        ) : (
                          <span className="text-zinc-500">Manual / Pending</span>
                        )}
                      </td>

                      {/* Service Type */}
                      <td className="p-4 text-zinc-300">
                        <span className="bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 inline-block">
                          {serviceType}
                        </span>
                      </td>

                      {/* Paid Date */}
                      <td className="p-4 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending Settlement"}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-black text-white text-sm">
                        ${p.amount || 0}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-right">
                        {isSuccess ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid & Settled
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {p.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
