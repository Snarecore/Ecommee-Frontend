import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import apiConfig from "../../../../config/api.json";
import { productQueryKey } from "../../../../config/query-key";
import { useEffect, useState } from "react";
import PageHeader from "../../../../component/card/PageHeader";
import Button from "../../../../component/buttons/ButtonStyleOne";
import { useAPI } from "../../../../hooks/useApi";
import ProductsTable from "./components/ProductTable";

const Products = () => {
	const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const navigate = useNavigate();
	const { usePaginatedQuery } = useAPI();
	const [editData, setEditData] = useState<any | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const storedUser = typeof window !== 'undefined' ? sessionStorage.getItem("user") : null;
	//@ts-ignore
	const user = storedUser ? JSON.parse(storedUser) : {};
	const [searchQuery, setSearchQuery] = useState("");
	const [tempSearch, setTempSearch] = useState("");

	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchQuery(tempSearch);
			setCurrentPageNumber(1)
		}, 500);

		return () => clearTimeout(handler);
	}, [tempSearch]);

	const [selectedFilters, setSelectedFilters] = useState<{
		mainCategoryId: { label: string; value: string } | null;
		isApprove: {label: string, value: string} | null;
	}>({
		mainCategoryId: null,
		isApprove: null
	});

	const getProductListApiUrl = () => {
		const queryParams = new URLSearchParams({
			page: currentPageNumber.toString(),
			limit: dataLimit.toString(),
			...(searchQuery && {searchKeyword: searchQuery}),
			...(selectedFilters.mainCategoryId?.value && {mainCategoryId: selectedFilters.mainCategoryId.value}),
			...(selectedFilters.isApprove?.value && { isApprove: selectedFilters.isApprove.value })
		});
		return `${apiConfig.vendor.productListUrl}?${queryParams.toString()}`;
		
	}

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const { data: dataList, isLoading, pageCount, isFetching, refetch: fetchProductList } = usePaginatedQuery({
		queryKey: [
			productQueryKey,
			searchQuery,
			selectedFilters.mainCategoryId?.value || "",
			selectedFilters.isApprove?.value || "",
			currentPageNumber.toString()
		],
		url: getProductListApiUrl()
	});

	useEffect(() => {
		fetchProductList();
	}, [currentPageNumber, searchQuery, selectedFilters]);
	

	const handleEdit = (product?: any) => {
		setEditData(product || null);
		setIsEditOpen(true);
	};

	return (
		<>
			<div className="flex flex-col gap-8">
				{!isEditOpen && (
					<div className="flex items-center justify-between flex-wrap">
						<PageHeader
							headerTitle="Product List"
							headerDescription="Manage your products"
						/>
						<Button label="Add Product" onClick={() => navigate("/create-product")} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
					</div>
				)}

				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						{isEditOpen ? (
							// @ts-ignore
							<ProductCreation editData={editData} />
						) : (
							<ProductsTable
							// @ts-ignore
								dataList={dataList}
								fetchProductList={fetchProductList}
								pageCount={pageCount}
								currentPageNumber={currentPageNumber}
								setCurrentPageNumber={setCurrentPageNumber}
								handlePagination={handlePagination}
								isLoading={isLoading}
								isFetching={isFetching}
								searchQuery={tempSearch}
								setSearchQuery={setTempSearch}
								selectedFilters={selectedFilters}
								setSelectedFilters={setSelectedFilters}
								onEdit={handleEdit}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Products;
