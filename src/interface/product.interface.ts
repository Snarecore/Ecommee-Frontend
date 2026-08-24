export enum DiscountType {
    NONE = 'NONE',
    PERCENT = 'PERCENT',
    FLAT = 'FLAT'
}

export interface Product {
    id: string;
    name: string;
    price: number;
    rating?: number;
    featuredImage: string;
    mainCategoryName: string;
    slug: string;
    productImages: { imageUrl: string }[];
    summary: string;
    description: string;
    discountType: DiscountType;
    discountAmount?: number;
    quantity?: number;
    stock?: string | number | boolean;
    stockStatus?: string;
    isOutOfStock?: boolean;
    inStock?: boolean;
    totalStock?: number;
    sizesString?: string;
    sizeStock?: Record<string, number>;
    vendor?: {
        profile?: {
            shopName?: string;
            shopImage?: string;
        };
    };
    productReview?: {
        reviewCount: number;
        ratingAverage: number;
        countFiveStartRating: number;
        countFourStartRating: number;
        countThreeStartRating: number;
        countTwoStartRating: number;
        countOneStartRating: number;
    };
}