/**
 * Incomplete Checkout Tracker for Storefront
 * Securely maintains session token and tracks customer intent without blocking UI.
 */

const SESSION_STORAGE_KEY = 'bb_checkout_session_token';

export function getOrCreateCheckoutSessionToken(): string {
    if (typeof window === 'undefined') return '';
    try {
        let token = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!token) {
            token = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            sessionStorage.setItem(SESSION_STORAGE_KEY, token);
        }
        return token;
    } catch {
        return '';
    }
}

export function clearCheckoutSessionToken(): void {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
        // no-op
    }
}

export interface TrackCheckoutParams {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    source?: string;
}

let debounceTimer: any = null;

export function trackCheckoutDraft(params: TrackCheckoutParams): void {
    if (typeof window === 'undefined') return;
    const sessionToken = getOrCreateCheckoutSessionToken();
    if (!sessionToken || !params.items || params.items.length === 0) return;

    // Only track if meaningful interaction occurred (at least phone or name entered)
    const hasMeaningfulInput = Boolean(
        (params.phone && params.phone.trim().length >= 3) ||
        (params.name && params.name.trim().length >= 2) ||
        (params.address && params.address.trim().length >= 3)
    );

    if (!hasMeaningfulInput) return;

    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        executeTrackPayload(sessionToken, params);
    }, 1500);
}

export function flushCheckoutDraft(params: TrackCheckoutParams): void {
    if (typeof window === 'undefined') return;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    const sessionToken = getOrCreateCheckoutSessionToken();
    if (!sessionToken || !params.items || params.items.length === 0) return;

    const hasMeaningfulInput = Boolean(
        (params.phone && params.phone.trim().length >= 3) ||
        (params.name && params.name.trim().length >= 2)
    );

    if (hasMeaningfulInput) {
        executeTrackPayload(sessionToken, params, true);
    }
}

function executeTrackPayload(sessionToken: string, params: TrackCheckoutParams, keepalive: boolean = false): void {
    try {
        const payload = {
            sessionToken,
            customer: {
                name: params.name?.trim() || undefined,
                phone: params.phone?.trim() || undefined,
                email: params.email?.trim() || undefined,
                address: params.address?.trim() || undefined,
                city: params.city?.trim() || undefined,
            },
            items: params.items.map((it) => ({
                productId: it.productId,
                variantId: it.variantId || undefined,
                quantity: it.quantity || 1,
            })),
            source: params.source || (typeof window !== 'undefined' ? window.location.pathname : 'Website checkout'),
        };

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1/';
        const normalizedUrl = baseUrl.endsWith('/') ? `${baseUrl}incomplete-checkouts/track` : `${baseUrl}/incomplete-checkouts/track`;

        fetch(normalizedUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive,
        }).catch(() => {
            // Non-blocking best-effort
        });
    } catch {
        // Non-blocking best-effort
    }
}
