'use client';

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrderByIdFromService, Order } from "@/utils/order-service";
import {
  FaCheckCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaShieldAlt,
  FaCreditCard,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaShoppingCart
} from "react-icons/fa";
import { getOrderCreatedAt } from "@/utils/order-service";

import { getData, postData } from "@/services/api-service";
import { getUserToken } from "@/hooks/useApi";
import { formatImageUrl } from "@/utils/product-utils";
import { showErrorToast, showSuccessToast } from "@/utils/toast-utils";
import { isOrderEligibleForPaymentRetry } from "@/utils/payment-retry.utils";
import { useCart } from "@/hooks/useCart";

import { useSocket } from "@/hooks/useSocket";
import { SocketEvent, OrderStatusUpdatedPayload } from "@/types/socket.types";

interface OrderConfirmationViewProps {
  orderId: string;
}

const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ orderId }) => {
  const router = useRouter();
  const { restoreCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const searchParams = useSearchParams();
  const paymentParam = searchParams?.get("payment") || "";
  const { socket } = useSocket();

  const fetchOrderFromApi = useCallback(async (isManual = false) => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    if (isManual) setIsManualChecking(true);

    try {
      const token = getUserToken();
      const res: any = await getData({ url: `orders/${orderId}`, token, noCache: true });
      const apiOrder = res?.data || res;
      if (apiOrder && !apiOrder.error && (apiOrder.id || apiOrder.orderId)) {
        setOrder(apiOrder);
        setLoading(false);
        if (isManual) setIsManualChecking(false);
        return apiOrder;
      }
    } catch {
      // Fallback to local service if offline
    }

    const found = getOrderByIdFromService(orderId);
    if (found) {
      setOrder(found);
    }
    setLoading(false);
    if (isManual) setIsManualChecking(false);
    return found;
  }, [orderId]);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial authoritative fetch from Backend
    fetchOrderFromApi();

    // 2. Bounded status polling (every 3s for up to 18s total) if payment is in verification / not settled
    let pollCount = 0;
    const maxPolls = 6;
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls || !isMounted) {
        clearInterval(pollInterval);
        if (isMounted) setIsPolling(false);
        return;
      }

      try {
        const token = getUserToken();
        const res: any = await getData({ url: `orders/${orderId}`, token, noCache: true });
        const refreshed = res?.data || res;
        if (refreshed && refreshed.paymentStatus === "Paid") {
          if (isMounted) {
            setOrder(refreshed);
            setIsPolling(false);
          }
          clearInterval(pollInterval);
        }
      } catch {
        // Suppress background poll errors
      }
    }, 3000);

    // 3. Cross-Tab / Cross-App BroadcastChannel Listener
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("fashion_time_notifications");
        channel.onmessage = (event) => {
          if (
            event.data?.type === "ORDER_STATUS_CHANGED" ||
            event.data?.type === "SYNC_NOTIFICATIONS"
          ) {
            fetchOrderFromApi();
          }
        };
      } catch {
        // BroadcastChannel unsupported fallback
      }
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (channel) channel.close();
    };
  }, [orderId, fetchOrderFromApi]);

  // Real-time socket listener for order status changes
  useEffect(() => {
    if (!socket || !orderId) return;

    const handleOrderStatusUpdated = (payload: OrderStatusUpdatedPayload) => {
      if (payload.orderId === orderId || (order && order.orderId === payload.orderId)) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: payload.status as any,
            orderStatus: payload.status as any
          };
        });
      }
    };

    socket.on(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);

    return () => {
      socket.off(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);
    };
  }, [socket, orderId, order?.orderId]);

  // Secure payment retry handler
  const handleRetryPayment = async () => {
    if (!order || isRetrying) return;

    try {
      setIsRetrying(true);
      const token = getUserToken();
      const targetId = (order as any).rawOrderId || order.orderId || order.id;

      const res: any = await postData({
        url: `payments/order/${targetId}/retry`,
        token,
        body: {}
      });

      if (res?.error) {
        showErrorToast(res?.message || "Failed to initiate payment retry");
        return;
      }

      const gatewayUrl = res?.gatewayPageUrl || res?.data?.gatewayPageUrl;
      if (gatewayUrl) {
        window.location.href = gatewayUrl;
      } else {
        showErrorToast(res?.message || "Payment gateway link not received from server");
      }
    } catch (err: any) {
      showErrorToast(err?.message || "Network error while connecting to payment gateway");
    } finally {
      setIsRetrying(false);
    }
  };

  // Authoritative Backend Cart Recovery Handler (Zero LocalStorage dependency)
  const handleRestoreAndEditCart = async () => {
    if (!order || isRestoring) return;

    try {
      setIsRestoring(true);
      const token = getUserToken();
      const targetId = (order as any).rawOrderId || order.orderId || order.id;

      // Extract guest recovery access token from sessionStorage if present
      let guestToken: string | null = null;
      if (typeof window !== "undefined") {
        guestToken =
          sessionStorage.getItem(`guest_order_token_${targetId}`) ||
          (order.orderId ? sessionStorage.getItem(`guest_order_token_${order.orderId}`) : null) ||
          (order.id ? sessionStorage.getItem(`guest_order_token_${order.id}`) : null);
      }

      const headers: Record<string, string> = {};
      if (guestToken) {
        headers["x-guest-order-token"] = guestToken;
      }

      const res: any = await postData({
        url: `orders/${targetId}/restore-cart`,
        token: token || undefined,
        headers,
        body: {}
      });

      if (res?.error) {
        showErrorToast(res?.message || "Failed to restore items to cart");
        return;
      }

      const payload = res?.data || res;
      if (payload && Array.isArray(payload.items) && payload.items.length > 0) {
        restoreCart(payload.items);
        showSuccessToast("Cart restored! You can now adjust items and checkout again.");
        router.push("/cart");
      } else {
        showErrorToast(res?.message || "No restorable items found for this order");
      }
    } catch (err: any) {
      showErrorToast(err?.message || "Could not restore cart at this time");
    } finally {
      setIsRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green-primary)]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm text-center border border-gray-100">
        <FaShieldAlt className="text-4xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          The requested order details could not be found or you do not have permission to view them.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[var(--color-green-primary)] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-95"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Authoritative State Machine Evaluation
  const isPaid = order.paymentStatus === "Paid";
  const isUnderReview = order.paymentStatus === "Review Required" || order.paymentStatus === "Processing";
  const isRetryEligible = isOrderEligibleForPaymentRetry(order);
  const isPending = order.orderStatus === "Pending";
  const isRejected = order.orderStatus === "Rejected";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Dynamic Header Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center">
          {/* Priority 1: Verified PAID status */}
          {isPaid ? (
            <>
              <h1 className="text-3xl font-extrabold text-[var(--color-green-primary)]">
                Order Placed & Payment Verified!
              </h1>
              <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                Thank you for shopping with us. Your online payment has been confirmed by SSLCommerz and your order is now being processed.
              </p>
            </>
          ) : isUnderReview ? (
            /* Priority 2: In-flight verification or Risk Review */
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-4xl shadow-inner">
                <FaClock />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-700">
                Payment Verification in Progress
              </h1>
              <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                We are confirming your transaction with the payment gateway. Your order will update as soon as the verification settles.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto text-blue-900 text-xs flex flex-col items-center gap-2">
                <span>
                  {isPolling
                    ? "🔄 Actively checking gateway confirmation..."
                    : "⏳ Automated check complete. You can verify again manually."}
                </span>
                {!isPolling && (
                  <button
                    onClick={() => fetchOrderFromApi(true)}
                    disabled={isManualChecking}
                    className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <FaSyncAlt className={isManualChecking ? "animate-spin" : ""} /> Check Payment Status
                  </button>
                )}
              </div>
            </>
          ) : isRetryEligible ? (
            /* Priority 3: Eligible for Payment Retry (Failed / Cancelled / Unpaid online payment) */
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 text-4xl shadow-inner">
                <FaExclamationTriangle />
              </div>
              <h1 className="text-3xl font-extrabold text-amber-700">
                Payment Incomplete / Cancelled
              </h1>
              <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                Your order is reserved (Order ID: <strong className="text-gray-800">{order.orderId || order.id}</strong>), but online payment was not completed on the gateway.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  {isRetrying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting to Gateway...
                    </>
                  ) : (
                    <>
                      <FaCreditCard /> Complete Payment with SSLCommerz
                    </>
                  )}
                </button>
                <button
                  onClick={handleRestoreAndEditCart}
                  disabled={isRestoring}
                  className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isRestoring ? (
                    <>
                      <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      Restoring Cart...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart /> Restore Cart &amp; Edit Items
                    </>
                  )}
                </button>
              </div>
            </>
          ) : isRejected ? (
            /* Priority 4: Store Admin Rejected */
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-4xl">
                <FaTimesCircle />
              </div>
              <h1 className="text-3xl font-extrabold text-red-600">
                Order Rejected
              </h1>
              <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                We regret to inform you that your order could not be accepted by the store admin.
              </p>
              {order.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-left max-w-md mx-auto space-y-1">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    Reason: {order.rejectionReason}
                  </p>
                  {order.rejectionMessage && (
                    <p className="text-sm text-red-800 italic">
                      &quot;{order.rejectionMessage}&quot;
                    </p>
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleRestoreAndEditCart}
                  disabled={isRestoring}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  {isRestoring ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Restoring Cart...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart /> Restore Items to Cart
                    </>
                  )}
                </button>
              </div>
            </>
          ) : isPending ? (
            /* Priority 5: Standard COD / Offline Pending Approval */
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 text-4xl">
                <FaClock />
              </div>
              <h1 className="text-3xl font-extrabold text-amber-700">
                Order Received
              </h1>
              <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                Your order has been successfully submitted and is currently waiting for admin approval.
              </p>
            </>
          ) : (
            /* Standard fallback */
            <>
              <h1 className="text-3xl font-extrabold text-[var(--color-green-primary)]">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 mt-2">
                Thank you for shopping with us. Your order has been placed and is now being prepared.
              </p>
            </>
          )}

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block text-xs">Order ID</span>
              <strong className="font-extrabold text-gray-800 text-base">
                {order.orderId || `#${(order as any).id?.slice(0, 8)}`}
              </strong>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-400 block text-xs">Order Date</span>
              <strong className="font-semibold text-gray-700">{getOrderCreatedAt(order)}</strong>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-400 block text-xs">Payment Method</span>
              <strong className="font-semibold text-gray-700">{order.paymentMethod || "COD"}</strong>
            </div>
          </div>
        </div>

        {/* Order Status & Shipping Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
              <FaMapMarkerAlt className="text-[var(--color-green-primary)]" /> Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="text-sm space-y-1 text-gray-600">
                <p className="font-bold text-gray-800 text-base">{order.shippingAddress.name}</p>
                <p className="flex items-center gap-2">📞 {order.shippingAddress.phone}</p>
                {order.shippingAddress.email && (
                  <p className="flex items-center gap-2">✉️ {order.shippingAddress.email}</p>
                )}
                <p className="flex items-start gap-2 mt-1">📍 {order.shippingAddress.address}</p>
                <p className="font-semibold text-gray-700 mt-1">City: {order.shippingAddress.city}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Address details unavailable.</p>
            )}
          </div>

          {/* Payment & Delivery Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
              <FaTruck className="text-[var(--color-green-primary)]" /> Delivery & Status
            </h3>
            <div className="text-sm space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span>Order Status:</span>
                <span
                  className={`font-bold px-3 py-0.5 rounded-full text-xs ${
                    isPending
                      ? "bg-amber-100 text-amber-800"
                      : isRejected
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isPending
                    ? "Pending Approval"
                    : isRejected
                    ? "Rejected"
                    : order.orderStatus || "Order Placed"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Status:</span>
                <span
                  className={`font-bold px-3 py-0.5 rounded-full text-xs ${
                    order.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.paymentStatus === "Review Required" || order.paymentStatus === "Processing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus || "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Zone:</span>
                <span className="font-semibold text-gray-800">
                  {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka (৳60)" : "Outside Dhaka (৳120)"}
                </span>
              </div>
              {order.specialNote && (
                <div className="pt-2 border-t text-xs text-gray-500 italic">
                  Note: &quot;{order.specialNote}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
            <FaShoppingBag className="text-[var(--color-green-primary)]" /> Ordered Products
          </h3>

          <div className="divide-y divide-gray-100">
            {(() => {
              const itemsList: any[] = order.items || (order as any).orderSummaries || (order as any).orderItems || (order as any).products || [];
              if (itemsList.length === 0) {
                return (
                  <p className="text-xs text-gray-500 py-3">No item details available.</p>
                );
              }
              return itemsList.map((item: any, idx: number) => {
                const pName = item.productName || item.product?.name || item.name || "Product";
                const pImg = formatImageUrl(item.productImage || item.image || item.product?.featuredImage);
                const pPrice = Number(item.price || item.product?.price || 0);
                const pQty = Number(item.quantity || 1);

                return (
                  <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={pImg}
                        alt={pName}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover rounded-xl border shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{pName}</h4>
                        <p className="text-xs text-gray-500">Quantity: {pQty}</p>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-gray-800">
                      ৳{(pPrice * pQty).toFixed(2)}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{Number(order.subtotal || order.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Delivery Fee ({order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
              </span>
              <span>৳{Number(order.deliveryCharge || 60).toFixed(2)}</span>
            </div>
            {((order as any).couponCode || Number((order as any).discountAmount) > 0) && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({(order as any).couponCode || "Applied"})</span>
                <span>-৳{Number((order as any).discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-[var(--color-green-primary)] pt-2 border-t">
              <span>Total Amount</span>
              <span>৳{Number(order.totalAmount || order.subtotal || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href="/customer-dashboard"
            className="w-full sm:w-1/2 py-3.5 bg-[var(--color-green-primary)] text-white text-center font-bold rounded-full shadow-md hover:opacity-95 transition"
          >
            Track Order Progress 🚚
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-1/2 py-3.5 bg-white border border-gray-300 text-gray-700 text-center font-bold rounded-full hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationView;
