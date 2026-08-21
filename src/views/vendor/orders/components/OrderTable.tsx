import { useState } from "react";
import { FiEye } from "react-icons/fi";
import apiConfig from "../../../../config/api.json";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../../../../hooks/useApi";
import TableSkeleton from "../../../../component/skeleton/TableSkeleton";
import EmptyComponent from "../../../../component/empty-component";
import DeleteModal from "../../../../component/modals/DeleteModal";
import Pagination from "../../../../component/pagination";
import { formatPrettyDateWithTime } from "../../../../utils/date-utils";

interface OrdersDataProps {
	id: string;
	orderId: string;
	totalAmount: string;
	vendorTotalAmount: string;
	vendorTotalCommission: string;
	status: string;
	paymentStatus: string;
	createdAt?: string;
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

	const tableHeaders = [
		{ key: "sl", label: "Sl" },
		{ key: "orderId", label: "Order ID" },
		{ key: "customer", label: "Customer Details" },
		{ key: "address", label: "Delivery Address" },
		{ key: "totalAmount", label: "Amount" },
		{ key: "vendorTotalCommission", label: "Total Commission" },
		{ key: "paymentStatus", label: "Payment Status" },
		{ key: "status", label: "Status" },
		{ key: "createAt", label: "Created At" },
		{ key: "action", label: "Action" }
	];

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedOrderData, setSelectedOrderData] = useState<OrdersDataProps | null>(null);

	// const openDeleteModal = (data: OrdersDataProps) => {
	// 	setSelectedOrderData(data);
	// 	setIsDeleteModalOpen(true);
	// };

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

	if (isFetching || isLoading) return <TableSkeleton />;

	return (
		<div className="p-6 bg-white rounded-lg border border-gray-200">
			<div className="mt-4 w-full overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[1050px]">
					<thead className="bg-gray-100">
						<tr className="text-gray-600 text-sm border-b border-gray-200">
							{tableHeaders.map(({ key, label }) => (
								<th key={key} className="px-6 py-4 text-left text-[#000000e0]">
									{label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200 rounded-lg">
						{dataList?.length > 0 ? (
							dataList?.map((data, index) => {
								const customerName = data.shippingAddress?.name || data.name || data.user?.name || "N/A";
								const customerPhone = data.shippingAddress?.phone || data.phone || data.user?.phone || "N/A";
								const deliveryAddress = [
									data.shippingAddress?.address || data.address,
									data.shippingAddress?.city
								].filter(Boolean).join(", ") || "N/A";

								return (
									<tr key={data.id} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300">
										<td className="px-6 py-4 font-medium text-gray-800">
											{index + 1}
										</td>
										<td className="px-6 py-4 font-medium text-gray-800">
											{data.orderId}
										</td>
										<td className="px-6 py-4 font-medium text-gray-800">
											<div className="text-sm font-semibold">{customerName}</div>
											<div className="text-xs text-gray-500">{customerPhone}</div>
										</td>
										<td className="px-6 py-4 font-medium text-gray-800 max-w-[200px]">
											<div className="truncate text-sm" title={deliveryAddress}>
												{deliveryAddress}
											</div>
										</td>
										<td className="px-6 py-4 font-medium text-gray-800">
											${data.vendorTotalAmount}
										</td>
										<td className="px-6 py-4 font-medium text-gray-800">
											${data.vendorTotalCommission}
										</td>
										<td className="px-6 py-4">
											<span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
												{data.paymentStatus}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
												{data.status}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-gray-800">
											{formatPrettyDateWithTime(data?.createdAt ?? '')}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<button onClick={() => handleInvoice(data)} className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300" title="View Invoice">
													<FiEye />
												</button>
												{/* <button onClick={() => openDeleteModal(data)} className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300">
													<FiTrash2 />
												</button> */}
											</div>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic">
									<EmptyComponent />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
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
				<div className="flex justify-center">
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
