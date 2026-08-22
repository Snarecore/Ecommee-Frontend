export type MinimalProduct = {
    id: string | number;
    name: string;
    featuredImage?: string;
    productImages?: { imageUrl: string }[];
    summary?: string;
    description?: string;
    price: number | string;
    currency?: string;
    seoData?: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
    };
    vendor?: { profile?: { shopName?: string } };
  
    mainCategoryName?: string;
    firstCategoryName?: string;
    secondCategoryName?: string;
  
    productReview?: {
      ratingAverage?: number;
      reviewCount?: number;
    };

    sku?: string;
  };
  
  export const stripHtml = (html?: string) =>
    (html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  
  export const money = (n?: number | string) => {
    if (n === undefined || n === null) return "0.00";
    const num = typeof n === "string" ? Number(n) : n;
    return num.toFixed(2);
  };
  
  export const buildCategoryString = (p: MinimalProduct) => {
    const names = [
      p.mainCategoryName,
      p.firstCategoryName,
      p.secondCategoryName,
    ].filter(Boolean) as string[];
    return names.length ? names.join(" > ") : "Digital Goods";
  };
  
  export const buildProductJsonLd = (p: MinimalProduct) => {
    const images = [
      p.featuredImage,
      ...(p.productImages?.map(i => i.imageUrl) ?? []),
    ].filter(Boolean);
  
    const here =
      typeof window !== "undefined" ? window.location.href : "https://bazaarbound.com/product";
  
    const node: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${here}#product`,
      name: p.name,
      description: stripHtml(p.seoData?.metaDescription || p.summary || p.description)?.slice(0, 300),
      sku: p.sku || `PROD-${p.id}`,
      brand: {
        "@type": "Brand",
        name: p?.vendor?.profile?.shopName || "BazaarBound",
      },
      category: buildCategoryString(p),
      image: images,
      url: here,
      offers: {
        "@type": "Offer",
        url: here,
        priceCurrency: p.currency || "USD",
        price: money(p.price),
        availability: "https://schema.org/InStock",     
        itemCondition: "https://schema.org/NewCondition", 
        category: "DigitalDownload",
      },
    };
  
    if (p?.productReview?.reviewCount && p.productReview.ratingAverage) {
      node.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: String(p.productReview.ratingAverage),
        ratingCount: String(p.productReview.reviewCount),
      };
    }
  
    return node;
  };
  
  export const buildOrganizationJsonLd = () => {
    const base =
      typeof window !== "undefined"
        ? `${location.protocol}//${location.host}`
        : "https://bazaarbound.com";
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BazaarBound",
      url: base,
      logo: base + "/logo.png",
    };
  };
  