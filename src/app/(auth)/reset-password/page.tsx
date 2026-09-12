import type { Metadata } from "next";
import ResetPassword from "@/views/authentications/reset-password";

export const metadata: Metadata = {
  title: "Reset Password | Fashion Time",
  description: "Set a new password for your Fashion Time account.",
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
