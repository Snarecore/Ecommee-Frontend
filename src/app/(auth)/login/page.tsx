import type { Metadata } from "next";
import Login from "@/views/authentications/login";

export const metadata: Metadata = {
  title: "Login | Fashion Time",
  description: "Sign in to your Fashion Time account to manage orders, wishlist, and profile.",
};

export default function LoginPage() {
  return <Login />;
}
