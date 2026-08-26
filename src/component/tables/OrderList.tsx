import React, { useState } from "react";
import { FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrettyDateWithTime } from "../../utils/date-utils";
import EmptyComponent from "../empty-component";
import {
  acceptOrderInService,
  rejectOrderInService,
  RejectionReason
} from "../../utils/order-service";
import { showErrorToast, showSuccessToast } from "../../utils/toast-utils";

interface OrdersDataProps {
  id: string;
  orderId: string;
  totalAmount?: string | number;
  vendorTotalAmount?: string | number;
  status: string;
  orderStatus?: string;
  paymentStatus: string;
  createdAt?: string;
  user?: { name: string };
  rejectionReason?: string;
  rejectionMessage?: string;
}

const REJECTION_REASONS: RejectionReason[] = [
  "Product unavailable",
  "Out of stock",
  "Delivery unavailable",
  "Customer information issue",
  "Payment issue",
  "Other"
];

const OrderListTable = ({
  title,
  headers,
  data: initialData
}: {
  title: string;
  headers: string[];
  data: any[];
}) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Local state to reflect instant state changes
  const [ordersList, setOrdersList] = useState<any[]>(initialData || []);

  // Sync state if prop changes
  React.useEffect(() => {
    setOrdersList(initialData || []);
  }, [initialData]);

  // Modal States
  const [acceptingOrder, setAcceptingOrder] = useState<any | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionMessage, setRejectionMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNavigate = (row: any) => {
    router.push(`/order-confirmation/${row.id || row.orderId}`);
  };

  // Filtered orders list
  const filteredOrders = ordersList.filter((item) => {
    const status = (item.orderStatus || item.status || "Pending").trim();
    if (activeFilter === "All") return true;
    if (activeFilter === "Pending") return status === "Pending";
    if (activeFilter === "Order Placed") return status === "Order Placed" || status === "Accepted";
    if (activeFilter === "Processing") return status === "Processing" || status === "Preparing Order";
    if (activeFilter === "Shipped") return status === "Shipped";
    if (activeFilter === "Delivered") return status === "Delivered" || status === "Completed";
    if (activeFilter === "Rejected") return status === "Rejected";
    return true;
  });

  // Calculate status counts
  const counts = {
    All: ordersList.length,
    Pending: ordersList.filter((o) => (o.orderStatus || o.status || "Pending") === "Pending").length,
    "Order Placed": ordersList.filter((o) => {
      const s = o.orderStatus || o.status;
      return s === "Order Placed" || s === "Accepted";
    }).length,
    Processing: ordersList.filter((o) => {
      const s = o.orderStatus || o.status;
      return s === "Processing" || s === "Preparing Order";
    }).length,
    Shipped: ordersList.filter((o) => (o.orderStatus || o.status) === "Shipped").length,
    Delivered: ordersList.filter((o) => {
      const s = o.orderStatus || o.status;
      return s === "Delivered" || s === "Completed";
    }).length,
    Rejected: ordersList.filter((o) => (o.orderStatus || o.status) === "Rejected").length
  };

  // Confirm Accept Order
  const handleConfirmAccept = async () => {
    if (!acceptingOrder) return;
    setIsSubmitting(true);
    try {
      const orderId = acceptingOrder.id || acceptingOrder.orderId;
      const res = await acceptOrderInService({ orderId, adminUserId: "admin_1" });
      if (res) {
        showSuccessToast(`Order #${res.orderId || res.id} accepted successfully!`);
        // Update local list
        setOrdersList((prev) =>
          prev.map((o) =>
            (o.id === orderId || o.orderId === orderId) ? { ...o, status: "Order Placed", orderStatus: "Order Placed" } : o
          )
        );
      } else {
        showErrorToast("409 Conflict: Failed to accept order. Only Pending orders can be accepted.");
      }
    } catch (err: any) {
      showErrorToast(err?.message || "409 Conflict: An error occurred while accepting order.");
    } finally {
      setIsSubmitting(false);
      setAcceptingOrder(null);
    }
  };

  // Confirm Reject Order
  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    if (!rejectionReason) {
      showErrorToast("Please select a reason for rejecting this order.");
      return;
    }
    if (rejectionReason === "Other" && !rejectionMessage.trim()) {
      showErrorToast("Please provide an additional message when selecting 'Other'.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = rejectingOrder.id || rejectingOrder.orderId;
      const res = await rejectOrderInService({
        orderId,
        adminUserId: "admin_1",
        rejectionReason,
        rejectionMessage: rejectionMessage.trim()
      });
      if (res) {
        showSuccessToast(`Order #${res.orderId || res.id} rejected.`);
        // Update local list
        setOrdersList((prev) =>
          prev.map((o) =>
            (o.id === orderId || o.orderId === orderId)
              ? {
                  ...o,
                  status: "Rejected",
                  orderStatus: "Rejected",
                  rejectionReason,
                  rejectionMessage: rejectionMessage.trim()
                }
              : o
          )
        );
      } else {
        showErrorToast("409 Conflict: Failed to reject order. Only Pending orders can be rejected.");
      }
    } catch (err: any) {
      showErrorToast(err?.message || "409 Conflict: An error occurred while rejecting order.");
    } finally {
      setIsSubmitting(false);
      setRejectingOrder(null);
      setRejectionReason("");
      setRejectionMessage("");
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || "Pending").trim();
    if (s === "Pending") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
          Pending Approval
        </span>
      );
    }
    if (s === "Order Placed" || s === "Accepted" || s === "Completed" || s === "Delivered") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
          {s}
        </span>
      );
    }
    if (s === "Rejected" || s === "Cancelled") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
          {s}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800">
        {s}
      </span>
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <Link
          href={"/orders"}
          className="underline text-[#212B36] text-xs hover:text-[var(--color-green-primary)] transition"
        >
          View All
        </Link>
      </div>

      {/* Filter Tabs with Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {(["All", "Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Rejected"] as const).map(
          (filterKey) => {
            const count = counts[filterKey] || 0;
            const isActive = activeFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <th className="p-3 text-left">Sl</th>
              {headers.map((header, index) => (
                <th key={index} className="p-3 text-left">
                  {header}
                </th>
              ))}
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((row, rowIndex) => {
                const currentStatus = (row.orderStatus || row.status || "Pending").trim();
                const isPending = currentStatus === "Pending";

                return (
                  <tr key={rowIndex} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-semibold text-gray-500">{rowIndex + 1}</td>
                    <td className="p-3 font-extrabold text-gray-800">{row.orderId || row.id}</td>
                    <td className="p-3">{row.user?.name || row.shippingAddress?.name || "Customer"}</td>
                    <td className="p-3 font-bold text-gray-900">
                      ৳{row.vendorTotalAmount || row.totalAmount || row.subtotal || 0}
                    </td>
                    <td className="p-3">{getStatusBadge(currentStatus)}</td>
                    <td className="p-3 text-gray-500 text-xs">{formatPrettyDateWithTime(row.createdAt)}</td>

                    {/* Action buttons */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleNavigate(row)}
                          title="View Order Confirmation"
                          className="border border-gray-200 text-gray-700 hover:text-[var(--color-green-primary)] hover:bg-emerald-50 cursor-pointer p-2 rounded-lg transition"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* Accept & Reject Buttons - ONLY shown for Pending orders */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => setAcceptingOrder(row)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-xs flex items-center gap-1"
                            >
                              <FiCheckCircle /> Accept
                            </button>
                            <button
                              onClick={() => {
                                setRejectingOrder(row);
                                setRejectionReason("");
                                setRejectionMessage("");
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-xs flex items-center gap-1"
                            >
                              <FiXCircle /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length + 2} className="py-8 text-center">
                  <EmptyComponent message="No orders match the selected filter." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Accept Confirmation Modal */}
      {acceptingOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 text-xl" /> Accept Order?
            </h3>
            <p className="text-sm text-gray-600">
              This will move Order <strong className="text-gray-800">#{acceptingOrder.orderId || acceptingOrder.id}</strong> from <span className="text-amber-700 font-bold">Pending</span> to <span className="text-emerald-700 font-bold">Order Placed</span>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setAcceptingOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmAccept}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                {isSubmitting ? "Accepting..." : "Accept Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {rejectingOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-red-600 flex items-center gap-2">
              <FiXCircle className="text-xl" /> Reject Order #{rejectingOrder.orderId || rejectingOrder.id}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select a reason...</option>
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Additional Message {rejectionReason === "Other" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  placeholder="Write a message for the customer..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason("");
                  setRejectionMessage("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                {isSubmitting ? "Rejecting..." : "Reject Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListTable;
