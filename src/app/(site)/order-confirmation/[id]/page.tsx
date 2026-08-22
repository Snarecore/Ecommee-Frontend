'use client';

import OrderConfirmationView from "@/views/order-confirmation/index";
import { useParams } from "next/navigation";

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  return <OrderConfirmationView orderId={id} />;
}
