"use client";

import { useEffect, useState } from "react";
import { bookingsService } from "@/services/bookings.service";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsService.getBookings();
        if (response && response.data) {
          setBookings(response.data);
        } else if (Array.isArray(response)) {
          setBookings(response);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Bookings...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rental Bookings</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No bookings found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-primary">
                    {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Unknown Vehicle"}
                    <div className="text-xs font-normal text-muted-foreground tracking-widest uppercase mt-1">ID: {booking.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-black">${booking.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
