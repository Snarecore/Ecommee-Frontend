import Image from "next/image";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import useWishlist from "../../../hooks/useWishlist";
import Link from "next/link";
import { Product } from "../../../interface/product.interface";
import useCart from "../../../hooks/useCart";
import { useRouter } from "next/navigation";
import { finalPrice } from "../../../utils/product-utils";
import ProductSizePickerModal from "../../modals/ProductSizePickerModal";
import { isProductOutOfStock, getProductSizes } from "../../../utils/stock-utils";

interface Props {
    product: Product;
    rating?: number;
    handleAddToCart?: (e: React.MouseEvent, product: Product) => void;
    handleBuyNow?: (e: React.MouseEvent) => void;
}

const ProductCardOne: React.FC<Props> = ({ product }) => {
    const router = useRouter();
    const {
        name,
        mainCategoryName,
        price,
        featuredImage,
        discountType,
        discountAmount,
    } = product;

    const {
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
    } = useWishlist();

    const { addToCart, isInCart } = useCart();

    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"addToCart" | "buyNow">(
        "addToCart"
    );

    const isOutOfStock = isProductOutOfStock(product);

    const calculatedPrice = finalPrice({
        price: Number(price) || 0,
        discountType: discountType,
        discountAmount: discountAmount ?? 0,
    });

    const original = Number(price) || 0;
    const hasDiscount = calculatedPrice < original;

    const secondImage =
        product.productImages && product.productImages.length > 0
            ? product.productImages[0].imageUrl !== featuredImage
                ? product.productImages[0].imageUrl
                : product.productImages[1]?.imageUrl
            : null;

    const openModal = (
        e: React.MouseEvent,
        type: "addToCart" | "buyNow"
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        const sizes = getProductSizes(product);
        if (sizes.length === 0) {
            addToCart(product, 1);
            if (type === "buyNow") {
                router.push("/checkout");
            }
            return;
        }

        if (type === "buyNow" && isInCart(product)) {
            router.push("/checkout");
            return;
        }

        setActionType(type);
        setModalOpen(true);
    };

    const handleModalConfirm = (p: Product, size?: string) => {
        if (actionType === "addToCart") {
            addToCart(p, 1, size);
        } else {
            addToCart(p, 1, size);
            router.push("/checkout");
        }
    };

    return (
        <>
            <div className="group rounded-xl sm:rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:border-neutral-300 overflow-hidden w-full flex flex-col h-[345px] sm:h-[370px] md:h-[455px] lg:h-[485px]">

                {/* Product Image */}
                <figure className="relative h-[230px] min-h-[230px] max-h-[230px] sm:h-[250px] sm:min-h-[250px] sm:max-h-[250px] md:h-[300px] md:min-h-[300px] md:max-h-[300px] lg:h-[330px] lg:min-h-[330px] lg:max-h-[330px] w-full overflow-hidden bg-neutral-50 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
                    <Link
                        href={`/product/${product.slug || product.id || (product as any)._id || ''}`}
                        className="block w-full h-full rounded-t-xl sm:rounded-t-2xl"
                    >
                        <Image
                            src={
                                featuredImage ||
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                            }
                            alt={name}
                            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 rounded-t-xl sm:rounded-t-2xl ${
                                secondImage
                                    ? "opacity-100 group-hover:opacity-0"
                                    : ""
                            }`}
                            width={500}
                            height={500}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            quality={80}
                            priority={false}
                        />

                        {secondImage && (
                            <Image
                                src={secondImage}
                                alt={`${name} hover`}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105 rounded-t-xl sm:rounded-t-2xl"
                                width={500}
                                height={500}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                quality={80}
                                loading="lazy"
                            />
                        )}
                    </Link>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                            {discountType === "PERCENT"
                                ? `${discountAmount}% OFF`
                                : `-$${discountAmount}`}
                        </div>
                    )}

                    {/* Wishlist */}
                    <button
                        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-neutral-600 shadow-sm transition-all duration-300 hover:bg-white hover:text-red-500 hover:scale-110 cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (isInWishlist(product)) {
                                removeFromWishlist(product);
                            } else {
                                addToWishlist(product);
                            }
                        }}
                    >
                        {isInWishlist(product) ? (
                            <FaHeart className="text-red-500 fill-current" />
                        ) : (
                            <FiHeart
                                className="text-neutral-700"
                                size={16}
                            />
                        )}
                    </button>
                </figure>

                {/* Product Information */}
                <div className="flex-1 p-2.5 sm:p-4 bg-white flex flex-col justify-between">
                    <div>
                        {/* Category */}
                        <div className="hidden md:block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-0.5">
                            {mainCategoryName || "Clothing"}
                        </div>

                        {/* Product Name */}
                        <h2 className="text-xs sm:text-sm font-semibold text-neutral-800 hover:text-[var(--color-green-primary)] transition-colors duration-200 line-clamp-2 mb-1 leading-snug">
                            <Link href={`/product/${product.slug || product.id || (product as any)._id || ''}`}>
                                {name}
                            </Link>
                        </h2>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-1">
                            {hasDiscount ? (
                                <>
                                    <span className="text-sm sm:text-base font-bold text-neutral-900">
                                        ${calculatedPrice.toFixed(2)}
                                    </span>

                                    <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                                        ${original.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm sm:text-base font-bold text-neutral-900">
                                    ${original.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-1 pt-2 border-t border-neutral-100 flex items-center gap-1.5 sm:gap-2">
                        {isOutOfStock ? (
                            <button
                                disabled
                                className="w-full py-2 bg-red-100 border border-red-300 text-red-600 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                Out of Stock
                            </button>
                        ) : (
                            <>
                                {/* Add to Cart */}
                                <button
                                    className="w-1/2 py-2 px-1 sm:px-2 border border-neutral-200 text-neutral-700 text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl hover:border-[var(--color-green-primary)] hover:text-[var(--color-green-primary)] hover:bg-neutral-50/50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs"
                                    onClick={(e) => openModal(e, "addToCart")}
                                >
                                    <FiShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Add</span>
                                </button>

                                {/* Buy Now */}
                                <button
                                    className="w-1/2 py-2 px-1 sm:px-2 bg-[var(--color-green-primary)] text-white text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl hover:bg-[#1D7693] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs hover:shadow-md whitespace-nowrap overflow-hidden"
                                    onClick={(e) => openModal(e, "buyNow")}
                                >
                                    <span>Buy Now</span>
                                    <FiArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Size Picker Modal */}
            <ProductSizePickerModal
                isOpen={modalOpen}
                product={product}
                actionType={actionType}
                onClose={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
            />
        </>
    );
};

export default ProductCardOne;