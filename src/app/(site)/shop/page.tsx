import type { Metadata } from "next";
import Shop from "@/views/shop";

export const metadata: Metadata = {
  title: "Shop Products | Fashion Time",
  description: "Browse our exclusive collection of clothing, fashion apparel, and accessories on Fashion Time.",
};

export const revalidate = 120; // ISR: 2 minutes cache

export default function ShopPage() {
  return <Shop />;
}
