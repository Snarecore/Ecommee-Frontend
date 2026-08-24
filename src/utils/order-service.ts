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

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: "ord-10024",
    orderId: "ORD-10024",
    userId: "user-default",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    orderStatus: "Out for Delivery",
    paymentStatus: "Pending",
    paymentMethod: "COD",
    subtotal: 1750,
    deliveryCharge: 60,
    totalAmount: 1810,
    deliveryZone: "inside_dhaka",
    shippingAddress: {
      name: "Majba Rahman",
      phone: "+8801810172434",
      address: "House 24, Road 12, Sector 4, Uttara",
      city: "Dhaka"
    },
    specialNote: "Please call 10 minutes before delivery.",
    courierName: "Steadfast Courier",
    trackingId: "ST-8891234",
    courierTrackingLink: "https://steadfast.com.bd/t/ST-8891234",
    items: [
      {
        id: "prod-1",
        productName: "Leaf Black Half Shirt",
        productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60",
        price: 1750,
        quantity: 1
      }
    ],
    statusHistory: [
      {
        status: "Order Placed",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        updatedBy: "system",
        note: "Order created successfully"
      },
      {
        status: "Preparing Order",
        timestamp: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
        updatedBy: "admin",
        updatedByUserId: "admin_1",
        note: "Items packed from store warehouse"
      },
      {
        status: "Loaded for Delivery",
        timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        updatedBy: "admin",
        updatedByUserId: "admin_1",
        note: "Loaded into delivery van"
      },
      {
        status: "Handed Over to Courier",
        timestamp: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
        updatedBy: "admin",
        updatedByUserId: "admin_1",
        note: "Handed over to Steadfast Courier"
      },
      {
        status: "Out for Delivery",
        timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        updatedBy: "admin",
        updatedByUserId: "admin_1",
        note: "Rider out for delivery"
      }
    ]
  }
];

export const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) return JSON.parse(rawV2);

    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (err) {
    console.error("Error reading stored orders:", err);
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
    paymentStatus: params.paymentStatus || (params.paymentMethod === "Online" ? "Pending" : "Pending"),
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

  const existing = getStoredOrders();
  const updated = [newOrder, ...existing];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
    window.dispatchEvent(new Event("storage"));
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
  const orders = getStoredOrders();
  return orders.find((o) => o.id === orderId || o.orderId === orderId);
};
