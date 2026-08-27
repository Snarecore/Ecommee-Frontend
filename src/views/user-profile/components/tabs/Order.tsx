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
  FaClock
} from "react-icons/fa";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { orderQueryKey } from "../../../../config/query-key";
import { formatDate, formatPrettyDate, formatPrettyDateWithTime } from "../../../../utils/date-utils";
import Pagination from "../../../../component/pagination";
import OrderListSkeleton from "../../../../component/skeleton/CustomerOrder";
import EmptyComponent from "../../../../component/empty-component";
import {
  getStoredOrders,
  getOrderCreatedAt,
  Order as StoredOrderType,
  OrderStatus
} from "../../../../utils/order-service";

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

const OrderTab = () => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [localOrders, setLocalOrders] = useState<StoredOrderType[]>([]);
  const dataLimit = 5;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const { usePaginatedQuery } = useAPI();

  const getOrderListApiUrl = () => {
    return `${apiConfig.customer.orderListUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
  };

  const handlePagination = (paginationData: { selected: number }) => {
    setCurrentPageNumber(paginationData.selected + 1);
  };

  const {
    data: dataList,
    isLoading,
    pageCount,
    isFetching,
    refetch: fetchData
  } = usePaginatedQuery({
    queryKey: [orderQueryKey, currentPageNumber.toString()],
    url: getOrderListApiUrl()
  });

  const loadStoredOrders = () => {
    setLocalOrders(getStoredOrders());
  };

  useEffect(() => {
    loadStoredOrders();
    const handleUpdate = () => loadStoredOrders();
    window.addEventListener("orders_updated", handleUpdate);
    return () => window.removeEventListener("orders_updated", handleUpdate);
  }, []);

  // Process API orders list from Backend first with top priority
  const apiOrdersMapped = (dataList || []).map((apiOrd: any) => {
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

    return {
      id: apiOrd.id,
      orderId: apiOrd.orderId ? `#${apiOrd.orderId}` : `ORD-${apiOrd.id?.slice(0, 6)}`,
      rawOrderId: apiOrd.orderId,
      createdAt: apiOrd.createdAt || new Date().toISOString(),
      orderStatus: currentStatus,
      status: currentStatus,
      paymentStatus: apiOrd.paymentStatus || "Pending",
      paymentMethod: apiOrd.paymentMethod || "COD",
      subtotal: Number(apiOrd.totalAmount) || 0,
      deliveryCharge: apiOrd.deliveryCharge || 60,
      totalAmount: Number(apiOrd.totalAmount) || 0,
      deliveryZone: apiOrd.deliveryZone || "inside_dhaka",
      shippingAddress: apiOrd.shippingAddress || {
        name: apiOrd.user?.name || "Customer",
        phone: apiOrd.user?.phone || "N/A",
        address: "Delivery address",
        city: "Dhaka"
      },
      items: (apiOrd.orderSummaries || apiOrd.items || []).map((s: any) => ({
        id: s.id || Math.random().toString(),
        productName: s.productName || "Product",
        productImage: s.productImage || "",
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1
      })),
      statusHistory: historyList
    };
  });

  // Combine: API orders take highest precedence, then remaining local storage orders
  const combinedOrdersList: any[] = [...apiOrdersMapped];
  localOrders.forEach((locOrd) => {
    const isDuplicate = combinedOrdersList.some(
      (o) =>
        o.id === locOrd.id ||
        (o.rawOrderId && locOrd.orderId && o.rawOrderId.toLowerCase() === locOrd.orderId.toLowerCase()) ||
        (o.orderId && locOrd.orderId && o.orderId.toLowerCase().includes(locOrd.orderId.toLowerCase()))
    );
    if (!isDuplicate) {
      combinedOrdersList.push(locOrd);
    }
  });

  // Ensure newest orders placed appear first at top (createdAt DESC)
  combinedOrdersList.sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
    const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
    return timeB - timeA;
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
      combinedOrdersList.length > 0 &&
      !selectedOrder &&
      !hasAutoOpenedRef.current
    ) {
      const params = new URLSearchParams(window.location.search);
      const targetOrderId = params.get("orderId");
      if (targetOrderId) {
        const found = combinedOrdersList.find(
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
  }, [combinedOrdersList]);

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

      <div className="mt-6">
        <p className="font-bold text-xl text-[var(--color-green-primary)]">Order History</p>

        <div className="mt-4 grid gap-4">
          {combinedOrdersList.length > 0 ? (
            combinedOrdersList.map((order: any) => {
              const currentStatus: OrderStatus = order.orderStatus || order.status || "Order Placed";
              const isDelivered = currentStatus === "Delivered";
              const isCancelled = currentStatus === "Cancelled";

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id || order.rawOrderId || order.orderId}`}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-lg text-[var(--color-green-primary)]">
                          {order.orderId}
                        </span>
                        <span
                          className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                            currentStatus === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : currentStatus === "Rejected" || isCancelled
                              ? "bg-red-100 text-red-800"
                              : isDelivered || currentStatus === "Order Placed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {currentStatus === "Pending" ? "Pending Approval" : currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Placed on {formatPrettyDateWithTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-400 block">Total Amount</span>
                        <span className="text-lg font-extrabold text-gray-900">
                          ৳{order.totalAmount || order.subtotal || 0}
                        </span>
                      </div>

                      {/* Courier External Tracking Button (If link attached) */}
                      {order.courierTrackingLink && (
                        <a
                          href={order.courierTrackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                        >
                          <FaTruck /> 🚚 Track Delivery
                        </a>
                      )}

                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-5 py-2 bg-[var(--color-green-primary)] text-white font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <FiEye /> View Timeline & Details
                      </button>
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
