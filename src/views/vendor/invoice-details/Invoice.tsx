import Image from "next/image";
import { useLocation } from "react-router-dom";
import PageHeader from "../../../component/card/PageHeader";
import { formatDate } from "../../../utils/date-utils";

const InvoiceView = () => {
	const location = useLocation();
	const order = (location.state as any)?.orderData;

	if (!order) {
		return (
			<div className="p-6 bg-white text-center text-red-500 font-semibold">
				Order data not found. Please go back to the order list.
			</div>
		);
	}

	const orderItems = order.orderSummaries || [];


	const customerName = order.shippingAddress?.name || order.name || order.user?.name || "N/A";
	const customerPhone = order.shippingAddress?.phone || order.phone || order.user?.phone || "N/A";
	const customerEmail = order.user?.email || "N/A";
	const deliveryAddress = [
		order.shippingAddress?.address || order.address,
		order.shippingAddress?.city
	].filter(Boolean).join(", ") || "N/A";

	return (
		<div className="flex flex-col gap-8 print-container">
			<style>{`
				@media print {
					body { background: white !important; color: black !important; }
					.no-print { display: none !important; }
					.print-container { padding: 0 !important; margin: 0 !important; }
					.print-border { border: 1px solid #e5e7eb !important; }
				}
			`}</style>

			<div className="flex items-center justify-between flex-wrap no-print">
				<PageHeader
					headerTitle="Invoice"
					headerDescription="View invoice details"
				/>
			</div>
			<div className="grid grid-cols-12 gap-12 bg-white p-6 rounded-md border border-gray-300 print-border">
				<div className="col-span-12 xl:col-span-12">
					<div className="grid grid-cols-2 pb-4 border-b border-gray-300">
						<div>
							<p className="text-4xl font-bold text-[var(--color-primary)] mt-2">
								Invoice
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
						<div>
							<p className="text-xl font-semibold mb-2 text-gray-800">Customer & Delivery Info</p>
							<p className="font-bold text-lg text-gray-900">Name: {customerName}</p>
							<p className="font-medium text-gray-600">Email: {customerEmail}</p>
							<p className="font-medium text-gray-600">Phone: {customerPhone}</p>
							<p className="font-medium text-gray-800 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
								<span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-1">Delivery Address:</span>
								{deliveryAddress}
							</p>
						</div>

						<div>
							<p className="text-xl font-semibold mb-2 text-gray-800">Order Info</p>
							<p className="font-bold text-lg">Order ID: <span className="text-[var(--color-primary)]">#{order.orderId}</span></p>
							<p className="font-medium text-gray-600">Date: {formatDate(order.createdAt)}</p>
						</div>

						<div>
							<p className="text-xl font-semibold mb-2 text-gray-800">Status</p>
							<p className="font-medium flex items-center">
								<span className="mr-2 text-gray-600">Payment:</span>
								<span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
									{order.paymentStatus}
								</span>
							</p>
							<p className="font-medium flex items-center mt-2">
								<span className="mr-2 text-gray-600">Order:</span>
								<span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
									{order.status}
								</span>
							</p>
						</div>
					</div>
					<div className="mt-8">
						<table className="w-full text-left">
							<thead>
								<tr className="bg-[#F9FAFB] text-md font-medium border-b border-gray-200">
									<th className="px-4 py-3 w-[40%] text-left">Product</th>
									<th className="px-4 py-3 w-[15%] text-center">Qunatity</th>
									<th className="px-4 py-3 w-[15%] text-center">Price</th>
									<th className="px-4 py-3 w-[15%] text-right">Sub Total</th>
								</tr>
							</thead>
							<tbody>
								{orderItems.map((item: any) => (
									<tr key={item.id} className="border-b border-gray-200 text-sm">
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<Image src={item.productImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={item.productName} className="w-12 h-12 object-cover rounded" width={48} height={48} />
												<span className="font-semibold">{item.productName}</span>
											</div>
										</td>
										<td className="px-4 py-3 text-center">{item.quantity}</td>
										<td className="px-4 py-3 text-center">${item.price}</td>
										<td className="px-4 py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
									</tr>
								))}
								<tr>
									<td colSpan={4} className="px-4 py-2">
										<div className="ml-auto max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
											<span>Sub Total</span>
											<span>${order.vendorTotalAmount ?? "0.00"}</span>
										</div>
									</td>
								</tr>
								<tr>
									<td colSpan={4} className="px-4 py-2">
										<div className="ml-auto max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
											<span>Commission</span>
											<span>(-) ${order.vendorTotalCommission ?? "0.00"}</span>
										</div>
									</td>
								</tr>
								<tr>
									<td colSpan={4} className="px-4 py-3">
										<div className="ml-auto max-w-[500px] flex justify-between pb-1 text-base text-black font-bold">
											<span>Total Amount</span>
											<span>${order.vendorTotalAmount - order.vendorTotalCommission}</span>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceView;
