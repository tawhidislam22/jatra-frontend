"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wrench, 
  Car, 
  CalendarDays, 
  CreditCard, 
  Star, 
  Settings, 
  LogOut, 
  Bell,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const dummyAdminNotifications = [
  { id: 1, title: "New Automotive Center registration pending approval: Apex Motors", time: "2m ago", read: false, type: "center" },
  { id: 2, title: "Payment of $350 processed for Rental Booking #1084", time: "1h ago", read: false, type: "payment" },
  { id: 3, title: "New mechanic account registered by Gulshan Auto Hub", time: "3h ago", read: true, type: "user" },
];

function AdminNotificationsPopover() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const filtered = dummyAdminNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-zinc-950 animate-pulse"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-84 p-0 shadow-2xl border border-zinc-800 bg-zinc-950 text-white">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" /> Platform Notifications
            </h3>
            <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
              Admin
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setFilter('all')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition-all ${filter === 'all' ? 'bg-red-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition-all ${filter === 'unread' ? 'bg-red-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Unread</button>
            <button onClick={() => setFilter('read')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition-all ${filter === 'read' ? 'bg-red-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Read</button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div key={n.id} className={`p-4 hover:bg-zinc-900 transition-colors cursor-pointer ${!n.read ? 'bg-zinc-900/40' : ''}`}>
                <div className="flex justify-between items-start gap-3">
                  <p className={`text-xs leading-snug ${!n.read ? 'font-bold text-white' : 'font-medium text-zinc-400'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5 font-semibold">{n.time}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-medium text-zinc-500">No notifications found.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && pathname !== '/admin/dashboard') return false;
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `w-full justify-start transition-all rounded-lg text-xs font-bold uppercase tracking-wider h-11 ${
      active 
        ? 'bg-red-600 text-white shadow-md shadow-red-950/50 font-black' 
        : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0c0d0e] text-zinc-100 antialiased">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-68 border-r border-zinc-800/80 bg-zinc-950 flex flex-col h-auto md:h-screen md:sticky top-0 shrink-0">
        <div className="h-18 px-6 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white uppercase">JATRA</span>
                <span className="bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-red-500/30">
                  ADMIN
                </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                Platform Control
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-black uppercase tracking-[2px] text-zinc-400 mb-2 mt-1">
            Platform Management
          </p>

          <Link href="/admin/dashboard">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard")}>
              <LayoutDashboard className="mr-3 h-4 w-4" /> Overview
            </Button>
          </Link>

          <Link href="/admin/dashboard/centers">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/centers")}>
              <Building2 className="mr-3 h-4 w-4" /> Workshops / Centers
            </Button>
          </Link>

          <Link href="/admin/dashboard/users">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/users")}>
              <Users className="mr-3 h-4 w-4" /> Users & Roles
            </Button>
          </Link>

          <Link href="/admin/dashboard/service-requests">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/service-requests")}>
              <Wrench className="mr-3 h-4 w-4" /> Service Requests
            </Button>
          </Link>

          <Link href="/admin/dashboard/fleet">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/fleet")}>
              <Car className="mr-3 h-4 w-4" /> Vehicle Fleet
            </Button>
          </Link>

          <Link href="/admin/dashboard/bookings">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/bookings")}>
              <CalendarDays className="mr-3 h-4 w-4" /> Rental Bookings
            </Button>
          </Link>

          <Link href="/admin/dashboard/payments">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/payments")}>
              <CreditCard className="mr-3 h-4 w-4" /> Transactions & Revenue
            </Button>
          </Link>

          <Link href="/admin/dashboard/reviews">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/reviews")}>
              <Star className="mr-3 h-4 w-4" /> Review Moderation
            </Button>
          </Link>

          <Link href="/admin/dashboard/settings">
            <Button variant="ghost" className={getLinkClasses("/admin/dashboard/settings")}>
              <Settings className="mr-3 h-4 w-4" /> Platform Settings
            </Button>
          </Link>
        </nav>
        
        {/* Sidebar Bottom: Admin Profile & Sign Out */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black shrink-0">
              {(user?.fullName || user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-xs text-white truncate">
                {user?.fullName || user?.name || "Platform Admin"}
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                SUPER ADMIN
              </span>
            </div>
          </div>
          
          <Button 
            onClick={() => logout()} 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-9 w-9 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#0c0d0e]">
        {/* Top Navbar */}
        <header className="h-18 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Status:</span>
              <span className="text-emerald-400 uppercase tracking-widest text-[10px]">Operational 100%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              <span>View Public Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
            <ThemeToggle className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" />
            <AdminNotificationsPopover />
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="p-6 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
