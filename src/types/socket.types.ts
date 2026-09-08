export interface MessageCreatedPayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'admin';
  content: string;
  createdAt: string;
}

export interface ConversationUpdatedPayload {
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountAdmin: number;
}

export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
}

export interface OrderStatusUpdatedPayload {
  orderId: string;
  status: string;
  changedAt: string;
  note?: string;
}

export interface StockUpdatedPayload {
  productId: string;
  sizeStock: Record<string, number> | null;
  totalQuantity: number;
}

export interface AdminNotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface TypingEventPayload {
  conversationId: string;
  userId: string;
  userRole: 'customer' | 'admin';
  userName?: string;
}

export interface MessageSeenPayload {
  conversationId: string;
  seenAt: string;
  seenBy: string;
}

export enum SocketEvent {
  MESSAGE_CREATED = 'message_created',
  MESSAGE_SEEN = 'message_seen',
  CONVERSATION_UPDATED = 'conversation_updated',
  ORDER_CREATED = 'order_created',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  STOCK_UPDATED = 'stock_updated',
  ADMIN_NOTIFICATION = 'admin_notification',
  TYPING_STARTED = 'typing_started',
  TYPING_STOPPED = 'typing_stopped',
}

export enum SocketCommand {
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  MARK_SEEN = 'mark_seen',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  JOIN_PRODUCT = 'join_product',
  LEAVE_PRODUCT = 'leave_product',
}
