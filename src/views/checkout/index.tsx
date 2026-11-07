'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user-store";
import useCart from "@/hooks/useCart";
import { finalPrice, formatImageUrl } from "@/utils/product-utils";
import { isProductOutOfStock, isSizeOutOfStock } from "@/utils/stock-utils";
import {
  calculateDeliveryZoneAndFee,
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
  FaEnvelope,
  FaUser,
  FaStickyNote,
  FaExclamationTriangle,
  FaShieldAlt,
  FaArrowLeft,
  FaLock
} from "react-icons/fa";
import { showErrorToast, showSuccessToast } from "@/utils/toast-utils";
import CouponInput from "@/component/coupon/CouponInput";
import StripeCardSection, { StripeCardSectionRef } from "@/component/payment/StripeCardSection";

const CheckoutView = () => {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const { cartItems, clearCart } = useCart();
  
  const stripeCardRef = React.useRef<StripeCardSectionRef>(null);

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponCode: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);

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
  const [email, setEmail] = useState((user as any)?.email || "");
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
      if (u.email && !email) setEmail(u.email);
      if (u.address && !address) setAddress(u.address);
      if (u.city && !city) setCity(u.city);
    }
  }, [user]);

  // Server-authoritative Price & Delivery Calculation (Backend SSOT)
  const [serverCalculation, setServerCalculation] = useState<{
    subtotal: number;
    deliveryCharge: number;
    deliveryZone: "inside_dhaka" | "outside_dhaka";
    discountAmount: number;
    totalAmount: number;
  } | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    if (!isMounted || cartItems.length === 0) return;

    let isCancelled = false;
    const fetchServerCalculation = async () => {
      setIsCalculatingPrice(true);
      try {
        const payload = {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            size: item.selectedSize
          })),
          city: city.trim(),
          couponCode: appliedCoupon?.couponCode || undefined
        };
        const token = getUserToken();
        const res: any = await postData({
          url: apiConfig.customer.orderPreviewUrl || "orders/preview",
          token,
          body: payload
        });
        const data = res?.data || res;
        if (!isCancelled && data && (data.subtotal !== undefined || data.totalAmount !== undefined)) {
          setServerCalculation({
            subtotal: Number(data.subtotal) || 0,
            deliveryCharge: Number(data.deliveryCharge) || 0,
            deliveryZone: data.deliveryZone || (city.toLowerCase().includes("dhaka") ? "inside_dhaka" : "outside_dhaka"),
            discountAmount: Number(data.discountAmount) || 0,
            totalAmount: Number(data.totalAmount) || 0
          });
        }
      } catch (err) {
        // Fallback seamlessly to local calculation if endpoint is temporarily unavailable
      } finally {
        if (!isCancelled) setIsCalculatingPrice(false);
      }
    };

    fetchServerCalculation();

    return () => {
      isCancelled = true;
    };
  }, [cartItems, city, appliedCoupon, isMounted]);

  // Fallback local subtotal calculation
  const fallbackSubtotal = cartItems.reduce((sum, item) => {
    const unit = finalPrice({
      price: Number(item.price) || 0,
      discountType: item.discountType,
      discountAmount: item.discountAmount ?? 0
    });
    return sum + unit * (item.quantity ?? 1);
  }, 0);

  const fallbackDelivery = calculateDeliveryZoneAndFee(city);

  // Authoritative calculations from backend first, with local fallback
  const cartSubtotal = serverCalculation?.subtotal ?? fallbackSubtotal;
  const deliveryCharge = serverCalculation?.deliveryCharge ?? fallbackDelivery.deliveryCharge;
  const deliveryZone = serverCalculation?.deliveryZone ?? fallbackDelivery.deliveryZone;
  const couponDiscount = serverCalculation?.discountAmount ?? (appliedCoupon ? appliedCoupon.discountAmount : 0);
  const grandTotal = serverCalculation?.totalAmount ?? Math.max(0, cartSubtotal + deliveryCharge - couponDiscount);

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
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      showErrorToast("Please enter a valid email address or leave it blank.");
      return;
    }
    if (!address.trim()) {
      showErrorToast("Please enter your delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "Online") {
        if (!stripeCardRef.current || !stripeCardRef.current.isReady()) {
          showErrorToast("Stripe payment gateway is initializing. Please try again in a moment.");
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
      const idempotencyKey = `idempotency_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const apiPayload: Record<string, any> = {
        idempotencyKey,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity ?? 1,
          size: item.selectedSize || (item as any).size || undefined
        })),
        products: backendProducts,
        currency: "usd",
        paymentIntentId: paymentMethod === "COD" ? "COD" : paymentMethod === "SSLCOMMERZ" ? "SSLCOMMERZ" : "PENDING_STRIPE",
        totalAmount: grandTotal,
        subtotal: cartSubtotal,
        deliveryCharge,
        specialNote: specialNote.trim(),
        name: name.trim(),
        customerName: name.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        customerPhone: phone.trim(),
        email: email.trim(),
        customerEmail: email.trim(),
        address: address.trim(),
        couponCode: appliedCoupon?.couponCode || undefined,
        shippingAddress: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim() || "Dhaka"
        },
        user: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim()
        }
      };

      // 1. Order-First: Pre-create order and reserve stock first
      const primaryUrl = apiConfig.customer.createOrderUrl || "orders";
      const response: any = await postData({
        url: primaryUrl,
        token,
        body: apiPayload
      });

      if (!response || response.error || (response.statusCode && response.statusCode >= 400)) {
        throw new Error(response?.message || response?.error || "Order creation failed on server. Please try again.");
      }

      const createdOrderData = response?.data || response;
      const createdOrderId = createdOrderData?.id || createdOrderData?.orderId;
      if (!createdOrderId) {
        throw new Error("Order was not accepted by server. Please try again.");
      }

      // 2. Stripe Payment Lifecycle (Order-First Flow)
      if (paymentMethod === "Online") {
        const stripeInitRes: any = await postData({
          url: "payments/stripe/init",
          token,
          body: {
            orderId: createdOrderId
          }
        });

        const initData = stripeInitRes?.data || stripeInitRes;
        const clientSecret = initData?.clientSecret;

        if (!clientSecret) {
          throw new Error(
            initData?.message ||
            stripeInitRes?.message ||
            "Failed to initialize Stripe payment. Your order is pending; please retry from order history."
          );
        }

        if (!stripeCardRef.current) {
          throw new Error("Card details missing. Please enter your card information.");
        }

        const stripeResult = await stripeCardRef.current.confirmPayment(clientSecret, {
          name: name.trim() || "Customer",
          email: user?.email || undefined,
          phone: phone.trim() || undefined,
          address: {
            line1: address.trim() || undefined,
            city: city.trim() || undefined
          }
        });

        if (stripeResult.error) {
          // Do NOT clear cart; allow customer to fix card or retry
          const errorMsg = stripeResult.error.message || "Card payment confirmation failed.";
          setPaymentError(errorMsg);
          showErrorToast(errorMsg);
          setIsSubmitting(false);
          return;
        }

        if (stripeResult.paymentIntent && (stripeResult.paymentIntent.status === "succeeded" || stripeResult.paymentIntent.status === "processing")) {
          setOrderSubmitted(true);
          clearCart();

          // Instantly notify admin dashboard tabs if open
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("fashion_time_admin_notifications");
              bc.postMessage({ type: "NEW_ADMIN_NOTIF_AVAILABLE" });
              bc.close();
            } catch {}
          }

          showSuccessToast("Payment successful! Your order has been placed.");
          router.push(`/order-confirmation/${createdOrderId}?payment=processing`);
          return;
        } else {
          const statusMsg = "Card payment could not be completed. Please try again.";
          setPaymentError(statusMsg);
          showErrorToast(statusMsg);
          setIsSubmitting(false);
          return;
        }
      }

      // 3. SSLCommerz Gateway Redirection Flow
      if (paymentMethod === "SSLCOMMERZ") {
        try {
          const initRes: any = await postData({
            url: "payments/sslcommerz/init",
            token,
            body: {
              orderId: createdOrderId,
              customerName: name.trim(),
              customerPhone: phone.trim(),
              customerAddress: address.trim(),
              customerCity: city.trim()
            }
          });

          const gatewayUrl = initRes?.gatewayPageUrl || initRes?.data?.gatewayPageUrl;
          if (gatewayUrl) {
            setOrderSubmitted(true);
            clearCart();
            window.location.href = gatewayUrl;
            return;
          } else {
            throw new Error(initRes?.failedReason || initRes?.message || "Failed to initialize SSLCommerz payment session.");
          }
        } catch (gatewayErr: any) {
          throw new Error(gatewayErr?.message || "Failed to connect to SSLCommerz payment gateway. Please try again.");
        }
      }

      // 4. Cash on Delivery (COD) Flow
      setOrderSubmitted(true);
      clearCart();

      // Instantly notify admin dashboard tabs if open
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("fashion_time_admin_notifications");
          bc.postMessage({ type: "NEW_ADMIN_NOTIF_AVAILABLE" });
          bc.close();
        } catch {}
      }

      showSuccessToast(
        "Order submitted successfully! Your order is now waiting for admin approval."
      );
      router.push(`/order-confirmation/${createdOrderId}`);
    } catch (err: any) {
      // console.error("Order payment error:", err);
      setPaymentError(err?.message || "Payment process failed. Please check your card details or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-slate-900">
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
          <div className="lg:col-span-8 space-y-4">
            {/* Section 1: Shipping & Delivery Information */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
                <span className="w-7 h-7 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h2 className="text-lg font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaMapMarkerAlt /> Delivery Information
                </h2>
              </div>

              <div className="space-y-3">
                {/* Line 1: 3 Input Fields (Full Name, Phone Number, Email Address) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <FaUser className="text-gray-400" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <FaPhoneAlt className="text-gray-400" /> Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01810000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <FaEnvelope className="text-gray-400" /> Email Address <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@example.com (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
                    />
                  </div>
                </div>

                {/* Line 2: 2 Input Fields (Full Delivery Address, City / District) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House / Flat No, Road Name, Area details"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhaka, Chittagong, Sylhet"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Area & Method */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100 mb-3.5">
                <span className="w-7 h-7 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaTruck /> Delivery Zone & Charge
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-lg border-2 transition-all ${
                    deliveryZone === "inside_dhaka"
                      ? "border-[var(--color-green-primary)] bg-teal-50/40 shadow-xs ring-1 ring-[var(--color-green-primary)]/20"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-sm">Inside Dhaka</span>
                    <span className="text-base font-extrabold text-[var(--color-green-primary)]">৳60</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Delivery within 24-48 hours</p>
                  {deliveryZone === "inside_dhaka" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1.5 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <FaCheckCircle className="text-[10px]" /> Auto-synced for Dhaka
                    </span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-lg border-2 transition-all ${
                    deliveryZone === "outside_dhaka"
                      ? "border-[var(--color-green-primary)] bg-teal-50/40 shadow-xs ring-1 ring-[var(--color-green-primary)]/20"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-sm">Outside Dhaka</span>
                    <span className="text-base font-extrabold text-[var(--color-green-primary)]">৳120</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Delivery within 2-4 business days</p>
                  {deliveryZone === "outside_dhaka" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1.5 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <FaCheckCircle className="text-[10px]" /> Auto-synced for District
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                <span className="w-7 h-7 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaCreditCard /> Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setPaymentMethod("SSLCOMMERZ")}
                  className={`cursor-pointer p-3 rounded-lg border-2 flex items-start gap-2.5 transition-all ${
                    paymentMethod === "SSLCOMMERZ"
                      ? "border-[var(--color-green-primary)] bg-teal-50/40 shadow-xs ring-1 ring-[var(--color-green-primary)]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "SSLCOMMERZ"}
                    onChange={() => setPaymentMethod("SSLCOMMERZ")}
                    className="mt-0.5 accent-[var(--color-green-primary)] w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                      <FaCreditCard className="text-pink-600 shrink-0" />
                      <span className="truncate">bKash / Nagad / Cards</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.5 rounded">bKash</span>
                      <span className="text-[9px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">Nagad</span>
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">Rocket</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      Instant &amp; secure checkout via SSLCommerz gateway.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`cursor-pointer p-3 rounded-lg border-2 flex items-start gap-2.5 transition-all ${
                    paymentMethod === "COD"
                      ? "border-[var(--color-green-primary)] bg-teal-50/40 shadow-xs ring-1 ring-[var(--color-green-primary)]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-0.5 accent-[var(--color-green-primary)] w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5">
                      <FaMoneyBillWave className="text-emerald-600 shrink-0" /> Cash on Delivery (COD)
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                      Pay with cash when package is delivered to your doorstep.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("Online")}
                  className={`cursor-pointer p-3 rounded-lg border-2 flex items-start gap-2.5 transition-all ${
                    paymentMethod === "Online"
                      ? "border-[var(--color-green-primary)] bg-teal-50/40 shadow-xs ring-1 ring-[var(--color-green-primary)]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className="mt-0.5 accent-[var(--color-green-primary)] w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5">
                      <FaCreditCard className="text-blue-600 shrink-0" /> Stripe Card
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                      International Credit or Debit Card payment via Stripe.
                    </p>
                  </div>
                </label>
              </div>

              {/* Stripe Card Elements Section (Lazy-loaded only when Online is selected) */}
              {paymentMethod === "Online" && (
                <StripeCardSection ref={stripeCardRef} />
              )}
            </div>

            {/* Section 4: Special Instructions (Optional) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100 mb-3">
                <span className="w-7 h-7 rounded-full bg-[var(--color-green-primary)] text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-green-primary)] flex items-center gap-2">
                  <FaStickyNote /> Special Delivery Notes (Optional)
                </h2>
              </div>
              <textarea
                rows={2}
                placeholder="Any special instructions for the delivery rider? (e.g. Call before arrival, leave at gate)"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] transition"
              ></textarea>
            </div>
          </div>

          {/* Right Side: Section 5 - Order Summary & Sticky Button */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md lg:sticky lg:top-24 space-y-5">
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
                        src={formatImageUrl(item.featuredImage)}
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

              {/* Coupon Section */}
              <div className="border-t pt-4">
                <CouponInput
                  items={cartItems.map((i) => ({ productId: i.id, quantity: i.quantity ?? 1 }))}
                  deliveryZone={deliveryZone}
                  appliedCouponCode={appliedCoupon?.couponCode}
                  appliedDiscountAmount={appliedCoupon?.discountAmount}
                  onCouponApplied={(res) => {
                    setAppliedCoupon({
                      couponCode: res.couponCode,
                      discountAmount: res.discountAmount,
                      discountType: res.discountType,
                      discountValue: res.discountValue
                    });
                    showSuccessToast(`Coupon "${res.couponCode}" applied! (-৳${res.discountAmount.toFixed(2)})`);
                  }}
                  onCouponRemoved={() => {
                    setAppliedCoupon(null);
                    showSuccessToast("Coupon removed.");
                  }}
                />
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
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.couponCode})</span>
                    <span>-৳{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
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
