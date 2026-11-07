'use client';

import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import type { Stripe, PaymentIntentResult } from '@stripe/stripe-js';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = () => {
  if (typeof window === 'undefined') return null;
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51RnvzXBVnYSmQrwaX27nyzY5fVkPDmiMTAOqA7qgI5KlyF4MN7y36bkb5ny0gadpnBYnvmGCUPiN4E4x4fIeySyL00xzqFL7TF'
    );
  }
  return stripePromise;
};

export interface StripeCardSectionRef {
  isReady: () => boolean;
  confirmPayment: (
    clientSecret: string,
    billingDetails: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        city?: string;
      };
    }
  ) => Promise<PaymentIntentResult>;
}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1F2937',
      fontFamily: 'inherit',
      '::placeholder': {
        color: '#9CA3AF'
      }
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444'
    }
  }
};

const InnerCardForm = forwardRef<StripeCardSectionRef>((_, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleFieldChange = (event: any) => {
    if (event?.error) {
      setInlineError(event.error.message || 'Invalid card information.');
    } else {
      setInlineError(null);
    }
  };

  useImperativeHandle(ref, () => ({
    isReady: () => {
      if (!stripe || !elements) return false;
      const cardNumber = elements.getElement(CardNumberElement);
      return !!cardNumber;
    },
    confirmPayment: async (clientSecret, billingDetails) => {
      if (!stripe || !elements) {
        return {
          error: {
            type: 'invalid_request_error',
            message: 'Stripe payment gateway is initializing. Please try again in a moment.'
          }
        } as unknown as PaymentIntentResult;
      }
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        return {
          error: {
            type: 'invalid_request_error',
            message: 'Please enter your credit/debit card details.'
          }
        } as unknown as PaymentIntentResult;
      }

      return await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: billingDetails
        }
      });
    }
  }), [stripe, elements]);

  return (
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
          <CardNumberElement options={ELEMENT_OPTIONS} onChange={handleFieldChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className="bg-white border border-gray-300 rounded-xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-green-primary)]">
            <CardExpiryElement options={ELEMENT_OPTIONS} onChange={handleFieldChange} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            CVC / CVV <span className="text-red-500">*</span>
          </label>
          <div className="bg-white border border-gray-300 rounded-xl p-3 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-green-primary)]">
            <CardCvcElement options={ELEMENT_OPTIONS} onChange={handleFieldChange} />
          </div>
        </div>
      </div>

      {inlineError && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
    </div>
  );
});

InnerCardForm.displayName = 'InnerCardForm';

const StripeCardSection = forwardRef<StripeCardSectionRef>((props, ref) => {
  const stripePromiseInstance = useMemo(() => getStripePromise(), []);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (stripePromiseInstance) {
      stripePromiseInstance
        .then((stripe) => {
          if (!stripe && isMounted) {
            setLoadError('Stripe could not be initialized. Please check your network or ad blocker settings.');
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoadError('Failed to load Stripe script. If you use an Ad Blocker, please whitelist this site.');
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [stripePromiseInstance]);

  if (loadError) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 animate-fadeIn">
        <FaExclamationTriangle className="mt-0.5 text-amber-600 flex-shrink-0 text-sm" />
        <div>
          <p className="font-semibold text-amber-900">Unable to load Stripe Payment Gateway</p>
          <p className="mt-1 text-amber-700 leading-relaxed">
            {loadError} You can also choose <strong>Cash on Delivery (COD)</strong> or <strong>bKash / Nagad</strong> to complete your order without delay.
          </p>
        </div>
      </div>
    );
  }

  if (!stripePromiseInstance) {
    return null;
  }

  return (
    <Elements stripe={stripePromiseInstance}>
      <InnerCardForm ref={ref} />
    </Elements>
  );
});

StripeCardSection.displayName = 'StripeCardSection';

export default StripeCardSection;
