'use client';
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import useWishlist from "../../../hooks/useWishlist";
import Link from "next/link";
import { Product } from "../../../interface/product.interface";
import useCart from "../../../hooks/useCart";
import { useRouter } from "next/navigation";
import { finalPrice } from "../../../utils/product-utils";

interface Props {
    product: Product;
    rating?: number;
    handleAddToCart?: (e: React.MouseEvent, productItem: any) => void;
    handleBuyNow?: (e: React.MouseEvent) => void;
}

const ProductCategoryCardTwo: React.FC<Props> = ({ product }) => {
    const { name, mainCategoryName, price, featuredImage, discountType, discountAmount } = product;
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart, isInCart } = useCart();
    const router = useRouter();

    const calculatedPrice = finalPrice({
        price: Number(price) || 0,
        discountType: discountType,
        discountAmount: discountAmount ?? 0
    });

    const original = Number(price) || 0;
    const hasDiscount = calculatedPrice < original;

    return (
        <div className="rounded-3xl transition-all duration-300 overflow-hidden w-full h-[460px] bg-white flex flex-col border border-neutral-100 hover:border-neutral-200">
            <figure className="relative h-[250px] w-full overflow-hidden bg-neutral-50 group">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <Image 
                        src={featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} 
                        alt={name} 
                        className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" 
                        width={500} 
                        height={500} 
                    />
                </Link>
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
            <div className="flex-1 p-4 bg-neutral-50 relative -mt-6 rounded-t-[32px] flex flex-col shadow-[0_-8px_20px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
                <div className="flex-1 flex flex-col">
                    <div className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-0.5">
                        {mainCategoryName || "Clothing"}
                    </div>

                    <h2 className="text-sm font-semibold text-neutral-800 hover:text-[var(--color-green-primary)] transition-colors duration-200 line-clamp-2 mb-1.5 leading-snug">
                        <Link href={`/product/${product.slug}`}>
                            {name}
                        </Link>
                    </h2>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-1.5">
                            {hasDiscount ? (
                                <>
                                    <span className="text-base font-bold text-neutral-900">
                                        ${calculatedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-neutral-400 line-through">
                                        ${original.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-base font-bold text-neutral-900">
                                    ${original.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-2 border-t border-neutral-200/60 flex items-center gap-2">
                    <button 
                        className="w-1/2 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:border-[var(--color-green-primary)] hover:text-[var(--color-green-primary)] hover:bg-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                    >
                        Add to Cart
                    </button>
                    <button 
                        className="w-1/2 py-2 bg-[var(--color-green-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[#428146] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isInCart(product)) {
                                router.push('/cart');
                            } else {
                                addToCart(product);
                                router.push('/cart');
                            }
                        }}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCategoryCardTwo;
