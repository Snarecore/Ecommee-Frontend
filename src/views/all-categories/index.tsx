import ProductCategory from "../../component/product-category";
import { useState, useEffect } from "react";
import ProductCardTwo from "../../component/card/product/ProductCardTwo";
import Pagination from "../../component/pagination";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import { productListWithHardLimitQueryKey } from "../../config/query-key";
import ProductCardSkeletonOne from "../../component/skeleton/ProductCardSkeletonOne";
import EmptyComponent from "../../component/empty-component";
import { Product } from "../../interface/product.interface";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { Helmet } from "react-helmet-async";

const AllCategories = () => {
	const dataLimit = 10;
	const maxTotal = 50;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery, fetchData: fetchApiData } = useAPI();
	const [contentData, setContentData] = useState<any>(null);
	const metaData = useAtomValue(metaDataAtom);
	const allCategoriesMeta = metaData?.find(item => item.page?.toLowerCase().includes("all categories"));

	useEffect(() => {
		const fetchContentData = async () => {
			const result = await fetchApiData({ apiUrl: `${apiConfig.site.homePageUrl}` });
			setContentData(result?.contentData);
		};
		fetchContentData();
	}, []);

	const getProductListApiUrl = () => {
		const apiUrl = `${apiConfig.site.productListWithHardLimitUrl}?page=${currentPageNumber}&limit=${dataLimit}&maxTotal=${maxTotal}`;
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
	} = usePaginatedQuery<Product>({
		queryKey: [productListWithHardLimitQueryKey],
		url: getProductListApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	return (
		<>
			<Helmet>
				<title>
					{(allCategoriesMeta?.metaTitle || "All Categories")
						.split(" ")
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}
				</title>
				<meta name="description" content={allCategoriesMeta?.metaDescription} />
				<meta name="keywords" content={allCategoriesMeta?.metaKeywords} />
			</Helmet>
			<div className="mb-10">
				<ProductCategory contentData={contentData} />
				<div className="text-center mt-20">
					<p className="text-4xl font-bold text-[var(--color-green-primary)] uppercase">
						Surprises You'll Love
					</p>
					<p className="text-[var(--color-green-primary)] max-w-screen-2xl mx-auto text-lg px-4 mb-4 pb-4">
						Randomly curated items to spark your interest
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 p-4 max-w-screen-2xl mx-auto px-4 py-4 my-4">
					{isLoading || isFetching ? (
						<ProductCardSkeletonOne />
					) : dataList?.length > 0 ? (
						<>
							{dataList.map((product) => (
								<div key={product.id}>
									<ProductCardTwo product={product} />
								</div>
							))}
							<div className="col-span-full">
								<Pagination
									pageCount={pageCount}
									currentPageNumber={currentPageNumber}
									handlePagination={handlePagination}
								/>
							</div>
						</>
					) : (
						<div className="col-span-full">
							<EmptyComponent message="Currently there are no products available." />
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default AllCategories;
