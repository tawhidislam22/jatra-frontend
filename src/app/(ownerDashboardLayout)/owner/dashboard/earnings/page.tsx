"use client";

import { useEffect, useState } from "react";
import { bookingsService } from "@/services/bookings.service";
import { serviceRequestsService } from "@/services/services.service";
import { DollarSign, Truck, Wrench } from "lucide-react";

export default function EarningsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, rental: 0, service: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingsService.getBookings(),
        serviceRequestsService.getRequests()
      ]);

      let rentalSum = 0;
      const rentalTx = (bookingsRes.data || []).map((b: any) => {
        if (b.status === 'COMPLETED') rentalSum += (b.totalPrice || 0);
        return {
          id: b._id,
          type: 'Rental',
          customer: b.user?.fullName || 'Customer',
          amount: b.totalPrice || 0,
          status: b.status,
          date: new Date(b.createdAt)
        };
      });

      let serviceSum = 0;
      const serviceTx = (servicesRes.data || []).map((s: any) => {
        const cost = s.estimatedCost || 0;
        if (s.status === 'COMPLETED') serviceSum += cost;
        return {
          id: s._id,
          type: 'Service',
          customer: s.customer?.fullName || 'Customer',
          amount: cost,
          status: s.status,
          date: new Date(s.createdAt)
        };
      });

      setSummary({ total: rentalSum + serviceSum, rental: rentalSum, service: serviceSum });

      const allTx = [...rentalTx, ...serviceTx].sort((a, b) => b.date.getTime() - a.date.getTime());
      setTransactions(allTx);
    } catch (error) {
      console.error("Failed to load earnings", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case "PENDING":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>PENDING</span>;
      case "IN_PROGRESS":
        return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>IN_PROGRESS</span>;
      case "COMPLETED":
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>COMPLETED</span>;
      case "CANCELLED":
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>CANCELLED</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading earnings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1a1a1a] uppercase tracking-wider">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-sm border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Revenue</p>
              <p className="text-3xl font-black text-[#1a1a1a]">${summary.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-sm border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Rental Income</p>
              <p className="text-3xl font-black text-[#1a1a1a]">${summary.rental.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Service Income</p>
              <p className="text-3xl font-black text-[#1a1a1a]">${summary.service.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Type</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Customer</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Amount</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Status</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={`${tx.id}-${idx}`} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    {tx.type === 'Rental' ? (
                      <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">RENTAL</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">SERVICE</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium">{tx.customer}</td>
                  <td className="p-4 text-sm font-black">${tx.amount.toFixed(2)}</td>
                  <td className="p-4">{getStatusBadge(tx.status)}</td>
                  <td className="p-4 text-sm">{tx.date.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
