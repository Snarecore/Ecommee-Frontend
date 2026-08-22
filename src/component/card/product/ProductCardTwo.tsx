import Image from "next/image";
import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from "react-icons/fa";
import { FiHeart, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import useWishlist from "../../../hooks/useWishlist";
import Link from "next/link";
import { Product } from "../../../interface/product.interface";
import useCart from "../../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { finalPrice } from "../../../utils/product-utils";
import ProductSizePickerModal from "../../modals/ProductSizePickerModal";

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
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"addToCart" | "buyNow">("addToCart");

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

    const secondImage =
        product.productImages && product.productImages.length > 0
            ? product.productImages[0].imageUrl !== featuredImage
                ? product.productImages[0].imageUrl
                : product.productImages[1]?.imageUrl
            : null;

    const openModal = (e: React.MouseEvent, type: "addToCart" | "buyNow") => {
        e.preventDefault();
        e.stopPropagation();
        if (type === "buyNow" && isInCart(product)) {
            navigate("/cart");
            return;
        }
        setActionType(type);
        setModalOpen(true);
    };

    const handleModalConfirm = (p: Product) => {
        if (actionType === "addToCart") {
            addToCart(p);
        } else {
            addToCart(p);
            navigate("/cart");
        }
    };

    return (
        <>
            <div className="group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-[480px] bg-white flex flex-col border border-neutral-100 hover:border-neutral-200">
                <figure className="relative h-[300px] w-full overflow-hidden bg-neutral-50 rounded-t-2xl">
                    <Link href={`/product/${product.slug || product.id || (product as any)._id || ''}`} className="block w-full h-full rounded-t-2xl">
                        <Image
                            src={featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                            alt={name}
                            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 rounded-t-2xl ${secondImage ? "opacity-100 group-hover:opacity-0" : ""}`}
                            width={500}
                            height={500}
                        />
                        {secondImage && (
                            <Image
                                src={secondImage}
                                alt={`${name} hover`}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105 rounded-t-2xl"
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

                <div className="flex-1 p-4 bg-white relative -mt-6 rounded-t-[24px] flex flex-col shadow-[0_-8px_20px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
                    <div className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-0.5">
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

                    <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                        <button
                            className="w-1/2 py-2 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl hover:border-[var(--color-green-primary)] hover:text-[var(--color-green-primary)] hover:bg-neutral-50/50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            onClick={(e) => openModal(e, "addToCart")}
                        >
                            <FiShoppingCart className="w-3.5 h-3.5" />
                            Add
                        </button>
                        <button
                            className="w-1/2 py-2 bg-[var(--color-green-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[#428146] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                            onClick={(e) => openModal(e, "buyNow")}
                        >
                            Buy Now
                            <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
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
