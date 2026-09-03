import Image from "next/image";
import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from "react-icons/fa";
import { FiHeart, FiShoppingCart, FiShoppingBag } from "react-icons/fi";
import useWishlist from "../../../hooks/useWishlist";
import Link from "next/link";
import { Product } from "../../../interface/product.interface";
import useCart from "../../../hooks/useCart";
import { useRouter } from "next/navigation";
import { finalPrice, formatImageUrl } from "../../../utils/product-utils";
import ProductSizePickerModal from "../../modals/ProductSizePickerModal";
import { isProductOutOfStock, getProductSizes } from "../../../utils/stock-utils";

interface Props {
    product: Product;
    rating?: number;
    handleAddToCart?: (e: React.MouseEvent, productItem: Product) => void;
    handleBuyNow?: (e: React.MouseEvent) => void;
}

const ProductCardTwo: React.FC<Props> = ({ product }) => {
    const { name, mainCategoryName, price, featuredImage, rating, discountType, discountAmount } = product;
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart, isInCart } = useCart();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"addToCart" | "buyNow">("addToCart");

    const isOutOfStock = isProductOutOfStock(product);

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`star-${i}`} className="text-amber-400" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half-star" className="text-amber-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="text-amber-200" />);
        }

        return stars;
    };

    const calculatedPrice = finalPrice({
        price: Number(price) || 0,
        discountType: discountType,
        discountAmount: discountAmount ?? 0,
    });

    const original = Number(price) || 0;
    const hasDiscount = calculatedPrice < original;

    const rawSecondImage =
        product.productImages && product.productImages.length > 0
            ? product.productImages[0].imageUrl !== featuredImage
                ? product.productImages[0].imageUrl
                : product.productImages[1]?.imageUrl
            : null;

    const formattedFeaturedImage = formatImageUrl(featuredImage);
    const formattedSecondImage = rawSecondImage ? formatImageUrl(rawSecondImage) : null;

    const openModal = (e: React.MouseEvent, type: "addToCart" | "buyNow") => {
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
            <div className="group rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden w-full h-[350px] sm:h-[375px] md:h-[450px] lg:h-[480px] bg-white flex flex-col border border-neutral-100 hover:border-neutral-200">
                <figure className="relative h-[210px] min-h-[210px] max-h-[210px] sm:h-[235px] sm:min-h-[235px] sm:max-h-[235px] md:h-[300px] md:min-h-[300px] md:max-h-[300px] lg:h-[330px] lg:min-h-[330px] lg:max-h-[330px] w-full overflow-hidden bg-neutral-50 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
                    <Link href={`/product/${product.slug || product.id || (product as any)._id || ''}`} className="block w-full h-full rounded-t-xl sm:rounded-t-2xl">
                        <Image
                            src={formattedFeaturedImage}
                            alt={name}
                            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 rounded-t-xl sm:rounded-t-2xl ${formattedSecondImage ? "opacity-100 group-hover:opacity-0" : ""}`}
                            width={500}
                            height={500}
                        />
                        {formattedSecondImage && (
                            <Image
                                src={formattedSecondImage}
                                alt={`${name} hover`}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105 rounded-t-xl sm:rounded-t-2xl"
                                width={500}
                                height={500}
                            />
                        )}
                    </Link>

                    {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                            {discountType === "PERCENT" ? `${discountAmount}% OFF` : `-$${discountAmount}`}
                        </div>
                    )}

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
                            <FiHeart className="text-neutral-700" size={16} />
                        )}
                    </button>
                </figure>

                <div className="flex-1 p-2.5 sm:p-4 bg-white relative -mt-6 rounded-t-[24px] flex flex-col justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
                    <div className="hidden md:block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-0.5">
                        {mainCategoryName || "Clothing"}
                    </div>

                    <h2 className="text-sm font-semibold text-neutral-800 hover:text-[var(--color-green-primary)] transition-colors duration-200 line-clamp-2 min-h-[36px] mb-1 leading-snug">
                        <Link href={`/product/${product.slug || product.id || (product as any)._id || ''}`}>{name}</Link>
                    </h2>

                    <div className="flex items-baseline gap-2 mb-1">
                        {hasDiscount ? (
                            <>
                                <span className="text-base font-bold text-neutral-900">${calculatedPrice.toFixed(2)}</span>
                                <span className="text-xs text-neutral-400 line-through">${original.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-base font-bold text-neutral-900">${original.toFixed(2)}</span>
                        )}
                    </div>

                    {rating && rating > 0 ? (
                        <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center text-[10px] gap-0.5">{renderStars(rating)}</div>
                            <span className="text-[11px] text-neutral-500 font-medium ml-0.5">({rating.toFixed(1)})</span>
                        </div>
                    ) : (
                        <div className="h-3 mb-3" />
                    )}

                    {/* Action Buttons */}
                    <div className="mt-0.5 pt-1.5 border-t border-[var(--color-green-primary)]/30 flex items-center gap-1.5 sm:gap-2">
                        {isOutOfStock ? (
                            <button
                                disabled
                                className="w-full py-2 bg-red-100 border border-red-300 text-red-600 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                Out of Stock
                            </button>
                        ) : (
                            <>
                                <button
                                    title="Add to Cart"
                                    aria-label="Add to Cart"
                                    className="w-10 sm:w-1/2 py-2 px-1 sm:px-2 border border-neutral-200 text-neutral-700 text-[11px] sm:text-xs font-semibold rounded-md sm:rounded-lg hover:border-[var(--color-green-primary)] hover:text-[var(--color-green-primary)] hover:bg-neutral-50/50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs flex-shrink-0 sm:flex-shrink"
                                    onClick={(e) => openModal(e, "addToCart")}
                                >
                                    <span className="hidden sm:inline">Add to Cart</span>
                                    <FiShoppingCart className="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                </button>
                                <button
                                    className="flex-1 sm:w-1/2 py-2 px-2 bg-[var(--color-green-primary)] text-white text-[11px] sm:text-xs font-semibold rounded-md sm:rounded-lg hover:bg-[#1D7693] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs hover:shadow-md whitespace-nowrap overflow-hidden"
                                    onClick={(e) => openModal(e, "buyNow")}
                                >
                                    <span>Buy Now</span>
                                    <FiShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

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

export default ProductCardTwo;
