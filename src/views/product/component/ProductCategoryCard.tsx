import Image from "next/image";
import { FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from "react-icons/fa";
import useWishlist from "../../../hooks/useWishlist";
import Link from "next/link";;
import { Product } from "../../../interface/product.interface";
import useCart from "../../../hooks/useCart";
import { useNavigate } from 'react-router-dom';
import { finalPrice } from "../../../utils/product-utils";

interface Props {
    product: Product;
    rating?: number;
    handleAddToCart?: (e: React.MouseEvent, productItem: any) => void;
    handleBuyNow?: (e: React.MouseEvent) => void;
}

const ProductCategoryCardTwo: React.FC<Props> = ({ product }) => {
    const { name, mainCategoryName, price, featuredImage, rating, discountType, discountAmount } = product;
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart, isInCart } = useCart();
    const navigate = useNavigate();

    const renderStars = (rating: any) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
        }

        return stars;
    };

    const calculatedPrice = finalPrice({
        price: Number(price) || 0,
        discountType: discountType,
        discountAmount: discountAmount ?? 0
    });

    const original = Number(price) || 0;
    const hasDiscount = calculatedPrice < original;

    return (
        <div className="rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full h-[460px] bg-white flex flex-col">
            <figure className="relative h-[250px] w-full overflow-hidden group">
                <Link href={`/product/${product.slug}`}>
                    <Image src={featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={name} className="w-full h-full transform group-hover:scale-110 transition-transform duration-500" width={500} height={500} />
                </Link>
                <button className="absolute top-3 right-3 text-lg text-[var(--color-icon)] bg-[var(--color-white-primary)] backdrop-blur-sm rounded-full shadow-sm p-2.5 transition-all duration-300 cursor-pointer"
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
                    {isInWishlist(product) ? <FaHeart /> : <FaRegHeart />}
                </button>
            </figure>
            <div className="flex-1 p-5 bg-gray-50 relative -mt-6 rounded-t-[32px] flex flex-col">
                <div className="h-32">
                    <p className="text-lg font-semibold line-clamp-2 text-[var(--color-green-primary)]">
                        <Link href={`/product/${product.slug}`}>
                            {name}
                        </Link>
                    </p>
                    <div className="text-sm text-[var(--color-green-primary)] line-clamp-2 mb-2">
                        {mainCategoryName}
                    </div>
                    <p className="mb-1">
                        {hasDiscount ? (
                            <>
                                <span className="mr-2 line-through text-gray-400">
                                    ${original.toFixed(2)}
                                </span>
                                <span className="text-[var(--color-green-primary)] text-lg font-bold">
                                    ${calculatedPrice.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-[var(--color-green-primary)] text-lg font-bold">
                                ${original.toFixed(2)}
                            </span>
                        )}
                    </p>
                    <div className="flex items-center gap-1">
                        {renderStars(rating)}
                        <span className="text-sm text-[var(--color-green-primary)] ml-1">({rating})</span>
                    </div>
                </div>
                <div className="pt-10 border-gray-200 flex flex-wrap gap-2">
                    <button className="w-full px-4 py-2 border border-[var(--color-green-primary)] bg-[var(--color-white-primary)] text-[var(--color-green-primary)] text-sm font-medium rounded-full cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                    >
                        Add to Cart
                    </button>
                    <button className="w-full px-4 py-2 text-[var(--color-white-primary)] bg-[var(--color-green-primary)] text-sm font-medium rounded-full cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isInCart(product)) {
                                navigate('/cart');
                            } else {
                                addToCart(product);
                                navigate('/cart');
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
