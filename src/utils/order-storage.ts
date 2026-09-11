// Legacy order storage utility (Deprecated - use order-service.ts)
import { Order, OrderStatus, PaymentStatus, PaymentMethod, OrderItem, OrderStatusHistoryItem, ShippingAddress } from "./order-service";

export type { Order, OrderStatus, PaymentStatus, PaymentMethod, OrderItem, OrderStatusHistoryItem, ShippingAddress };

let memoryOrders: Order[] = [];

export const calculateDeliveryZoneAndFee = (city: string) => {
  const normalizedCity = (city || "").trim().toLowerCase();
  const isDhaka = normalizedCity === "dhaka" || normalizedCity.startsWith("dhaka ");
  return {
    deliveryZone: isDhaka ? ("inside_dhaka" as const) : ("outside_dhaka" as const),
    deliveryCharge: isDhaka ? 60 : 120
  };
};

export const getStoredOrders = (): Order[] => {
  return memoryOrders;
};
