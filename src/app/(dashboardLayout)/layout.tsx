import Link from "next/link";
import { Car, LayoutDashboard, CalendarDays, Wrench, CreditCard, LogOut, Heart, Wallet, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col h-auto md:h-screen md:sticky top-0">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">JATRA</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
          </Link>
          <Link href="/dashboard/my-vehicles">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <Car className="mr-2 h-4 w-4" /> My Vehicles
            </Button>
          </Link>
          <Link href="/dashboard/bookings">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <CalendarDays className="mr-2 h-4 w-4" /> Rental Bookings
            </Button>
          </Link>
          <Link href="/dashboard/service-requests">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <Wrench className="mr-2 h-4 w-4" /> Service Requests
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <CreditCard className="mr-2 h-4 w-4" /> Payments
            </Button>
          </Link>
          <Link href="/dashboard/wishlist">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <Wallet className="mr-2 h-4 w-4" /> Wallet
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Button>
          </Link>
          <Link href="/dashboard/notifications">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Button>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}