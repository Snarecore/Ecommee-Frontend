'use client';
import Image from "next/image";
import useCart from "../../hooks/useCart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TbArrowBackUp } from "react-icons/tb";
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
import { finalPrice } from "../../utils/product-utils"; 
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
        console.error("Failed to fetch data:", error);
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
    <div className="py-8 max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto sm:px-2">
        <div className="rounded-2xl p-6 ">
          <p className="text-3xl font-bold pb-4 text-[var(--color-green-primary)]">
            Shopping Cart
          </p>

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
                <div className="flex-1 rounded-lg mt-4 lg:mt-0">
                  <div className="hidden lg:grid grid-cols-12 font-semibold text-lg pb-2 mb-4 px-2">
                    <span className="col-span-8"></span>
                    <span className="col-span-2 text-center text-[var(--color-green-primary)]">
                      Quantity
                    </span>
                    <span className="col-span-2 text-center text-[var(--color-green-primary)]">
                      Subtotal
                    </span>
                  </div>

                  <div className="space-y-4">
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
                          className="flex flex-col md:grid md:grid-cols-12 items-start gap-4 pb-4 shadow-sm"
                        >
                          {/* Product & unit price */}
                          <div className="w-full md:col-span-8 flex flex-row gap-4 sm:gap-8 p-4">
                            <div className="relative">
                              <Image src={item.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={item.name} className="w-20 h-20 object-cover rounded" width={80} height={80} />
                              {isItemOutOfStock && (
                                <span className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1 rounded">Out of Stock</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-green-primary)]">
                                {item.name}
                              </p>
                              {item.selectedSize && (
                                <p className="text-xs text-gray-600 font-semibold mt-0.5">
                                  Size: <span className="text-black">{item.selectedSize}</span>
                                </p>
                              )}
                              {isItemOutOfStock && (
                                <p className="text-xs text-red-600 font-bold mt-1">
                                  Out of Stock! Please remove to proceed.
                                </p>
                              )}

                              {/* Unit price (desktop) */}
                              <p className="text-sm text-[var(--color-green-primary)] font-medium hidden md:block">
                                {hasDiscount ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-2">
                                      ${original.toFixed(2)}
                                    </span>
                                    <span>${unitPrice.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <>${unitPrice.toFixed(2)}</>
                                )}
                              </p>

                              {/* Subtotal (mobile) */}
                              <p className="text-sm font-bold md:hidden">
                                ${lineSubtotal.toFixed(2)}
                              </p>

                              <div className="hidden md:flex gap-8 text-sm mt-4">
                                <button
                                  onClick={() => removeFromCart(item)}
                                  className="text-red-500 hover:underline cursor-pointer font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quantity (desktop) */}
                          <div className="hidden col-span-2 md:flex items-center justify-center place-self-center">
                            <div className="flex border border-[var(--color-green-primary)] rounded overflow-hidden">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="px-3 py-1 hover:bg-gray-100 border-r border-[var(--color-green-primary)] cursor-pointer text-[var(--color-green-primary)]"
                              >
                                -
                              </button>
                              <span className="px-4 py-1 flex items-center justify-center text-[var(--color-green-primary)]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="px-3 py-1 hover:bg-gray-100 border-l border-[var(--color-green-primary)] cursor-pointer text-[var(--color-green-primary)]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Line subtotal (desktop) */}
                          <div className="hidden md:block col-span-2 font-bold place-self-center text-[var(--color-green-primary)]">
                            ${lineSubtotal.toFixed(2)}
                          </div>

                          {/* Quantity + Actions (mobile) */}
                          <div className="md:hidden flex items-center justify-between w-full px-4">
                            <div className="flex border border-gray-200 rounded overflow-hidden">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="px-4 py-2 bg-white hover:bg-gray-100 border-r border-gray-200 text-lg"
                              >
                                -
                              </button>
                              <span className="px-4 py-2 bg-white flex items-center justify-center text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="px-4 py-2 bg-white hover:bg-gray-100 border-l border-gray-200 text-lg"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-8 text-sm">
                              <button
                                onClick={() => removeFromCart(item)}
                                className="text-red-500 hover:underline cursor-pointer font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="py-4 hidden lg:inline-flex">
                    <Link
                      href={"/shop"}
                      className="bg-[var(--color-green-primary)] px-4 py-3 text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <TbArrowBackUp size={20} />
                        Back to Shop
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-1/4 p-4 rounded-lg shadow-md h-fit lg:self-start lg:mt-13">
                  <p className="text-2xl font-bold mb-6 text-[var(--color-green-primary)]">
                    Order Summary
                  </p>

                  <div className="flex justify-between mb-2 font-semibold text-[var(--color-green-primary)]">
                    <span>Subtotal ({cartItems.length})</span>
                    <span className="font-bold">${cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-lg text-[var(--color-green-primary)] pt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${cartSubtotal.toFixed(2)}</span>
                  </div>

                  {(() => {
                    const hasOutOfStock = cartItems.some(
                      (item) => isProductOutOfStock(item) || (item.selectedSize ? isSizeOutOfStock(item, item.selectedSize) : false)
                    );
                    const isDisabled = hasOutOfStock || user?.role === "vendor" || user?.role === "admin";
                    return (
                      <>
                        <button
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              router.push("/checkout");
                            }
                          }}
                          className={`mt-10 block text-center w-full font-bold py-3 rounded-3xl transition-all duration-300 ${
                            isDisabled
                              ? "bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed"
                              : "bg-[var(--color-green-primary)] text-white hover:opacity-95 cursor-pointer shadow-md"
                          }`}
                        >
                          {hasOutOfStock ? "Remove Out of Stock Items" : "Proceed to Checkout"}
                        </button>
                        {hasOutOfStock && (
                          <p className="text-xs text-red-600 font-bold text-center mt-2">
                            Some items in your cart are Out of Stock. Please remove them to proceed.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="py-4 inline-flex lg:hidden">
                <Link
                  href={"/shop"}
                  className="bg-[var(--color-green-primary)] px-4 py-3 text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <TbArrowBackUp size={20} />
                    Back to Shop
                  </div>
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
          <div className="mt-10 mb-4 px-4 flex items-center justify-between">
            <p className="text-4xl font-bold text-[var(--color-green-primary)] uppercase">
              Product You May Also Like
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="hover:bg-[var(--color-green-primary)] text-[var(--color-green-primary)] hover:text-white border border-[var(--color-green-primary)] px-8 py-2 rounded-full cursor-pointer transition-all ease-in-out duration-300"
            >
              See More
            </button>
          </div>

          <div className="mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 p-4">
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
