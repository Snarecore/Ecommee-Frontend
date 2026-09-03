export type OrderStatus =
  | "Order Placed"
  | "Preparing Order"
  | "Loaded for Delivery"
  | "Handed Over to Courier"
  | "Out for Delivery"
  | "Delivered"
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

const STORAGE_KEY = "fashiontime_orders_v2";

export const calculateDeliveryZoneAndFee = (city: string) => {
  const normalizedCity = (city || "").trim().toLowerCase();
  const isDhaka = normalizedCity === "dhaka" || normalizedCity.startsWith("dhaka ");
  return {
    deliveryZone: isDhaka ? ("inside_dhaka" as const) : ("outside_dhaka" as const),
    deliveryCharge: isDhaka ? 60 : 120
  };
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // console.error("Error reading stored orders:", err);
    return [];
  }
};

export const createOrderInStorage = (params: {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  }
  return newOrder;
};

export const updateOrderStatusInStorage = (params: {
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

  // Business Rule: COD Payment auto-transitions to Paid when Delivered
  if (target.paymentMethod === "COD" && params.newStatus === "Delivered") {
    target.paymentStatus = "Paid";
  }

  // Business Rule: Cancellation matrix
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("orders_updated"));

    try {
      const { addShippingNotification } = require("../services/notification-service");
      addShippingNotification(
        target.orderId || target.id,
        params.newStatus,
        params.note || `Order status updated to "${params.newStatus}"`
      );
    } catch (err) {
      // console.error("Error triggering notification in storage:", err);
    }
  }

  return target;
};

export const getOrderById = (orderId: string): Order | undefined => {
  const orders = getStoredOrders();
  return orders.find((o) => o.id === orderId || o.orderId === orderId);
};
