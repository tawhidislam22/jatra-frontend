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
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationsPopover } from "@/components/shared/NotificationsPopover";

export default function MechanicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dutyStatus, setDutyStatus] = useState<'ONLINE' | 'BUSY' | 'OFFLINE'>('ONLINE');

  useEffect(() => {
    if (!user) return;
    if (user.role === 'CUSTOMER') {
      router.replace('/dashboard');
    } else if (user.role === 'OWNER') {
      router.replace('/owner/dashboard');
    }
  }, [user, router]);

  // One user only one dashboard: Non-mechanic should never render mechanic dashboard
  if (user && user.role !== 'MECHANIC' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <NotificationsPopover badgeClassName="bg-amber-600 text-white" />
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
