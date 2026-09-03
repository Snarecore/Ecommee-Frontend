type DiscountType = "NONE" | "PERCENT" | "FLAT";

export function finalPrice({
    price,
    discountType,
    discountAmount = 0
}: {
    price: number;
    discountType?: DiscountType;
    discountAmount?: number;
}): number {
    const originalPrice = Number(price) || 0;
    const discountPrice = Number(discountAmount) || 0;

    let result = originalPrice;

    if (discountType === "PERCENT") {
        const clampValue = Math.min(Math.max(discountPrice, 0), 100);
        result = originalPrice * (1 - clampValue / 100);
    } else if (discountType === "FLAT") {
        result = originalPrice - Math.max(discountPrice, 0);
    }

    return +Math.max(result, 0).toFixed(2);
}

const DEFAULT_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function formatImageUrl(url?: string | null | any): string {
    if (!url) return DEFAULT_PLACEHOLDER;
    if (typeof url !== "string") return DEFAULT_PLACEHOLDER;
    
    let trimmed = url.trim();
    if (!trimmed) return DEFAULT_PLACEHOLDER;

    if (trimmed.startsWith("data:")) {
        return trimmed;
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return formatImageUrl(parsed[0]);
            }
            if (parsed && typeof parsed === "object" && parsed.url) {
                return formatImageUrl(parsed.url);
            }
            return DEFAULT_PLACEHOLDER;
        } catch {
            return DEFAULT_PLACEHOLDER;
        }
    }

    // Determine backend origin from environment variable
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
    let apiOrigin = "";
    try {
        const u = new URL(apiBaseUrl);
        apiOrigin = u.origin;
    } catch {
        apiOrigin = "";
    }

    // Replace localhost server host in production if backend is hosted remotely
    if (trimmed.startsWith("http://localhost:5000") || trimmed.startsWith("http://127.0.0.1:5000")) {
        if (apiOrigin && !apiOrigin.includes("localhost")) {
            trimmed = trimmed.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, apiOrigin);
        }
    }

    // Handle relative image paths (e.g., uploads/abc.jpg or /uploads/abc.jpg)
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
        if (apiOrigin) {
            return `${apiOrigin}${cleanPath}`;
        }
        return cleanPath;
    }

    return trimmed;
}
