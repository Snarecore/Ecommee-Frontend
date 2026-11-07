
export function isOrderEligibleForPaymentRetry(order: any): boolean {
    if (!order) return false;

    // 1. Payment Method must be online/gateway based
    const method = String(order.paymentMethod || '').trim().toUpperCase();
    if (method !== 'SSLCOMMERZ' && method !== 'ONLINE') {
        return false;
    }

    // 2. Financial state must NOT be final paid or settled
    const paymentStatus = String(order.paymentStatus || '').trim();
    if (
        paymentStatus === 'Paid' ||
        paymentStatus === 'Refunded' ||
        paymentStatus === 'Partially Refunded'
    ) {
        return false;
    }

    // 3. Must NOT be actively under verification or processing
    if (paymentStatus === 'Review Required' || paymentStatus === 'Processing') {
        return false;
    }

    // 4. Order lifecycle: terminal completed/delivered/rejected orders cannot be retried
    const orderStatus = String(order.orderStatus || order.status || '').trim();
    if (
        orderStatus === 'Delivered' ||
        orderStatus === 'Completed' ||
        orderStatus === 'Rejected'
    ) {
        return false;
    }

    // 5. Eligible payment statuses: Pending, Failed, Unpaid
    return ['Pending', 'Failed', 'Unpaid'].includes(paymentStatus);
}
