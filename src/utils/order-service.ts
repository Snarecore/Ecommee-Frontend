import { formatPrettyDateWithTime } from "./date-utils";

export type OrderStatus =
  | "Pending"
  | "Order Placed"
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
  | "Returned"
  | "Rejected";

export type RejectionReason =
  | "Product unavailable"
  | "Out of stock"
  | "Delivery unavailable"
  | "Customer information issue"
  | "Payment issue"
  | "Other";

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
  couponCode?: string;
  discountAmount?: number;
  
  courierName?: string;
  trackingId?: string;
  courierTrackingLink?: string;

  acceptedAt?: string;
  acceptedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: RejectionReason | string;
  rejectionMessage?: string;
  
  items: OrderItem[];
  statusHistory: OrderStatusHistoryItem[];
}

export interface OrderLike {
  createdAt?: string | Date;
  created_at?: string | Date;
  createAt?: string | Date;
  date?: string | Date;
}

// In-memory runtime cache (no localStorage persistence)
let memoryOrders: Order[] = [];

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
  return memoryOrders;
};

export const setMemoryOrders = (orders: Order[]): void => {
  memoryOrders = orders;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders_updated"));
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
  couponCode?: string;
  discountAmount?: number;
  totalAmount?: number;
  orderId?: string;
  id?: string;
}): Order => {
  const { deliveryZone, deliveryCharge } = calculateDeliveryZoneAndFee(
    params.shippingAddress.city
  );
  const couponDiscount = Number(params.discountAmount || 0);
  const calculatedTotal = Math.max(0, params.subtotal + deliveryCharge - couponDiscount);
  const totalAmount = params.totalAmount !== undefined ? params.totalAmount : calculatedTotal;
  const nowISO = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = params.orderId || `ORD-${randomSuffix}`;

  const newOrder: Order = {
    id: params.id || `ord-${Date.now()}`,
    orderId,
    userId: params.userId || "user-default",
    createdAt: nowISO,
    updatedAt: nowISO,
    orderStatus: "Pending",
    paymentStatus: params.paymentStatus || (params.paymentMethod === "Online" ? "Paid" : "Pending"),
    paymentMethod: params.paymentMethod,
    subtotal: params.subtotal,
    deliveryCharge,
    totalAmount,
    deliveryZone,
    shippingAddress: params.shippingAddress,
    specialNote: params.specialNote,
    couponCode: params.couponCode,
    discountAmount: couponDiscount,
    items: params.items,
    statusHistory: [
      {
        status: "Pending",
        timestamp: nowISO,
        updatedBy: "system",
        note: "Order submitted by customer - Pending Admin Approval"
      }
    ]
  };

  memoryOrders.unshift(newOrder);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders_updated"));
  }
  return newOrder;
};

export const acceptOrderInService = async (params: {
  orderId: string;
  adminUserId?: string;
  note?: string;
}): Promise<Order | null> => {
  const { patchData } = require("../services/api-service");
  const { getUserToken } = require("../hooks/useApi");
  const token = getUserToken();

  // Call API
  try {
    const apiRes: any = await patchData({
      url: `orders/${params.orderId}/accept`,
      token,
      body: { note: params.note || "Order accepted by admin" }
    });

    if (apiRes && (apiRes.status === 409 || (apiRes.message && apiRes.message.includes("409")))) {
      throw new Error("409 Conflict: Order status has already changed or is no longer Pending.");
    }
  } catch (err: any) {
    if (err?.message?.includes("409")) {
      throw err;
    }
  }

  const idx = memoryOrders.findIndex((o) => o.id === params.orderId || o.orderId === params.orderId);

  if (idx === -1) {
    return {
      id: params.orderId,
      orderId: params.orderId,
      createdAt: new Date().toISOString(),
      orderStatus: "Order Placed",
      paymentStatus: "Pending",
      paymentMethod: "COD",
      subtotal: 0,
      deliveryCharge: 60,
      totalAmount: 60,
      deliveryZone: "inside_dhaka",
      shippingAddress: { name: "Customer", phone: "", address: "", city: "Dhaka" },
      items: [],
      statusHistory: [
        {
          status: "Order Placed",
          timestamp: new Date().toISOString(),
          updatedBy: "admin",
          note: params.note || "Order accepted by admin"
        }
      ]
    };
  }

  const target = { ...memoryOrders[idx] };
  if (target.orderStatus !== "Pending") {
    throw new Error("409 Conflict: Only Pending orders can be accepted.");
  }

  const nowISO = new Date().toISOString();
  target.orderStatus = "Order Placed";
  target.updatedAt = nowISO;
  target.acceptedAt = nowISO;
  target.acceptedBy = params.adminUserId || "admin_default";

  if (!target.statusHistory) target.statusHistory = [];
  target.statusHistory = [
    ...target.statusHistory,
    {
      status: "Order Placed",
      timestamp: nowISO,
      updatedBy: "admin",
      updatedByUserId: params.adminUserId || "admin_default",
      note: params.note || "Order accepted by admin"
    }
  ];

  memoryOrders[idx] = target;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders_updated"));

    try {
      const { addShippingNotification } = require("../services/notification-service");
      addShippingNotification(
        target.orderId || target.id,
        "Order Placed",
        `🎉 Your order #${target.orderId || target.id} has been accepted and is now being prepared.`
      );
    } catch (err) {}
  }

  return target;
};

export const rejectOrderInService = async (params: {
  orderId: string;
  adminUserId?: string;
  rejectionReason: RejectionReason | string;
  rejectionMessage?: string;
}): Promise<Order | null> => {
  if (!params.rejectionReason) {
    throw new Error("Rejection reason is mandatory.");
  }

  const { patchData } = require("../services/api-service");
  const { getUserToken } = require("../hooks/useApi");
  const token = getUserToken();

  try {
    const apiRes: any = await patchData({
      url: `orders/${params.orderId}/reject`,
      token,
      body: {
        rejectionReason: params.rejectionReason,
        rejectionMessage: params.rejectionMessage?.trim() || ""
      }
    });

    if (apiRes && (apiRes.status === 409 || (apiRes.message && apiRes.message.includes("409")))) {
      throw new Error("409 Conflict: Order status has already changed or is no longer Pending.");
    }
  } catch (err: any) {
    if (err?.message?.includes("409")) {
      throw err;
    }
  }

  const idx = memoryOrders.findIndex((o) => o.id === params.orderId || o.orderId === params.orderId);

  if (idx === -1) {
    return {
      id: params.orderId,
      orderId: params.orderId,
      createdAt: new Date().toISOString(),
      orderStatus: "Rejected",
      paymentStatus: "Refunded",
      paymentMethod: "COD",
      subtotal: 0,
      deliveryCharge: 60,
      totalAmount: 60,
      deliveryZone: "inside_dhaka",
      shippingAddress: { name: "Customer", phone: "", address: "", city: "Dhaka" },
      rejectionReason: params.rejectionReason,
      rejectionMessage: params.rejectionMessage,
      items: [],
      statusHistory: [
        {
          status: "Rejected",
          timestamp: new Date().toISOString(),
          updatedBy: "admin",
          note: `Order rejected - ${params.rejectionReason}`
        }
      ]
    };
  }

  const target = { ...memoryOrders[idx] };
  if (target.orderStatus !== "Pending") {
    throw new Error("409 Conflict: Only Pending orders can be rejected.");
  }

  const nowISO = new Date().toISOString();
  target.orderStatus = "Rejected";
  target.updatedAt = nowISO;
  target.rejectedAt = nowISO;
  target.rejectedBy = params.adminUserId || "admin_default";
  target.rejectionReason = params.rejectionReason;
  target.rejectionMessage = params.rejectionMessage?.trim();

  if (target.paymentStatus === "Paid") {
    target.paymentStatus = "Refunded";
  }

  if (!target.statusHistory) target.statusHistory = [];
  const noteText = `Order rejected - ${params.rejectionReason}${
    params.rejectionMessage ? `: ${params.rejectionMessage}` : ""
  }`;

  target.statusHistory = [
    ...target.statusHistory,
    {
      status: "Rejected",
      timestamp: nowISO,
      updatedBy: "admin",
      updatedByUserId: params.adminUserId || "admin_default",
      note: noteText
    }
  ];

  memoryOrders[idx] = target;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders_updated"));

    try {
      const { addShippingNotification } = require("../services/notification-service");
      addShippingNotification(
        target.orderId || target.id,
        "Rejected",
        `Your order #${target.orderId || target.id} was not accepted (${params.rejectionReason}).`
      );
    } catch (err) {}
  }

  return target;
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
  let idx = memoryOrders.findIndex((o) => o.id === params.orderId || o.orderId === params.orderId);

  if (idx === -1) {
    if (params.orderFallback) {
      memoryOrders.unshift(params.orderFallback);
      idx = 0;
    } else {
      return null;
    }
  }

  const target = { ...memoryOrders[idx] };

  if (
    target.orderStatus === "Pending" &&
    params.newStatus !== "Order Placed" &&
    params.newStatus !== "Rejected" &&
    params.newStatus !== "Cancelled"
  ) {
    return null;
  }

  const nowISO = new Date().toISOString();

  target.orderStatus = params.newStatus;
  target.updatedAt = nowISO;

  if (params.courierName !== undefined) target.courierName = params.courierName.trim();
  if (params.trackingId !== undefined) target.trackingId = params.trackingId.trim();
  if (params.courierTrackingLink !== undefined) target.courierTrackingLink = params.courierTrackingLink.trim();

  if (target.paymentMethod === "COD" && params.newStatus === "Delivered") {
    target.paymentStatus = "Paid";
  }

  if (params.newStatus === "Cancelled" || params.newStatus === "Rejected") {
    if (target.paymentStatus === "Paid") {
      target.paymentStatus = "Refunded";
    }
  }

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

  memoryOrders[idx] = target;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orders_updated"));
    
    try {
      const { addShippingNotification } = require("../services/notification-service");
      addShippingNotification(
        target.orderId || target.id,
        params.newStatus,
        params.note || `Order status updated to "${params.newStatus}"`
      );
    } catch (err) {}
  }

  return target;
};

export const getOrderByIdFromService = (orderId: string): Order | undefined => {
  if (!orderId) return undefined;
  const cleanId = orderId.replace(/^#/, "").trim().toLowerCase();

  return memoryOrders.find((o) => {
    const idMatches = o.id?.toLowerCase() === cleanId;
    const orderIdMatches = o.orderId?.replace(/^#/, "").trim().toLowerCase() === cleanId;
    return idMatches || orderIdMatches;
  });
};
