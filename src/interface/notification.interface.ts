export type NotificationType =
  | "ORDER_PROCESSING"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "GENERAL";

export interface NotificationItem {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}
