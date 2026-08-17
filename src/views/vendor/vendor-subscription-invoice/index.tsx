import { useParams } from "react-router-dom";
import PageHeader from "../../../component/card/PageHeader";
import { formatDate } from "../../../utils/date-utils";
import { useEffect, useState } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";

interface Subscription {
    id: string | number;
    createdAt: string;
    vendor: {
        name: string;
        email: string;
        phone: string;
    };
    tier: {
        id: string;
        name: string;
        durationInMonths: number;
        commissionRate: number;
        price: number;
        discountAmount?: number;
    };
}

const VendorInvoiceView = () => {
    const { id } = useParams();
    const {fetchData} = useAPI();
    const [subscription, setSubcription] = useState<Subscription | null>(null);
    useEffect(()=>{
        const fetchVendorSingleSub = async() =>{
            const response = await fetchData({apiUrl : `${apiConfig.subcriptionLinks.activeSingleSubcriptionUrl}/${id}`})
            setSubcription(response)
        }
        fetchVendorSingleSub();
    },[id])
    // const { state } = useLocation();
    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (!state?.subscription) {
    //         navigate("/subscription");
    //     }
    // }, [state]);

    // const subscription = state?.subscription;
    // const user = state?.userInfo;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between flex-wrap">
                <PageHeader
                    headerTitle="Subscription Invoice"
                    headerDescription="View subscription invoice details"
                />
            </div>
            <div className="grid grid-cols-12 gap-12 bg-white p-4 rounded-md border border-gray-300">
                <div className="col-span-12 xl:col-span-12">
                    <div className="grid grid-cols-1 pb-4 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                            <p className="text-4xl font-bold text-[var(--color-primary)] mt-2">
                                Invoice
                            </p>
                            <p className="text-[var(--color-primary)] mt-2">
                                Date: {subscription?.createdAt ? formatDate(subscription.createdAt) : 'N/A'}
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
                            <p className="font-bold text-lg">Name: {subscription?.vendor?.name}</p>
                            <p className="font-medium">Email: {subscription?.vendor?.email}</p>
                            <p className="font-medium">Phone: {subscription?.vendor?.phone}</p>
                        </div>

                        {/* <div>
							<p className="text-xl font-semibold mb-2">Order Info</p>
							<p className="font-bold text-lg">Order ID: <span className="text-[var(--color-primary)]">#{order.orderId}</span></p>
							<p className="font-medium">Date: {formatDate(order.createdAt)}</p>
						</div> */}

                        {/* <div>
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
						</div> */}
                    </div>
                    <div className="mt-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F9FAFB] text-md font-medium border-b border-gray-200">
                                    <th className="px-4 py-3 text-left">Tier Name</th>
                                    <th className="px-4 py-3 text-center">Duration</th>
                                    <th className="px-4 py-3 text-center">Commission Rate</th>
                                    <th className="px-4 py-3 text-center">Price</th>
                                    <th className="px-4 py-3 text-right">Sub Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200 text-sm">
                                    <td className="px-4 py-3 text-start">{subscription?.tier?.name}</td>
                                    <td className="px-4 py-3 text-center">{subscription?.tier?.durationInMonths} month</td>
                                    <td className="px-4 py-3 text-center">{subscription?.tier?.commissionRate}%</td>
                                    <td className="px-4 py-3 text-center">${subscription?.tier?.price}</td>
                                    <td className="px-4 py-3 text-end">${subscription?.tier?.price}</td>
                                </tr>

                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-2 text-end">
                                        <div className="max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
                                            <span>Total Amount</span>
                                            <span>${subscription?.tier?.price ?? "0.00"}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-2 text-end">
                                        <div className="ml-auto max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
                                            <span>Discount</span>
                                            <span>${subscription?.tier?.discountAmount ?? "0.00"}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-3">
                                        <div className="ml-auto max-w-[500px] flex justify-between pb-1 text-base text-black font-bold">
                                            <span>Total Amount</span>
                                            <span>${subscription?.tier?.price ?? "0.00"}</span>
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

export default VendorInvoiceView;
