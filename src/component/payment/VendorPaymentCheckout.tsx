import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { postData } from '../../services/api-service';
import { getUserToken } from '../../hooks/useApi';
import { showErrorToast, showSuccessToast } from '../../utils/toast-utils';

interface StripeCheckoutProps {
    tierId: string;
    onSuccess: (subscriptionData: any) => void;
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

const VendorPaymentCheckout = ({ tierId, onSuccess }: StripeCheckoutProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const response: any = await postData({
                    url: 'vendor/subscription/payment-intent',
                    token: getUserToken(),
                    body: { tierId, currency: 'usd' }
                });
                if (response?.clientSecret || response?.data?.clientSecret) {
                    setClientSecret(response.clientSecret || response.data.clientSecret);
                }
            } catch (error) {
                console.error('Failed to create payment intent: ', error);
            }
        };

        if (tierId) {
            createPaymentIntent();
        }

    }, [tierId]);

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
            const response: any = await postData({
                url: 'vendor/subscription/select',
                token: getUserToken(),
                body: {
                    paymentIntentId: result.paymentIntent.id,
                    tierId,
                }
            });
            onSuccess(response?.data || response);
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

export default VendorPaymentCheckout;

