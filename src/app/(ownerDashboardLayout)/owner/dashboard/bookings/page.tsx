"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { bookingsService } from "@/services/bookings.service";
import { Calendar } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsService.getBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bookingsService.updateStatus(id, { status });
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case 'PENDING': return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>PENDING</span>;
      case 'ACCEPTED': return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>ACCEPTED</span>;
      case 'IN_PROGRESS': return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>IN_PROGRESS</span>;
      case 'COMPLETED': return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>COMPLETED</span>;
      case 'CANCELLED': return <span className={`${baseClasses} bg-red-100 text-red-700`}>CANCELLED</span>;
      default: return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-wider mb-6">Rental Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground">There are no rental bookings for your center yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Customer</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Vehicle</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Pickup Date</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Return Date</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Amount</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Status</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors border-t">
                    <td className="p-4 font-semibold text-[#1a1a1a]">
                      {b.customer?.fullName || b.customer?.name || 'Customer'}
                    </td>
                    <td className="p-4 font-medium text-muted-foreground">
                      {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : 'Vehicle'}
                    </td>
                    <td className="p-4 text-sm font-medium text-[#1a1a1a]">
                      {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-medium text-[#1a1a1a]">
                      {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 font-bold text-[#1a1a1a]">${b.totalAmount || b.totalPrice || 0}</td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {b.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="font-bold text-[10px] uppercase tracking-wider rounded-sm"
                            onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                          >
                            Accept
                          </Button>
                        )}
                        {b.status === 'ACCEPTED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="font-bold text-[10px] uppercase tracking-wider rounded-sm"
                            onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          >
                            Complete
                          </Button>
                        )}
                        {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="font-bold text-[10px] uppercase tracking-wider rounded-sm text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
