import Image from "next/image";
import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { Product } from "../../interface/product.interface";
import { finalPrice } from "../../utils/product-utils";
import { getProductSizes, isSizeOutOfStock, isProductOutOfStock } from "../../utils/stock-utils";

interface ProductSizePickerModalProps {
    isOpen: boolean;
    product: Product;
    actionType: "addToCart" | "buyNow";
    onClose: () => void;
    onConfirm: (product: Product, size?: string) => void;
}

const ProductSizePickerModal: React.FC<ProductSizePickerModalProps> = ({
    isOpen,
    product,
    actionType,
    onClose,
    onConfirm,
}) => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && product) {
            const availableSizes = getProductSizes(product);
            const firstInStock = availableSizes.find(s => !isSizeOutOfStock(product, s));
            if (firstInStock) {
                setSelectedSize(firstInStock);
            } else if (availableSizes.length > 0) {
                setSelectedSize(availableSizes[0]);
            }
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const { name, featuredImage, price, discountType, discountAmount } = product;

    const calculatedPrice = finalPrice({
        price: Number(price) || 0,
        discountType: discountType,
        discountAmount: discountAmount ?? 0,
    });
    const original = Number(price) || 0;
    const hasDiscount = calculatedPrice < original;

    const availableSizes = getProductSizes(product);
    const productOutOfStock = isProductOutOfStock(product);
    const selectedSizeIsOutOfStock = selectedSize ? isSizeOutOfStock(product, selectedSize) : false;
    const isActionDisabled = !selectedSize || selectedSizeIsOutOfStock || productOutOfStock;

    const handleConfirm = () => {
        if (isActionDisabled || !selectedSize) return;
        onConfirm(product, selectedSize);
        setSelectedSize(null);
        onClose();
    };

    const handleClose = () => {
        setSelectedSize(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
            onClick={handleClose}
        >
            <div
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-neutral-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
                    <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
                        Select Size
                    </h2>
                    <button
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                        <IoClose size={18} />
                    </button>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-4 px-5 py-4">
                    <div className="relative w-[76px] h-[86px] rounded-xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                        <Image
                            src={featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                            alt={name}
                            className="w-full h-full object-cover object-top"
                            width={160}
                            height={180}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">
                            {product.mainCategoryName || "Clothing"}
                        </p>
                        <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug mb-1.5">
                            {name}
                        </h3>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-neutral-900">
                                ${calculatedPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-neutral-400 line-through">
                                    ${original.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Size Picker */}
                <div className="px-5 pb-2">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                        Available Sizes
                    </p>
                    <div className="flex flex-wrap gap-2.5 mb-1">
                        {availableSizes.map((size) => {
                            const sizeOut = isSizeOutOfStock(product, size);
                            const isSelected = selectedSize === size;
                            return (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`relative w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200
                                        ${sizeOut
                                            ? isSelected
                                                ? "border-2 border-red-500 bg-red-50 text-red-600 scale-105 shadow-sm"
                                                : "border-2 border-red-200 bg-red-50/60 text-red-500 hover:border-red-400 cursor-pointer"
                                            : isSelected
                                            ? "bg-neutral-900 text-white border-2 border-neutral-900 scale-105 shadow-md"
                                            : "border-2 border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900 cursor-pointer"
                                        }`}
                                >
                                    <span className={sizeOut ? "line-through opacity-70" : ""}>
                                        {size}
                                    </span>
                                    {sizeOut && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden">
                                            <div className="w-full h-[1.5px] bg-red-400 rotate-45" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {productOutOfStock ? (
                        <p className="text-xs font-bold text-red-600 mt-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-center">
                            This product is currently Out of Stock
                        </p>
                    ) : selectedSizeIsOutOfStock ? (
                        <p className="text-xs font-bold text-red-600 mt-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-center flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                            Size {selectedSize} is Out of Stock
                        </p>
                    ) : !selectedSize ? (
                        <p className="text-[11px] text-neutral-400 mt-1.5">Please select a size to continue.</p>
                    ) : null}
                </div>

                {/* Action Button */}
                <div className="px-5 py-4">
                    <button
                        disabled={isActionDisabled}
                        onClick={handleConfirm}
                        className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
                            ${isActionDisabled
                                ? "bg-red-100 text-red-500 border border-red-200 cursor-not-allowed font-bold"
                                : "bg-[var(--color-green-primary)] text-white hover:bg-[#1D7693] shadow-sm hover:shadow-md cursor-pointer"
                            }`}
                    >
                        {selectedSizeIsOutOfStock || productOutOfStock ? (
                            "Out of Stock"
                        ) : actionType === "addToCart" ? (
                            <>
                                <FiShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </>
                        ) : (
                            <>
                                Buy Now
                                <FiArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductSizePickerModal;
