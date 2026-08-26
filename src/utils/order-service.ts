import { formatPrettyDateWithTime } from "./date-utils";

export type OrderStatus =
  | "Order Placed"
  | "Pending"
  | "Processing"
  | "Preparing Order"
  | "Shipped"
  | "Loaded for Delivery"
  | "Handed Over to Courier"
  | "Out for Delivery"
  | "Delivered"
  | "Completed"
  | "Failed"
  | "Cancelled"
  | "Returned";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type PaymentMethod = "COD" | "Online";

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  updatedBy: "admin" | "system";
  updatedByUserId?: string;
  note?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id: string;
  orderId: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  
  shippingAddress: ShippingAddress;
  specialNote?: string;
  
  courierName?: string;
  trackingId?: string;
  courierTrackingLink?: string;
  
  items: OrderItem[];
  statusHistory: OrderStatusHistoryItem[];
}

export interface OrderLike {
  createdAt?: string | Date;
  created_at?: string | Date;
  createAt?: string | Date;
  date?: string | Date;
}

const STORAGE_KEY_V2 = "bazaarbound_orders_v2";
const STORAGE_KEY_V1 = "bazaarbound_orders";

export const calculateDeliveryZoneAndFee = (city: string) => {
  const normalizedCity = (city || "").trim().toLowerCase();
  const isDhaka = normalizedCity === "dhaka" || normalizedCity.startsWith("dhaka ");
  return {
    deliveryZone: isDhaka ? ("inside_dhaka" as const) : ("outside_dhaka" as const),
    deliveryCharge: isDhaka ? 60 : 120
  };
};

export const getOrderCreatedAt = (order?: OrderLike | null): string => {
  if (!order) return "Date unavailable";
  const rawDate = order.createdAt || order.created_at || order.createAt || order.date;
  if (!rawDate) return "Date unavailable";
  return formatPrettyDateWithTime(rawDate);
};

export const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2) || localStorage.getItem(STORAGE_KEY_V1);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const createOrderInService = (params: {
  userId?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  specialNote?: string;
  items: OrderItem[];
  subtotal: number;
}): Order => {
  const { deliveryZone, deliveryCharge } = calculateDeliveryZoneAndFee(
    params.shippingAddress.city
  );
  const totalAmount = params.subtotal + deliveryCharge;
  const nowISO = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ORD-${randomSuffix}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderId,
    userId: params.userId || "user-default",
    createdAt: nowISO,
    updatedAt: nowISO,
    orderStatus: "Order Placed",
    paymentStatus: params.paymentStatus || (params.paymentMethod === "Online" ? "Paid" : "Pending"),
    paymentMethod: params.paymentMethod,
    subtotal: params.subtotal,
    deliveryCharge,
    totalAmount,
    deliveryZone,
    shippingAddress: params.shippingAddress,
    specialNote: params.specialNote,
    items: params.items,
    statusHistory: [
      {
        status: "Order Placed",
        timestamp: nowISO,
        updatedBy: "system",
        note: "Order created successfully"
      }
    ]
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getStoredOrders();
      existing.unshift(newOrder);
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(existing));
      localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to store order in localStorage:", e);
    }
    window.dispatchEvent(new Event("orders_updated"));
  }
  return newOrder;
};

export const updateOrderStatusInService = (params: {
  orderId: string;
  newStatus: OrderStatus;
  courierName?: string;
  trackingId?: string;
  courierTrackingLink?: string;
  adminUserId?: string;
  note?: string;
  orderFallback?: Order;
}): Order | null => {
  const orders = getStoredOrders();
  let idx = orders.findIndex((o) => o.id === params.orderId || o.orderId === params.orderId);

  if (idx === -1) {
    if (params.orderFallback) {
      orders.unshift(params.orderFallback);
      idx = 0;
    } else {
      return null;
    }
  }

  const target = { ...orders[idx] };
  const nowISO = new Date().toISOString();

  target.orderStatus = params.newStatus;
  target.updatedAt = nowISO;

  if (params.courierName !== undefined) target.courierName = params.courierName.trim();
  if (params.trackingId !== undefined) target.trackingId = params.trackingId.trim();
  if (params.courierTrackingLink !== undefined) target.courierTrackingLink = params.courierTrackingLink.trim();

  // COD Payment auto-transitions to Paid when Delivered
  if (target.paymentMethod === "COD" && params.newStatus === "Delivered") {
    target.paymentStatus = "Paid";
  }

  // Cancellation matrix
  if (params.newStatus === "Cancelled") {
    if (target.paymentStatus === "Paid") {
      target.paymentStatus = "Refunded";
    }
  }

  // Append status history entry (prevent duplicate consecutive entries)
  if (!target.statusHistory) target.statusHistory = [];
  const lastHistory = target.statusHistory[target.statusHistory.length - 1];
  if (!lastHistory || lastHistory.status !== params.newStatus) {
    target.statusHistory = [
      ...target.statusHistory,
      {
        status: params.newStatus,
        timestamp: nowISO,
        updatedBy: "admin",
        updatedByUserId: params.adminUserId || "admin_default",
        note: params.note || `Status updated to ${params.newStatus}`
      }
    ];
  }

  orders[idx] = target;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(orders));
    window.dispatchEvent(new Event("orders_updated"));
    window.dispatchEvent(new Event("storage"));
    
    // Automatically trigger notification for order shipping status update
    try {
      const { addShippingNotification } = require("../services/notification-service");
      addShippingNotification(
        target.orderId || target.id,
        params.newStatus,
        params.note || `Order status updated to "${params.newStatus}"`
      );
    } catch (err) {
      console.error("Error triggering notification:", err);
    }
  }

  return target;
};

export const getOrderByIdFromService = (orderId: string): Order | undefined => {
  if (!orderId) return undefined;
  const orders = getStoredOrders();
  const cleanId = orderId.replace(/^#/, "").trim().toLowerCase();

  return orders.find((o) => {
    const idMatches = o.id?.toLowerCase() === cleanId;
    const orderIdMatches = o.orderId?.replace(/^#/, "").trim().toLowerCase() === cleanId;
    return idMatches || orderIdMatches;
  });
};
