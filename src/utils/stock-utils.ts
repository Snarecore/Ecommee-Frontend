import { Product } from "../interface/product.interface";

export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

/**
 * Returns the configured sizes for a product.
 */
export function getProductSizes(product?: Product | null): string[] {
    if (!product) return DEFAULT_SIZES;
    const p = product as any;

    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
        if (typeof p.sizes[0] === "string") {
            return p.sizes;
        }
        if (typeof p.sizes[0] === "object" && p.sizes[0] !== null) {
            return p.sizes.map((s: any) => s.size || s.name || s.label).filter(Boolean);
        }
    }
    if (typeof p.sizesString === "string" && p.sizesString.trim()) {
        return p.sizesString.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return DEFAULT_SIZES;
}

/**
 * Check if the product itself is explicitly marked out of stock by any backend field.
 */
export function isExplicitlyOutOfStock(product?: Product | null): boolean {
    if (!product) return true;
    const p = product as any;

    if (p.isOutOfStock === true) return true;
    if (p.inStock === false || p.isStock === false) return true;

    // Check string indicators on stockStatus, stock, status
    const statusString = String(p.stockStatus || p.status || "").toLowerCase();
    if (statusString.includes("out") || statusString === "out_of_stock" || statusString === "outofstock") {
        return true;
    }

    if (typeof p.stock === "boolean" && !p.stock) return true;
    if (typeof p.stock === "number" && p.stock <= 0) return true;
    if (typeof p.stock === "string") {
        const lowerStock = p.stock.toLowerCase();
        if (lowerStock.includes("out") || lowerStock === "0") return true;
    }

    if (typeof p.quantity === "number" && p.quantity <= 0) return true;
    if (typeof p.totalStock === "number" && p.totalStock <= 0) return true;
    if (typeof p.countInStock === "number" && p.countInStock <= 0) return true;
    if (typeof p.productQuantity === "number" && p.productQuantity <= 0) return true;

    return false;
}

/**
 * Check stock quantity for a specific size of a product.
 */
export function getSizeStockQuantity(product?: Product | null, size?: string | null): number {
    if (!product) return 0;
    if (isExplicitlyOutOfStock(product)) return 0;

    const p = product as any;

    // 1. Check sizeStock object: e.g. { S: 5, M: 0 }
    if (p.sizeStock && typeof p.sizeStock === "object") {
        if (size && size in p.sizeStock) {
            return Number(p.sizeStock[size]) || 0;
        }
    }

    // 2. Check sizes array of objects: e.g. [{ size: "M", stock: 0, quantity: 0 }]
    if (Array.isArray(p.sizes) && p.sizes.length > 0 && typeof p.sizes[0] === "object") {
        if (size) {
            const sizeObj = p.sizes.find((s: any) => (s.size || s.name || s.label) === size);
            if (sizeObj) {
                if (typeof sizeObj.stock === "number") return sizeObj.stock;
                if (typeof sizeObj.quantity === "number") return sizeObj.quantity;
                if (typeof sizeObj.count === "number") return sizeObj.count;
                if (sizeObj.inStock === false || sizeObj.isOutOfStock === true) return 0;
            }
        }
    }

    // 3. Fallback to general stock/quantity numbers
    if (typeof p.quantity === "number") return p.quantity;
    if (typeof p.stock === "number") return p.stock;
    if (typeof p.totalStock === "number") return p.totalStock;
    if (typeof p.countInStock === "number") return p.countInStock;
    if (typeof p.productQuantity === "number") return p.productQuantity;

    if (typeof p.stock === "string") {
        const match = p.stock.match(/\d+/);
        if (match) return parseInt(match[0], 10);
    }

    return 1;
}

/**
 * Check if a specific size is out of stock.
 */
export function isSizeOutOfStock(product?: Product | null, size?: string | null): boolean {
    if (!product || !size) return true;
    if (isExplicitlyOutOfStock(product)) return true;

    const configuredSizes = getProductSizes(product);
    if (!configuredSizes.includes(size)) return true;

    return getSizeStockQuantity(product, size) <= 0;
}

/**
 * Check if a product has ANY size in stock.
 */
export function hasAnySizeInStock(product?: Product | null): boolean {
    if (!product) return false;
    if (isExplicitlyOutOfStock(product)) return false;

    const p = product as any;
    const sizes = getProductSizes(product);

    // If sizeStock is provided: check if at least one size has stock > 0
    if (p.sizeStock && typeof p.sizeStock === "object" && Object.keys(p.sizeStock).length > 0) {
        return sizes.some((size) => (p.sizeStock?.[size] ?? 0) > 0);
    }

    // If sizes array of objects is provided: check if at least one size object has stock > 0
    if (Array.isArray(p.sizes) && p.sizes.length > 0 && typeof p.sizes[0] === "object") {
        return p.sizes.some((s: any) => {
            if (s.inStock === false || s.isOutOfStock === true) return false;
            const qty = s.stock ?? s.quantity ?? s.count ?? 1;
            return qty > 0;
        });
    }

    // General stock check
    if (typeof p.quantity === "number") return p.quantity > 0;
    if (typeof p.stock === "number") return p.stock > 0;
    if (typeof p.totalStock === "number") return p.totalStock > 0;
    if (typeof p.countInStock === "number") return p.countInStock > 0;
    if (typeof p.productQuantity === "number") return p.productQuantity > 0;

    return false; // Default to out of stock if no positive stock data exists
}

/**
 * Check if product is completely out of stock.
 */
export function isProductOutOfStock(product?: Product | null): boolean {
    return !hasAnySizeInStock(product);
}
