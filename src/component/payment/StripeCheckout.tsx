import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '../../utils/toast-utils';

import { finalPrice } from "../../utils/product-utils";

type DiscountType = "NONE" | "PERCENT" | "FLAT";

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    discountType?: DiscountType;
    discountAmount?: number;
}


interface StripeCheckoutProps {
    products: Product[];
    onSuccess: () => void;
}

const ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#231F20',
            fontFamily: 'Montserrat, sans-serif',
            '::placeholder': {
                color: '#A0AEC0'
            }
        },
        invalid: {
            color: '#e53e3e',
            iconColor: '#e53e3e'
        }
    }
};

const StripeCheckout = ({ products, onSuccess }: StripeCheckoutProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const user = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem("user") || "{}") : {};
    const token = user?.token || '';

    // Customer delivery info state
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [city, setCity] = useState(user?.city || '');

    useEffect(() => {
        if (user) {
            if (user.name && !name) setName(user.name);
            if (user.phone && !phone) setPhone(user.phone);
            if (user.address && !address) setAddress(user.address);
            if (user.city && !city) setCity(user.city);
        }
    }, [user]);

    const discountedTotal = useMemo(() => {
        return products.reduce((sum, p) => {
            const unit = finalPrice({
                price: Number(p.price) || 0,
                discountType: p.discountType,
                discountAmount: p.discountAmount ?? 0,
            });
            return sum + unit * (p.quantity ?? 1);
        }, 0);
    }, [products]);

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}payments`, {
                    products,
                    currency: 'usd'
                });
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error('Failed to create payment intent: ', error);
            }
        };

        if (products.length > 0) {
            createPaymentIntent();
        }
    }, [products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) {
            showErrorToast("Stripe is loading. Please wait a moment.");
            return;
        }

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

        setLoading(true);

        try {
            let secret = clientSecret;
            if (!secret) {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}payments`, {
                    products,
                    currency: 'usd'
                });
                secret = response.data.clientSecret;
                setClientSecret(secret);
            }

            if (!secret) {
                showErrorToast("Unable to process payment. Secret key missing.");
                setLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardNumberElement);
            const result = await stripe.confirmCardPayment(secret, {
                payment_method: {
                    card: cardElement!
                }
            });

            if (result.error) {
                const message = result.error.message || "Something went wrong during payment.";
                showErrorToast(message);
            } else if (result.paymentIntent?.status === 'succeeded') {
                showSuccessToast('Payment successful');
                
                const shippingAddress = {
                    name: name.trim(),
                    phone: phone.trim(),
                    address: address.trim(),
                    city: city.trim()
                };

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}orders`,
                    {
                        paymentIntentId: result.paymentIntent.id,
                        products,
                        totalAmount: discountedTotal,
                        currency: 'usd',
                        shippingAddress,
                        name: name.trim(),
                        phone: phone.trim(),
                        address: address.trim()
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                onSuccess();
            }
        } catch (err: any) {
            console.error("Payment submission error:", err);
            showErrorToast(err?.response?.data?.message || err?.message || "Payment process failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Information Section */}
            <div className="border-b pb-4 mb-4">
                <h3 className="font-bold text-lg text-[#231F20] mb-3">Delivery Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-[#231F20]">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C37D16]"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-[#231F20]">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border rounded-lg p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C37D16]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    <div className="sm:col-span-2">
                        <label className="block mb-1 text-sm font-semibold text-[#231F20]">
                            Home / Delivery Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="House No, Road / Street address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border rounded-lg p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C37D16]"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-[#231F20]">City / Area</label>
                        <input
                            type="text"
                            placeholder="e.g. Dhaka"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border rounded-lg p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C37D16]"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Information Section */}
            <div>
                <h3 className="font-bold text-lg text-[#231F20] mb-3">Payment Details</h3>
                <div className="mb-4">
                    <label className="block mb-2 font-semibold text-[#231F20]">Card Number</label>
                    <div className="border rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-[#C37D16]">
                        <CardNumberElement options={ELEMENT_OPTIONS} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-semibold text-[#231F20]">Expiry Date</label>
                        <div className="border rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-[#C37D16]">
                            <CardExpiryElement options={ELEMENT_OPTIONS} />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-[#231F20]">CVC</label>
                        <div className="border rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-[#C37D16]">
                            <CardCvcElement options={ELEMENT_OPTIONS} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total (USD)</span>
                <span className="font-semibold">${discountedTotal.toFixed(2)}</span>
            </div>
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-[var(--color-green-primary)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-green-primary)] cursor-pointer transition"
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

export default StripeCheckout;

