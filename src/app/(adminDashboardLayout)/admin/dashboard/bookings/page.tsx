"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  Search, 
  Car, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookingsService } from "@/services/bookings.service";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsService.getBookings();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setBookings(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load rental bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch = 
      (b.customer?.fullName || b.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vehicle?.make || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vehicle?.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vehicle?.licensePlate || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Rental Bookings Oversight
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {bookings.length} Bookings
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Global view of vehicle rentals, customer bookings, rental schedules, and total amounts.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, vehicle..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            {["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Rental Bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Bookings Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No rental bookings matched the selected filter.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Rental Vehicle</th>
                  <th className="p-4">Pickup Date</th>
                  <th className="p-4">Return Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-right">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filtered.map((b) => {
                  const statusBadgeClass = 
                    b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    b.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    b.status === "ACCEPTED" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    b.status === "CANCELLED" ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20";

                  return (
                    <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">
                          {b.customer?.fullName || b.customer?.name || "Customer"}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">ID: {b.id.slice(0, 8)}...</p>
                      </td>

                      {/* Vehicle */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-zinc-500" />
                          <div>
                            <p className="font-semibold text-zinc-200">
                              {b.vehicle?.make} {b.vehicle?.model}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">{b.vehicle?.licensePlate}</p>
                          </div>
                        </div>
                      </td>

                      {/* Pickup */}
                      <td className="p-4 text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : "TBD"}</span>
                        </div>
                      </td>

                      {/* Return */}
                      <td className="p-4 text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : "TBD"}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-black text-white text-sm">
                        ${b.totalAmount || 0}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${statusBadgeClass}`}>
                          {b.status}
                        </span>
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
