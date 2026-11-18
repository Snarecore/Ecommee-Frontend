'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckoutVerificationService } from '@/services/checkout-verification.service';
import { showErrorToast } from '@/utils/toast-utils';
import {
    FaSearch,
    FaTruck,
    FaBox,
    FaCheckCircle,
    FaExternalLinkAlt
} from 'react-icons/fa';

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const queryOrderId = searchParams.get('orderId') || '';
    const queryPhone = searchParams.get('phone') || '';

    const [orderId, setOrderId] = useState(queryOrderId);
    const [phone, setPhone] = useState(queryPhone);
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState<any | null>(null);

    const performTrack = async (targetId: string, targetPhone: string) => {
        if (!targetId.trim()) {
            showErrorToast('Please enter your Order ID.');
            return;
        }
        if (!targetPhone.trim()) {
            showErrorToast('Please enter your Phone Number.');
            return;
        }

        setIsLoading(true);
        try {
            const data = await CheckoutVerificationService.trackOrder(targetId.trim(), targetPhone.trim());
            setOrderData(data);
        } catch (err: any) {
            setOrderData(null);
            showErrorToast(err?.message || 'Order not found. Please verify your Order ID and Phone Number.');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-track on load if URL params present
    useEffect(() => {
        if (queryOrderId && queryPhone) {
            setOrderId(queryOrderId);
            setPhone(queryPhone);
            performTrack(queryOrderId, queryPhone);
        }
    }, [queryOrderId, queryPhone]);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        await performTrack(orderId, phone);
    };

    const STATUS_STEPS = ['Pending', 'Order Placed', 'Processing', 'Shipped', 'Delivered'];

    const getStatusIndex = (currentStatus: string): number => {
        const s = (currentStatus || '').toLowerCase();
        if (s === 'delivered' || s === 'completed') return 4;
        if (s === 'shipped') return 3;
        if (s === 'processing') return 2;
        if (s === 'order_placed' || s === 'order placed') return 1;
        return 0; // Pending
    };

    const currentStepIndex = orderData ? getStatusIndex(orderData.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
                        <FaTruck /> Live Order Tracking
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Track Your Order Status
                    </h1>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Enter your Order ID and verified phone number below to check real-time order status and courier delivery progress.
                    </p>
                </div>

                {/* Tracking Search Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Order ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. #1005 or 1005"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Mobile Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="e.g. 017XXXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaSearch className="text-xs" />
                            )}
                            Track Order Status
                        </button>
                    </form>
                </div>

                {/* Tracking Results Card */}
                {orderData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 animate-in fade-in">
                        {/* Order Header Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900">Order #{orderData.orderId}</h2>
                                    {orderData.isPhoneVerified && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                            <FaCheckCircle className="text-[10px]" /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Placed on: {new Date(orderData.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-xs text-gray-500 block">Total Amount</span>
                                <span className="text-xl font-extrabold text-emerald-700">৳{orderData.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Status Stepper */}
                        <div>
                            <div className="relative flex items-center justify-between">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                                    style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                />
                                {STATUS_STEPS.map((step, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                        <div key={step} className="relative z-10 flex flex-col items-center">
                                            <div
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                                                    isCompleted
                                                        ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                                                        : 'bg-gray-200 text-gray-500'
                                                }`}
                                            >
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                            <span
                                                className={`text-[10px] sm:text-xs mt-1.5 font-medium whitespace-nowrap ${
                                                    isCurrent
                                                        ? 'text-emerald-700 font-bold'
                                                        : isCompleted
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Courier Details Card */}
                        {orderData.courierName && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                    <span className="font-semibold text-emerald-900 block">
                                        Courier: {orderData.courierName}
                                    </span>
                                    {orderData.trackingId && (
                                        <p className="text-gray-600 font-mono mt-0.5">
                                            Tracking ID: {orderData.trackingId}
                                        </p>
                                    )}
                                    {orderData.shipment?.statusLabel && (
                                        <p className="text-emerald-800 mt-1">
                                            Courier status: <span className="font-semibold">{orderData.shipment.statusLabel}</span>
                                            {orderData.shipment.updatedAt && (
                                                <span className="text-gray-500"> · updated {new Date(orderData.shipment.updatedAt).toLocaleString()}</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                {orderData.courierTrackingLink && (
                                    <a
                                        href={orderData.courierTrackingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition"
                                    >
                                        Live Courier Track <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Ordered Items Summary */}
                        <div className="pt-2 border-t border-gray-100">
                            <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                                <FaBox className="text-gray-400" /> Package Items
                            </h3>
                            <div className="space-y-2.5">
                                {(orderData.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs py-1">
                                        <div className="flex items-center gap-3">
                                            {item.featuredImage ? (
                                                <Image
                                                    src={item.featuredImage}
                                                    alt={item.productName}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <FaBox />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.productName}</p>
                                                <p className="text-gray-500">
                                                    Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Totals */}
                        <div className="space-y-1.5 text-xs text-gray-600 pt-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>৳{orderData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>৳{orderData.deliveryCharge.toFixed(2)}</span>
                            </div>
                            {orderData.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span>Discount</span>
                                    <span>-৳{orderData.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total Amount ({orderData.paymentMethod})</span>
                                <span>৳{orderData.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}
