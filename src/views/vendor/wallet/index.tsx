import OverViewCard from "../../../component/card/OverViewCard";
import { useAPI } from "../../../hooks/useApi";
import { FaMoneyBillWave, FaMoneyCheck, FaWallet } from "react-icons/fa6";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import WalletTable from "./component/WalletTable";
import apiConfig from "../../../config/api.json"
import { vendorPaymentQueryKey } from "../../../config/query-key";
import { Role } from "../../../enum/role.enum";

interface statisticsDataProps {
    totalNetProfit: string;
    totalWithdrawnAmount: string;
    lastPaidWithdrawal: {
        amount: string;
    }
}

const Wallet = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery, fetchData } = useAPI();

    const getWalletListApiUrl = () => {
        const apiUrl = `${apiConfig.dashboard.vendorPaymentHistoryUrl}?role=${Role.VENDOR}&page=${currentPageNumber}&limit=${dataLimit}`;
        return apiUrl;
    }

    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        setCurrentPageNumber(selectedPage);
    };

    const {
        data: dataList,
        refetch: fetchWalletData,
        pageCount,
        isFetching,
        isLoading
    } = usePaginatedQuery({
        queryKey: [vendorPaymentQueryKey],
        url: getWalletListApiUrl()
    });

    useEffect(() => {
        fetchWalletData();
    }, [currentPageNumber]);

    const [statisticsData, setStatisticsData] = useState<statisticsDataProps>();

    const fetchStatisticsData = async () => {
        try {
            const response = await fetchData({
                apiUrl: `${apiConfig.dashboard.vendorStatsticsUrl}`
            });
            if (response) {
                setStatisticsData(response);
            }
        } catch (error) {
            console.error(error)
        }
    };

    useEffect(() => {
        fetchStatisticsData();
    }, []);

    const availabeBalance = (Number(statisticsData?.totalNetProfit) || 0) - (Number(statisticsData?.totalWithdrawnAmount) || 0)

    return (
        <div>
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full transition-all ease-in duration-300">
                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${statisticsData?.totalNetProfit ?? 0}`}
                        subTitle="Total Net Profit"
                    >
                        <FaMoneyBillWave size={45} />
                    </OverViewCard>

                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${statisticsData?.totalWithdrawnAmount ?? 0}`}
                        subTitle="Total Withdrawn"
                    >
                        <FaMoneyCheckAlt size={45} />
                    </OverViewCard>

                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${availabeBalance.toFixed(2)}`}
                        subTitle="Available Balance"
                    >
                        <FaWallet size={45} />
                    </OverViewCard>

                    <OverViewCard
                        bgColor="bg-[var(--color-primary)]"
                        title={`$${statisticsData?.lastPaidWithdrawal?.amount ?? 0}`}
                        subTitle="Last Withdrawal"
                    >
                        <FaMoneyCheck size={45} />
                    </OverViewCard>

                </div>

                <WalletTable
                    // @ts-ignore
                    dataList={dataList}
                    fetchWalletData={fetchWalletData}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    pageCount={pageCount}
                    currentPageNumber={currentPageNumber}
                    handlePagination={handlePagination}
                    availabeBalance={availabeBalance}
                />
            </div>
        </div>
    );
};

export default Wallet;
