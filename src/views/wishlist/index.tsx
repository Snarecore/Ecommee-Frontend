import { useEffect } from "react";
import useWishlist from "../../hooks/useWishlist";
import usePagination from "../../hooks/usePagination";
import { FaHeart } from "react-icons/fa";
import Pagination from "../../component/pagination";
import ProductCardTwo from "../../component/card/product/ProductCardTwo";
import { FaAngleRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { Helmet } from "react-helmet-async";

const Wishlist = () => {
    const wishlistLimit = 5;
    const { wishlist } = useWishlist();
    const metaData = useAtomValue(metaDataAtom);
    const wishlistMeta = metaData?.find(item => item.page?.toLowerCase().includes("wishlist"));

    const {
        currentPage,
        getTotalPages,
        handlePageChange,
        startIndex,
        endIndex,
        calculatePageRange
    } = usePagination();

    useEffect(() => {
        calculatePageRange(wishlist.length, wishlistLimit);
    }, [calculatePageRange, wishlist.length]);

    return (
        <>
            <Helmet>
                <title>
                    {(wishlistMeta?.metaTitle || "Wishlist")
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                </title>
                <meta name="description" content={wishlistMeta?.metaDescription} />
                <meta name="keywords" content={wishlistMeta?.metaKeywords} />
            </Helmet>
            <div className="min-h-screen">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-12 animate-fade-in-down">
                        <div>
                            <p className="text-3xl font-bold  text-[var(--color-green-primary)]">My Wishlist</p>
                        </div>
                    </div>
                    {wishlist.length === 0 ? (
                        <div className="text-center p-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaHeart className="text-[var(--color-green-primary)] text-4xl" />
                            </div>
                            <p className="text-2xl font-bold text-[var(--color-green-primary)] mb-2">Your wishlist is empty.</p>
                            <p className="text-[var(--color-green-primary)] max-w-md mx-auto">
                                Explore our products and add your favorites to the wishlist.
                            </p>
                            <div className="mt-6">
                                <Link to={'/shop'} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-green-primary)] bg-white text-[var(--color-green-primary)] text-sm font-medium rounded-full hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <span>Go to Shop</span>
                                    <FaAngleRight />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {wishlist.slice(startIndex, endIndex).map((item) => {
                                    return (
                                        <ProductCardTwo key={item.id} product={item} />
                                    )
                                })}
                            </div>
                            <Pagination
                                pageCount={getTotalPages(wishlist.length, wishlistLimit)}
                                currentPageNumber={currentPage}
                                handlePagination={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
