"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Calendar, 
  Wrench, 
  Car, 
  CreditCard, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  CheckCheck,
  ExternalLink
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsService } from "@/services/notifications.service";
import { Notification } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationsPopoverProps {
  notificationsHref?: string;
  badgeClassName?: string;
}

export function NotificationsPopover({ 
  notificationsHref = "/dashboard/notifications",
  badgeClassName = "bg-primary text-primary-foreground" 
}: NotificationsPopoverProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isOpen, setIsOpen] = useState(false);

  // Live polling for notifications every 10 seconds
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

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "BOOKING":
        return <Car className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "SERVICE":
        return <Wrench className="h-4 w-4 text-amber-500 shrink-0" />;
      case "PAYMENT":
        return <CreditCard className="h-4 w-4 text-blue-500 shrink-0" />;
      case "MESSAGE":
        return <MessageSquare className="h-4 w-4 text-primary shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-400 shrink-0" />;
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted/50 focus:outline-none"
          aria-label="Open Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-pulse ${badgeClassName}`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-84 sm:w-96 p-0 shadow-2xl border border-border rounded-2xl overflow-hidden bg-card">
        {/* Header */}
        <div className="p-4 border-b bg-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${
                filter === "unread" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold transition-all ${
                filter === "read" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60 bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-semibold text-muted-foreground animate-pulse">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">No notifications</p>
              <p className="text-[11px] text-muted-foreground">You are all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 transition-colors cursor-pointer flex gap-3 hover:bg-muted/40 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-muted/60 border border-border shrink-0 self-start">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h4 className={`text-xs truncate ${!n.read ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${!n.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <div className="flex items-center shrink-0 self-center">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="p-3 border-t bg-muted/20 text-center">
          <Link
            href={notificationsHref}
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All Activity & Notifications</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
