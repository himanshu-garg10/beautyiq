"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Heart,
  Tag,
  AlertTriangle,
  Info,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { NotificationService } from "@/services/notification.service";
import type { InAppNotification, NotificationType } from "@/types";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";

export function NotificationDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const loadNotifications = React.useCallback(() => {
    if (!user) return;
    const items = NotificationService.getNotifications(user.id);
    setNotifications(items);
    setUnreadCount(NotificationService.getUnreadCount(user.id));
  }, [user]);

  React.useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener("beautyiq_notification_update", handleUpdate);
    return () => window.removeEventListener("beautyiq_notification_update", handleUpdate);
  }, [loadNotifications]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = NotificationService.markAllAsRead(user.id);
    setNotifications(updated);
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    if (!user) return;
    NotificationService.markAsRead(user.id, notif.id);
    loadNotifications();
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "PRICE_CHANGED":
        return <Tag className="h-3.5 w-3.5 text-clay" />;
      case "RECOMMENDATION_GENERATED":
        return <Sparkles className="h-3.5 w-3.5 text-sage-deep" />;
      case "PRODUCT_SAVED":
        return <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />;
      case "PROFILE_UPDATED":
        return <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" />;
      case "PRODUCT_UNAVAILABLE":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-foreground-muted" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          loadNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card hover:bg-background-elevated hover:text-foreground text-foreground-muted transition-colors shadow-subtle"
        aria-label={`Notifications (${unreadCount} unread)`}
        title="In-App Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sage-deep text-[0.62rem] font-bold text-white px-1 shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-line bg-background-card p-0 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="sage" className="text-[0.65rem] py-0 px-1.5 font-bold">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[0.7rem] font-semibold text-sage-deep hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-line/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground-muted space-y-2">
                <div className="h-9 w-9 rounded-full bg-sage-tint text-sage-deep mx-auto flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <p className="font-medium text-foreground">You&apos;re all caught up</p>
                <p className="text-[0.72rem] text-foreground-muted max-w-[220px] mx-auto">
                  No pending routine reminders or product price drops at this time.
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-background-elevated/60 transition-colors cursor-pointer flex items-start gap-3 text-xs ${
                    !n.isRead ? "bg-sage-tint/20 dark:bg-sage-deep/10" : ""
                  }`}
                >
                  <div className="mt-0.5 rounded-full p-1.5 bg-background border border-line shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-xs leading-snug">{n.title}</h4>
                      <span className="text-[0.65rem] font-mono text-foreground-faint shrink-0">
                        {n.createdAt.split(" ")[1] || "Just now"}
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[0.72rem] line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-deep shrink-0 mt-2" aria-hidden="true" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-line p-2 text-center bg-background-elevated/40 rounded-b-lg">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-sage-deep hover:underline inline-flex items-center gap-1 py-1"
            >
              Open Notification Center <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
