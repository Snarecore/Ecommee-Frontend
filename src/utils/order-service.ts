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
  return [];
};

export const setMemoryOrders = (_orders: Order[]): void => {
  // Deprecated: Orders are persisted directly in backend database
};

export const getOrderByIdFromService = (_orderId: string): Order | undefined => {
  // Deprecated: Orders are loaded from authoritative backend API
  return undefined;
};
