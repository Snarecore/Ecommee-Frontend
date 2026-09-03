import type { Metadata } from "next";
import Product from "@/views/product";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/").replace(/\/$/, "");
  try {
    const res = await fetch(`${baseUrl}/site/product/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      const product = json?.data || json;
      if (product && !product.error && (product.id || product.slug || product.name)) {
        return product;
      }
    }
  } catch (error) {
    // console.error("Failed to fetch product data on server:", error);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (product) {
    return {
      title: `${product.name || "Product"} | Fashion Time`,
      description: product.summary || product.description || `Buy ${product.name || "this product"} on Fashion Time.`,
      openGraph: {
        title: product.name,
        description: product.summary || product.description,
        images: product.featuredImage ? [{ url: product.featuredImage }] : [],
      },
    };
  }

  return {
    title: "Product Details | Fashion Time",
    description: "View product details on Fashion Time.",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const initialData = await getProductData(slug);
  return <Product initialData={initialData} />;
}
