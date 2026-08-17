import OverViewCard from "../../../component/card/OverViewCard";
import OrderListTable from "../../../component/tables/OrderList";
import ProductListTable from "../../../component/tables/ProductList";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { useEffect, useState } from "react";
import DashboardSkeleton from "../../../component/skeleton/AdminDashboard";
import { FaCube, FaEnvelope, FaStar } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";

interface DashboardData {
	totalProducts: number;
	totalOrders: number;
	totalVendors: number;
	totalCustomers: number;
	recentProducts: any;
	recentOrders: any;
	totalMessages: string;
	totalReviews: string;
}

const Dashboard = () => {
	const { fetchData } = useAPI();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			const response = await fetchData({
				apiUrl: `${apiConfig.dashboard.vendorDashboardUrl}`
			});
			if (response) {
				setDashboardData(response);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	if (isLoading) return <DashboardSkeleton />;

	const ProductListHeaders = [
		"Name",
		"Main Category",
		"Price",
		"Created At",
		"Action"
	];

	const OrderListHeaders = [
		"Order ID",
		"Customer",
		"Amount",
		"Status",
		"Created At",
		"Action"
	];

	return (
		<div>
			<div className="flex flex-col gap-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full transition-all ease-in duration-300">

					<OverViewCard
						bgColor="bg-[var(--color-primary)]"
						title={dashboardData?.totalProducts?.toString() || "0"}
						subTitle="Total Products"
					>
						<FaCube size={45}/>
					</OverViewCard>

					<OverViewCard
						bgColor="bg-[var(--color-primary)]"
						title={dashboardData?.totalOrders?.toString() || "0"}
						subTitle="Total Orders"
					>
						<FaShoppingCart size={45}/>
					</OverViewCard>

					<OverViewCard
						bgColor="bg-[var(--color-primary)]"
						title={dashboardData?.totalReviews?.toString() || "0"}
						subTitle="Total Reviews"
					>
						<FaStar size={45}/>
					</OverViewCard>

					<OverViewCard
						bgColor="bg-[var(--color-primary)]"
						title={dashboardData?.totalMessages?.toString() || "0"}
						subTitle="Total Messages"
					>
						<FaEnvelope size={45}/>
					</OverViewCard>
				</div>
				<ProductListTable
					title="Recent Products"
					headers={ProductListHeaders}
					data={dashboardData?.recentProducts?.data || []}
				/>
				<OrderListTable
					title="Recent Orders"
					headers={OrderListHeaders}
					data={dashboardData?.recentOrders || []}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
