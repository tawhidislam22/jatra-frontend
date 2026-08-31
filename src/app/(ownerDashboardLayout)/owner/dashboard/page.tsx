"use client";

import { useEffect, useState } from "react";
import { Car, CalendarDays, Wrench, Star, AlertTriangle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { bookingsService } from "@/services/bookings.service";
import { serviceRequestsService } from "@/services/services.service";

// Define inline types if they differ from your actual types to avoid compilation errors,
// assuming standard Next.js / TypeScript behavior
export default function OwnerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [center, setCenter] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await authService.getMe();
        if (userRes?.data) {
          setUser(userRes.data);
          
          if (userRes.data.managedCenter) {
            const centerRes = await centersService.getCenterById(userRes.data.managedCenter?.id);
            if (centerRes?.data) {
              setCenter(centerRes.data);
            }
          }
        }

        const [bookingsRes, requestsRes] = await Promise.all([
          bookingsService.getBookings(),
          serviceRequestsService.getRequests()
        ]);

        if (bookingsRes?.data) {
          setBookings(bookingsRes.data);
        }
        
        if (requestsRes?.data) {
          setServiceRequests(requestsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><p className="text-muted-foreground font-medium">Loading dashboard...</p></div>;
  }

  const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'ACCEPTED').length;
  const pendingRequests = serviceRequests.filter(r => r.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">PENDING</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">ACCEPTED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-wide">Dashboard Overview</h1>
        <p className="text-muted-foreground font-medium mt-1">Welcome back, {user?.fullName || 'Owner'}</p>
      </div>

      {center?.isApproved === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-yellow-800 leading-relaxed">
            Your center is pending approval. Some features may be limited until your center is approved by our team.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Total Fleet Vehicles</span>
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1a1a1a]">{center?.rentalFleet?.length || 0}</span>
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Active Bookings</span>
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1a1a1a]">{activeBookings}</span>
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Pending Service Requests</span>
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1a1a1a]">{pendingRequests}</span>
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Center Rating</span>
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1a1a1a]">
            {center?.rating ? `${Number(center.rating).toFixed(1)} / 5.0` : '0.0 / 5.0'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">Recent Bookings</h2>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            {bookings.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.slice(0, 5).map((booking, idx) => (
                    <tr key={booking.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1a1a1a]">{booking.user?.fullName || 'Customer'}</td>
                      <td className="px-6 py-4 text-gray-600">{booking.vehicle?.make || 'Unknown'} {booking.vehicle?.model || ''}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground font-medium text-sm">No recent bookings found.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">Recent Service Requests</h2>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            {serviceRequests.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serviceRequests.slice(0, 5).map((request, idx) => (
                    <tr key={request.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1a1a1a]">{request.user?.fullName || 'Customer'}</td>
                      <td className="px-6 py-4 text-gray-600">{request.vehicle?.make || 'Unknown'} {request.vehicle?.model || ''}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">{getStatusBadge(request.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground font-medium text-sm">No recent service requests found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
