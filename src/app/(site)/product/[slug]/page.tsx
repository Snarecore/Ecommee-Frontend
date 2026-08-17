import type { Metadata } from "next";
import Product from "@/views/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
  
  try {
    const res = await fetch(`${baseUrl}site/product/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const product = await res.json();
      if (product) {
        return {
          title: `${product.name || "Product"} | Bazaarbound`,
          description: product.shortDescription || product.description || `Buy ${product.name || "this product"} on Bazaarbound.`,
          openGraph: {
            title: product.name,
            description: product.shortDescription || product.description,
            images: product.featuredImage ? [{ url: product.featuredImage }] : [],
          },
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch product metadata for SEO:", error);
  }

  return {
    title: "Product Details | Bazaarbound",
    description: "View product details on Bazaarbound.",
  };
}

export default function ProductDetailPage() {
  return <Product />;
}
