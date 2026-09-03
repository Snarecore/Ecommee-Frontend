'use client';

import Pagination from "../../component/pagination";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import Sidebar from "../../component/sidebar";
import { productListQueryKey } from "../../config/query-key";
import EmptyComponent from "../../component/empty-component";
import ProductCardSkeletonTwo from "../../component/skeleton/ProductCardSkeletonTwo";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { metaDataAtom, nestedCategoriesAtom } from "../../store/global-store";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Product } from "../../interface/product.interface";
import { FaSlidersH } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ProductCardOne from "../../component/card/product/ProductCardOne";

export interface ShopPageCmsData {
    id: string;
    bannerImage: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

const Shop = () => {
    const dataLimit = 12;
    const { fetchData, usePaginatedQuery } = useAPI();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const metaData = useAtomValue(metaDataAtom);
    const shopMeta = metaData?.find(item => item.page?.toLowerCase().includes("shop"));

    const searchEntries = searchParams ? Array.from(searchParams.entries()) : [];
    const categoryEntry = searchEntries.find(([key]) => key.endsWith('CategoryId'));
    const categoryKey = categoryEntry?.[0] || '';
    const categoryId = categoryEntry?.[1] || '';
    const currentPageNumber = parseInt(searchParams?.get("pageNumber") || "1");
    const minPrice = searchParams?.get("minPrice") || "";
    const maxPrice = searchParams?.get("maxPrice") || "";
    const inStockOnly = searchParams?.get("inStockOnly") || "";
    const discountOnly = searchParams?.get("discountOnly") || "";
    const sortBy = searchParams?.get("sortBy") || "";

    const getProductListApiUrl = () => {
        let apiUrl = `${apiConfig.site.productListUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
        if (categoryKey && categoryId) {
            apiUrl += `&${categoryKey}=${categoryId}`;
        }
        if (minPrice) apiUrl += `&minPrice=${encodeURIComponent(minPrice)}`;
        if (maxPrice) apiUrl += `&maxPrice=${encodeURIComponent(maxPrice)}`;
        if (inStockOnly) apiUrl += `&inStockOnly=${encodeURIComponent(inStockOnly)}`;
        if (discountOnly) apiUrl += `&discountOnly=${encodeURIComponent(discountOnly)}`;
        if (sortBy) apiUrl += `&sortBy=${encodeURIComponent(sortBy)}`;
        return apiUrl;
    };

    const currentApiUrl = getProductListApiUrl();

    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        const newParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
        newParams.set("pageNumber", selectedPage.toString());
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const {
        data: dataList,
        pageCount,
        isFetching,
        isLoading
    } = usePaginatedQuery<Product>({
        queryKey: [productListQueryKey, currentApiUrl],
        url: currentApiUrl
    });

    const getCategoryBreadcrumb = (categories: any[]): string[] => {
        for (const main of categories) {
            if (main.id === categoryId) return [main.name];
            for (const first of main.firstCategories || []) {
                if (first.id === categoryId) return [main.name, first.name];
                for (const second of first.secondCategories || []) {
                    if (second.id === categoryId) return [main.name, first.name, second.name];
                    for (const third of first.thirdCategories || []) {
                        if (third.id === categoryId) return [main.name, first.name, second.name, third.name];
                    }
                }
            }
        }
        return [];
    };

    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const breadcrumbPath = getCategoryBreadcrumb(nestedCategories);

    const [response, setResponse] = useState<ShopPageCmsData>();
    useEffect(() => {
        const fetchShopPageData = async () => {
            const result = await fetchData({ apiUrl: `${apiConfig.site.shopPageUrl}` });
            setResponse(result?.cmsData);
        };
        fetchShopPageData();
    }, []);

    const findCategoryById = (categories: any[], id: string): any | undefined => {
        for (const category of categories) {
            if (category.id === id) return category;

            const subCategories = category.firstCategories || category.secondCategories || category.thirdCategories;

            if (subCategories) {
                const result = findCategoryById(subCategories, id);
                if (result) return result;
            }
        }
        return undefined;
    };

    const selectedCategory = findCategoryById(nestedCategories, categoryId);
    const categoryBannerImage = selectedCategory?.bannerImage;

    return (
        <div>
                <div className="bg-blue-300 p-4 h-48 flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${categoryBannerImage || response?.bannerImage})` }}>
                    <p className="text-2xl font-semibold text-white">
                        {breadcrumbPath.length > 0 ? breadcrumbPath.join(" → ") : "Shop"}
                    </p>
                </div>
                <div>
                    <div className="flex max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
                        <div className="hidden lg:block self-start py-6">
                            <Sidebar selectedCategoryId={categoryId} />
                        </div>

                        {isMobileSidebarOpen && (
                            <div className="fixed inset-0 bg-[#000000b6] bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
                        )}

                        <div className={`fixed top-0 left-0 h-full w-83 bg-gradient-to-b from-gray-100 to-gray-300 border-l border-gray-300 shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <div className="flex justify-end p-2">
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-600 hover:text-gray-800">
                                    <IoClose size={24} />
                                </button>
                            </div>
                            <Sidebar selectedCategoryId={categoryId} />
                        </div>

                        <main className="px-2 lg:px-6 lg:py-6 w-full">
                            <div className="block lg:hidden p-4 cursor-pointer">
                                <div
                                    className="flex items-center gap-2 border-2 border-[var(--color-green-primary)] px-4 py-2 rounded-full w-28 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                                    onClick={() => setIsMobileSidebarOpen(true)}
                                >
                                    <FaSlidersH className="text-[var(--color-green-primary)] group-hover:scale-110 transition-transform duration-300" />
                                    <p className="font-semibold text-[var(--color-green-primary)] group-hover:font-bold transition-all duration-300">Filter</p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="min-w-svh">
                                    <ProductCardSkeletonTwo />
                                </div>
                            ) : dataList?.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4">
                                        {dataList.map((product) => (
                                            <div key={product.id} className="w-full">
                                                <ProductCardOne product={product} />
                                            </div>
                                        ))}
                                    </div>
                                    {
                                        pageCount > 1 && (
                                            <Pagination
                                                pageCount={pageCount}
                                                currentPageNumber={currentPageNumber}
                                                handlePagination={handlePagination}
                                            />
                                        )
                                    }
                                </>
                            ) : (
                                <EmptyComponent message="Looks like no product is available." />
                            )}
                        </main>
                    </div>
                </div>
            </div>
    );
};

export default Shop;

