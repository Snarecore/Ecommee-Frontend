import { useEffect, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { vendorMessageQueryKey } from "../../../../config/query-key";
import PageHeader from "../../../../component/card/PageHeader";
import MessageTable from "./components/Contact-Message-Table";

const Message = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const getMessageListApiUrl = () => {
        const apiUrl = `${apiConfig.vendor.vendorMessageUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [vendorMessageQueryKey],
        url: getMessageListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Message"
                        headerDescription="Manage your messages"
                    />
                </div>

                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                    <MessageTable
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
        </>
    );
};

export default Message;
