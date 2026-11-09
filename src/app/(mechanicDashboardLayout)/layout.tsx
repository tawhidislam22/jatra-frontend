"use client";

import Link from "next/link";
import { 
  Car, 
  LayoutDashboard, 
  Wrench, 
  Building2, 
  CalendarDays, 
  History, 
  User as UserIcon, 
  LogOut, 
  Bell,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const dummyNotifications = [
  { id: 1, title: "New Service Request Assigned #SR-882", time: "2m ago", read: false },
  { id: 2, title: "Workshop schedule updated", time: "1d ago", read: true },
];

function MechanicNotificationsPopover() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const filtered = dummyNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative text-muted-foreground hover:text-amber-600 transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-2 border-muted/20">
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Mechanic Alerts</h3>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              Live
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setFilter('all')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'all' ? 'bg-amber-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'unread' ? 'bg-amber-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Unread</button>
            <button onClick={() => setFilter('read')} className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${filter === 'read' ? 'bg-amber-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Read</button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto bg-card">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div key={n.id} className={`p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? 'bg-amber-500/5' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <p className={`text-xs leading-tight ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {n.time}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-medium text-muted-foreground">No alerts found.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MechanicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dutyStatus, setDutyStatus] = useState<'ONLINE' | 'BUSY' | 'OFFLINE'>('ONLINE');

  const isActive = (path: string) => {
    if (path === '/mechanic/dashboard' && pathname !== '/mechanic/dashboard') return false;
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `w-full justify-start transition-all ${active ? 'bg-amber-600/10 text-amber-700 font-bold border-r-2 border-amber-600 rounded-r-none' : 'hover:bg-amber-500/10 hover:text-amber-700 font-medium text-muted-foreground'}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col h-auto md:h-screen md:sticky top-0 shrink-0">
        <Link href="/" className="h-16 px-6 flex items-center gap-2 border-b hover:bg-muted/50 transition-colors shrink-0">
          <div className="bg-amber-600 p-1.5 rounded-lg text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight leading-none text-foreground">JATRA</span>
            <span className="text-[9px] font-bold tracking-widest text-amber-600 uppercase">Mechanic Portal</span>
          </div>
        </Link>

        {/* Duty Status Badge */}
        <div className="p-4 border-b bg-amber-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Duty Status</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${dutyStatus === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : (dutyStatus === 'BUSY' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-gray-700')}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dutyStatus === 'ONLINE' ? 'bg-emerald-500' : (dutyStatus === 'BUSY' ? 'bg-amber-500' : 'bg-gray-400')}`} />
              {dutyStatus}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => setDutyStatus('ONLINE')} 
              className={`text-[9px] font-bold uppercase py-1 rounded transition-colors ${dutyStatus === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >
              Available
            </button>
            <button 
              onClick={() => setDutyStatus('BUSY')} 
              className={`text-[9px] font-bold uppercase py-1 rounded transition-colors ${dutyStatus === 'BUSY' ? 'bg-amber-600 text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >
              On Job
            </button>
            <button 
              onClick={() => setDutyStatus('OFFLINE')} 
              className={`text-[9px] font-bold uppercase py-1 rounded transition-colors ${dutyStatus === 'OFFLINE' ? 'bg-gray-700 text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >
              Off Duty
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link href="/mechanic/dashboard">
            <Button variant={isActive("/mechanic/dashboard") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
          </Link>
          <Link href="/mechanic/dashboard/assigned-services">
            <Button variant={isActive("/mechanic/dashboard/assigned-services") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard/assigned-services")}>
              <Wrench className="mr-2 h-4 w-4" /> Assigned Services
            </Button>
          </Link>
          <Link href="/mechanic/dashboard/workshop">
            <Button variant={isActive("/mechanic/dashboard/workshop") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard/workshop")}>
              <Building2 className="mr-2 h-4 w-4" /> My Workshop
            </Button>
          </Link>
          <Link href="/mechanic/dashboard/schedule">
            <Button variant={isActive("/mechanic/dashboard/schedule") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard/schedule")}>
              <CalendarDays className="mr-2 h-4 w-4" /> Task Schedule
            </Button>
          </Link>
          <Link href="/mechanic/dashboard/history">
            <Button variant={isActive("/mechanic/dashboard/history") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard/history")}>
              <History className="mr-2 h-4 w-4" /> Repair History
            </Button>
          </Link>
          <Link href="/mechanic/dashboard/profile">
            <Button variant={isActive("/mechanic/dashboard/profile") ? "secondary" : "ghost"} className={getLinkClasses("/mechanic/dashboard/profile")}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile & Skills
            </Button>
          </Link>
        </nav>
        
        {/* Sidebar Bottom: Mechanic User Profile & Logout */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden" suppressHydrationWarning>
            <div className="w-10 h-10 rounded-full bg-amber-600/20 border-2 border-amber-600 text-amber-700 flex items-center justify-center font-bold shrink-0" suppressHydrationWarning>
              {(user?.fullName || user?.name || user?.email || "M").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden" suppressHydrationWarning>
              <p className="text-sm font-bold truncate text-foreground" suppressHydrationWarning>
                {user?.fullName || user?.name || user?.email?.split('@')[0] || "Mechanic"}
              </p>
              <div className="flex items-center gap-1.5" suppressHydrationWarning>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                  Mechanic
                </span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-[10px] text-muted-foreground truncate" suppressHydrationWarning>
                  {user?.employedAtCenter?.name || "Workshop"}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            title="Logout" 
            className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 focus:outline-none"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">Mechanic Portal</span>
            <span>/</span>
            <span className="capitalize font-medium text-amber-700">
              {pathname?.replace('/mechanic/dashboard', '').replace('/', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MechanicNotificationsPopover />
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              Main Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-muted/10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
