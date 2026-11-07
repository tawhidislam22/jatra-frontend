"use client";

import Link from "next/link";
import { Car, LayoutDashboard, Building2, CalendarDays, Wrench, Users, AlertTriangle, CreditCard, Star, Settings, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const dummyNotifications = [
  { id: 1, title: "New Booking Request #1029", time: "5m ago", read: false },
  { id: 2, title: "Payment Successful for Toyota Camry", time: "1h ago", read: false },
  { id: 3, title: "Profile details updated", time: "2d ago", read: true },
];

function NotificationsPopover() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const filtered = dummyNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative text-muted-foreground hover:text-primary transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-2 border-muted/20">
        <div className="p-4 border-b bg-card">
          <h3 className="font-bold text-sm text-foreground">Notifications</h3>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setFilter('all')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Unread</button>
            <button onClick={() => setFilter('read')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'read' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Read</button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto bg-card">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div key={n.id} className={`p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <p className={`text-xs leading-tight ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">{n.time}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-medium text-muted-foreground">No notifications found.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/owner/dashboard' && pathname !== '/owner/dashboard') return false;
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `w-full justify-start transition-all ${active ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-primary/10 hover:text-primary font-medium text-muted-foreground'}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col h-auto md:h-screen md:sticky top-0 shrink-0">
        <Link href="/" className="h-16 px-6 flex items-center gap-2 border-b hover:bg-muted/50 transition-colors shrink-0">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">JATRA</span>
        </Link>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/owner/dashboard">
            <Button variant={isActive("/owner/dashboard") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
          </Link>
          <Link href="/owner/dashboard/center-profile">
            <Button variant={isActive("/owner/dashboard/center-profile") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/center-profile")}>
              <Building2 className="mr-2 h-4 w-4" /> Center Profile
            </Button>
          </Link>
          <Link href="/owner/dashboard/fleet">
            <Button variant={isActive("/owner/dashboard/fleet") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/fleet")}>
              <Car className="mr-2 h-4 w-4" /> Fleet Vehicles
            </Button>
          </Link>
          <Link href="/owner/dashboard/bookings">
            <Button variant={isActive("/owner/dashboard/bookings") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/bookings")}>
              <CalendarDays className="mr-2 h-4 w-4" /> Rental Bookings
            </Button>
          </Link>
          <Link href="/owner/dashboard/service-requests">
            <Button variant={isActive("/owner/dashboard/service-requests") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/service-requests")}>
              <Wrench className="mr-2 h-4 w-4" /> Service Requests
            </Button>
          </Link>
          <Link href="/owner/dashboard/mechanics">
            <Button variant={isActive("/owner/dashboard/mechanics") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/mechanics")}>
              <Users className="mr-2 h-4 w-4" /> Mechanics
            </Button>
          </Link>
          <Link href="/owner/dashboard/emergencies">
            <Button variant={isActive("/owner/dashboard/emergencies") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/emergencies")}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Emergencies
            </Button>
          </Link>
          <Link href="/owner/dashboard/earnings">
            <Button variant={isActive("/owner/dashboard/earnings") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/earnings")}>
              <CreditCard className="mr-2 h-4 w-4" /> Earnings
            </Button>
          </Link>
          <Link href="/owner/dashboard/reviews">
            <Button variant={isActive("/owner/dashboard/reviews") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/reviews")}>
              <Star className="mr-2 h-4 w-4" /> Reviews
            </Button>
          </Link>
          <Link href="/owner/dashboard/settings">
            <Button variant={isActive("/owner/dashboard/settings") ? "secondary" : "ghost"} className={getLinkClasses("/owner/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </Link>
        </nav>
        
        {/* Sidebar Bottom: User Profile & Logout */}
        <div className="p-4 border-t flex items-center justify-between bg-card">
          <div className="flex items-center gap-3 overflow-hidden" suppressHydrationWarning>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shrink-0" suppressHydrationWarning>
              {(user?.fullName || user?.name || user?.email || "O").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden" suppressHydrationWarning>
              <span className="font-bold text-sm leading-tight text-foreground truncate" suppressHydrationWarning>
                {user?.fullName || user?.name || user?.email?.split('@')[0] || "Owner"}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate" suppressHydrationWarning>
                {user?.role || "OWNER"}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={() => logout()} 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 w-10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-card flex items-center justify-end px-8 gap-4 shrink-0">
          <ThemeToggle />
          <NotificationsPopover />
        </header>

        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
