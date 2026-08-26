'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user-store";
import useCart from "@/hooks/useCart";
import { finalPrice } from "@/utils/product-utils";
import { isProductOutOfStock, isSizeOutOfStock } from "@/utils/stock-utils";
import {
  calculateDeliveryZoneAndFee,
  createOrderInService,
  OrderItem,
  PaymentMethod
} from "@/utils/order-service";
import apiConfig from "@/config/api.json";
import { postData } from "@/services/api-service";
import { getUserToken } from "@/hooks/useApi";
import {
  FaCheckCircle,
  FaTruck,
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaStickyNote,
  FaExclamationTriangle,
  FaShieldAlt,
  FaArrowLeft,
  FaLock
} from "react-icons/fa";
import { showErrorToast, showSuccessToast } from "@/utils/toast-utils";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1F2937",
      fontFamily: "inherit",
      "::placeholder": {
        color: "#9CA3AF"
      }
    },
    invalid: {
      color: "#EF4444",
      iconColor: "#EF4444"
    }
  }
};

const CheckoutView = () => {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const { cartItems, clearCart } = useCart();
  
  const stripe = useStripe();
  const elements = useElements();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if cart is empty or has out-of-stock items (unless order was just submitted)
  useEffect(() => {
    if (!isMounted) return;

    const hasOutOfStock = cartItems.some(
      (item) => isProductOutOfStock(item) || (item.selectedSize ? isSizeOutOfStock(item, item.selectedSize) : false)
    );
    if ((cartItems.length === 0 || hasOutOfStock) && !orderSubmitted) {
      if (hasOutOfStock) {
        showErrorToast("Your cart contains Out of Stock items. Please remove them before checkout.");
      }
      router.push("/cart");
    }
  }, [cartItems, orderSubmitted, router, isMounted]);

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState((user as any)?.phone || "");
  const [address, setAddress] = useState((user as any)?.address || "");
  const [city, setCity] = useState((user as any)?.city || "Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [specialNote, setSpecialNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Sync user info if loaded later
  useEffect(() => {
    if (user) {
      const u = user as any;
      if (u.name && !name) setName(u.name);
      if (u.phone && !phone) setPhone(u.phone);
      if (u.address && !address) setAddress(u.address);
      if (u.city && !city) setCity(u.city);
    }
  }, [user]);

  // Calculate Subtotal with discounts
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const unit = finalPrice({
      price: Number(item.price) || 0,
      discountType: item.discountType,
      discountAmount: item.discountAmount ?? 0
    });
    return sum + unit * (item.quantity ?? 1);
  }, 0);

  // Authoritative delivery zone & fee calculation
  const { deliveryZone, deliveryCharge } = calculateDeliveryZoneAndFee(city);
  const grandTotal = cartSubtotal + deliveryCharge;

  // Handle Form Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!name.trim()) {
      showErrorToast("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      showErrorToast("Please enter your phone number.");
      return;
    }
    if (!address.trim()) {
      showErrorToast("Please enter your delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "Online") {
        if (!stripe || !elements) {
          showErrorToast("Stripe payment gateway is initializing. Please try again in a moment.");
          setIsSubmitting(false);
          return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          showErrorToast("Please enter your credit/debit card details.");
          setIsSubmitting(false);
          return;
        }
      }

      // Convert cart items to OrderItem structure
      const orderItems: OrderItem[] = cartItems.map((item) => {
        const unit = finalPrice({
          price: Number(item.price) || 0,
          discountType: item.discountType,
          discountAmount: item.discountAmount ?? 0
        });
        return {
          id: item.id || `item-${Math.random()}`,
          productId: item.id,
          productName: item.name,
          productImage: item.featuredImage || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60",
          price: unit,
          quantity: item.quantity ?? 1
        };
      });

      const backendProducts = cartItems.map((item) => ({
        product: item.id,
        id: item.id,
        name: item.name || "Product",
        productName: item.name,
        quantity: item.quantity ?? 1,
        price: finalPrice({
          price: Number(item.price) || 0,
          discountType: item.discountType,
          discountAmount: item.discountAmount ?? 0
        })
      }));

      const token = getUserToken();

      // 1. Generate & Confirm Stripe PaymentIntent for Online payments
      let validPaymentIntentId = "COD";
      if (paymentMethod === "Online") {
        const paymentRes: any = await postData({
          url: "payments",
          token,
          body: {
            products: backendProducts,
            currency: "usd"
          }
        });

        const clientSecret = paymentRes?.clientSecret || paymentRes?.data?.clientSecret;
        if (!clientSecret) {
          throw new Error("Failed to initialize payment gateway. Please try again.");
        }

        const cardNumberElement = elements!.getElement(CardNumberElement);
        if (!cardNumberElement) {
          throw new Error("Card details missing. Please enter your card information.");
        }

        const stripeResult = await stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: name.trim() || "Customer"
            }
          }
        });

        if (stripeResult.error) {
          throw new Error(stripeResult.error.message || "Card payment confirmation failed.");
        }

        if (stripeResult.paymentIntent && stripeResult.paymentIntent.status === "succeeded") {
          validPaymentIntentId = stripeResult.paymentIntent.id;
        } else {
          throw new Error("Card payment could not be completed.");
        }
      }

      const idempotencyKey = `idempotency_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const apiPayload: Record<string, any> = {
        idempotencyKey,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity ?? 1
        })),
        products: backendProducts,
        currency: "usd",
        paymentIntentId: validPaymentIntentId,
        totalAmount: grandTotal,
        subtotal: cartSubtotal,
        deliveryCharge,
        specialNote: specialNote.trim(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        shippingAddress: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim() || "Dhaka"
        }
      };

      const primaryUrl = apiConfig.customer.createOrderUrl || "orders";
      const response: any = await postData({
        url: primaryUrl,
        token,
        body: apiPayload
      });

      if (response && (response.statusCode >= 400 || response.error)) {
        throw new Error(response.message || "Failed to create order on server.");
      }

      const createdOrderData = response?.data || response;
      const createdOrderId = createdOrderData?.id || createdOrderData?.orderId;

      const newOrder = createOrderInService({
        userId: user?.id || "user-guest",
        shippingAddress: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim() || "Dhaka"
        },
        paymentMethod,
        paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
        specialNote: specialNote.trim(),
        items: orderItems,
        subtotal: cartSubtotal
      });

      setOrderSubmitted(true);
      clearCart();
      showSuccessToast(
        paymentMethod === "Online"
          ? "Stripe payment successful! Order placed."
          : "Cash on Delivery order placed successfully!"
      );
      const targetOrderId = newOrder.id || newOrder.orderId || createdOrderId;
      router.push(`/order-confirmation/${targetOrderId}`);
    } catch (err: any) {
      console.error("Order payment error:", err);
      setPaymentError(err?.message || "Payment process failed. Please check your card details or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9f5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-green-primary)]"></div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSubmitted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-green-primary)] hover:underline"
            >
              <FaArrowLeft /> Back to Shopping Cart
            </Link>
            <h1 className="text-3xl font-extrabold text-[var(--color-green-primary)] mt-2">
              Checkout & Shipping
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500">
            <span>Cart</span>
            <span>&rarr;</span>
            <span className="text-[var(--color-green-primary)] font-bold">Checkout</span>
            <span>&rarr;</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Payment Error Alert Box (In-Place Recovery) */}
        {paymentError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-600 text-2xl shrink-0" />
              <div>
                <h4 className="font-bold">Payment Transaction Failed</h4>
                <p className="text-sm text-red-700">{paymentError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPaymentError(null)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
              >
                Retry Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("COD");
                  setPaymentError(null);
                }}
                className="px-4 py-2 bg-white border border-red-300 text-red-800 text-xs font-bold rounded-lg hover:bg-red-100 transition"
              >
                Switch to Cash on Delivery
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Step-by-Step Checkout Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Shipping & Delivery Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <span className="w-8 h-8 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-sm">
                  1
                </span>
                <h2 className="text-xl font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaMapMarkerAlt /> Delivery Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FaUser className="text-gray-400" /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FaPhoneAlt className="text-gray-400" /> Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01810000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat No, Road Name, Area details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City / District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka, Chittagong, Sylhet"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    * Entering &quot;Dhaka&quot; automatically sets delivery fee to Inside Dhaka (৳60). Other districts default to Outside Dhaka (৳120).
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Area & Method */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <span className="w-8 h-8 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-sm">
                  2
                </span>
                <h2 className="text-xl font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaTruck /> Delivery Zone & Charge
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryZone === "inside_dhaka"
                      ? "border-[var(--color-green-primary)] bg-emerald-50/40"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">Inside Dhaka</span>
                    <span className="text-lg font-extrabold text-[var(--color-green-primary)]">৳60</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Delivery within 24-48 hours</p>
                  {deliveryZone === "inside_dhaka" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-2 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <FaCheckCircle /> Auto-synced for Dhaka
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryZone === "outside_dhaka"
                      ? "border-[var(--color-green-primary)] bg-emerald-50/40"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">Outside Dhaka</span>
                    <span className="text-lg font-extrabold text-[var(--color-green-primary)]">৳120</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Delivery within 2-4 business days</p>
                  {deliveryZone === "outside_dhaka" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-2 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <FaCheckCircle /> Auto-synced for District
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <span className="w-8 h-8 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-sm">
                  3
                </span>
                <h2 className="text-xl font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaCreditCard /> Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                    paymentMethod === "COD"
                      ? "border-[var(--color-green-primary)] bg-emerald-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 accent-[var(--color-green-primary)]"
                  />
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      <FaMoneyBillWave className="text-emerald-600" /> Cash on Delivery (COD)
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay with cash when your package is delivered to your doorstep.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("Online")}
                  className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                    paymentMethod === "Online"
                      ? "border-[var(--color-green-primary)] bg-emerald-50/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className="mt-1 accent-[var(--color-green-primary)]"
                  />
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      <FaCreditCard className="text-blue-600" /> Pay Online (Stripe Card)
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Instant & secure payment via Credit Card, Debit Card, or Online Banking.
                    </p>
                  </div>
                </label>
              </div>

              {/* Stripe Card Elements Section (Visible when Online is selected) */}
              {paymentMethod === "Online" && (
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/30 border border-blue-100 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <FaLock className="text-blue-600" /> Stripe Secure Card Payment
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">256-bit SSL Encrypted</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-white border border-gray-300 rounded-xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-green-primary)]">
                      <CardNumberElement options={ELEMENT_OPTIONS} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <div className="bg-white border border-gray-300 rounded-xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-green-primary)]">
                        <CardExpiryElement options={ELEMENT_OPTIONS} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CVC / CVV <span className="text-red-500">*</span>
                      </label>
                      <div className="bg-white border border-gray-300 rounded-xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-green-primary)]">
                        <CardCvcElement options={ELEMENT_OPTIONS} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Special Instructions (Optional) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <span className="w-8 h-8 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-sm">
                  4
                </span>
                <h2 className="text-xl font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaStickyNote /> Special Delivery Notes (Optional)
                </h2>
              </div>
              <textarea
                rows={3}
                placeholder="Any special instructions for the delivery rider? (e.g. Call before arrival, leave at gate)"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)]"
              ></textarea>
            </div>
          </div>

          {/* Right Side: Section 5 - Order Summary & Sticky Button */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg lg:sticky lg:top-24 space-y-6">
              <h3 className="text-xl font-bold text-[var(--color-green-primary)] border-b pb-4">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
              </h3>

              {/* Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const unit = finalPrice({
                    price: Number(item.price) || 0,
                    discountType: item.discountType,
                    discountAmount: item.discountAmount ?? 0
                  });
                  return (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <Image
                        src={
                          item.featuredImage ||
                          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60"
                        }
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                      />
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-gray-800">
                        ৳{(unit * (item.quantity ?? 1)).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost Calculations */}
              <div className="border-t border-b border-gray-100 py-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">৳{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Delivery Charge ({deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                  </span>
                  <span className="font-semibold text-gray-800">৳{deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[var(--color-green-primary)] pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[var(--color-green-primary)] hover:opacity-95 text-white font-bold text-lg rounded-full shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Processing Order..."
                ) : (
                  <>
                    <FaShieldAlt />{" "}
                    {paymentMethod === "Online"
                      ? `Pay Now (৳${grandTotal.toFixed(2)})`
                      : `Place Order (৳${grandTotal.toFixed(2)})`}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <FaShieldAlt className="text-emerald-500" /> Safe & Secure Checkout Guarantee
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutView;
