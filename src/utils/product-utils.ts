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

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/") || trimmed.startsWith("data:")) {
        return trimmed;
    }

    return `/${trimmed}`;
}
