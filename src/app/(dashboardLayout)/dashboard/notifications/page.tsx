import { Bell, Calendar, CheckCircle2, AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: "success", title: "Booking Confirmed", message: "Your appointment at Jatra Premier Service is confirmed for tomorrow at 10:00 AM.", time: "2 hours ago", read: false },
    { id: 2, type: "alert", title: "Payment Failed", message: "We couldn't process your payment for the recent rental. Please update your payment method.", time: "Yesterday", read: true },
    { id: 3, type: "info", title: "New Promotion", message: "Get 20% off on your next oil change! Use code OIL20 at checkout.", time: "3 days ago", read: true },
    { id: 4, type: "success", title: "Vehicle Registered", message: "Your Toyota Corolla has been successfully added to your profile.", time: "1 week ago", read: true },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info': default: return <Calendar className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with your bookings and alerts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            Mark all as read
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="divide-y">
          {notifications.map(n => (
            <div key={n.id} className={`p-6 flex gap-4 transition-colors hover:bg-muted/30 ${n.read ? '' : 'bg-primary/5'}`}>
              <div className="mt-1 shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${n.read ? 'font-semibold' : 'font-bold text-[#1a1a1a]'}`}>{n.title}</h4>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-4">{n.time}</span>
                </div>
                <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'text-[#1a1a1a]'}`}>{n.message}</p>
              </div>
              {!n.read && (
                <div className="flex items-center ml-4 shrink-0">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
