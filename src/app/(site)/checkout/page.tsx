'use client';

import Checkout from "@/views/checkout/index";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51RnvzXBVnYSmQrwaX27nyzY5fVkPDmiMTAOqA7qgI5KlyF4MN7y36bkb5ny0gadpnBYnvmGCUPiN4E4x4fIeySyL00xzqFL7TF'
);

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
}
