import type { Metadata } from "next";
import AllCategories from "@/views/all-categories";

export const revalidate = 120; // ISR: 2 minutes cache

export const metadata: Metadata = {
  title: "All Categories | Fashion Time",
  description: "Explore all clothing and fashion categories, collections, and deals on Fashion Time.",
  openGraph: {
    title: "All Categories | Fashion Time",
    description: "Explore all clothing and fashion categories, collections, and deals on Fashion Time.",
  },
};

async function getCategoriesContent() {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/").replace(/\/$/, "");
  try {
    const res = await fetch(`${baseUrl}/site/home`, { next: { revalidate: 120 } });
    if (res.ok) {
      const json = await res.json();
      return json?.data?.contentData || json?.contentData || null;
    }
  } catch (error) {
    // Graceful fallback to client-side fetching if backend is unavailable during build
  }
  return undefined;
}

export default async function AllCategoriesPage() {
  const contentData = await getCategoriesContent();
  return <AllCategories initialContentData={contentData} />;
}
