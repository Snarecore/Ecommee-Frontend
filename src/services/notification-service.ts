import { NotificationItem, NotificationType } from "../interface/notification.interface";
import apiConfig from "../config/api.json";
import { getData, patchData } from "./api-service";
import { getUserToken } from "../hooks/useApi";

const STORAGE_KEY = "shipping_notifications_v1";

export const getStoredNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (notifications: NotificationItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("notifications_updated"));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error saving notifications:", err);
  }
};

export const fetchNotificationsApi = async (): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  if (notifUrl && token) {
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

        if (list.length > 0) {
          saveStoredNotifications(list);
          return { notifications: list, unreadCount };
        }
      }
    } catch (err) {
      console.warn("API fetch error for notifications, using fallback:", err);
    }
  }

  const list = getStoredNotifications();
  const unreadCount = list.filter((n) => !n.isRead).length;
  return { notifications: list, unreadCount };
};

export const markNotificationReadApi = async (id: string): Promise<void> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  if (notifUrl && token) {
    try {
      await patchData({ url: `${notifUrl}/${id}/read`, token, body: {} });
    } catch (err) {
      console.warn("API markNotificationReadApi error:", err);
    }
  }

  const list = getStoredNotifications();
  const updated = list.map((n) => (n._id === id || (n as any).id === id ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
};

export const markAllNotificationsReadApi = async (): Promise<void> => {
  const token = getUserToken();
  const notifUrl = (apiConfig as any)?.site?.notificationsUrl;

  if (notifUrl && token) {
    try {
      await patchData({ url: `${notifUrl}/read-all`, token, body: {} });
    } catch (err) {
      console.warn("API markAllNotificationsReadApi error:", err);
    }
  }

  const list = getStoredNotifications();
  const updated = list.map((n) => ({ ...n, isRead: true }));
  saveStoredNotifications(updated);
};

export const addShippingNotification = (
  orderId: string,
  status: string,
  customNote?: string
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

  const list = getStoredNotifications();
  const isDuplicate = list.some(
    (n) => n.orderId === orderId && n.title === newNotif.title && (Date.now() - new Date(n.createdAt).getTime() < 5000)
  );

  if (!isDuplicate) {
    const updated = [newNotif, ...list];
    saveStoredNotifications(updated);
  }

  return newNotif;
};
