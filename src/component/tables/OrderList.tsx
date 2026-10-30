import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrettyDateWithTime } from "../../utils/date-utils";
import EmptyComponent from "../empty-component";

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
  shippingAddress?: { name?: string; phone?: string; city?: string };
  name?: string;
  phone?: string;
}

const OrderListTable = ({
  title,
  headers,
  data: initialData
}: {
  title: string;
  headers: string[];
  data: OrdersDataProps[];
}) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const ordersList = initialData || [];

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
          href={"/customer-dashboard?tab=order"}
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

                return (
                  <tr key={row.id || rowIndex} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-semibold text-gray-500">{rowIndex + 1}</td>
                    <td className="p-3 font-extrabold text-gray-800">{row.orderId || row.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">
                        {row.user?.name || row.shippingAddress?.name || row.name || "Customer"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {row.shippingAddress?.phone || row.phone || "N/A"}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      ৳{row.vendorTotalAmount || row.totalAmount || 0}
                    </td>
                    <td className="p-3">{getStatusBadge(currentStatus)}</td>
                    <td className="p-3 text-gray-500 text-xs">{row.createdAt ? formatPrettyDateWithTime(row.createdAt) : "N/A"}</td>

                    {/* Action buttons */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleNavigate(row)}
                          title="View Order Details"
                          className="border border-gray-200 text-gray-700 hover:text-[var(--color-green-primary)] hover:bg-emerald-50 cursor-pointer p-2 rounded-lg transition"
                        >
                          <FiEye size={16} />
                        </button>
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
    </div>
  );
};

export default OrderListTable;
