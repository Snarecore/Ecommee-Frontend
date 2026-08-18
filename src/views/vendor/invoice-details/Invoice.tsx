import Image from "next/image";
import { useLocation } from "react-router-dom";
import PageHeader from "../../../component/card/PageHeader";
import { formatDate } from "../../../utils/date-utils";

const InvoiceView = () => {
	const location = useLocation();
	const order = location.state?.orderData;

	if (!order) {
		return (
			<div className="p-6 bg-white text-center text-red-500 font-semibold">
				Order data not found. Please go back to the order list.
			</div>
		);
	}

	const orderItems = order.orderSummaries || [];


	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between flex-wrap">
				<PageHeader
					headerTitle="Invoice"
					headerDescription="View invoice details"
				/>
			</div>
			<div className="grid grid-cols-12 gap-12 bg-white p-4 rounded-md border border-gray-300">
				<div className="col-span-12 xl:col-span-12">
					<div className="grid grid-cols-2 pb-4 border-b border-gray-300">
						<div>
							<p className="text-4xl font-bold text-[var(--color-primary)] mt-2">
								Invoice
							</p>
						</div>
						{/* <div className="text-right">
							<p className="text-[#7A8086] text-xl font-bold">
								Order ID: <span className="text-[#FE9F43] font-semibold">#{order.orderId}</span>
							</p>
							<p className="text-sm font-medium">
								<span className="text-[#7A8086]">Created At:</span>{" "}
								{new Date(order.createdAt).toLocaleDateString()}
							</p>
						</div> */}
					</div>
					<div className="grid grid-cols-3 mt-6">

						<div>
							<p className="text-xl font-semibold mb-2">Customer</p>
							<p className="font-bold text-lg">Name: {order.user.name}</p>
							<p className="font-medium">Email: {order.user.email}</p>
							<p className="font-medium">Phone: {order.user.phone}</p>
						</div>

						<div>
							<p className="text-xl font-semibold mb-2">Order Info</p>
							<p className="font-bold text-lg">Order ID: <span className="text-[var(--color-primary)]">#{order.orderId}</span></p>
							<p className="font-medium">Date: {formatDate(order.createdAt)}</p>
						</div>

						<div>
							<p className="text-xl font-semibold mb-2">Status</p>
							<p className="font-medium flex items-center">
								<span className="mr-2">Payment:</span>
								<span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
									{order.paymentStatus}
								</span>
							</p>
							<p className="font-medium flex items-center mt-2">
								<span className="mr-2">Order:</span>
								<span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
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
