import type { Metadata } from "next";
import AllCategories from "@/views/all-categories";
import { getApiBaseUrl } from "@/config/env";

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
  const baseUrl = getApiBaseUrl();
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
