import type { Metadata } from "next";
import ForgotPassword from "@/views/authentications/forgot-password";

export const metadata: Metadata = {
  title: "Forgot Password | Fashion Time",
  description: "Reset your Fashion Time account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
