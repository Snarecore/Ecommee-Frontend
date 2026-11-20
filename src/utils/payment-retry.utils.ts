export interface PaymentRetryOptions {
    /**
     * Whether Cash on Delivery (COD) orders are allowed to be paid online before delivery.
     * Defaults to true (e.g. for customer dashboard & tracking).
     * Set to false on order-confirmation page if freshly placed COD orders should show
     * standard confirmation rather than triggering payment incomplete state.
     */
    allowCod?: boolean;
}

export function isOrderEligibleForPaymentRetry(order: any, options: PaymentRetryOptions = { allowCod: true }): boolean {
    if (!order) return false;

    // 1. Payment Method check
    const method = String(order.paymentMethod || '').trim().toUpperCase();
    const isCod = method === 'COD' || method.includes('CASH') || method.includes('DELIVERY');

    const allowCod = options?.allowCod ?? true;
    if (isCod && !allowCod) {
        return false;
    }

    // 2. Financial state must NOT be final paid or settled
    const paymentStatus = String(order.paymentStatus || '').trim().toLowerCase();
    if (
        paymentStatus === 'paid' ||
        paymentStatus === 'refunded' ||
        paymentStatus === 'partially refunded'
    ) {
        return false;
    }

    // 3. Must NOT be actively under verification or processing
    if (paymentStatus === 'review required' || paymentStatus === 'processing') {
        return false;
    }

    // 4. Order lifecycle: terminal completed/delivered/rejected/cancelled orders cannot be paid
    const orderStatus = String(order.orderStatus || order.status || '').trim().toLowerCase();
    if (
        orderStatus === 'delivered' ||
        orderStatus === 'completed' ||
        orderStatus === 'rejected' ||
        orderStatus === 'cancelled'
    ) {
        return false;
    }

    // 5. Eligible payment statuses: Pending, Failed, Unpaid, or empty
    return ['pending', 'failed', 'unpaid', ''].includes(paymentStatus);
}
