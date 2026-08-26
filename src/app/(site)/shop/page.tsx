import type { Metadata } from "next";
import Shop from "@/views/shop";

export const metadata: Metadata = {
  title: "Shop Products | Bazaarbound",
  description: "Browse our exclusive collection of clothing, fashion apparel, and accessories on Bazaarbound.",
};

export const revalidate = 120; // ISR: 2 minutes cache

export default function ShopPage() {
  return <Shop />;
}
