import Image from "next/image";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { FiEye, FiDownload } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { orderQueryKey } from "../../../../config/query-key";
import { formatDate, formatPrettyDate, formatPrettyDateWithTime } from "../../../../utils/date-utils";
import Pagination from "../../../../component/pagination";
import OrderListSkeleton from "../../../../component/skeleton/CustomerOrder";
import EmptyComponent from "../../../../component/empty-component";

type Order = {
	id: string;
	orderId: string;
	createdAt: string;
	totalAmount: number;
	status: string;
	orderSummaries: any[];
}

const Order = () => {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const dataLimit = 5;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery } = useAPI();

	const getOrderListApiUrl = () => {
		const apiUrl = `${apiConfig.customer.orderListUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
		return apiUrl;
	};

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const {
		data: dataList,
		isLoading,
		pageCount,
		isFetching,
		refetch: fetchData
	} = usePaginatedQuery({
		queryKey: [orderQueryKey],
		url: getOrderListApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
	};

	const handleCloseModal = () => {
		setSelectedOrder(null);
	};

	if (isFetching || isLoading) return <OrderListSkeleton />;

	return (
		<div>
			<div className="flex lg:flex-row flex-col lg:items-center lg:justify-between">
				<div>
					<p className="font-bold text-[var(--color-green-primary)]">
						Your Orders
					</p>
					<p className="text-sm mb-2 text-[var(--color-green-primary)]">
						Manage your orders
					</p>
				</div>
			</div>

			<div className="mt-6">
				<p className="font-bold text-xl text-[var(--color-green-primary)]">
					Order Lists
				</p>

				<div className="mt-6 grid gap-3">
					{dataList.length > 0 ? (
						(dataList as Order[]).map((order: Order) => (
							<div
								key={order?.id}
								className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
							>
								<div className="flex flex-col md:flex-row justify-between gap-3">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-md lg:text-[12px] xl:text-lg">
												Order ID:
											</p>

											<p className="text-md lg:text-[12px] xl:text-lg">
												{order?.orderId}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<p className="font-semibold text-md lg:text-[12px] xl:text-lg">
												Date:
											</p>

											<p className="hidden md:block text-sm md:text-md xl:text-lg">
												{formatPrettyDateWithTime(order?.createdAt)}
											</p>

											<p className="block md:hidden text-sm md:text-md xl:text-lg">
												{formatPrettyDate(order?.createdAt)}
											</p>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-md lg:text-[12px] xl:text-lg">
												Amount:
											</p>
											<p className="text-[var(--color-green-primary)] text-md lg:text-[12px] xl:text-lg font-bold">
												${order?.totalAmount}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<p className="font-semibold text-md lg:text-[12px] xl:text-lg">
												Status:
											</p>

											<span
												className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${order?.status === "Completed"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
													}`}
											>
												{order?.status}
											</span>
										</div>
										<button
											onClick={() => handleViewOrder(order)}
											className="flex items-center gap-2 px-4 py-2 bg-[var(--color-green-primary)] text-white rounded-lg transition-colors hover:bg-opacity-90 w-full cursor-pointer"
										>
											<FiEye className="hidden md:block" />
											<span className="md:hidden block w-full">View Details</span>
										</button>
									</div>
								</div>
							</div>
						))
					) : (
						<EmptyComponent message="No orders yet — find something you love and order now!" />
					)}
				</div>
				{
					pageCount > 1 && (
						<Pagination
							pageCount={pageCount}
							currentPageNumber={currentPageNumber}
							handlePagination={handlePagination}
						/>
					)
				}
			</div>

			{selectedOrder && (
				<div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-50 p-4">
					<div className="bg-white rounded-lg w-full max-w-4xl">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-2xl font-bold text-[var(--color-green-primary)]">
										Order Info
									</h2>
									<p className="text-sm text-gray-600">
										Order ID: {selectedOrder.orderId}
									</p>
								</div>
								<button onClick={handleCloseModal} className="cursor-pointer">
									<MdClose size={24} />
								</button>
							</div>

							<div className="space-y-4 overflow-hidden overflow-y-scroll max-h-[40vh]">
								{selectedOrder?.orderSummaries?.map((product: any) => {
									return (
										<div
											key={product.id}
											className="sm:flex sm:items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<Image src={product.productImage} alt={product.productName} className="w-20 h-20 object-cover rounded-lg" width={80} height={80} />
											<div className="flex-1 flex flex-col">
												<h3 className="font-semibold text-gray-800">
													{product.productName}
												</h3>
												<p className="text-sm text-gray-600 mt-1">
													${product.price}
												</p>
											</div>
											<div className="flex items-center h-20">
												<a href={product.productFileUrl} download target="_blank" rel="noopener noreferrer">
													<button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-green-primary)] text-white rounded-lg transition-colors cursor-pointer">
														<FiDownload />
														<span>Download</span>
													</button>
												</a>

											</div>
										</div>
									)
								})}
							</div>

							<div className="mt-6 pt-6 border-t border-gray-200">
								<div className="flex justify-between items-center">
									<div>
										<p className="text-sm text-gray-600">
											Order Date: {formatDate(selectedOrder?.createdAt)}
										</p>
										<p className="text-sm text-gray-600">
											Status:{" "}
											<span
												className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedOrder.status === "Completed"
													? "bg-green-100 text-green-800"
													: selectedOrder.status === "Failed"
														? "bg-yellow-100 text-yellow-800"
														: "bg-gray-100 text-gray-800"
													}`}
											>
												{selectedOrder.status}
											</span>
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-600">Total Amount</p>
										<p className="text-xl font-bold text-[var(--color-green-primary)]">
											${selectedOrder.totalAmount}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
			}
		</div>
	);
};

export default Order;
