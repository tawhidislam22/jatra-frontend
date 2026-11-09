"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Car, 
  CalendarDays, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  RefreshCw,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOverviewStats();
      if (res?.data) {
        setStats(res.data);
      } else {
        setStats(res);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApprove = async (centerId: string) => {
    try {
      setVerifyingId(centerId);
      await adminService.verifyCenter(centerId, true);
      await fetchStats();
    } catch (err) {
      console.error("Failed to approve center:", err);
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
          <div className="h-80 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  const s = stats || {};
  const users = s.users || {};
  const centers = s.centers || {};
  const vehicles = s.vehicles || {};
  const services = s.services || {};
  const financials = s.financials || {};
  const recent = s.recentActivity || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Platform Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/40 border border-zinc-800 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-500/30">
                Super Admin Master Control
              </span>
              <span className="text-zinc-500 text-xs font-semibold">| Global System View</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
              Platform Command Center
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl font-medium">
              Nationwide oversight of automotive centers, verified workshops, user roles, service operations, and platform revenue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStats}
              variant="outline"
              className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl h-11"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh Live Data
            </Button>
            <Link href="/admin/dashboard/centers">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-5 shadow-lg shadow-red-950/50">
                Manage Centers <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gross Platform Volume */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Gross Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">
              ${(financials.grossPlatformVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1.5 font-semibold">
              <span className="text-emerald-400 font-bold">${(financials.estimatedPlatformRevenue || 0).toFixed(0)}</span> platform take (10%)
            </p>
          </div>
        </div>

        {/* Automotive Centers */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Workshops / Centers</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {centers.total || 0}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2 font-semibold">
              <span className="text-emerald-400 font-bold">{centers.approved || 0} Approved</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{centers.pending || 0} Pending</span>
            </p>
          </div>
        </div>

        {/* Registered Platform Users */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Total Users</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {users.total || 0}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2 font-semibold">
              <span>{users.customers || 0} Cust</span>
              <span>•</span>
              <span>{users.owners || 0} Owners</span>
              <span>•</span>
              <span>{users.mechanics || 0} Mech</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[2px] text-zinc-400">Workshop Services</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {services.total || 0}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2 font-semibold">
              <span className="text-amber-400 font-bold">{services.pending || 0} Pending</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{services.completed || 0} Done</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Sections: Pending Centers & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Verification Queue */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  Workshops Awaiting Approval
                </h3>
              </div>
              <Link href="/admin/dashboard/centers" className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                View All ({centers.pending || 0})
              </Link>
            </div>

            {recent.pendingCenters && recent.pendingCenters.length > 0 ? (
              <div className="space-y-4">
                {recent.pendingCenters.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">{c.name}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate max-w-xs">{c.address}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        Owner: {c.admin?.fullName || c.admin?.name || "Workshop Partner"} ({c.admin?.phone || c.phone || "No phone"})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        disabled={verifyingId === c.id}
                        onClick={() => handleQuickApprove(c.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg h-9 px-3"
                      >
                        {verifyingId === c.id ? "Approving..." : "Approve Center"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                <p className="font-bold text-sm text-zinc-300 uppercase tracking-wider">All Caught Up!</p>
                <p className="text-xs text-zinc-500 mt-1">There are no workshop center registrations pending review.</p>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-zinc-800/80 mt-6">
            <Link href="/admin/dashboard/centers">
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider h-10">
                Open Automotive Centers Management Directory <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Fleet & Rental Bookings Feed */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  Recent Vehicle Bookings
                </h3>
              </div>
              <Link href="/admin/dashboard/bookings" className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                View All Bookings
              </Link>
            </div>

            {recent.bookings && recent.bookings.length > 0 ? (
              <div className="space-y-4">
                {recent.bookings.map((booking: any) => (
                  <div key={booking.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            booking.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            booking.status === 'IN_PROGRESS' || booking.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {booking.customer?.fullName || booking.customer?.name || "Customer"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 font-medium">
                          {booking.vehicle ? `${booking.vehicle.make || ''} ${booking.vehicle.model || ''}` : "Rental Fleet Vehicle"}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-3">
                          <span>Pickup: <strong className="text-zinc-300">{new Date(booking.pickupDate).toLocaleDateString()}</strong></span>
                          <span>•</span>
                          <span>Total: ${Number(booking.totalAmount || 0).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="font-bold text-sm text-zinc-300 uppercase tracking-wider">No Recent Bookings</p>
                <p className="text-xs text-zinc-500 mt-1">Vehicle rental bookings will appear here.</p>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-zinc-800/80 mt-6">
            <Link href="/admin/dashboard/bookings">
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider h-10">
                Open Fleet Bookings Management <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Quick Action Navigation Grid */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-[2px] text-zinc-400 mb-4">
          Platform Management Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/admin/dashboard/users" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <Users className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">Users & Roles</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{users.total || 0} Registered</p>
          </Link>

          <Link href="/admin/dashboard/centers" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <Building2 className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">Workshops</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{centers.total || 0} Centers</p>
          </Link>

          <Link href="/admin/dashboard/fleet" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <Car className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">Vehicle Fleet</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{vehicles.total || 0} Vehicles</p>
          </Link>

          <Link href="/admin/dashboard/bookings" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <CalendarDays className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">Bookings</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{financials.totalBookings || 0} Total</p>
          </Link>

          <Link href="/admin/dashboard/payments" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <CreditCard className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">Payments</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{financials.totalPayments || 0} Processed</p>
          </Link>

          <Link href="/admin/dashboard/settings" className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850 transition-all text-center group">
            <ShieldCheck className="w-6 h-6 text-zinc-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-white">System Config</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Parameters</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
