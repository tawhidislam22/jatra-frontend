"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Calendar, 
  CheckCircle2, 
  Wrench, 
  Car, 
  CreditCard, 
  MessageSquare, 
  CheckCheck, 
  Trash2, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsService } from "@/services/notifications.service";
import { Notification } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => notificationsService.getNotifications(filter),
    refetchInterval: 8000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "BOOKING":
        return <Car className="h-5 w-5 text-emerald-500" />;
      case "SERVICE":
        return <Wrench className="h-5 w-5 text-amber-500" />;
      case "PAYMENT":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-zinc-400" />;
    }
  };

  const formatRelative = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              Notifications & Alerts
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Stay updated with real-time alerts regarding vehicle bookings, service appointments, and messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider rounded-xl h-10 border-border"
          >
            <CheckCheck className="h-4 w-4 text-primary" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs uppercase tracking-wider px-4 py-1.5 rounded-full font-bold transition-all ${
            filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`text-xs uppercase tracking-wider px-4 py-1.5 rounded-full font-bold transition-all ${
            filter === "unread" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`text-xs uppercase tracking-wider px-4 py-1.5 rounded-full font-bold transition-all ${
            filter === "read" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-semibold text-muted-foreground animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">No Notifications</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {filter === "unread" ? "You have no unread notifications right now." : "All your upcoming alerts and activity logs will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer ${
                  n.read ? "" : "bg-primary/5"
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="mt-1 p-2.5 rounded-xl bg-muted/60 border border-border shrink-0 self-start">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <h4 className={`text-sm truncate ${n.read ? "font-semibold text-muted-foreground" : "font-black text-foreground"}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {n.message}
                  </p>

                  {n.link && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {!n.read && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(n.id);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
