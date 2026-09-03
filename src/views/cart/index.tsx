'use client';
import Image from "next/image";
import useCart from "../../hooks/useCart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TbArrowBackUp } from "react-icons/tb";
import { FiTrash2, FiArrowRight } from "react-icons/fi";
import { useAPI } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import apiConfig from "../../config/api.json";
import ProductCardTwo from "../../component/card/product/ProductCardTwo";
import EmptyComponent from "../../component/empty-component";
import ProductCardSkeletonOne from "../../component/skeleton/ProductCardSkeletonOne";
import { FaAngleRight } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi";
import StripeCheckout from "../../component/payment/StripeCheckout";
import Modal from "../../component/modals/Modal";
import { useAtomValue } from "jotai";
import { userAtom } from "../../store/user-store";
import { metaDataAtom } from "../../store/global-store";

// 👇 Adjust this import path to wherever your helper lives
import { finalPrice, formatImageUrl } from "../../utils/product-utils"; 
import { isProductOutOfStock, isSizeOutOfStock } from "../../utils/stock-utils";

const MyCart = () => {
  const { fetchData } = useAPI();
  const router = useRouter();
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const user = useAtomValue(userAtom);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const metaData = useAtomValue(metaDataAtom);
  const cartMeta = metaData?.find((item) =>
    item.page?.toLowerCase().includes("cart")
  );

  useEffect(() => {
    const fetchCartPageData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchData({ apiUrl: `${apiConfig.site.cartPageUrl}` });
        setResponse(res.recommendedProducts);
      } catch (error) {
        // console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartPageData();
  }, []);

  // ---- Discount-aware subtotal for the whole cart ----
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const unit = finalPrice({
      price: Number(item.price) || 0,
      discountType: item.discountType,        // "NONE" | "PERCENT" | "FLAT"
      discountAmount: item.discountAmount ?? 0,
    });
    return sum + unit * (item.quantity ?? 1);
  }, 0);

  return (
    <div className="py-2 sm:py-8 max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto sm:px-2">
        <div className="rounded-2xl px-2 sm:px-4 py-2 sm:py-6">
          <h1 className="text-xl sm:text-3xl font-bold pb-2 sm:pb-4 text-[var(--color-green-primary)]">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center p-16 rounded-2xl">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineShoppingBag className="text-[var(--color-green-primary)] text-4xl" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-green-primary)] mb-2">
                Your cart is empty.
              </p>
              <p className="text-[var(--color-green-primary)] max-w-md mx-auto">
                Explore our products and add your favorites to the cart.
              </p>
              <div className="mt-6">
                <Link
                  href={"/shop"}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-green-primary)] bg-white text-[var(--color-green-primary)] text-sm font-medium rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span>Go to Shop</span>
                  <FaAngleRight />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Cart List */}
                <div className="flex-1 rounded-lg mt-2 lg:mt-0">
                  <div className="hidden lg:grid grid-cols-12 font-semibold text-sm text-neutral-400 uppercase tracking-wider pb-3 mb-2 px-3 border-b border-neutral-100">
                    <span className="col-span-6">Product Details</span>
                    <span className="col-span-2 text-center">Price</span>
                    <span className="col-span-2 text-center">Quantity</span>
                    <span className="col-span-2 text-center">Subtotal</span>
                  </div>

                  <div className="space-y-3.5">
                    {cartItems.map((item) => {
                      const original = Number(item.price) || 0;
                      const unitPrice = finalPrice({
                        price: original,
                        discountType: item.discountType,
                        discountAmount: item.discountAmount ?? 0,
                      });
                      const hasDiscount = unitPrice < original;
                      const lineSubtotal = unitPrice * (item.quantity ?? 1);
                      const isItemOutOfStock = isProductOutOfStock(item) || (item.selectedSize ? isSizeOutOfStock(item, item.selectedSize) : false);

                      return (
                        <div
                          key={item.id + (item.selectedSize || "")}
                          className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 sm:gap-4 transition-all duration-200 hover:border-neutral-300"
                        >
                          {/* Product Details */}
                          <div className="w-full md:col-span-6 flex flex-row items-center gap-3 sm:gap-4">
                            <div className="relative flex-shrink-0">
                              <Image
                                src={formatImageUrl(item.featuredImage)}
                                alt={item.name}
                                className="w-20 h-20 sm:w-22 sm:h-22 object-cover rounded-xl border border-neutral-100 shadow-xs"
                                width={88}
                                height={88}
                              />
                              {isItemOutOfStock && (
                                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                                  Out of Stock
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-neutral-800 line-clamp-2 leading-snug">
                                {item.name}
                              </h3>

                              {item.selectedSize && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center text-xs bg-neutral-100 text-neutral-600 font-medium px-2 py-0.5 rounded-md">
                                    Size: {item.selectedSize}
                                  </span>
                                </div>
                              )}

                              {isItemOutOfStock && (
                                <p className="text-xs text-red-600 font-bold mt-1">
                                  Out of Stock! Please remove to proceed.
                                </p>
                              )}

                              {/* Mobile Price */}
                              <div className="mt-1.5 flex items-baseline gap-2 md:hidden">
                                <span className="text-base font-bold text-neutral-900">
                                  ${lineSubtotal.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-neutral-400 line-through">
                                    ${(original * (item.quantity ?? 1)).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Unit Price (Desktop) */}
                          <div className="hidden md:block col-span-2 text-center text-sm font-semibold text-neutral-700">
                            {hasDiscount ? (
                              <div className="flex flex-col items-center">
                                <span className="text-base font-bold text-neutral-900">${unitPrice.toFixed(2)}</span>
                                <span className="text-xs text-neutral-400 line-through">${original.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-base font-bold text-neutral-900">${unitPrice.toFixed(2)}</span>
                            )}
                          </div>

                          {/* Quantity Controls (Both Mobile & Desktop) */}
                          <div className="w-full md:col-span-2 flex items-center justify-between md:justify-center pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50 shadow-xs">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="px-3 py-1.5 hover:bg-neutral-200/60 active:scale-95 text-neutral-700 font-bold text-sm transition-all cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3.5 py-1.5 font-bold text-neutral-900 text-sm min-w-[32px] text-center bg-white border-x border-neutral-200/80">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="px-3 py-1.5 hover:bg-neutral-200/60 active:scale-95 text-neutral-700 font-bold text-sm transition-all cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Delete Button (Mobile) */}
                            <button
                              onClick={() => removeFromCart(item)}
                              className="md:hidden flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>

                          {/* Line Subtotal (Desktop) & Delete */}
                          <div className="hidden md:flex col-span-2 flex-col items-center justify-center gap-1">
                            <span className="font-bold text-base text-[var(--color-green-primary)]">
                              ${lineSubtotal.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold hover:underline cursor-pointer transition-colors"
                            >
                              <FiTrash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="py-4 hidden lg:inline-flex">
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <TbArrowBackUp className="w-4 h-4 text-neutral-500" />
                      <span>Back to Shop</span>
                    </Link>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-4/12 xl:w-3/12 p-4 sm:p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-xs h-fit lg:self-start">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 pb-3 mb-4 border-b border-neutral-100">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-sm text-neutral-600 mb-4">
                    <div className="flex justify-between items-center">
                      <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                      <span className="font-semibold text-neutral-900">${cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base sm:text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-100">
                    <span>Total</span>
                    <span className="text-[var(--color-green-primary)] text-lg sm:text-xl font-bold">${cartSubtotal.toFixed(2)}</span>
                  </div>

                  {(() => {
                    const outOfStockItems = cartItems.filter(
                      (item) => isProductOutOfStock(item) || (item.selectedSize ? isSizeOutOfStock(item, item.selectedSize) : false)
                    );
                    const hasOutOfStock = outOfStockItems.length > 0;
                    const isDisabled = cartItems.length === 0 || hasOutOfStock;
                    return (
                      <>
                        <button
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            if (!user) {
                              setShowLoginRequiredModal(true);
                              return;
                            }
                            router.push("/checkout");
                          }}
                          className={`mt-6 w-full py-3.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                            isDisabled
                              ? "bg-gray-200 text-gray-400 opacity-80 cursor-not-allowed shadow-none"
                              : "bg-[var(--color-green-primary)] text-white hover:bg-[#1D7693] active:scale-[0.99] cursor-pointer"
                          }`}
                        >
                          <span>Proceed to Checkout</span>
                          <FiArrowRight className="w-4 h-4" />
                        </button>
                        {hasOutOfStock && (
                          <div className="mt-4 space-y-2 p-3 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-xs text-red-600 font-bold text-center">
                              ⚠ Some items in your cart are Out of Stock. Please remove them to proceed.
                            </p>
                            <button
                              onClick={() => {
                                outOfStockItems.forEach((item) => removeFromCart(item));
                              }}
                              className="w-full text-xs bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition cursor-pointer shadow-xs"
                            >
                              Remove {outOfStockItems.length} Out-of-Stock Item{outOfStockItems.length > 1 ? "s" : ""}
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="py-3 flex lg:hidden">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <TbArrowBackUp className="w-4 h-4 text-neutral-500" />
                  <span>Back to Shop</span>
                </Link>
              </div>

              {/* Payment Modal */}
              <Modal
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                title="Complete Your Payment"
              >
                <StripeCheckout
                  products={cartItems}
                  onSuccess={() => {
                    clearCart();
                    setShowPaymentForm(false);
                    router.push("/success");
                  }}
                />
              </Modal>

              {/* Login Required Modal */}
              <Modal
                isOpen={showLoginRequiredModal}
                onClose={() => setShowLoginRequiredModal(false)}
                title=""
              >
                <div className="text-center space-y-6">
                  <p className="text-[var(--color-green-primary)] font-medium">
                    You must be logged in to proceed to checkout.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-[var(--color-green-primary)] text-white px-6 py-2 rounded-full font-semibold"
                  >
                    Go to Login
                  </Link>
                </div>
              </Modal>
            </>
          )}
        </div>

        {/* Recommended Products */}
        <div>
          <div className="mt-8 sm:mt-12 mb-2 sm:mb-4 px-2 sm:px-4 flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-green-primary)] uppercase tracking-tight">
              Product You May Also Like
            </h2>
            <button
              onClick={() => router.push("/shop")}
              className="hover:bg-[var(--color-green-primary)] text-[var(--color-green-primary)] text-xs sm:text-sm font-semibold hover:text-white border border-[var(--color-green-primary)] px-3 sm:px-6 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all ease-in-out duration-300 whitespace-nowrap flex-shrink-0"
            >
              See More
            </button>
          </div>

          <div className="mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 py-2">
              {isLoading ? (
                <ProductCardSkeletonOne />
              ) : response?.length > 0 ? (
                <>
                  {response.map((product: any) => (
                    <div key={product.id}>
                      <ProductCardTwo product={product} />
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-full">
                  <EmptyComponent message="Currently there are no products available." />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default MyCart;
