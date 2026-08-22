import { useEffect, useState } from "react";
import { FiEye, FiEdit3 } from "react-icons/fi";
import { FaTruck, FaExclamationTriangle, FaExternalLinkAlt, FaCheckCircle, FaUndoAlt, FaTimesCircle } from "react-icons/fa";
import apiConfig from "../../../../config/api.json";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../../../../hooks/useApi";
import TableSkeleton from "../../../../component/skeleton/TableSkeleton";
import EmptyComponent from "../../../../component/empty-component";
import DeleteModal from "../../../../component/modals/DeleteModal";
import Pagination from "../../../../component/pagination";
import {
  getOrderCreatedAt,
  getStoredOrders,
  updateOrderStatusInService,
  Order,
  OrderStatus
} from "../../../../utils/order-service";
import Modal from "../../../../component/modals/Modal";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast-utils";

interface OrdersDataProps {
  id: string;
  orderId: string;
  totalAmount: string;
  vendorTotalAmount?: string;
  vendorTotalCommission?: string;
  status?: string;
  orderStatus?: string;
  paymentStatus: string;
  createdAt?: string;
  created_at?: string;
  createAt?: string;
  date?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  name?: string;
  phone?: string;
  address?: string;
  courierName?: string;
  trackingId?: string;
  courierTrackingLink?: string;
}

interface OrderTableProps {
  dataList: OrdersDataProps[];
  fetchData: () => void;
  pageCount: number;
  currentPageNumber: number;
  handlePagination: (paginationData: { selected: number }) => void;
  isLoading: boolean;
  isFetching: boolean;
}

const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  "Order Placed",
  "Preparing Order",
  "Loaded for Delivery",
  "Handed Over to Courier",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

const getStatusBadgeStyle = (status: OrderStatus) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Out for Delivery":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Handed Over to Courier":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "Cancelled":
    case "Returned":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
};

const OrderTable = ({
  dataList,
  fetchData,
  pageCount,
  currentPageNumber,
  handlePagination,
  isLoading,
  isFetching
}: OrderTableProps) => {
  const navigate = useNavigate();
  const { handleDeleteAPI } = useAPI();
  const apiUrl = apiConfig.vendor.orderListUrl;

  const [storedOrders, setStoredOrders] = useState<Order[]>([]);
  const [selectedOrderToUpdate, setSelectedOrderToUpdate] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Stage Skip / Terminal Status Confirmation Modal state
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    order: Order;
    newStatus: OrderStatus;
    skipCount: number;
    requiresReason: boolean;
  } | null>(null);
  const [confirmationReason, setConfirmationReason] = useState("");

  // Update Modal Form State
  const [modalOrderStatus, setModalOrderStatus] = useState<OrderStatus>("Order Placed");
  const [modalCourierName, setModalCourierName] = useState("");
  const [modalTrackingId, setModalTrackingId] = useState("");
  const [modalCourierTrackingLink, setModalCourierTrackingLink] = useState("");
  const [modalAdminNote, setModalAdminNote] = useState("");

  const refreshLocalOrders = () => {
    setStoredOrders(getStoredOrders());
  };

  useEffect(() => {
    refreshLocalOrders();
    const handleStorageUpdate = () => refreshLocalOrders();
    window.addEventListener("orders_updated", handleStorageUpdate);
    return () => window.removeEventListener("orders_updated", handleStorageUpdate);
  }, []);

  const tableHeaders = [
    { key: "sl", label: "Sl" },
    { key: "orderId", label: "Order ID" },
    { key: "customer", label: "Customer Details" },
    { key: "address", label: "Delivery Address" },
    { key: "totalAmount", label: "Amount" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "status", label: "Order Status (Inline Select)" },
    { key: "courier", label: "Courier Tracking" },
    { key: "createAt", label: "Date" },
    { key: "action", label: "Action" }
  ];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState<OrdersDataProps | null>(null);

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedOrderData(null);
  };

  const handleInvoice = (data: OrdersDataProps) => {
    navigate(`/invoice/${data.id}`, { state: { orderData: data } });
  };

  const handleDelete = async () => {
    if (!selectedOrderData) return;
    const apiResponse = await handleDeleteAPI({
      url: `${apiUrl}/${selectedOrderData.id}`,
      showSuccessMessage: true
    });
    if (apiResponse) {
      fetchData();
      closeDeleteModal();
    }
  };

  // Inline Row Status Change Handler
  const handleInlineStatusChange = (order: Order, targetStatus: OrderStatus) => {
    if (order.orderStatus === targetStatus) return;

    const pipelineSequence: OrderStatus[] = [
      "Order Placed",
      "Preparing Order",
      "Loaded for Delivery",
      "Handed Over to Courier",
      "Out for Delivery",
      "Delivered"
    ];

    const currentIdx = pipelineSequence.indexOf(order.orderStatus);
    const targetIdx = pipelineSequence.indexOf(targetStatus);

    const isTerminal = targetStatus === "Cancelled" || targetStatus === "Returned";
    const isStageSkip = currentIdx !== -1 && targetIdx !== -1 && targetIdx - currentIdx > 1;
    const skipCount = isStageSkip ? targetIdx - currentIdx - 1 : 0;

    // If stage skipping or terminal state, prompt confirmation modal
    if (isStageSkip || isTerminal) {
      setPendingStatusUpdate({
        order,
        newStatus: targetStatus,
        skipCount,
        requiresReason: isTerminal
      });
      setConfirmationReason("");
      return;
    }

    // Normal sequential update -> instant update
    executeStatusUpdate(order.id, targetStatus, `Status updated to ${targetStatus}`, order);
  };

  const executeStatusUpdate = (orderId: string, newStatus: OrderStatus, note?: string, orderFallback?: Order) => {
    const targetOrder = orderFallback || combinedOrders.find((o) => o.id === orderId || o.orderId === orderId);
    const updated = updateOrderStatusInService({
      orderId,
      newStatus,
      adminUserId: "admin_vendor_1",
      note: note || `Status changed to ${newStatus}`,
      orderFallback: targetOrder
    });

    if (updated) {
      showSuccessToast(`Order status updated to "${newStatus}"`);
      refreshLocalOrders();
      fetchData();
    }
  };

  const confirmPendingStatusUpdate = () => {
    if (!pendingStatusUpdate) return;
    const note =
      confirmationReason.trim() ||
      (pendingStatusUpdate.requiresReason
        ? `Marked as ${pendingStatusUpdate.newStatus}`
        : `Status changed to ${pendingStatusUpdate.newStatus} (Skipped ${pendingStatusUpdate.skipCount} stages)`);

    executeStatusUpdate(pendingStatusUpdate.order.id, pendingStatusUpdate.newStatus, note, pendingStatusUpdate.order);
    setPendingStatusUpdate(null);
  };

  // Open Update Shipping Tracker Modal for full courier details
  const openUpdateModalForOrder = (order: Order) => {
    setSelectedOrderToUpdate(order);
    setModalOrderStatus(order.orderStatus || "Order Placed");
    setModalCourierName(order.courierName || "");
    setModalTrackingId(order.trackingId || "");
    setModalCourierTrackingLink(order.courierTrackingLink || "");
    setModalAdminNote("");
    setIsUpdateModalOpen(true);
  };

  // Save Admin Tracker Update from Modal
  const handleSaveTrackerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToUpdate) return;

    if (modalCourierTrackingLink.trim()) {
      const url = modalCourierTrackingLink.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        showErrorToast("Courier Tracking Link must start with http:// or https://");
        return;
      }
    }

    const updated = updateOrderStatusInService({
      orderId: selectedOrderToUpdate.id,
      newStatus: modalOrderStatus,
      courierName: modalCourierName,
      trackingId: modalTrackingId,
      courierTrackingLink: modalCourierTrackingLink,
      adminUserId: "admin_vendor_1",
      note: modalAdminNote.trim() || `Status updated to ${modalOrderStatus}`,
      orderFallback: selectedOrderToUpdate
    });

    if (updated) {
      showSuccessToast("Order status & tracking info updated successfully!");
      setIsUpdateModalOpen(false);
      refreshLocalOrders();
      fetchData();
    }
  };

  // Merge stored customer orders with API order list (PRESERVE existing orderStatus!)
  const combinedOrders = [...storedOrders];
  if (dataList?.length > 0) {
    dataList.forEach((apiOrd) => {
      if (!combinedOrders.some((o) => o.id === apiOrd.id || o.orderId === apiOrd.orderId)) {
        // Preserve existing valid status if already present, do NOT reset existing orders to Order Placed!
        const existingStatus = (apiOrd.orderStatus || apiOrd.status) as OrderStatus;
        const validStatus: OrderStatus = ORDER_STATUS_PIPELINE.includes(existingStatus)
          ? existingStatus
          : "Order Placed";

        combinedOrders.push({
          id: apiOrd.id,
          orderId: apiOrd.orderId,
          createdAt: apiOrd.createdAt || apiOrd.created_at || apiOrd.createAt || apiOrd.date || new Date().toISOString(),
          orderStatus: validStatus,
          paymentStatus: (apiOrd.paymentStatus as any) || "Pending",
          paymentMethod: "COD",
          subtotal: Number(apiOrd.totalAmount) || 0,
          deliveryCharge: 60,
          totalAmount: Number(apiOrd.totalAmount) || 0,
          deliveryZone: "inside_dhaka",
          shippingAddress: {
            name: apiOrd.shippingAddress?.name || apiOrd.name || apiOrd.user?.name || "Customer",
            phone: apiOrd.shippingAddress?.phone || apiOrd.phone || apiOrd.user?.phone || "N/A",
            address: apiOrd.shippingAddress?.address || apiOrd.address || "N/A",
            city: apiOrd.shippingAddress?.city || "Dhaka"
          },
          courierName: apiOrd.courierName,
          trackingId: apiOrd.trackingId,
          courierTrackingLink: apiOrd.courierTrackingLink,
          items: [],
          statusHistory: [
            {
              status: validStatus,
              timestamp: apiOrd.createdAt || apiOrd.created_at || apiOrd.createAt || apiOrd.date || new Date().toISOString(),
              updatedBy: "system"
            }
          ]
        });
      }
    });
  }

  if (isFetching || isLoading) return <TableSkeleton />;

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-[var(--color-green-primary)] flex items-center gap-2">
            <FaTruck /> Customer Orders & Shipping Pipeline
          </h3>
          <p className="text-xs text-gray-500">
            Manage customer order progress, select status step-by-step inline, and attach courier tracking links.
          </p>
        </div>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1150px]">
          <thead className="bg-gray-50">
            <tr className="text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              {tableHeaders.map(({ key, label }) => (
                <th key={key} className="px-6 py-4 text-left text-gray-700">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {combinedOrders.length > 0 ? (
              combinedOrders.map((ord, index) => {
                const customerName = ord.shippingAddress?.name || "Customer";
                const customerPhone = ord.shippingAddress?.phone || "N/A";
                const deliveryAddress = [ord.shippingAddress?.address, ord.shippingAddress?.city]
                  .filter(Boolean)
                  .join(", ");

                const formattedDate = getOrderCreatedAt(ord);

                return (
                  <tr
                    key={ord.id}
                    className="hover:bg-gray-50/80 transition duration-200 border-b border-gray-100"
                  >
                    <td className="px-6 py-4 font-bold text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-[var(--color-green-primary)]">
                      {ord.orderId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{customerName}</div>
                      <div className="text-xs text-gray-500">{customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[180px]">
                      <div className="truncate text-xs text-gray-700" title={deliveryAddress}>
                        {deliveryAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">৳{ord.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1 ${
                          ord.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    {/* Inline Status Dropdown Select Column */}
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleInlineStatusChange(ord, e.target.value as OrderStatus)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition-all ${getStatusBadgeStyle(
                            ord.orderStatus
                          )}`}
                        >
                          {ORDER_STATUS_PIPELINE.map((st) => (
                            <option key={st} value={st} className="bg-white text-gray-800 font-semibold">
                              {st}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current text-xs">
                          ▼
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {ord.courierTrackingLink ? (
                        <a
                          href={ord.courierTrackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          <FaExternalLinkAlt size={10} />
                          <span>{ord.courierName || "Courier Link"}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No link attached</span>
                      )}
                    </td>

                    {/* Formatted Date Column using getOrderCreatedAt Helper */}
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      {formattedDate}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUpdateModalForOrder(ord)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-green-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition cursor-pointer shadow-sm"
                          title="Update Order Status & Courier Info"
                        >
                          <FiEdit3 /> Courier Link
                        </button>
                        <button
                          onClick={() => handleInvoice(ord as any)}
                          className="p-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          title="View Invoice"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="px-6 py-8 text-center italic">
                  <EmptyComponent />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stage Skip / Terminal Status Confirmation Modal */}
      {pendingStatusUpdate && (
        <Modal
          isOpen={Boolean(pendingStatusUpdate)}
          onClose={() => setPendingStatusUpdate(null)}
          title="Confirm Order Status Change"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-xl shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">
                  Change Status for {pendingStatusUpdate.order.orderId}?
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Changing status from &quot;<strong>{pendingStatusUpdate.order.orderStatus}</strong>&quot; to &quot;
                  <strong>{pendingStatusUpdate.newStatus}</strong>&quot;.
                </p>
                {pendingStatusUpdate.skipCount > 0 && (
                  <p className="text-xs font-bold text-amber-900 mt-1">
                    ⚠️ Note: This skips {pendingStatusUpdate.skipCount} intermediate shipping stages.
                  </p>
                )}
              </div>
            </div>

            {pendingStatusUpdate.requiresReason && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for {pendingStatusUpdate.newStatus} (Logged in Audit History) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Customer requested ${pendingStatusUpdate.newStatus.toLowerCase()}`}
                  value={confirmationReason}
                  onChange={(e) => setConfirmationReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                />
              </div>
            )}

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingStatusUpdate(null)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingStatusUpdate}
                className="px-6 py-2.5 bg-[var(--color-green-primary)] text-white rounded-xl font-bold text-sm hover:opacity-95 transition shadow-sm flex items-center gap-1.5"
              >
                <FaCheckCircle /> Confirm & Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Courier Link & Full Update Modal */}
      {selectedOrderToUpdate && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Courier Tracking & Order Info: ${selectedOrderToUpdate.orderId}`}
        >
          <form onSubmit={handleSaveTrackerUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Order Pipeline Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={modalOrderStatus}
                onChange={(e) => setModalOrderStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
              >
                {ORDER_STATUS_PIPELINE.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Courier Partner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Courier, Pathao"
                  value={modalCourierName}
                  onChange={(e) => setModalCourierName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tracking / Consignment ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ST-8891234"
                  value={modalTrackingId}
                  onChange={(e) => setModalTrackingId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Courier Shipment Tracking URL
              </label>
              <input
                type="url"
                placeholder="https://steadfast.com.bd/t/ST-8891234"
                value={modalCourierTrackingLink}
                onChange={(e) => setModalCourierTrackingLink(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
              />
              <p className="text-xs text-gray-400 mt-1">
                * Customers will see a &quot;🚚 Track Delivery&quot; button linking directly to this URL. Must start with http:// or https://.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Audit Trail Step Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Package handed over to courier rider at Uttara Hub"
                value={modalAdminNote}
                onChange={(e) => setModalAdminNote(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--color-green-primary)] text-white rounded-xl font-bold text-sm hover:opacity-95 transition shadow-sm flex items-center gap-1.5"
              >
                <FaCheckCircle /> Save & Update Status
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedOrderData && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          title="Delete Order"
          message={`Are you sure you want to delete?`}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
      )}

      {pageCount > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            pageCount={pageCount}
            currentPageNumber={currentPageNumber}
            handlePagination={handlePagination}
          />
        </div>
      )}
    </div>
  );
};

export default OrderTable;
