import type { Metadata } from "next";
import Home from "@/views/home/Home";

export const metadata: Metadata = {
  title: "Bazaarbound | Online Shopping for Clothing & Fashion",
  description: "Explore the latest fashion, clothing, and accessories on Bazaarbound. Fast delivery and quality guaranteed.",
};

export const revalidate = 300; // ISR: 5 minutes cache

async function getHomePageData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
  try {
    const res = await fetch(`${baseUrl}site/home-page`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data || json;
    }
  } catch (err) {
    console.error("Failed to pre-fetch Home page data on server:", err);
  }
  return null;
}

export default async function HomePage() {
  const initialData = await getHomePageData();
  return <Home initialData={initialData} />;
}
