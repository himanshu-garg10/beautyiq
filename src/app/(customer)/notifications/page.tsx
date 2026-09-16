"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { NotificationService } from "@/services/notification.service";
import type { InAppNotification, NotificationType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Heart,
  Tag,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sliders,
  ArrowRight,
} from "lucide-react";

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = React.useState<InAppNotification[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "unread">("all");

  const loadNotifications = React.useCallback(() => {
    if (!user) return;
    setNotifications(NotificationService.getNotifications(user.id));
  }, [user]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    if (!user) return;
    const updated = NotificationService.markAllAsRead(user.id);
    setNotifications(updated);
    addToast({ type: "success", title: "All Read", description: "All notifications marked as read." });
  };

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = NotificationService.markAsRead(user.id, id);
    setNotifications(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = NotificationService.deleteNotification(user.id, id);
    setNotifications(updated);
    addToast({ type: "info", title: "Notification Dismissed", description: "Removed from your notifications." });
  };

  const handleClearAll = () => {
    if (!user) return;
    NotificationService.clearAll(user.id);
    setNotifications([]);
    addToast({ type: "info", title: "Notifications Cleared", description: "All notification records removed." });
  };

  const handleCardClick = (n: InAppNotification) => {
    if (!user) return;
    NotificationService.markAsRead(user.id, n.id);
    loadNotifications();
    if (n.link) {
      router.push(n.link);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "PRICE_CHANGED":
        return <Tag className="h-4 w-4 text-clay" />;
      case "RECOMMENDATION_GENERATED":
        return <Sparkles className="h-4 w-4 text-sage-deep" />;
      case "PRODUCT_SAVED":
        return <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />;
      case "PROFILE_UPDATED":
        return <ShieldCheck className="h-4 w-4 text-sage-deep" />;
      case "PRODUCT_UNAVAILABLE":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-foreground-muted" />;
    }
  };

  const filteredNotifications = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="sage" className="flex items-center gap-1 font-semibold text-xs">
              <Bell className="h-3.5 w-3.5" /> Customer Alerts
            </Badge>
            {unreadCount > 0 && (
              <Badge variant="clay" className="font-mono text-xs">
                {unreadCount} Unread
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Notification Center
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Real-time updates regarding your saved products, price changes, and new skincare recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleClearAll}>
              Clear All
            </Button>
          )}

          <Link href="/settings">
            <Button variant="outline" size="sm" leftIcon={<Sliders className="h-4 w-4" />}>
              Preferences
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 text-xs">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
            activeFilter === "all"
              ? "bg-sage-deep text-white"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter("unread")}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
            activeFilter === "unread"
              ? "bg-sage-deep text-white"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title={activeFilter === "unread" ? "No Unread Notifications" : "No Notifications"}
          description={
            activeFilter === "unread"
              ? "You are all caught up with your skincare updates."
              : "You do not have any notifications yet. Alerts for price drops and recommendations will appear here."
          }
          icon={<Bell className="h-8 w-8 text-foreground-faint" />}
          actionLabel="Browse Products Catalog"
          onAction={() => router.push("/products")}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleCardClick(n)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead
                  ? "border-sage-deep/60 bg-sage-tint/15 dark:bg-sage-deep/10 shadow-xs"
                  : "border-line bg-background-card hover:border-line-strong"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full p-2 bg-background border border-line shrink-0">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-foreground text-sm leading-snug">
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-sage-deep shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[0.7rem] text-foreground-faint font-mono">
                    <span>{n.createdAt}</span>
                    {n.link && (
                      <span className="text-sage-deep font-semibold flex items-center gap-1 hover:underline">
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={(e) => handleMarkRead(n.id, e)}
                    className="text-xs font-semibold text-sage-deep hover:underline p-1.5"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(n.id, e)}
                  className="text-foreground-faint hover:text-status-error p-1.5 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
