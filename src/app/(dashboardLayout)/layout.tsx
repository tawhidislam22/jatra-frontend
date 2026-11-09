"use client";

import Link from "next/link";
import { Car, LayoutDashboard, CalendarDays, Wrench, CreditCard, LogOut, Heart, Wallet, MessageSquare, Bell, User as UserIcon, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationsPopover } from "@/components/shared/NotificationsPopover";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    } else if (user.role === 'OWNER' || !!user?.managedCenter) {
      router.replace('/owner/dashboard');
    } else if (user.role === 'MECHANIC') {
      router.replace('/mechanic/dashboard');
    }
  }, [user, router]);

  // One user, only one dashboard: If user is not CUSTOMER, never render customer dashboard!
  if (user && user.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname !== '/dashboard') return false;
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
          <Link href="/dashboard">
            <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
          </Link>
          <Link href="/dashboard/my-vehicles">
            <Button variant={isActive("/dashboard/my-vehicles") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/my-vehicles")}>
              <Car className="mr-2 h-4 w-4" /> My Vehicles
            </Button>
          </Link>
          <Link href="/dashboard/bookings">
            <Button variant={isActive("/dashboard/bookings") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/bookings")}>
              <CalendarDays className="mr-2 h-4 w-4" /> Rental Bookings
            </Button>
          </Link>
          <Link href="/dashboard/service-requests">
            <Button variant={isActive("/dashboard/service-requests") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/service-requests")}>
              <Wrench className="mr-2 h-4 w-4" /> Service Requests
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant={isActive("/dashboard/payments") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/payments")}>
              <CreditCard className="mr-2 h-4 w-4" /> Payments
            </Button>
          </Link>
          <Link href="/dashboard/wishlist">
            <Button variant={isActive("/dashboard/wishlist") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/wishlist")}>
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant={isActive("/dashboard/wallet") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/wallet")}>
              <Wallet className="mr-2 h-4 w-4" /> Wallet
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant={isActive("/dashboard/messages") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/messages")}>
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant={isActive("/dashboard/profile") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/profile")}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </Button>
          </Link>
          <Link href="/dashboard/reviews">
            <Button variant={isActive("/dashboard/reviews") ? "secondary" : "ghost"} className={getLinkClasses("/dashboard/reviews")}>
              <Star className="mr-2 h-4 w-4" /> Reviews
            </Button>
          </Link>
        </nav>
        
        {/* Sidebar Bottom: User Profile & Logout */}
        <div className="p-4 border-t flex items-center justify-between bg-card">
          <div className="flex items-center gap-3 overflow-hidden" suppressHydrationWarning>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shrink-0" suppressHydrationWarning>
              {(user?.fullName || user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden" suppressHydrationWarning>
              <span className="font-bold text-sm leading-tight text-foreground truncate" suppressHydrationWarning>
                {user?.fullName || user?.name || user?.email?.split('@')[0] || "Customer"}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate" suppressHydrationWarning>
                {user?.role || "CUSTOMER"}
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