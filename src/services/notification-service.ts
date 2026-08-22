import { NotificationItem, NotificationType } from "../interface/notification.interface";
import apiConfig from "../config/api.json";

const STORAGE_KEY = "shipping_notifications_v1";

const INITIAL_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    _id: "notif_demo_1",
    orderId: "ord-10024",
    title: "Order Status: Out for Delivery",
    message: "Your order #ORD-10024 is currently out for delivery via Steadfast Courier.",
    type: "ORDER_SHIPPED",
    isRead: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  },
  {
    _id: "notif_demo_2",
    orderId: "ORD-10023",
    title: "Order Status: Processing",
    message: "Your order #ORD-10023 has been accepted and is being prepared.",
    type: "ORDER_PROCESSING",
    isRead: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
  }
];

export const getStoredNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return INITIAL_DEMO_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_NOTIFICATIONS));
      return INITIAL_DEMO_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_NOTIFICATIONS;
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
  try {
    if ((apiConfig as any)?.site?.notificationsUrl) {
      const res = await fetch((apiConfig as any).site.notificationsUrl);
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            notifications: list,
            unreadCount: data.unreadCount ?? list.filter((n: any) => !n.isRead).length
          };
        }
      }
    }
  } catch {
    // API fallback
  }

  const list = getStoredNotifications();
  const unreadCount = list.filter((n) => !n.isRead).length;
  return { notifications: list, unreadCount };
};

export const markNotificationReadApi = async (id: string): Promise<void> => {
  try {
    if ((apiConfig as any)?.site?.notificationsUrl) {
      await fetch(`${(apiConfig as any).site.notificationsUrl}/${id}/read`, {
        method: "PATCH"
      });
    }
  } catch {
    // API fallback
  }

  const list = getStoredNotifications();
  const updated = list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
};

export const markAllNotificationsReadApi = async (): Promise<void> => {
  try {
    if ((apiConfig as any)?.site?.notificationsUrl) {
      await fetch(`${(apiConfig as any).site.notificationsUrl}/read-all`, {
        method: "PATCH"
      });
    }
  } catch {
    // API fallback
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
