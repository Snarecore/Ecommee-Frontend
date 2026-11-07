'use client';
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { MdClose } from "react-icons/md";
import { FiEye, FiDownload } from "react-icons/fi";
import {
  FaCheckCircle,
  FaTruck,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaHistory,
  FaUndoAlt,
  FaClock,
  FaCreditCard
} from "react-icons/fa";
import { useAPI, getUserToken } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { orderQueryKey } from "../../../../config/query-key";
import { formatDate, formatPrettyDate, formatPrettyDateWithTime } from "../../../../utils/date-utils";
import Pagination from "../../../../component/pagination";
import OrderListSkeleton from "../../../../component/skeleton/CustomerOrder";
import EmptyComponent from "../../../../component/empty-component";
import {
  getOrderCreatedAt,
  OrderStatus
} from "../../../../utils/order-service";
import { formatImageUrl } from "../../../../utils/product-utils";
import { postData } from "../../../../services/api-service";
import { showErrorToast } from "../../../../utils/toast-utils";
import { isOrderEligibleForPaymentRetry } from "../../../../utils/payment-retry.utils";

interface CustomerTimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
}

const TIMELINE_STEPS: CustomerTimelineStep[] = [
  {
    key: "Pending",
    label: "Pending Approval",
    description: "Order Submitted - Awaiting Admin Acceptance"
  },
  {
    key: "Order Placed",
    label: "Order Placed",
    description: "Order Accepted by Admin"
  },
  {
    key: "Processing",
    label: "Processing",
    description: "Your order is being prepared and processed by our store."
  },
  {
    key: "Shipped",
    label: "Shipped",
    description: "Your package has been shipped and is on its way."
  },
  {
    key: "Delivered",
    label: "Delivered",
    description: "Package delivered successfully."
  }
];

import { useSocket } from "../../../../hooks/useSocket";
import { SocketEvent, OrderStatusUpdatedPayload } from "../../../../types/socket.types";

const OrderTab = () => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const dataLimit = 5;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const { usePaginatedQuery } = useAPI();
  const { socket } = useSocket();
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const handleRetryPayment = async (orderToRetry: any) => {
    const orderIdentifier = orderToRetry.id || orderToRetry.rawOrderId;
    if (retryingOrderId) return;

    try {
      setRetryingOrderId(orderIdentifier);
      const token = getUserToken();
      const targetId = orderToRetry.rawOrderId || orderToRetry.orderId?.replace(/^#/, '') || orderToRetry.id;

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
        showErrorToast(res?.message || "Payment gateway link not received");
      }
    } catch (err: any) {
      showErrorToast(err?.message || "Network error while connecting to payment gateway");
    } finally {
      setRetryingOrderId(null);
    }
  };

  const getOrderListApiUrl = () => {
    let url = `${apiConfig.customer.orderListUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
    if (activeFilter !== "All") {
      url += `&status=${encodeURIComponent(activeFilter)}`;
    }
    return url;
  };

  const handlePagination = (paginationData: { selected: number }) => {
    setCurrentPageNumber(paginationData.selected + 1);
  };

  const {
    data: dataList,
    isLoading,
    pageCount,
    isFetching,
    refetch: fetchData,
    response
  } = usePaginatedQuery({
    queryKey: [orderQueryKey, currentPageNumber.toString(), activeFilter],
    url: getOrderListApiUrl(),
    refetchOnWindowFocus: true
  });

  const statusCounts = (response as any)?.statusCounts || {
    All: 0,
    Pending: 0,
    "Order Placed": 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
    Rejected: 0
  };

  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("fashion_time_notifications");
      channel.onmessage = (event) => {
        if (
          event.data?.type === "SYNC_NOTIFICATIONS" ||
          event.data?.type === "ORDER_STATUS_CHANGED"
        ) {
          handleUpdate();
        }
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, [fetchData]);

  // Real-time order status tracking via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdated = (payload: OrderStatusUpdatedPayload) => {
      const targetId = payload?.orderId || (payload as any)?.rawOrderId;
      if (!targetId) return;

      fetchData();

      setSelectedOrder((current: any) => {
        if (
          current &&
          (current.id === payload.orderId ||
            current.rawOrderId === payload.orderId ||
            (payload as any).rawOrderId === current.rawOrderId ||
            (payload as any).rawOrderId === current.id ||
            current.orderId?.toLowerCase()?.includes(String(targetId).toLowerCase()))
        ) {
          const updatedHistory = Array.isArray(current.statusHistory) ? [...current.statusHistory] : [];
          updatedHistory.push({
            status: payload.status,
            timestamp: payload.changedAt || new Date().toISOString(),
            updatedBy: "admin",
            note: payload.note || ""
          });
          return {
            ...current,
            status: payload.status,
            orderStatus: payload.status,
            statusHistory: updatedHistory
          };
        }
        return current;
      });
    };

    socket.on(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);

    return () => {
      socket.off(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);
    };
  }, [socket, fetchData]);

  // Process API orders list directly from Backend (authoritative source of truth)
  const ordersList: any[] = (dataList || []).map((apiOrd: any) => {
    const currentStatus = (apiOrd.status || apiOrd.orderStatus || "Order Placed") as OrderStatus;
    const historyList = Array.isArray(apiOrd.statusHistory) && apiOrd.statusHistory.length > 0
      ? apiOrd.statusHistory
      : [
          {
            status: currentStatus,
            timestamp: apiOrd.createdAt || new Date().toISOString(),
            updatedBy: "system"
          }
        ];

    let parsedShippingAddress = apiOrd.shippingAddress;
    if (typeof parsedShippingAddress === "string") {
      try {
        parsedShippingAddress = JSON.parse(parsedShippingAddress);
      } catch {}
    }
    if (!parsedShippingAddress || typeof parsedShippingAddress !== "object") {
      parsedShippingAddress = {
        name: apiOrd.user?.name || "Customer",
        phone: apiOrd.user?.phone || "N/A",
        address: "Delivery address",
        city: "Dhaka"
      };
    }

    return {
      id: apiOrd.id,
      orderId: apiOrd.orderId ? `#${apiOrd.orderId}` : `ORD-${apiOrd.id?.slice(0, 6)}`,
      rawOrderId: apiOrd.orderId,
      createdAt: apiOrd.createdAt || new Date().toISOString(),
      orderStatus: currentStatus,
      status: currentStatus,
      paymentStatus: apiOrd.paymentStatus || "Pending",
      paymentMethod: apiOrd.paymentMethod || "COD",
      subtotal: Number(apiOrd.subtotal || apiOrd.totalAmount) || 0,
      deliveryCharge: apiOrd.deliveryCharge || 60,
      totalAmount: Number(apiOrd.totalAmount || apiOrd.subtotal) || 0,
      deliveryZone: apiOrd.deliveryZone || "inside_dhaka",
      shippingAddress: parsedShippingAddress,
      courierName: apiOrd.courierName,
      trackingId: apiOrd.trackingId,
      courierTrackingLink: apiOrd.courierTrackingLink,
      rejectionReason: apiOrd.rejectionReason,
      rejectionMessage: apiOrd.rejectionMessage,
      couponCode: apiOrd.couponCode,
      discountAmount: apiOrd.discountAmount,
      specialNote: apiOrd.specialNote,
      items: (apiOrd.orderSummaries || apiOrd.items || []).map((s: any) => ({
        id: s.id || Math.random().toString(),
        productName: s.productName || "Product",
        productImage: s.productImage || s.productFileUrl || "",
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1
      })),
      statusHistory: historyList
    };
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const hasAutoOpenedRef = useRef(false);

  const handleCloseModal = () => {
    setSelectedOrder(null);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("orderId")) {
        params.delete("orderId");
        const newSearch = params.toString() ? `?${params.toString()}` : "";
        window.history.replaceState({}, "", `${window.location.pathname}${newSearch}`);
      }
    }
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ordersList.length > 0 &&
      !selectedOrder &&
      !hasAutoOpenedRef.current
    ) {
      const params = new URLSearchParams(window.location.search);
      const targetOrderId = params.get("orderId");
      if (targetOrderId) {
        const found = ordersList.find(
          (o: any) =>
            o.id === targetOrderId ||
            (o.orderId && o.orderId.toLowerCase().includes(targetOrderId.toLowerCase())) ||
            (o.rawOrderId && o.rawOrderId.toLowerCase() === targetOrderId.toLowerCase())
        );
        if (found) {
          hasAutoOpenedRef.current = true;
          setSelectedOrder(found);
          setTimeout(() => {
            const cardId = found.id || found.rawOrderId || targetOrderId;
            const el = document.getElementById(`order-card-${cardId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 200);
        }
      }
    }
  }, [ordersList]);

  if (isLoading) return <OrderListSkeleton />;

  return (
    <div>
      <div className="flex lg:flex-row flex-col lg:items-center lg:justify-between">
        <div>
          <p className="font-bold text-[var(--color-green-primary)] text-2xl">
            Your Orders & Shipping Progress
          </p>
          <p className="text-sm text-gray-500">
            Track your order stages, delivery partner progress, and shipment history in real-time.
          </p>
        </div>
      </div>

      {/* Dynamic Status Tabs from Backend */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {(["All", "Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map(
          (filterKey) => {
            const count = statusCounts[filterKey] ?? (filterKey === "All" ? statusCounts.All || 0 : 0);
            const isActive = activeFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => {
                  setActiveFilter(filterKey);
                  setCurrentPageNumber(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[var(--color-green-primary)] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterKey}
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? "bg-white text-[var(--color-green-primary)]" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      <div className="mt-6">
        <p className="font-bold text-xl text-[var(--color-green-primary)]">Order History</p>

        <div className="mt-3 grid gap-2.5">
          {ordersList.length > 0 ? (
            ordersList.map((order: any) => {
              const currentStatus: OrderStatus = order.orderStatus || order.status || "Order Placed";
              const isDelivered = currentStatus === "Delivered";
              const isCancelled = currentStatus === "Cancelled";

              const statusConfig = (() => {
                switch (currentStatus as string) {
                  case "Pending":
                    return {
                      badge: "bg-amber-50 text-amber-800 border-amber-200/90",
                      dot: "bg-amber-500 animate-pulse",
                      label: "Pending Approval"
                    };
                  case "Order Placed":
                    return {
                      badge: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
                      dot: "bg-emerald-500",
                      label: "Order Placed"
                    };
                  case "Processing":
                  case "Packaging":
                    return {
                      badge: "bg-blue-50 text-blue-800 border-blue-200/90",
                      dot: "bg-blue-500 animate-pulse",
                      label: currentStatus
                    };
                  case "Shipped":
                    return {
                      badge: "bg-indigo-50 text-indigo-800 border-indigo-200/90",
                      dot: "bg-indigo-500",
                      label: "Shipped"
                    };
                  case "Delivered":
                    return {
                      badge: "bg-teal-50 text-teal-800 border-teal-200/90",
                      dot: "bg-teal-500",
                      label: "Delivered"
                    };
                  case "Cancelled":
                  case "Rejected":
                    return {
                      badge: "bg-rose-50 text-rose-800 border-rose-200/90",
                      dot: "bg-rose-500",
                      label: currentStatus === "Rejected" ? "Rejected" : "Cancelled"
                    };
                  default:
                    return {
                      badge: "bg-gray-50 text-gray-700 border-gray-200",
                      dot: "bg-gray-400",
                      label: currentStatus
                    };
                }
              })();

              const totalItemCount = order.items && order.items.length > 0
                ? order.items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
                : 1;

              const paymentMethodStr = (order.paymentMethod || "COD").toUpperCase();
              const paymentMethodLabel =
                paymentMethodStr === "COD"
                  ? "Cash on Delivery"
                  : paymentMethodStr === "SSLCOMMERZ"
                  ? "bKash / Nagad"
                  : paymentMethodStr === "ONLINE" || paymentMethodStr === "STRIPE"
                  ? "Stripe Card"
                  : order.paymentMethod || "COD";

              const paymentStatusStr = (order.paymentStatus || "").toLowerCase();
              const isPaid = paymentStatusStr === "paid";

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id || order.rawOrderId || order.orderId}`}
                  className="bg-white rounded-xl border border-gray-200/80 hover:border-[var(--color-green-primary)]/40 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  {/* Slim Card Header Strip */}
                  <div className="bg-gradient-to-r from-gray-50/90 via-slate-50/50 to-white px-3.5 py-1.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Left: Order ID & Date */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--color-green-primary)] tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green-primary)]" />
                        {order.orderId}
                      </div>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className="text-gray-500 font-medium text-[11px] flex items-center gap-1">
                        <FaClock className="text-gray-400 text-[10px]" />
                        Placed on {formatPrettyDateWithTime(order.createdAt)}
                      </span>
                    </div>

                    {/* Right: Payment Method, Payment Status & Order Status Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Payment Method Badge */}
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-gray-100/90 text-gray-700 border border-gray-200/70 flex items-center gap-1">
                        {paymentMethodStr === "COD" ? "💵" : "💳"} {paymentMethodLabel}
                      </span>

                      {/* Payment Status Pill */}
                      {order.paymentStatus && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isPaid ? "✓ Paid" : "⏳ Unpaid"}
                        </span>
                      )}

                      {/* Main Order Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border flex items-center gap-1 shadow-2xs ${statusConfig.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Compact Card Main Body */}
                  <div className="px-3.5 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Product Thumbnail & Meta Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Compact Product Thumbnail */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 overflow-hidden border border-gray-200/80 shrink-0 relative flex items-center justify-center shadow-2xs group-hover:scale-102 transition-transform duration-200">
                        {order.items && order.items[0]?.productImage ? (
                          <img
                            src={formatImageUrl(order.items[0].productImage)}
                            alt={order.items[0].productName || "Order Item"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xl">🛍️</span>
                        )}
                        {order.items && order.items.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-gray-900/85 text-white text-[9px] font-extrabold px-1 py-0.2 rounded shadow-xs">
                            +{order.items.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Product Title & Compact Info */}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[var(--color-green-primary)] transition-colors">
                          {order.items && order.items[0]?.productName
                            ? order.items[0].productName
                            : "Product Item"}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-gray-500">
                          <span className="font-medium text-gray-600">
                            {totalItemCount} {totalItemCount > 1 ? "items" : "item"}
                          </span>
                          {order.items?.[0]?.quantity && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Qty: {order.items[0].quantity}</span>
                            </>
                          )}
                          {order.shippingAddress?.city && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <FaMapMarkerAlt className="text-gray-400 text-[9px]" />
                                {order.shippingAddress.city}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Harmonized Action Buttons */}
                    <div className="flex flex-row items-center justify-between md:justify-end gap-3 sm:gap-3.5 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                      {/* Price Section */}
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                          ৳{Number(order.totalAmount || order.subtotal || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Subtle Vertical Divider */}
                      <div className="h-7 w-px bg-gray-200 hidden sm:block" />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Courier Tracking Link */}
                        {order.courierTrackingLink && (
                          <a
                            href={order.courierTrackingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                          >
                            <FaTruck className="text-xs" />
                            <span>Track</span>
                          </a>
                        )}

                        {/* Pay Now Button */}
                        {isOrderEligibleForPaymentRetry(order) && (
                          <button
                            onClick={() => handleRetryPayment(order)}
                            disabled={retryingOrderId === (order.id || order.rawOrderId)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
                          >
                            {retryingOrderId === (order.id || order.rawOrderId) ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <FaCreditCard className="text-white text-xs" />
                                <span>Pay Now</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* View Timeline & Details Button */}
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-3.5 py-1.5 bg-[var(--color-green-primary)] hover:opacity-90 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <FiEye className="text-xs" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyComponent message="No orders yet — find something you love and order now!" />
          )}
        </div>

        {pageCount > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              pageCount={pageCount}
              currentPageNumber={currentPageNumber}
              handlePagination={handlePagination}
            />
          </div>
        )}
      </div>

      {/* Detailed Shipping Tracker & Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl cursor-default"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaTruck /> Shipping Progress & Order Info
                </h2>
                <p className="text-xs text-gray-500">Order ID: {selectedOrder.orderId}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition cursor-pointer"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Special Cancelled / Returned / Rejected Banners */}
              {(selectedOrder.orderStatus === "Rejected" || selectedOrder.status === "Rejected") && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                  <FaExclamationCircle className="text-red-600 text-2xl shrink-0" />
                  <div>
                    <h4 className="font-bold">Order Rejected ✕</h4>
                    {selectedOrder.rejectionReason && (
                      <p className="text-xs font-bold text-red-700 mt-0.5">
                        Reason: {selectedOrder.rejectionReason}
                      </p>
                    )}
                    {selectedOrder.rejectionMessage && (
                      <p className="text-xs text-red-800 italic mt-0.5">
                        &quot;{selectedOrder.rejectionMessage}&quot;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(selectedOrder.orderStatus === "Cancelled" || selectedOrder.status === "Cancelled") && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                  <FaExclamationCircle className="text-red-600 text-2xl shrink-0" />
                  <div>
                    <h4 className="font-bold">Order Cancelled ✕</h4>
                    <p className="text-xs text-red-700">
                      This order was cancelled. If you paid online, a refund will be processed to your payment source.
                    </p>
                  </div>
                </div>
              )}

              {(selectedOrder.orderStatus === "Returned" || selectedOrder.status === "Returned") && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
                  <FaUndoAlt className="text-amber-600 text-2xl shrink-0" />
                  <div>
                    <h4 className="font-bold">Order Returned ↩</h4>
                    <p className="text-xs text-amber-700">
                      This order was returned to vendor/store warehouse.
                    </p>
                  </div>
                </div>
              )}

              {/* Vertical Shipping Progress Timeline */}
              {selectedOrder.orderStatus !== "Cancelled" &&
                selectedOrder.orderStatus !== "Returned" &&
                selectedOrder.orderStatus !== "Rejected" && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-base font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                      <FaHistory className="text-[var(--color-green-primary)]" /> Live Shipping Timeline
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                      {(() => {
                        const getStageIndex = (status?: string) => {
                          if (!status) return 0;
                          const s = status.trim().toLowerCase();
                          if (s === "pending") return 0;
                          if (s === "order placed" || s === "placed" || s === "accepted") return 1;
                          if (s === "processing" || s === "preparing order") return 2;
                          if (
                            s === "shipped" ||
                            s === "loaded for delivery" ||
                            s === "handed over to courier" ||
                            s === "out for delivery"
                          )
                            return 3;
                          if (s === "delivered" || s === "completed") return 4;
                          return 0;
                        };

                      const currentStatusStr: string = selectedOrder.orderStatus || selectedOrder.status || "Order Placed";
                      const currentIndex = getStageIndex(currentStatusStr);
                      const isOrderCompletedAll = currentStatusStr.trim().toLowerCase() === "completed";
                      const historyList: any[] = selectedOrder.statusHistory || [];

                      return TIMELINE_STEPS.map((step, stepIndex) => {
                        const isCompleted = isOrderCompletedAll || stepIndex < currentIndex;
                        const isCurrent = !isOrderCompletedAll && stepIndex === currentIndex;

                        const historyMatch = historyList.find(
                          (h) => getStageIndex(h.status) === stepIndex
                        );

                        return (
                          <div key={step.key} className="relative flex items-start gap-4 group">
                            {/* Step Icon Node */}
                            <div
                              className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isCompleted
                                  ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                                  : isCurrent
                                  ? "bg-[var(--color-green-primary)] text-white ring-4 ring-emerald-200 animate-pulse"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {isCompleted ? "✓" : isCurrent ? "●" : "○"}
                            </div>

                            {/* Step Content */}
                            <div className="pl-4">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-bold text-sm ${
                                    isCurrent
                                      ? "text-[var(--color-green-primary)]"
                                      : isCompleted
                                      ? "text-gray-800"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Current Stage
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>

                              {/* Timestamp log */}
                              {historyMatch && (
                                <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                                  <FaClock size={10} /> {formatPrettyDateWithTime(historyMatch.timestamp)}
                                  {historyMatch.note && <span className="text-gray-400 font-normal">({historyMatch.note})</span>}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Courier Tracking Partner Card */}
              {selectedOrder.courierTrackingLink && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-emerald-900 flex items-center gap-2">
                      <FaTruck className="text-emerald-600" /> Delivery Partner Tracking
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Courier: <strong>{selectedOrder.courierName || "Courier Partner"}</strong>
                      {selectedOrder.trackingId && (
                        <>
                          {" "}
                          | Tracking ID: <strong>{selectedOrder.trackingId}</strong>
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Track your shipment through our delivery partner.
                    </p>
                  </div>
                  <a
                    href={selectedOrder.courierTrackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0"
                  >
                    <FaExternalLinkAlt /> 🚚 Track Delivery
                  </a>
                </div>
              )}

              {/* Shipping Address & Summary */}
              {selectedOrder.shippingAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1 mb-2">
                      <FaMapMarkerAlt className="text-[var(--color-green-primary)]" /> Delivery Address
                    </h4>
                    <p className="font-semibold text-gray-800">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-xs text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-xs text-gray-600">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-xs font-semibold text-gray-700">{selectedOrder.shippingAddress.city}</p>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Payment Details</h4>
                    <p>
                      Payment Method: <strong>{selectedOrder.paymentMethod || "COD"}</strong>
                    </p>
                    <p>
                      Payment Status:{" "}
                      <strong
                        className={
                          selectedOrder.paymentStatus === "Paid" ? "text-emerald-700" : "text-amber-700"
                        }
                      >
                        {selectedOrder.paymentStatus || "Pending"}
                      </strong>
                    </p>
                    {(selectedOrder.couponCode || Number(selectedOrder.discountAmount) > 0) && (
                      <p className="text-emerald-700 font-semibold pt-1">
                        Coupon Applied: <strong>{selectedOrder.couponCode || "Discount"}</strong> (-৳{Number(selectedOrder.discountAmount || 0).toFixed(2)})
                      </p>
                    )}
                    {selectedOrder.specialNote && (
                      <p className="pt-2 text-gray-500 italic">
                        Note: &quot;{selectedOrder.specialNote}&quot;
                      </p>
                    )}

                    {isOrderEligibleForPaymentRetry(selectedOrder) && (
                      <div className="pt-3">
                        <button
                          onClick={() => handleRetryPayment(selectedOrder)}
                          disabled={retryingOrderId === (selectedOrder.id || selectedOrder.rawOrderId)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          {retryingOrderId === (selectedOrder.id || selectedOrder.rawOrderId) ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Connecting to Gateway...
                            </>
                          ) : (
                            <>
                              <FaCreditCard /> Pay Now (SSLCommerz)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div>
                <h4 className="font-bold text-gray-800 text-base mb-3">Order Items</h4>
                <div className="space-y-3">
                  {(selectedOrder.items || selectedOrder.orderSummaries || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition"
                    >
                      <Image
                        src={
                          item.productImage ||
                          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60"
                        }
                        alt={item.productName}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover rounded-xl border shrink-0"
                      />
                      <div className="flex-1">
                        <h5 className="font-bold text-sm text-gray-800">{item.productName}</h5>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="font-bold text-sm text-gray-800">
                        ৳{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Order Total:{" "}
                <strong className="text-lg text-[var(--color-green-primary)] font-extrabold">
                  ৳{selectedOrder.totalAmount || selectedOrder.subtotal || 0}
                </strong>
              </span>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 bg-[var(--color-green-primary)] text-white font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTab;
