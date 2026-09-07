import { NotificationItem, NotificationType } from "../interface/notification.interface";
import apiConfig from "../config/api.json";
import { getData, patchData } from "./api-service";
import { getUserToken } from "../hooks/useApi";

const STORAGE_KEY = "shipping_notifications_v1";

export const getStoredNotifications = (userId?: string): NotificationItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) {
      // For specific logged-in users, fallback to empty array so demo notifications don't leak to new users
      return userId ? [] : [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (
  notifications: NotificationItem[],
  userId?: string,
  emitEvents: boolean = true
) => {
  if (typeof window === "undefined") return;
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(notifications));
    if (emitEvents) {
      window.dispatchEvent(new Event("notifications_updated"));
      if ("BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel("fashion_time_notifications");
          channel.postMessage({ type: "SYNC_NOTIFICATIONS" });
          channel.close();
        } catch {}
      }
    }
  } catch (err) {
    // console.error("Error saving notifications:", err);
  }
};

export const fetchNotificationsApi = async (userId?: string): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  let isGoogleSession = false;
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.provider === "google" || u.firebaseUid) isGoogleSession = true;
      }
    } catch {}
  }

  // Only invoke backend notifications endpoint for local_jwt sessions (or if backend is configured to handle Google tokens)
  if (notifUrl && token && !isGoogleSession) {
    try {
      const res: any = await getData({ url: notifUrl, token });
      if (res && !res.error) {
        const payload = res.data || res;
        const list = Array.isArray(payload.notifications)
          ? payload.notifications
          : Array.isArray(payload)
          ? payload
          : [];
        const unreadCount =
          payload.unreadCount ?? list.filter((n: any) => !n.isRead).length;

        saveStoredNotifications(list, userId, false);
        return { notifications: list, unreadCount };
      }
    } catch (err) {
      // console.warn("API fetch error for notifications, using fallback:", err);
    }
  }

  const list = getStoredNotifications(userId);
  const unreadCount = list.filter((n) => !n.isRead).length;
  return { notifications: list, unreadCount };
};

export const markNotificationReadApi = async (id: string, userId?: string): Promise<void> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  if (notifUrl && token) {
    try {
      await patchData({ url: `${notifUrl}/${id}/read`, token, body: {} });
    } catch (err) {
      // console.warn("API markNotificationReadApi error:", err);
    }
  }

  const list = getStoredNotifications(userId);
  const updated = list.map((n) => (n._id === id || (n as any).id === id ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated, userId);
};

export const markAllNotificationsReadApi = async (userId?: string): Promise<void> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  if (notifUrl && token) {
    try {
      await patchData({ url: `${notifUrl}/read-all`, token, body: {} });
    } catch (err) {
      // console.warn("API markAllNotificationsReadApi error:", err);
    }
  }

  const list = getStoredNotifications(userId);
  const updated = list.map((n) => ({ ...n, isRead: true }));
  saveStoredNotifications(updated, userId);
};

export function playChimeSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export const addShippingNotification = (
  orderId: string,
  status: string,
  customNote?: string,
  userId?: string
): NotificationItem => {
  const typeMap: Record<string, NotificationType> = {
    Processing: "ORDER_PROCESSING",
    Shipped: "ORDER_SHIPPED",
    "Out for Delivery": "ORDER_SHIPPED",
    Delivered: "ORDER_DELIVERED",
    Cancelled: "ORDER_CANCELLED"
  };

  const notifType = typeMap[status] || "GENERAL";
  const displayId = orderId.startsWith("#") ? orderId : `#${orderId}`;

  const newNotif: NotificationItem = {
    _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderId,
    title: `Order Status: ${status}`,
    message: customNote || `Your order ${displayId} status has been updated to "${status}".`,
    type: notifType,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const list = getStoredNotifications(userId);
  const isDuplicate = list.some(
    (n) => n.orderId === orderId && n.title === newNotif.title && (Date.now() - new Date(n.createdAt).getTime() < 5000)
  );

  if (!isDuplicate) {
    const updated = [newNotif, ...list];
    saveStoredNotifications(updated, userId);
    playChimeSound();
  }

  return newNotif;
};
