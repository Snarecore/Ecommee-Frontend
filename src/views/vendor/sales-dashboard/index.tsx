import { FiDollarSign, FiGrid, FiPackage } from "react-icons/fi"
import OverViewCard from "../../../component/card/OverViewCard"
import { FaArrowUpWideShort, FaClipboardList, FaDollarSign } from "react-icons/fa6"
import { RiMoneyDollarCircleLine } from "react-icons/ri"
import SubcriptionInfo from "./component/SubcriptionInfo"
import DoughnutChart from "./component/DoughnutChart"
import TopProductListTable from "./component/TopSellingProductTable"
import SalesPurchaseChart from "./component/SalesVsCommissionChart"
import { useEffect, useState } from "react"
import { useAPI } from "../../../hooks/useApi"
import apiConfig from "../../../config/api.json";
import { FaPercentage } from "react-icons/fa"
import SalesDashboardSkeleton from "../../../component/skeleton/SalesDashboardSkeleton"

interface SalesDashboardData {
    totalSalesAmount: number;
    totalOrders: number;
    totalCommissionPaid: number;
    totalNetProfit: number;
    recentProducts: any;
    recentOrders: any;
    monthlySalesCommissionData: any;
    subscriptionData: any;
    topSellingProducts: any;
    categoryStatistics: any;
    topCategories: any;
    totalWithdrawnAmount: string;
}

const SalesDashboard = () => {
    const { fetchData } = useAPI();
    const [salesDashboardData, setSalesDashboardData] = useState<SalesDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSalesDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await fetchData({
                apiUrl: `${apiConfig.dashboard.vendorSalesDashboardUrl}`
            });
            if (response) {
                setSalesDashboardData(response);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesDashboardData();
    }, []);

    if (isLoading) return <SalesDashboardSkeleton />;


    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full transition-all ease-in duration-300">
                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`${salesDashboardData?.totalOrders ?? 0}`}
                        subTitle="Total Orders"
                    >
                        <FaClipboardList size={45} />
                    </OverViewCard>
                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${salesDashboardData?.totalSalesAmount ?? 0}`}
                        subTitle="Total Sales"
                    >
                        <FaDollarSign size={45} />
                    </OverViewCard>
                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${salesDashboardData?.totalNetProfit ?? 0}`}
                        subTitle="Net Profit"
                    >
                        <FaArrowUpWideShort size={45} />
                    </OverViewCard>
                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${salesDashboardData?.totalCommissionPaid ?? 0}`}
                        subTitle="Total Commission"
                    >
                        <FaPercentage size={45} />
                    </OverViewCard>
                </div>

                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
                    <div>
                        <SalesPurchaseChart monthlySalesCommissionData={salesDashboardData?.monthlySalesCommissionData} />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center text-start text-2xl font-bold mb-4">
                            <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full mr-3">
                                <FiPackage size={22} />
                            </span>
                            Subscription Info
                        </div>

                        <div>
                            <SubcriptionInfo subscriptionData={salesDashboardData?.subscriptionData} />

                            <div className="mt-4">
                                <p className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                                        <FiDollarSign size={18} />
                                    </span>
                                    Payout Summary
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 place-items-center">
                                    <div className="flex flex-col items-center bg-emerald-50 hover:bg-emerald-100 transition rounded-xl shadow-sm p-6 w-full mx-2 md:mx-0 relative md:border-r md:border-gray-200">
                                        <span className="bg-emerald-200 text-emerald-700 p-3 rounded-full mb-2">
                                            <FiDollarSign size={22} />
                                        </span>
                                        <p className="text-2xl font-extrabold text-emerald-700">${salesDashboardData?.totalNetProfit}</p>
                                        <p className="text-green-600 font-medium">Total Net Earnings</p>
                                    </div>

                                    <div className="flex flex-col items-center bg-emerald-50 hover:bg-emerald-100 transition rounded-xl shadow-sm p-6 w-full mx-2 md:mx-0 relative md:border-r md:border-gray-200">
                                        <span className="bg-emerald-200 text-emerald-700 p-3 rounded-full mb-2">
                                            <RiMoneyDollarCircleLine size={22} />
                                        </span>
                                        <p className="text-2xl font-extrabold text-emerald-700">${salesDashboardData?.totalWithdrawnAmount}</p>
                                        <p className="text-green-600 font-medium">Total Withdrawn</p>
                                    </div>

                                    <div className="flex flex-col items-center bg-emerald-50 hover:bg-emerald-100 transition rounded-xl shadow-sm p-6 w-full mx-2 md:mx-0 relative md:border-r md:border-gray-200">
                                        <span className="bg-emerald-200 text-emerald-700 p-3 rounded-full mb-2">
                                            <FiDollarSign size={22} />
                                        </span>
                                        <p className="text-2xl font-extrabold text-emerald-700">${(salesDashboardData?.totalNetProfit || 0) - (Number(salesDashboardData?.totalWithdrawnAmount) || 0)}</p>
                                        <p className="text-green-600 font-medium">Available Balance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div>
                        <TopProductListTable title="Top-Selling Products" topSellingProducts={salesDashboardData?.topSellingProducts} />
                    </div>

                    <div className="bg-white px-8 py-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
                                <FiGrid size={20} />
                            </span>
                            <p className="text-2xl font-bold">Top Categories</p>
                        </div>

                        <DoughnutChart totalProducts={salesDashboardData?.categoryStatistics?.totalProducts} totalCategories={salesDashboardData?.categoryStatistics?.totalCategories} topCategories={salesDashboardData?.topCategories} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default SalesDashboard