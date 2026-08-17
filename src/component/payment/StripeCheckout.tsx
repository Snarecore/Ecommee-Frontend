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
        if (!stripe || !elements || !clientSecret) return;

        setLoading(true);

        const cardElement = elements.getElement(CardNumberElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement!
            }
        });

        if (result.error) {
            const message = result.error.message || "Something went wrong during payment.";
            showErrorToast(message);
        } else if (result.paymentIntent.status === 'succeeded') {
            showSuccessToast('Payment successful');
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}orders`,
                {
                    paymentIntentId: result.paymentIntent.id,
                    products,
                    totalAmount: discountedTotal,
                    currency: 'usd'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            onSuccess();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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

