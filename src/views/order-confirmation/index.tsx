'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOrderByIdFromService, Order } from "@/utils/order-service";
import {
  FaCheckCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCalendarAlt,
  FaShieldAlt,
  FaMoneyBillWave,
  FaCreditCard
} from "react-icons/fa";
import { getOrderCreatedAt } from "@/utils/order-service";

interface OrderConfirmationViewProps {
  orderId: string;
}

const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const found = getOrderByIdFromService(orderId);
      if (found) {
        setOrder(found);
      }
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green-primary)]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm text-center border border-gray-100">
        <FaShieldAlt className="text-4xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          The requested order details could not be found or you do not have permission to view them.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[var(--color-green-primary)] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-95"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 text-4xl">
            <FaCheckCircle />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-green-primary)]">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 mt-2">
            Thank you for shopping with us. We have received your order and are preparing it for shipment.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block text-xs">Order ID</span>
              <span className="font-bold text-gray-800">{order.orderId}</span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <span className="text-gray-400 block text-xs">Order Date</span>
              <span className="font-semibold text-gray-800">
                {getOrderCreatedAt(order)}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <span className="text-gray-400 block text-xs">Estimated Delivery</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <FaCalendarAlt /> 2-3 Business Days
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
              <FaMapMarkerAlt className="text-[var(--color-green-primary)]" /> Delivery Details
            </h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p className="font-bold text-gray-800">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p className="font-medium text-gray-700">{order.shippingAddress.city}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
              <FaTruck className="text-[var(--color-green-primary)]" /> Payment Information
            </h3>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  {order.paymentMethod === "COD" ? (
                    <>
                      <FaMoneyBillWave className="text-emerald-600" /> Cash on Delivery
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="text-blue-600" /> Online Payment
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.specialNote && (
                <div className="pt-2 border-t text-xs text-gray-500">
                  <span className="font-semibold block text-gray-700">Special Note:</span>
                  &quot;{order.specialNote}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3">
            <FaShoppingBag className="text-[var(--color-green-primary)]" /> Ordered Products
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-xl border shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{item.productName}</h4>
                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-bold text-sm text-gray-800">
                  ৳{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Delivery Fee ({order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
              </span>
              <span>৳{order.deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[var(--color-green-primary)] pt-2 border-t">
              <span>Total Amount</span>
              <span>৳{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href="/customer-dashboard"
            className="w-full sm:w-1/2 py-3.5 bg-[var(--color-green-primary)] text-white text-center font-bold rounded-full shadow-md hover:opacity-95 transition"
          >
            Track Order Progress 🚚
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-1/2 py-3.5 bg-white border border-gray-300 text-gray-700 text-center font-bold rounded-full hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationView;
