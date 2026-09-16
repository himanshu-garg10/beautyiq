import type { InAppNotification, NotificationType } from "@/types";
import { mockNotifications } from "@/lib/mock-data";

const NOTIFICATIONS_STORAGE_KEY = "beautyiq_notifications";

export class NotificationService {
  /**
   * Retrieve in-app notifications for customer
   */
  static getNotifications(userId: string = "u1"): InAppNotification[] {
    if (typeof window === "undefined") {
      return mockNotifications.filter((n) => n.userId === userId);
    }
    try {
      const stored = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(mockNotifications));
      return mockNotifications;
    } catch {
      return mockNotifications;
    }
  }

  /**
   * Get unread notification count
   */
  static getUnreadCount(userId: string = "u1"): number {
    const list = this.getNotifications(userId);
    return list.filter((n) => !n.isRead).length;
  }

  /**
   * Create a new in-app notification
   */
  static createNotification(
    userId: string = "u1",
    data: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      productId?: string;
    }
  ): InAppNotification {
    const current = this.getNotifications(userId);

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      productId: data.productId,
      isRead: false,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    const updated = [newNotif, ...current].slice(0, 30); // Keep last 30

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist notification:", e);
      }
    }

    return newNotif;
  }

  /**
   * Mark single notification as read
   */
  static markAsRead(userId: string = "u1", id: string): InAppNotification[] {
    const current = this.getNotifications(userId);
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to update notification status:", e);
      }
    }

    return updated;
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(userId: string = "u1"): InAppNotification[] {
    const current = this.getNotifications(userId);
    const updated = current.map((n) => ({ ...n, isRead: true }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to mark all notifications as read:", e);
      }
    }

    return updated;
  }

  /**
   * Delete an individual notification
   */
  static deleteNotification(userId: string = "u1", id: string): InAppNotification[] {
    const current = this.getNotifications(userId);
    const updated = current.filter((n) => n.id !== id);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to delete notification:", e);
      }
    }

    return updated;
  }

  /**
   * Clear all notifications
   */
  static clearAll(userId: string = "u1"): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
      } catch (e) {
        console.warn("Failed to clear notifications:", e);
      }
    }
  }
}
