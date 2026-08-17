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
