import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiEye } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import Link from "next/link";;
import apiConfig from "../../../../../config/api.json";
import { useAPI } from "../../../../../hooks/useApi";
import TableSkeleton from "../../../../../component/skeleton/TableSkeleton";
import Search from "../../../../../component/table-components/Search";
import DropdownFilter from "../../../../../component/table-components/DropdownFilter";
import RefreshButton from "../../../../../component/table-components/RefreshButton";
import Pagination from "../../../../../component/pagination";
import DeleteModal from "../../../../../component/modals/DeleteModal";
import EmptyComponent from "../../../../../component/empty-component";

interface ProductDataProps {
	id: string;
	name: string;
	featuredImage: string;
	sku: string;
	slug: string;
	description: string;
	summary: string;
	videoUrl: string;
	mainCategoryName: string;
	firstCategoryName: string;
	secondCategoryName: string;
	thirdCategoryName: string;
	price: number;
	cost: number;
	discount: number;
	discountType: string;
	vendorName: string;
	isBestSeller: string;
	isRecommended: string;
	isNew: string;
	status: string;
}

interface ProductTableProps {
	dataList: {
		data: ProductDataProps[];
		total: number;
		page: number;
		limit: number;
	};
	fetchProductList: () => void;
	isLoading?: boolean;
	pageCount: number;
	currentPageNumber: number;
	setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
	handlePagination: (paginationData: { selected: number }) => void;
	isFetching?: boolean;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedFilters: {
		mainCategoryId: { label: string; value: string } | null;
		isApprove: { label: string; value: string } | null;
	};
	setSelectedFilters: React.Dispatch<React.SetStateAction<{
		mainCategoryId: { label: string; value: string } | null;
		isApprove: { label: string; value: string } | null;
	}>>;
	onEdit: (data?: ProductDataProps) => void;
}

// @ts-ignore
const ProductsTable = ({ dataList, fetchProductList, pageCount, currentPageNumber, setCurrentPageNumber, handlePagination, isLoading, isFetching, searchQuery, setSearchQuery, selectedFilters, setSelectedFilters, onEdit }: ProductTableProps) => {
	// const [fieldValues, setFieldValues] = useState(initialFieldValues);
	const { handleDeleteAPI, fetchData } = useAPI();
	const apiUrl = apiConfig.vendor.productUrl;
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ProductDataProps | null>(null);
	// @ts-ignore
	const [isBestSeller, setIsBestSeller] = useState(selectedProduct?.isBestSeller || false);
	// @ts-ignore
	const [isRecommended, setIsRecommended] = useState(selectedProduct?.isRecommended || false);
	// @ts-ignore
	const [isNew, setIsNew] = useState(selectedProduct?.isNew || false);
	// @ts-ignore
	const [status, setStatus] = useState(selectedProduct?.status || false);


	// Search and Filter by Category, Vendor
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const [mainCategories, setMainCategories] = useState<{ label: string, value: string }[]>([]);
	const mainCategoryApiUrl = apiConfig.vendor.mainCategoryUrl;
	const fetchMainCategoryData = async () => {
		try {
			const result = await fetchData({ apiUrl: mainCategoryApiUrl });
			setMainCategories(result.mainCategory.map((cat: any) => ({ label: cat.name, value: cat.id })));
		} catch (error) {
			console.error("Failed to fetch main categories:", error);
		}
	};

	useEffect(() => {
		fetchMainCategoryData();
	}, []);


	const dropdownOptions = useMemo(() => {
		return {
			mainCategoryId: mainCategories,
			isApprove: [
				{ label: "Approved", value: "true" },
				{ label: "Pending", value: "false" }
			]
		};
	}, [mainCategories]);

	const handleRefreshButton = () => {
		setSelectedFilters({
			mainCategoryId: null,
			isApprove: null
		});
		setSearchQuery("");
		setCurrentPageNumber(1);
		setOpenDropdown(null);
	};

	const tableHeaders = [
		{ key: "sl", label: "SL" },
		{ key: "name", label: "Product Name" },
		{ key: "sku", label: "SKU" },
		{ key: "price", label: "Price" },
		{ key: "isApprove", label: "Approval" },
		{ key: "status", label: "Status" },
		{ key: "action", label: "Action" },
	];

	const openDeleteModal = (data: ProductDataProps) => {
		setSelectedProduct(data);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setSelectedProduct(null);
	};

	const handleDelete = async () => {
		if (!selectedProduct) return;

		const apiResponse = await handleDeleteAPI({
			url: `${apiUrl}/${selectedProduct.id}`,
			showSuccessMessage: true
		});

		if (apiResponse) {
			fetchProductList();
			closeDeleteModal();
		}
	};

	if (isFetching || isLoading) return <TableSkeleton />;

	return (
		<div className="p-6 bg-white rounded-lg border border-gray-200">
			<div className="flex justify-between flex-wrap space-y-4">
				<Search
					searchQuery={searchQuery}
					onSearchChange={(value) => {
						setSearchQuery(value);
						setCurrentPageNumber(1);
					}}
				/>

				<div className="flex flex-wrap gap-2">
					{(Object.entries(dropdownOptions) as [keyof typeof selectedFilters, any][]).map(([key, options]) => (
						<DropdownFilter
							key={key}
							title={key === "mainCategoryId" ? "Category" : "Approval"}
							options={options}
							selectedOption={selectedFilters[key]}
							isOpen={openDropdown === key}
							onToggle={() => setOpenDropdown(openDropdown === key ? null : key)}
							onSelect={(selected) => {
								setSelectedFilters(prev => ({ ...prev, [key]: selected }));
								setOpenDropdown(null);
							}}
						/>
					))}
					<RefreshButton onClick={handleRefreshButton} />
				</div>

			</div>

			<div className="mt-4 w-full overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[1300px] cursor-pointer">
					<thead className="bg-gray-100">
						<tr className="text-[14px] font-semibold border-b border-gray-200">
							{tableHeaders.map(({ key, label }) => (
								<th key={key} className="px-6 py-4 text-left text-[#000000e0]">
									<span>{label}</span>
								</th>
							))}
						</tr>
					</thead>

					<tbody className="bg-white divide-y divide-gray-200 rounded-lg">
						{/* @ts-ignore */}
						{dataList?.length > 0 ? (
							// @ts-ignore
							dataList.map((data, index) => (
								<tr
									key={data.id}
									className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
								>
									<td className="px-6 py-4 font-medium text-gray-800">
										{index + 1}
									</td>

									<td className="px-6 py-4 flex items-center gap-2">
										<Image src={data.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={data.name} className="w-10 h-10 rounded-md shadow-sm border border-gray-200" width={40} height={40} />
										<span className="">
											{data.name}
										</span>
									</td>

									<td className="px-6 py-4">{data.sku}</td>
									<td className="px-6 py-4">{`$${data.price}`}</td>
									<td className="px-6 py-4">
										<span
											className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.isApprove
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
												}`}
										>
											{data.isApprove ? "Approved" : "Pending"}
										</span>
									</td>
									<td className="px-6 py-4">
										<span
											className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
												}`}
										>
											{data.status ? "Active" : "Inactive"}
										</span>
									</td>

									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<Link href={`/product-details/${data.id}`}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer">
												<FiEye />
											</Link>
											<Link
												href="/edit-product"
												{...({ state: { editData: data } } as any)}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer"
											>
												<FaEdit />
											</Link>
											<button
												onClick={() => openDeleteModal(data)}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer"
											>
												<FiTrash2 />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic">
									<EmptyComponent />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{selectedProduct && (
				<DeleteModal
					isOpen={isDeleteModalOpen}
					title="Confirm Delete"
					message={`Are you sure you want to delete?`}
					onClose={closeDeleteModal}
					onDelete={handleDelete}
				/>
			)}

			{pageCount > 1 && (
				<div className="flex justify-center">
					<Pagination
						pageCount={pageCount}
						currentPageNumber={currentPageNumber}
						handlePagination={handlePagination}
					/>
				</div>
			)}
		</div>
	);
};

export default ProductsTable;
