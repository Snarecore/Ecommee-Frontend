import PageHeader from "../../../../component/card/PageHeader";
import { useAPI } from "../../../../hooks/useApi";
import ReviewTable from "./components/ReviewTable";
import apiConfig from "../../../../config/api.json";
import { productRatingQueryKey } from "../../../../config/query-key";
import { useEffect, useState } from "react";

const Review = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const getProductRatingListApiUrl = () => {
        const apiUrl = `${apiConfig.site.productRatingUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [productRatingQueryKey],
        url: getProductRatingListApiUrl()
    });

    useEffect(() => {    
        fetchData();
    }, [currentPageNumber]);

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Review"
                        headerDescription="Manage your reviews"
                    />
                </div>

                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <ReviewTable
                            //@ts-ignore
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

export default Review;