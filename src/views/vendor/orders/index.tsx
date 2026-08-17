import { useEffect, useState } from "react";
import OrderTable from "./components/OrderTable";
import apiConfig from "../../../config/api.json";
import { orderQueryKey } from "../../../config/query-key";
import { useAPI } from "../../../hooks/useApi";
import PageHeader from "../../../component/card/PageHeader";

const Orders = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const getOrderListApiUrl = () => {
		const apiUrl = `${apiConfig.vendor.orderListUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
		return apiUrl;
	}

    const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

    const {
        data: dataList,
        refetch: fetchData,
        pageCount,
        isFetching,
        isLoading
    } = usePaginatedQuery({
        queryKey: [orderQueryKey],
        url: getOrderListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);

    return (
        <div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Order List"
                        headerDescription="Manage your orders"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <OrderTable
                        // @ts-ignore
                            dataList={dataList}
                            fetchData={fetchData}
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber} 
                            handlePagination={handlePagination}
                            isLoading={isLoading}
                            isFetching={isFetching}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
